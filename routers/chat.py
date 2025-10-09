from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
from utils.llm_streaming import gen_stream
from utils.session_manager import user_session_cache,user_locks,get_or_create_session
import utils.sqlite_manager as sqlite_manager
chat_router = APIRouter(tags=["Chat"])

@chat_router.post("/chat_stream")
async def chat_stream(request: Request):
    print("chat_stream")
    try:
        body = await request.json()
        print("chat_stream: ", body)
        unionid = body.get("unionid")
        # 判断unionid是否存在及token_balance是否大于0，否的话直接返回。
        user = sqlite_manager.get_user_by_unionid(unionid)
        if user is None:
            raise HTTPException(404, detail="用户不存在")
        token_balance = user.get("token_balance", 0)
        if token_balance <= 0:
            raise HTTPException(400, detail="Token不足")
        avatar_id = body.get("avatar_id")
        user_prompt = body.get("prompt")
        memory_prompt = body.get("memory_prompt")        # 这是一个 list of dict

        async with user_locks[unionid]:  # 获取用户级锁
            # 获取或创建会话
            session = get_or_create_session(unionid, avatar_id, memory_prompt)
            print("****",session.combined_prompt)
            print("****", session.messages)
            # 构建符合OpenAI格式的消息数组
            messages = [
                {"role": "system", "content": session.combined_prompt},
                *session.messages[-100:],  # 保留最近50轮对话（100条消息）
                {"role": "user", "content": user_prompt}
            ]
        return StreamingResponse(
            gen_stream(
                unionid = unionid,
                avatar_id = avatar_id,
                messages=messages,
            ),
            media_type="application/json"
        )
    except HTTPException as e:
        raise e  # 直接重新抛出原有异常
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))