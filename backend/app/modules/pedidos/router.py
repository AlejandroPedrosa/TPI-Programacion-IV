from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import CurrentUser, AdminUser
from app.core.errors import DomainError
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    ResumenPedidos,
    EstadoPedido,
)
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service():
    return PedidoService(PedidoUnitOfWork())


Service = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=201)
def create(data: PedidoCreate, user: CurrentUser, service: Service):
    try:
        return service.create(data, user)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.get("", response_model=PedidosPaginados)
def list_orders(
    user: CurrentUser,
    service: Service,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
):
    return service.list(user, skip=skip, limit=limit, estado=estado)


# Ruta fija antes de /{id}.
@router.get("/resumen", response_model=ResumenPedidos)
def summary(admin: AdminUser, service: Service):
    return service.summary()


@router.get("/{id}", response_model=PedidoRead)
def detail(id: int, user: CurrentUser, service: Service):
    try:
        return service.get(id, user)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch("/{id}/estado", response_model=PedidoRead)
def change_state(id: int, data: CambioEstado, admin: AdminUser, service: Service):
    try:
        return service.change_state(id, data.estado, admin)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancel(id: int, user: CurrentUser, service: Service):
    try:
        return service.change_state(id, "CANCELADO", user)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error
