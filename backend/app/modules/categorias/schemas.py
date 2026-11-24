from pydantic import Field
from app.core.schemas import Schema, PartialSchema


class CategoriaCreate(Schema):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ""


class CategoriaUpdate(PartialSchema):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
