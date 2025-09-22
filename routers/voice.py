from fastapi import APIRouter, HTTPException, Body, Depends
import utils.sqlite_manager as sqlite_manager
import uuid
import sqlite3
import httpx
from datetime import datetime, timedelta
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from string import ascii_letters, digits
import random
voice_router = APIRouter(tags=["Voice"])
