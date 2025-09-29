DASHSCOPE_API_KEY = ""
DASHSCOPE_TOKEN_URL = "https://dashscope.aliyuncs.com/api/v1/tokens"
DASHSCOPE_LLM_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

HOST_URL = "http://localhost:8000"

OSS_URL = "https://matesx.oss-cn-beijing.aliyuncs.com/audio/user"
MatesX_key = ""

if not DASHSCOPE_API_KEY:
    print("错误: DASHSCOPE_API_KEY 未配置，请设置阿里百炼平台秘钥，否则无法开启对话")

if not MatesX_key:
    print("错误: MatesX_key 未配置，请设置matesx.cn授权平台秘钥，否则无法新建形象")

from fastapi import HTTPException
import httpx

async def get_temp_token_from_dashscope():
    """
    封装DashScope API调用的异步函数
    临时鉴权 Token 有效期为 60 秒，避免直接暴露长期有效的 API Key，降低泄露风险
    返回DashScope API的响应结果
    """
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