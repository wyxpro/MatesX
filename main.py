from fastapi import FastAPI,Body,HTTPException,Request, UploadFile, File
from pathlib import Path
from utils.dashscope import get_temp_token_from_dashscope
from fastapi.staticfiles import StaticFiles
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi.responses import StreamingResponse, JSONResponse,Response
from utils.llm_streaming import gen_stream
from utils.session_manager import cleanup_expired_sessions,user_locks,get_or_create_session
import utils.sqlite_manager as sqlite_manager
from routers import chat_router, auth_router, voice_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(cleanup_expired_sessions())
    yield
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

app = FastAPI(lifespan=lifespan)

app.include_router(chat_router, prefix="/chat")
app.include_router(auth_router, prefix="/auth")
app.include_router(voice_router, prefix="/voice")
# 挂载视频数据静态文件目录
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/web", StaticFiles(directory="web"), name="web")
# 确保视频数据目录存在
os.makedirs("assets", exist_ok=True)

@app.put("/api/assets/{avatar_id}/memory.bin")
async def upload_memory_bin(avatar_id: str, request: Request):
    try:
        # 读取原始二进制数据
        memory_data = await request.body()
        if not memory_data:
            raise HTTPException(status_code=400, detail="No data received")
        path = Path(f"assets/{avatar_id}")
        path.mkdir(parents=True, exist_ok=True)
        file_path = path / "memory.bin"
        with open(file_path, "wb") as f:
            f.write(memory_data)
        return JSONResponse(
            content={"message": "Upload successful", "path": str(file_path)},
            status_code=200
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/assets/{avatar_id}/memory.bin")
async def download_memory_bin(avatar_id: str):
    try:
        file_path = Path(f"assets/{avatar_id}/memory.bin")
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        # 读取二进制数据
        with open(file_path, "rb") as f:
            data = f.read()
        # 返回二进制响应
        return Response(
            content=data,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename=memory.bin"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

DB_FILE = 'users.db'
# 初始化数据库（如果不存在则创建）
if not os.path.exists(DB_FILE):
    sqlite_manager.init_db()
    # 插入初始化数据
    sqlite_manager.init_insert_data()

@app.post("/login")
async def login(data: dict = Body(...)):
    """登录接口，接收unionid并返回角色和音色列表"""
    unionid = data.get("unionid")
    user = sqlite_manager.get_user_by_unionid(unionid)
    print(unionid, user)
    if user is None:
        return {
            "success": False,
            "message": "用户不存在",
            "userInfo": {
                "unionid": unionid,
                "roles_list": [],
                "voices_list": []
            }
        }
    voices_list = sqlite_manager.get_voices_by_unionid(unionid)
    roles_list = sqlite_manager.get_roles_by_unionid(unionid)
    bg_list = sqlite_manager.get_bgs_by_unionid(unionid)
    return {
        "success": True,
        "message": "登录成功",
        "userInfo": {
            "unionid": unionid,
            "roles_list": roles_list,
            "voices_list": voices_list,
            "bg_list": bg_list
        }
    }


@app.post("/generate_temp_token")
async def generate_temp_token(data: dict = Body(...)):
    """
    生成临时访问令牌
    返回格式: { "token": "st-****", "expires_at": 1744080369 }
    """
    try:
        unionid = data.get("unionid")
        if not unionid:
            raise HTTPException(400, detail="unionid不能为空")

        user = sqlite_manager.get_user_by_unionid(unionid)
        if user is None:
            raise HTTPException(404, detail="用户不存在")

        # 调用封装的异步函数获取令牌
        return await get_temp_token_from_dashscope()

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)