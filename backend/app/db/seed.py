"""Ejecutar desde backend: python -m app.db.seed. No duplica ni reinicia stock."""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from sqlmodel import select

PRODUCTOS = [
    (
        "Hamburguesas",
        "Burger clásica",
        "Carne, cheddar, lechuga y nuestra salsa de la casa.",
        8500,
        "photo-1568901346375-23c9450c58cd",
    ),
    (
        "Hamburguesas",
        "Doble cheddar",
        "Doble carne, doble cheddar y cebolla caramelizada.",
        10500,
        "photo-1550547660-d9450f859349",
    ),
    (
        "Hamburguesas",
        "Burger veggie",
        "Medallón de legumbres, palta y vegetales frescos.",
        9000,
        "photo-1520072959219-c595dc870360",
    ),
    (
        "Pizzas",
        "Pizza muzzarella",
        "Masa artesanal, salsa de tomates y muzzarella.",
        12000,
        "photo-1579751626657-72bc17010498",
    ),
    (
        "Pizzas",
        "Pizza napolitana",
        "Muzzarella, tomates frescos, ajo y albahaca.",
        13500,
        "photo-1513104890138-7c749659a591",
    ),
    (
        "Pizzas",
        "Pizza especial",
        "Jamón, morrones asados y aceitunas.",
        14500,
        "photo-1571407970349-bc81e7e96d47",
    ),
    (
        "Acompañamientos",
        "Papas rústicas",
        "Papas al horno con romero y sal marina.",
        4500,
        "photo-1573080496219-bb080dd4f877",
    ),
    (
        "Acompañamientos",
        "Papas con cheddar",
        "Papas crocantes con cheddar y verdeo.",
        5500,
        "photo-1639024471283-03518883512d",
    ),
    (
        "Acompañamientos",
        "Ensalada de estación",
        "Mix de hojas, tomate y vegetales de estación.",
        5000,
        "photo-1512621776951-a57141f2eefd",
    ),
]


def seed():
    create_all_tables()
    with UnitOfWork() as uow:
        users, categories, products = (
            UsuarioRepository(uow.session),
            CategoriaRepository(uow.session),
            ProductoRepository(uow.session),
        )
        if not users.get_by_username("admin"):
            users.add(
                Usuario(
                    username="admin",
                    full_name="Administrador Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )
        for nombre in ("Hamburguesas", "Pizzas", "Acompañamientos"):
            if not categories.get_by_nombre(nombre):
                categories.add(
                    Categoria(
                        nombre=nombre, descripcion=f"Selección de {nombre.lower()}"
                    )
                )
        for category, nombre, descripcion, precio, photo in PRODUCTOS:
            existing = uow.session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if not existing:
                products.add(
                    Producto(
                        categoria_id=categories.get_by_nombre(category).id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=25,
                        imagen_url=f"https://images.unsplash.com/{photo}?auto=format&fit=crop&w=800&q=80",
                    )
                )
    print("Seed completado. Admin: admin / Admin1234!")


if __name__ == "__main__":
    seed()
