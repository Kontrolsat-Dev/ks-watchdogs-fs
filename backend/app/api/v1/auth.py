# app/api/v1/auth.py

from typing import Annotated
from fastapi import APIRouter, Depends

from app.core.deps import require_access_token
from app.schemas.auth import LoginDTO, LoginRequest
from app.services.commands.auth.login import login_user

router = APIRouter(prefix='/auth', tags=['auth'])
UserDep = Annotated[dict, Depends(require_access_token)]


@router.post("/login", response_model=LoginDTO)
def post_login(body: LoginRequest):
    return login_user(body)


@router.get("/me")
def get_me(user: UserDep):
    return {"user": user}
