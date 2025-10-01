# 角色记忆系统（Memory System）——让 AI 记住你

## 🧠 简介

本系统是一种轻量级、面向角色对话的长期记忆机制，专为 Web 前端 + 轻量后端场景设计。它能让 AI 角色在多轮对话中“记住”用户的关键信息（如偏好、经历、约定等），从而实现更自然、连贯、个性化的交互体验。

灵感来源于 mem0 等记忆架构，但针对成本、性能与部署便捷性做了优化——无需向量数据库，不依赖复杂基础设施，仅用对象存储 + 本地检索即可运行。

## 📦 核心设计原则

- 轻量高效：每个角色的记忆以单个二进制文件存储，支持快速加载与离线缓存。
- 语义驱动：依赖大模型（LLM）智能提取与整合记忆，而非简单关键词匹配。
- 成本可控：避免使用商用向量数据库，存储成本趋近于零（仅需 S3/OSS 等对象存储）。
- 隐私隔离：通过 avatar_id 隔离不同角色的记忆，配合权限控制保障数据安全。

## 🔁 记忆如何工作？

1. 加载：前端根据 avatar_id 从远程 URL 下载二进制记忆文件（若为首次使用则初始化空记忆）。
2. 缓存：使用 IndexedDB 在浏览器中缓存最新版本，加速后续对话启动。
3. 提取：当新对话发生时，系统将聊天历史送入 LLM，提取对角色扮演有价值的第一人称记忆片段。
4. 嵌入：为每个片段生成 768 维 float16 向量（默认使用 text-embedding-v4 或兼容模型）。
5. 检索：在本地内存中计算余弦相似度，找出相似度 ≥0.7 的已有记忆。
6. 决策：再次调用 LLM，判断新片段应“新建”、“合并”还是“忽略”。
7. 保存：生成新版二进制文件，通过 PUT 请求上传，版本号自动递增。

## 🧩 关键组件详解

### 💬 记忆片段提取（extract_memory_fragments）

系统不会记录所有对话，而是通过 LLM 智能筛选“值得记住”的内容。提取时遵循以下规则：
- 以 AI 角色的第一人称视角叙述（如：“我记得用户喜欢在周末喝美式咖啡”）；
- 仅保留对后续对话有实际价值的信息（偏好、承诺、重要事件、情感倾向）；
- 自动过滤问候语、测试语句、技术错误等噪声；
- 输出为自然、完整的陈述句，便于人类理解与模型检索。

示例输入对话：
> 用户：我下周要去东京出差，可能会很忙。
> 
> AI：祝你顺利！需要我帮你查天气吗？
> 
> 用户：好啊，谢谢！

提取结果可能为：
```bash
{ "fragments": ["我记得用户下周要去东京出差，并希望我帮忙查天气。"] } 
```
具体代码为：
```bash
    def extract_memory_fragments(self, chat_history):
        """从聊天历史中提取可用于角色扮演的记忆片段"""
        prompt = f"""
        请从以下对话历史中提取重要的记忆信息，这些信息将用于AI角色的持续对话。

        【提取要求】
        1. 从AI角色的第一人称视角描述事件和事实
        2. 只提取对后续对话有实际价值的信息（如用户偏好、重要事件、承诺等）
        3. 避免提取技术性、格式性的元信息
        4. 每个记忆片段应该是完整、自然的陈述句
        5. 重点关注：用户透露的个人信息、达成的共识、重要事件、情感倾向

        【对话历史】
        {chat_history}

        请用JSON格式返回，包含一个"fragments"数组。
        """

        try:
            completion = self.client.chat.completions.create(
                model="qwen-plus",
                messages=[
                    {"role": "system", "content": "你擅长从对话中提取对角色扮演有价值的记忆信息。"
                                                  "你的提取原则："
                                                  "- 转化为第一人称叙述：将“AI说”改为“我记得用户...”"
                                                  "- 过滤无效信息：忽略问候语、技术错误、测试内容"
                                                  "- 保持自然连贯：像在回忆对话那样组织语言"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )

            response = json.loads(completion.choices[0].message.content)
            return response.get("fragments", [])

        except Exception as e:
            print(f"提取记忆片段失败: {e}")
            return []
```
### 🤔 记忆整合决策（decide_memory_integration）

