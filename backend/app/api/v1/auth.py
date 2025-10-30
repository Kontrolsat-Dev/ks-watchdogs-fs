# app/api/v1/auth.py

from fastapi import APIRouter, Depends

from app.schemas.auth import LoginDTO, LoginRequest
from app.services.commands.auth.login import login_user

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post("/login", response_model=LoginDTO)
def post_login(body: LoginRequest):
    return login_user(body)
