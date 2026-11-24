from typing import Annotated
from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import CurrentUser
from app.modules.auth.schemas import UserCreate, UserPublic, Message
from app.modules.auth.service import AuthService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service():
    return AuthService(UsuarioUnitOfWork())


Service = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: UserCreate, service: Service):
    return service.register(data)


@router.post("/token", response_model=Message)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Service,
):
    token = service.login(form.username, form.password)
    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Message(message="Login exitoso")


@router.post("/logout", response_model=Message)
def logout(response: Response):
    response.delete_cookie(
        "access_token",
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
    )
    return Message(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(user: CurrentUser):
    return user
