from fastapi import HTTPException
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def get(self, entity_id):
        with self.uow as uow:
            user = uow.usuarios.get_by_id(entity_id)
            if user is None:
                raise HTTPException(401, "Sesión inválida")
            return UserPublic.model_validate(user)

    def list(self):
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def set_disabled(self, entity_id, disabled, current_id):
        with self.uow as uow:
            user = uow.usuarios.get_by_id_for_update(entity_id)
            if user is None:
                raise HTTPException(404, "Usuario no encontrado")
            if disabled and entity_id == current_id:
                raise HTTPException(400, "No podés desactivarte a vos mismo")
            user.disabled = disabled
            return UserPublic.model_validate(user)
