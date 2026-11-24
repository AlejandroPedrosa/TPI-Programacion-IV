from datetime import datetime, timezone
from app.core.errors import DomainError
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontrado(DomainError):
    status_code = 404


class PedidoAjeno(DomainError):
    status_code = 403


class StockInsuficiente(DomainError):
    pass


class ProductoNoDisponible(DomainError):
    pass


class ProductoRepetido(DomainError):
    pass


class TransicionInvalida(DomainError):
    pass


TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    @staticmethod
    def require_order(pedido):
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def authorize(pedido, user):
        if user.role != "admin" and pedido.usuario_id != user.id:
            raise PedidoAjeno("El pedido pertenece a otro usuario")

    def create(self, data, user):
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no se puede repetir en el pedido")
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=user.id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                )
            )
            # Orden estable de bloqueo: evita ventas simultáneas del mismo stock
            # y reduce deadlocks cuando dos carritos contienen varios productos.
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(f"{producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de {producto.nombre}: quedan {producto.stock}"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                pedido.total = round(pedido.total + subtotal, 2)
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def list(self, user, **filters):
        with self.uow as uow:
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=None if user.role == "admin" else user.id, **filters
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def get(self, entity_id, user):
        with self.uow as uow:
            pedido = self.require_order(uow.pedidos.get_by_id(entity_id))
            self.authorize(pedido, user)
            return PedidoRead.model_validate(pedido)

    def change_state(self, entity_id, estado, user):
        with self.uow as uow:
            pedido = self.require_order(uow.pedidos.get_by_id_for_update(entity_id))
            self.authorize(pedido, user)
            if user.role != "admin" and (
                estado != "CANCELADO" or pedido.estado != "PENDIENTE"
            ):
                raise TransicionInvalida("Solo podés cancelar tus pedidos pendientes")
            if estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {estado}"
                )
            if estado == "CANCELADO":
                for item in sorted(pedido.items, key=lambda i: i.producto_id):
                    # Se devuelve stock aunque el producto haya sido dado de baja.
                    producto = uow.productos.get_by_id_for_update(item.producto_id)
                    if producto is None:
                        raise ProductoNoEncontrado(
                            "No se pudo restituir el stock del pedido"
                        )
                    producto.stock += item.cantidad
            pedido.estado = estado
            pedido.updated_at = datetime.now(timezone.utc)
            return PedidoRead.model_validate(pedido)

    def summary(self):
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_today(),
                ingresos_entregados=round(uow.pedidos.delivered_revenue(), 2),
            )
