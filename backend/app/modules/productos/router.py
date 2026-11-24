from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from app.core.deps import AdminUser
from app.core.errors import DomainError
from app.modules.productos.service import ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    ProductoStockUpdate,
    ProductosPaginados,
)

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service():
    return ProductoService(ProductoUnitOfWork())


Service = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados, status_code=200)
def list_items(
    service: Service,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = Query(None, ge=1),
    disponible: bool | None = None,
):
    try:
        return service.list(
            skip=skip,
            limit=limit,
            search=search,
            categoria_id=categoria_id,
            disponible=disponible,
        )
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.get("/{id}", response_model=ProductoRead, status_code=200)
def get_item(id: int, service: Service):
    try:
        return service.get(id)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.post("", response_model=ProductoRead, status_code=201)
def create(data: ProductoCreate, admin: AdminUser, service: Service):
    try:
        return service.create(data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.put("/{id}", response_model=ProductoRead, status_code=200)
def update(id: int, data: ProductoUpdate, admin: AdminUser, service: Service):
    try:
        return service.update(id, data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.patch("/{id}/stock", response_model=ProductoRead, status_code=200)
def stock(id: int, data: ProductoStockUpdate, admin: AdminUser, service: Service):
    try:
        return service.update(id, data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.delete("/{id}", status_code=204)
def delete(id: int, admin: AdminUser, service: Service):
    try:
        service.delete(id)
        return Response(status_code=204)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error
