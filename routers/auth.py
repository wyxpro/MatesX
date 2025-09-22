from fastapi import APIRouter, HTTPException, Body, Depends, Query, status
from fastapi.responses import JSONResponse
import utils.sqlite_manager as sqlite_manager
import sqlite3

auth_router = APIRouter(tags=["Authentication"])

@auth_router.post("/update_role")
async def update_role(data: dict = Body(...)):
    print("update_role", data)
    try:
        # 参数校验
        avatar_id = data.get("avatar_id")
        unionid = data.get("unionid")
        avatar_name = data.get("avatar_name")
        cosyvoice_id = data.get("cosyvoice_id")
        system_prompt = data.get("system_prompt")

        if not unionid or not avatar_id:
            raise HTTPException(status_code=400, detail="Missing required parameters")

        sqlite_manager.insert_or_update_table(
            table_name="roles",
            avatar_id=avatar_id,
            unionid=unionid,
            avatar_name=avatar_name,
            cosyvoice_id=cosyvoice_id,
            system_prompt=system_prompt
        )

        return {
            "code": 0
        }

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@auth_router.post("/remove_role")
async def remove_role(data: dict = Body(...)):
    print("remove_role", data)
    try:
        # 参数校验
        unionid = data.get("unionid")
        avatar_id = data.get("avatar_id")

        if not unionid or not avatar_id:
            raise HTTPException(status_code=400, detail="缺少必要参数")

        success = sqlite_manager.remove_role_from_roles(
            unionid=unionid,
            avatar_id=avatar_id
        )

        if not success:
            raise HTTPException(
                status_code=404,
                detail={"code": 404, "message": "未找到指定的角色或角色不属于该用户"}
            )

        return {
            "code": 0,
            "message": "角色删除成功",
            "data": {
                "avatar_id": avatar_id
            }
        }

    except HTTPException:
        raise  # 直接抛出已有的HTTPException
    except Exception as e:
        print(f"删除角色失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"code": 500, "message": "服务器内部错误"}
        )

