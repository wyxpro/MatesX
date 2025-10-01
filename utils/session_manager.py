# session_manager.py
from datetime import datetime, timezone
import asyncio
from collections import defaultdict
from cachetools import LRUCache
from utils.sqlite_manager import get_role_by_avatar_id, insert_or_update_table
from utils.memory import MemoryManager
from concurrent.futures import ThreadPoolExecutor
memory_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="MemoryWorker")
user_session_cache = defaultdict(lambda: LRUCache(maxsize=5))
user_locks = defaultdict(asyncio.Lock)
SESSION_TIMEOUT = 600  # 超时删除后台会话记录的时间，600s
CLEANUP_INTERVAL = 300  # 后台定时总结记忆服务，300s一次


class Session:
    __slots__ = ("messages", "last_active", "system_prompt", "memory_prompt", "memory_version", "combined_prompt", "chat_count")

    def __init__(self, system_prompt="", memory_prompt=[], memory_version=0, chat_count=0):
        system_prompt = system_prompt or ""
        memory_prompt = memory_prompt or []

        self.memory_version = memory_version
        self.messages = []
        self.last_active = datetime.now()
        self.chat_count = chat_count
        self.update_system_prompt(system_prompt, memory_prompt)

    def update_activity(self):
        self.last_active = datetime.now()

    def add_messages(self, new_messages):
        """添加消息并保持最多100条记录"""
        self.messages.extend(new_messages)
        # 截断到最新的100条消息
        if len(self.messages) > 100:
            self.messages = self.messages[-100:]
        self.update_activity()

    def update_system_prompt(self, system_prompt="", memory_prompt=[]):
        """更新系统提示词"""
        self.system_prompt = system_prompt or ""
        self.memory_prompt = memory_prompt or []

        # 重新构建combined_prompt
        self.combined_prompt = "你将扮演角色和我对话。"
        if self.system_prompt:
            self.combined_prompt += "你的人物设定是：" + self.system_prompt + " "

        if self.memory_prompt:
            memory_descriptions = []
            for mem in self.memory_prompt:
                if not isinstance(mem, dict):
                    continue

                text = mem.get("text", "").strip()
                if not text:
                    continue

                # 获取时间戳（可能是 int 或 float，单位：秒）
                created_ts = mem.get("createdAt")
                updated_ts = mem.get("updatedAt")
                frequency = mem.get("frequency", 1)

                # 安全转换时间戳为 "YYYY-MM-DD" 字符串
                def format_timestamp(ts):
                    if ts is None:
                        return None
                    try:
                        # 支持 int/float，自动处理
                        dt = datetime.fromtimestamp(float(ts), tz=timezone.utc)
                        return dt.strftime("%Y-%m-%d")
                    except (ValueError, TypeError, OSError):
                        return None

                created_str = format_timestamp(created_ts) or "未知日期"
                updated_str = format_timestamp(updated_ts)

                # 构建自然语言描述
                if frequency == 1:
                    desc = f"你在 {created_str} 提到：「{text}」"
                else:
                    if updated_str and updated_str != created_str:
                        desc = f"你在 {created_str} 首次提到：「{text}」，此后共聊过 {frequency} 次，最近一次是在 {updated_str}。"
                    else:
                        # 如果 updatedAt 不存在或等于 createdAt，说明只聊过一次或未更新
                        desc = f"你多次提到：「{text}」（共 {frequency} 次，首次于 {created_str}）。"

                memory_descriptions.append(desc)

            if memory_descriptions:
                memory_block = "\n".join(memory_descriptions)
                self.combined_prompt += "以下是我们过去聊天的摘要：\n" + memory_block + "\n"

        # 添加额外的指令
        self.combined_prompt += "请遵守以下回复要求：不要使用括号及括号内的动作描述，只能以对话文本形式进行回复。"
        self.update_activity()


def get_or_create_session(unionid, avatar_id, memory_prompt):
    """获取或创建用户的会话"""
    sessions = user_session_cache[unionid]
    try:
        session = sessions[avatar_id]
        if memory_prompt:
            session.memory_prompt = memory_prompt
        session.update_activity()
        return session
    except KeyError:
        # 从数据库获取角色信息
        role = get_role_by_avatar_id(avatar_id)
        session = Session(
            system_prompt=role.get("system_prompt", ""),
            memory_prompt=memory_prompt,
            memory_version=role.get("memory_version", 0),
            chat_count=role.get("chat_count", 0)
        )
        sessions[avatar_id] = session
        return session

def _process_memory_in_thread(avatar_id, memory_version, messages, chat_count):
    """在线程池中执行的记忆处理函数"""
    try:
        memoryManager = MemoryManager(avatar_id, memory_version)
        memoryManager.load_memories()
        memory_data_url = memoryManager.process_chat_history(messages)

        # 可选：更新数据库中的 chat_count 和 memory_version
        new_memory_version = memory_version + 1
        insert_or_update_table(
            table_name="roles",
            avatar_id=avatar_id,
            memory_version=new_memory_version,
            memory_prompt_url = memory_data_url,
            chat_count=chat_count + 1,
            updated_at = datetime.now().isoformat()
        )
    except Exception as e:
        print(f"线程内处理记忆失败 avatar_id={avatar_id}: {e}")

async def cleanup_expired_sessions():
    """定期清理过期的会话，并异步生成历史记忆"""
    loop = asyncio.get_running_loop()
    while True:
        try:
            await asyncio.sleep(CLEANUP_INTERVAL)
            now = datetime.now()
            for unionid in list(user_session_cache.keys()):
                sessions = user_session_cache[unionid]
                for avatar_id in list(sessions.keys()):
                    session = sessions[avatar_id]
                    if (now - session.last_active).seconds > SESSION_TIMEOUT:
                        loop.run_in_executor(
                            memory_executor,
                            _process_memory_in_thread,
                            avatar_id,
                            session.memory_version,
                            session.messages,
                            session.chat_count  # 如果需要更新数据库
                        )

                        # 从缓存中删除会话
                        del sessions[avatar_id]

                # 如果该用户的所有会话都已清理，则删除用户的缓存条目
                if not sessions:
                    del user_session_cache[unionid]
        except asyncio.CancelledError:
            print("清理任务被取消")
            break
        except Exception as e:
            print(f"清理任务发生错误: {e}")
            await asyncio.sleep(60)  # 出错后等待一段时间再继续

