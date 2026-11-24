from collections.abc import Callable
from types import TracebackType
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    """La única frontera de transacción. Todos los repositorios comparten sesión."""

    def __init__(self, factory: Callable[[], Session] = session_factory):
        self.factory = factory

    def __enter__(self):
        self.session = self.factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> bool:
        try:
            if exc_type is None:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