当新记忆片段与已有记忆相似时，系统不会简单覆盖或重复存储，而是由 LLM 判断最佳处理方式：
- create_new：内容全新，无相关记忆；
- merge_with:X：与第 X 条记忆高度相关，应合并更新（如补充细节）；
- ignore：信息冗余、无价值或重复。

决策过程会综合语义、上下文和相似度，确保记忆库既准确又简洁。例如：
- 新片段：“用户说他喜欢黑咖啡”
- 已有记忆：“用户偏好美式咖啡”
→ LLM 可能决定合并为：“用户喜欢黑咖啡，尤其偏爱美式。”
```bash
    def decide_memory_integration(self, new_fragment, similar_memories):
        """决定如何整合记忆"""
        if not similar_memories:
            return "create_new", "没有找到相似记忆"

        # 准备相似记忆的描述
        similar_memories_desc = []
        for i, (idx, similarity, memory) in enumerate(similar_memories):
            similar_memories_desc.append(f"{i + 1}. {memory['text']} (相似度: {similarity:.3f})")

        prompt = f"""
        你是一个记忆管理专家。请决定如何处理新的记忆片段。

        新的记忆片段: "{new_fragment}"

        相似的现有记忆:
        {chr(10).join(similar_memories_desc)}

        请选择以下操作之一:
        1. 如果新片段与某个现有记忆高度相关，选择"merge_with:X"（X是记忆编号）
        2. 如果新片段是全新的信息，选择"create_new"
        3. 如果新片段不重要或重复，选择"ignore"

        请用JSON格式返回，包含"decision"字段和可选的"reason"字段。
        示例: {{"decision": "merge_with:1", "reason": "理由"}}
        """

        try:
            completion = self.client.chat.completions.create(
                model="qwen-plus",
                messages=[
                    {"role": "system", "content": "你是一个专业的记忆管理助手，能够智能地决定如何整合记忆。"},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )

            response = json.loads(completion.choices[0].message.content)
            return response.get("decision", "create_new"), response.get("reason", "")

        except Exception as e:
            print(f"记忆整合决策失败: {e}")
            return "create_new", "决策失败，默认创建新记忆"
```
## 🌐 前后端协同流程

- 前端：通过 MemoryDataDB 单例管理 IndexedDB，支持按 avatarID 快速读写记忆二进制数据。
- 后端：提供 /api/assets/{avatar_id}/memory.bin 接口，用于 GET（下载）和 PUT（上传）记忆文件。
- 网络优化：二进制格式压缩向量（float16）与文本，比 JSON 节省 40%+ 体积。
- 离线支持：即使无网络，前端仍可使用缓存记忆辅助对话（仅限读取）。

## ❓ 常见问题

Q：为什么不用 reranking 或复杂检索？
A：角色对话对检索精度要求适中，embedding 相似度已足够；加入 reranking 会显著增加延迟（+0.5~1s），影响对话流畅性。

Q：记忆会无限膨胀吗？
A：当前通过 LLM 自动合并相似内容控制增长。未来将支持“记忆衰减”机制（如按使用频率和时间淘汰低价值条目），并可设置最大条数（如 300 条）。

Q：安全性如何？
A：建议在生产环境中：
- 对记忆文件 URL 实施鉴权（如 JWT 或临时 token）；
- 禁止存储身份证、密码等敏感信息；
- 定期清理废弃角色的记忆文件。

Q：能用本地模型吗？
A：完全可以！系统支持替换 embedding 模型（如 Sentence-BERT、BGE）和 LLM（如 Llama 3、Qwen），只需适配接口。

## 🧪 扩展与定制

- 格式扩展：二进制结构预留扩展字段，未来可加入情绪标签、上下文 ID、时间戳等。
- 框架集成：前端模块可无缝嵌入 React、Vue、Taro（小程序）等任意 Web 框架。
- 多角色支持：每个 avatar_id 对应独立记忆空间，适合虚拟偶像、客服分身等场景。

## 📜 开源友好

本系统设计为模块化、低耦合，鼓励社区贡献与定制。核心逻辑清晰，替换组件只需修改少量接口。

—— 让 AI 不仅“聪明”，而且“记得你”。