# app/services/commands/auth/login.py
from fastapi import HTTPException, status

from app.external.prestashop_client import PrestashopClient
from app.schemas.auth import LoginRequest, LoginDTO
from app.shared.jwt import create_access_token
from app.core.config import settings


def login_user(req: LoginRequest) -> LoginDTO:
    client = PrestashopClient()
    try:
        user = client.login(req.email, req.password)
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Dados inválidos")

    access = create_access_token(sub=str(user["id"]), role=user.get("role", "user"), name=user.get("name"))
    expires_in = settings.JWT_EXPIRE_MIN

    return LoginDTO(
        access_token=access,
        expires_in=expires_in,
        user = {
            "uid": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
        }
    )