from sqlalchemy import event
from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
)
if is_sqlite:

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    from app.modules.usuarios.models import Usuario
    from app.modules.categorias.models import Categoria
    from app.modules.productos.models import Producto
    from app.modules.pedidos.models import Pedido, DetallePedido

    SQLModel.metadata.create_all(engine)
