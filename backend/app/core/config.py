from functools import lru_cache
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    DATABASE_URL: str = "postgresql://foodstore:foodstore@localhost:5432/foodstore_db"
    SECRET_KEY: str = Field(
        default="cambiar-esta-clave-de-al-menos-32-caracteres", min_length=32
    )
    ALGORITHM: Literal["HS256"] = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1)
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    COOKIE_SECURE: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
