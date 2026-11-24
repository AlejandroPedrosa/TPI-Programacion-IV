from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from app.core.deps import AdminUser
from app.core.errors import DomainError
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def get_categoria_service():
    return CategoriaService(CategoriaUnitOfWork())


Service = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead], status_code=200)
def list_items(service: Service):
    try:
        return service.list()
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.get("/{id}", response_model=CategoriaRead, status_code=200)
def get_item(id: int, service: Service):
    try:
        return service.get(id)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.post("", response_model=CategoriaRead, status_code=201)
def create(data: CategoriaCreate, admin: AdminUser, service: Service):
    try:
        return service.create(data)
    except DomainError as error:
        raise HTTPException(error.status_code, str(error)) from error


@router.put("/{id}", response_model=CategoriaRead, status_code=200)
def update(id: int, data: CategoriaUpdate, admin: AdminUser, service: Service):
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
