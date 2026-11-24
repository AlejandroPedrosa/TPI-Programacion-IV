from pydantic import Field
from pydantic import field_validator, HttpUrl, TypeAdapter
from app.core.schemas import Schema, PartialSchema
from app.modules.categorias.schemas import CategoriaRead


class ImageValidator(Schema):
    @field_validator("imagen_url", check_fields=False)
    @classmethod
    def image_url(cls, value: str | None):
        if value:
            TypeAdapter(HttpUrl).validate_python(value)
        return value


class ProductoCreate(ImageValidator):
    categoria_id: int = Field(ge=1)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(PartialSchema, ImageValidator):
    categoria_id: int | None = Field(default=None, ge=1)
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoStockUpdate(PartialSchema):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(Schema):
    total: int
    items: list[ProductoRead]
