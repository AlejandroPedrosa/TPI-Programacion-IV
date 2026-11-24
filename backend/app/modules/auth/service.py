from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from app.core.security import hash_password, verify_password, create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, data):
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(
                    data.username
                ) or uow.usuarios.get_by_email(str(data.email).lower()):
                    raise HTTPException(
                        409, "El nombre de usuario o email ya está registrado"
                    )
                user = uow.usuarios.add(
                    Usuario(
                        username=data.username,
                        full_name=data.full_name,
                        email=str(data.email).lower(),
                        hashed_password=hash_password(data.password),
                        role="user",
                    )
                )
                return UserPublic.model_validate(user)
        except IntegrityError as error:
            raise HTTPException(
                409, "El nombre de usuario o email ya está registrado"
            ) from error

    def login(self, username, password):
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(
                    401,
                    "Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if user.disabled:
                raise HTTPException(400, "Cuenta de usuario desactivada")
            return create_access_token(user.id)
