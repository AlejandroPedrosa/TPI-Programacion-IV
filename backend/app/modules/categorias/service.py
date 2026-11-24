from sqlalchemy.exc import IntegrityError
from app.core.errors import DomainError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(DomainError):
    status_code = 404


class NombreDuplicado(DomainError):
    status_code = 409


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    @staticmethod
    def require_active(categoria):
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def list(self):
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(c) for c in uow.categorias.list_active()
            ]

    def get(self, entity_id: int):
        with self.uow as uow:
            return CategoriaRead.model_validate(
                self.require_active(uow.categorias.get_by_id(entity_id))
            )

    def create(self, data: CategoriaCreate):
        try:
            with self.uow as uow:
                if uow.categorias.get_by_nombre(data.nombre):
                    raise NombreDuplicado(
                        "El nombre de categoría ya existe, incluso si está dada de baja"
                    )
                categoria = uow.categorias.add(Categoria(**data.model_dump()))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            raise NombreDuplicado("El nombre de categoría ya existe") from error

    def update(self, entity_id: int, data: CategoriaUpdate):
        try:
            with self.uow as uow:
                categoria = self.require_active(
                    uow.categorias.get_by_id_for_update(entity_id)
                )
                if data.nombre is not None:
                    existing = uow.categorias.get_by_nombre(data.nombre)
                    if existing and existing.id != entity_id:
                        raise NombreDuplicado("El nombre de categoría ya existe")
                categoria.sqlmodel_update(data.model_dump(exclude_unset=True))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            raise NombreDuplicado("El nombre de categoría ya existe") from error

    def delete(self, entity_id: int):
        with self.uow as uow:
            categoria = self.require_active(
                uow.categorias.get_by_id_for_update(entity_id)
            )
            categoria.activo = False
