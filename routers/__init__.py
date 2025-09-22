from fastapi import APIRouter
from .auth import auth_router
from .voice import voice_router

__all__ = ["auth_router", "voice_router"]