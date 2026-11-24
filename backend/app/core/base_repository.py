from typing import Generic, TypeVar
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session, self.model = session, model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def get_by_id_for_update(self, entity_id: int) -> T | None:
        # PostgreSQL bloquea la fila hasta el fin de la transacción.
        return self.session.exec(
            select(self.model).where(self.model.id == entity_id).with_for_update()
        ).first()

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model).order_by(self.model.id)).all())

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
