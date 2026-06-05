import os

# DashScope (阿里云) 相关配置
DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")
DASHSCOPE_TOKEN_URL = "https://dashscope.aliyuncs.com/api/v1/tokens"
DASHSCOPE_LLM_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

# 记忆文件地址
memory_data_url = "http://localhost:8000/api/assets/{avatar_id}/memory.bin"

# OSS 用户音频存储地址
OSS_URL = "https://matesx.oss-cn-beijing.aliyuncs.com/audio/user"
MatesX_key = os.environ.get("MatesX_key", "")

# 腾讯 TTS 配置
USE_TENCENT_TTS = False
class TencentTtsConfig:
    SECRET_ID = os.environ.get("TENCENT_SECRET_ID", "")
    SECRET_KEY = os.environ.get("TENCENT_SECRET_KEY", "")
    APP_ID = os.environ.get("TENCENT_APP_ID", None)

# Load configuration from .env file if it exists
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        val = parts[1].strip().strip('"').strip("'")
                        if key == "DASHSCOPE_API_KEY" and not DASHSCOPE_API_KEY:
                            DASHSCOPE_API_KEY = val
                        elif key == "MatesX_key" and not MatesX_key:
                            MatesX_key = val
                        elif key == "TENCENT_SECRET_ID" and not TencentTtsConfig.SECRET_ID:
                            TencentTtsConfig.SECRET_ID = val
                        elif key == "TENCENT_SECRET_KEY" and not TencentTtsConfig.SECRET_KEY:
                            TencentTtsConfig.SECRET_KEY = val
                        elif key == "TENCENT_APP_ID" and TencentTtsConfig.APP_ID is None:
                            TencentTtsConfig.APP_ID = val
    except Exception as e:
        print(f"[WARNING] Failed to load .env file: {e}")

if not DASHSCOPE_API_KEY:
    print("错误: DASHSCOPE_API_KEY 未配置，请设置阿里百炼平台秘钥，否则无法开启对话")

if not MatesX_key:
    print("错误: MatesX_key 未配置，请设置matesx.cn授权平台秘钥，否则无法新建形象")

# 检查腾讯 TTS 配置（仅在启用时检查）
if USE_TENCENT_TTS:
    if not TencentTtsConfig.SECRET_ID or not TencentTtsConfig.SECRET_KEY or not TencentTtsConfig.APP_ID:
        print(f"错误: 腾讯 TTS 已启用，但缺少必要配置字段")

import uuid
import hmac
import hashlib
import base64
import time
from urllib.parse import urlencode, quote
def generate_signature(voice_id):
    # 1. 准备基础参数
    params = {
        "Action": "TextToStreamAudioWSv2",
        "AppId": TencentTtsConfig.APP_ID,
        "Codec": "pcm",
        "EnableSubtitle": "True",
        "Expired": int(time.time()) + 50,
        "SampleRate": "16000",
        "SecretId": TencentTtsConfig.SECRET_ID,
        "SessionId": str(uuid.uuid4()),
        "Speed": "0",
        "Timestamp": int(time.time()),
        "VoiceType": voice_id,
        "Volume": "0"
    }

    # 2. 排序参数
    sorted_params = sorted(params.items(), key=lambda x: x[0])

    # 3. 生成签名原文
    query_str = urlencode(sorted_params, safe='/')
    signature_str = f"GETtts.cloud.tencent.com/stream_wsv2?{query_str}"

    # 4. 计算签名
    digest = hmac.new(TencentTtsConfig.SECRET_KEY.encode('utf-8'), signature_str.encode('utf-8'), hashlib.sha1).digest()
    signature = base64.b64encode(digest).decode('utf-8')

    # 5. 生成最终URL
    encoded_signature = quote(signature, safe='')
    ws_url = f"wss://tts.cloud.tencent.com/stream_wsv2?{query_str}&Signature={encoded_signature}"

    return ws_url

from fastapi import HTTPException
import httpx

async def get_temp_token_from_dashscope(model_name, voice_id):
    """
    封装腾讯云和DashScope API调用的异步函数
    临时鉴权 Token 有效期为 60 秒，避免直接暴露长期有效的 API Key，降低泄露风险
    返回DashScope API的响应结果
    """
    if model_name == "tencent":
        return {"token": generate_signature(voice_id)}
    headers = {
        "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DASHSCOPE_TOKEN_URL,
                headers=headers
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"DashScope API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get token from DashScope: {str(e)}"
        )