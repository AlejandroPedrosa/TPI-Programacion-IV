from typing import Annotated
from fastapi import Cookie, Depends, HTTPException
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> UserPublic:
    if not access_token:
        raise HTTPException(401, "Iniciá sesión para continuar")
    try:
        user_id = decode_access_token(access_token)
    except ValueError as error:
        raise HTTPException(401, str(error)) from error
    return UsuarioService(UsuarioUnitOfWork()).get(user_id)


def get_current_active_user(
    user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if user.disabled:
        raise HTTPException(400, "Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]):
    def check(
        user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(403, "No tenés permiso para realizar esta acción")
        return user

    return check


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
