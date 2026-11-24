from typing import Annotated
from pydantic import EmailStr, field_validator, StringConstraints
from pydantic import Field
from app.core.schemas import Schema
from app.modules.usuarios.schemas import UserPublic


class UserCreate(Schema):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: Annotated[str, StringConstraints(strip_whitespace=False)] = Field(
        min_length=8
    )

    @field_validator("password")
    @classmethod
    def bcrypt_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes UTF-8")
        return value


class Message(Schema):
    message: str
