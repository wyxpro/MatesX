from fastapi import APIRouter, HTTPException, Body, Depends, BackgroundTasks
import utils.sqlite_manager as sqlite_manager
import uuid
import sqlite3
import httpx
from datetime import datetime, timedelta
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from string import ascii_letters, digits
import random
from typing import Optional
import dashscope
from dashscope.audio.tts_v2 import VoiceEnrollmentService, SpeechSynthesizer
import asyncio
import requests
import random
from utils.dashscope import DASHSCOPE_API_KEY, OSS_URL
dashscope.api_key = DASHSCOPE_API_KEY
prefix = 'prefix'
target_model = "cosyvoice-v2"
# 创建语音注册服务实例
service = VoiceEnrollmentService()

voice_router = APIRouter(tags=["Voice"])

def background_voice_clone(unionid: str, voice_id: str, voice_url: str):
    """
    在后台执行语音克隆，并更新数据库状态。
    注意：此函数是同步的，但由 FastAPI 的 BackgroundTasks 在线程池中运行。
    """
    cosyvoice_id: Optional[str] = None
    clone_voice_url: Optional[str] = None
    error_message: Optional[str] = None
    status = "failed"
    print("background_voice_clone", unionid, voice_id, voice_url)
    try:
        # Step 1: 创建声音复刻
        cosyvoice_id = service.create_voice(
            target_model=target_model,
            prefix=prefix,
            url=voice_url
        )
        print("Voice enrollment requestId:", service.get_last_request_id())
        print(f"Created cosyvoice_id: {cosyvoice_id}")

        # Step 2: 合成测试音频
        synthesizer = SpeechSynthesizer(model=target_model, voice=cosyvoice_id)

        test_sentences = [
            "你好呀，今天的天气真不错，适合出去散步呢！大概走了两公里左右吧。",
            "红鲤鱼与绿鲤鱼想要穿越龙门，这个绕口令你能读准吗？",
            "第三季度财务报表显示，公司净利润同比增长了百分之十五点六。",
            "昨夜星辰昨夜风，画楼西畔桂堂东，这句古诗的平仄韵律听得清楚吗？",
            "正在为您查询2023年世界人工智能大会的日程安排，请稍候..."
        ]
        selected = random.choice(test_sentences)
        audio = synthesizer.call(selected)
        print("Synthesis requestId:", synthesizer.get_last_request_id())

        # Step 3: 上传到 OSS
        oss_url = f"{OSS_URL}/{voice_id}.mp3"
        response = requests.put(
            oss_url,
            data=audio,
            headers={"Content-Type": "audio/mpeg"}  # 修正 MIME 类型
        )
        response.raise_for_status()  # 检查上传是否成功

        clone_voice_url = oss_url
        status = "success"

    except Exception as e:
        error_message = str(e)
        print(f"Voice clone failed for {voice_id}: {error_message}")

    finally:
        # Step 4: 更新数据库（无论成功或失败）
        sqlite_manager.insert_or_update_table(
            table_name="voices",
            unionid=unionid,
            voice_id=voice_id,
            status=status,
            cosyvoice_id=cosyvoice_id,
            clone_voice_url=clone_voice_url,
            errorMessage=error_message
        )
        print(f"Database updated for voice_id={voice_id}, status={status}")

@voice_router.post("/apply_new_voice")
async def apply_new_voice(data: dict = Body(...)):
    print("apply_new_voice", data)
    try:
        # 参数校验
        unionid = data.get("unionid")

        if not unionid:
            raise HTTPException(status_code=400, detail="Missing required parameters")

        # 查询当前形象余额
        user = sqlite_manager.get_user_by_unionid(unionid)
        print("check_voice_balance", user)
        voice_balance = user.get("voice_balance")
        if voice_balance < 1:
            return {
                "code": 1002,
                "message": "已无足够形象创建语音",
                "data": {
                    "unionid": unionid,
                    "voice_balance": voice_balance,
                    "check_status": ""
                }
            }

        # 查询现有角色
        voices = sqlite_manager.get_voices_by_unionid(unionid)

        # 检查 pending 状态
        if any(voice.get("status") == "pending" for voice in voices):
            return {"code": 1001, "message": "您已有任务正在排队，请等待完成后请再申请", "data": {"unionid": unionid}}

        # 生成新 voice_id
        time_part = datetime.now().strftime("%y%m%d%H%M%S")  # 12位时间
        random_part = ''.join(random.choices(ascii_letters + digits, k=4))  # 4位随机
        voice_id = time_part + random_part
        voice_name = "克隆语音_" + voice_id

        return {
            "code": 0,
            "message": "申请已提交",
            "data": {
                "unionid": unionid,
                "voice_id": voice_id,
                "voice_name": voice_name,
                "voice_balance": voice_balance,
                "check_status": "pending",
                "voice_oss_url": OSS_URL
            }
        }

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@voice_router.post("/handle_new_voice")
async def handle_new_voice(
    background_tasks: BackgroundTasks,
    data: dict = Body(...)
):
    print("handle_new_voice", data)
    try:
        # 参数校验
        unionid = data.get("unionid")
        voice_id = data.get("voice_id")
        voice_name = data.get("voice_name")
        voice_url = data.get("voice_url")

        if not unionid or not voice_id or not voice_url:
            raise HTTPException(status_code=400, detail="缺少必要参数")
        # 插入新记录
        sqlite_manager.insert_or_update_table(
            table_name="voices",
            voice_id=voice_id,
            unionid=unionid,
            voice_name=voice_name,
            status="pending",
            voice_url=voice_url
        )

        # 添加后台任务
        background_tasks.add_task(background_voice_clone, unionid, voice_id, voice_url)

        return {
            "code": 0,
            "message": "操作成功",
            "data": {
                "voice_id": voice_id,
                "new_status": "processing"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@voice_router.post("/check_voice_status")
async def check_voice_status(data: dict = Body(...)):
    print("check_voice_status", data)
    try:
        # 参数校验
        unionid = data.get("unionid")
        voice_id = data.get("voice_id")

        if not unionid or not voice_id:
            raise HTTPException(status_code=400, detail="缺少必要参数")

        # 查询现有voice
        voice = sqlite_manager.get_voice_by_voice_id(voice_id)
        # role是具体的字典或None
        if voice:
            return voice
        else:
            return {}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@voice_router.post("/delete_voice")
async def delete_voice(data: dict = Body(...)):
    print("delete_voice", data)
    try:
        # 参数校验
        unionid = data.get("unionid")
        voice_id = data.get("voice_id")

        if not unionid or not voice_id:
            raise HTTPException(status_code=400, detail="缺少必要参数")
        # 插入新记录
        status = sqlite_manager.remove_voice_from_voices(
            voice_id=voice_id,
            unionid=unionid
        )

        return {
            "code": 0,
            "status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))