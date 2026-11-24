from app.core.errors import DomainError
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoRead, ProductosPaginados
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(DomainError):
    status_code = 404


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def require_active(producto):
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def validate_category(uow, categoria_id):
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada o dada de baja")

    def list(self, **filters):
        with self.uow as uow:
            total, items = uow.productos.search(**filters)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def get(self, entity_id):
        with self.uow as uow:
            return ProductoRead.model_validate(
                self.require_active(uow.productos.get_by_id(entity_id))
            )

    def create(self, data):
        with self.uow as uow:
            self.validate_category(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def update(self, entity_id, data):
        with self.uow as uow:
            producto = self.require_active(
                uow.productos.get_by_id_for_update(entity_id)
            )
            changes = data.model_dump(exclude_unset=True)
            if "categoria_id" in changes:
                self.validate_category(uow, changes["categoria_id"])
            producto.sqlmodel_update(changes)
            return ProductoRead.model_validate(producto)

    def delete(self, entity_id):
        with self.uow as uow:
            producto = self.require_active(
                uow.productos.get_by_id_for_update(entity_id)
            )
            producto.activo = False
