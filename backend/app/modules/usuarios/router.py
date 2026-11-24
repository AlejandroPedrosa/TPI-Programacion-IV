from typing import Annotated
from fastapi import APIRouter, Depends
from app.core.deps import AdminUser
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service():
    return UsuarioService(UsuarioUnitOfWork())


Service = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def list_users(admin: AdminUser, service: Service):
    return service.list()


@router.post("/{id}/activar", response_model=UserPublic)
def activate(id: int, admin: AdminUser, service: Service):
    return service.set_disabled(id, False, admin.id)


@router.post("/{id}/desactivar", response_model=UserPublic)
def deactivate(id: int, admin: AdminUser, service: Service):
    return service.set_disabled(id, True, admin.id)
