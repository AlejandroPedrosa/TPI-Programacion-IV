import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "../../../store/cartStore";
import { money } from "../../../shared/lib/format";
import { Card, Button } from "../../../shared/ui";
import { EstadoVacio } from "../../../shared/components/Feedback";
export function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar } = useCartStore();
  const total = useCartStore((s) => s.total());
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CASI ESTÁ</p>
          <h1>
            Tu carrito<span className="accent">.</span>
          </h1>
        </div>
        <Link className="text-link" to="/">
          <ArrowLeft size={16} />
          Seguir eligiendo
        </Link>
      </div>
      {!items.length ? (
        <EstadoVacio
          title="Tu carrito está esperando"
          description="Elegí algo rico del menú para empezar."
          action={
            <Link className="btn btn-primary" to="/">
              Explorar menú
            </Link>
          }
        />
      ) : (
        <div className="checkout-layout">
          <Card>
            <div className="section-heading">
              <h2>Lo que elegiste</h2>
              <Button variant="ghost" onClick={vaciar}>
                Vaciar carrito
              </Button>
            </div>
            {items.map((i) => (
              <div className="cart-row" key={i.producto_id}>
                <div className="flex-1">
                  <h3>{i.nombre}</h3>
                  <span className="muted">
                    {money(i.precio_unitario)} por unidad
                  </span>
                </div>
                <div className="quantity">
                  <Button
                    variant="ghost"
                    aria-label={`Quitar una unidad de ${i.nombre}`}
                    disabled={i.cantidad <= 1}
                    onClick={() =>
                      cambiarCantidad(i.producto_id, i.cantidad - 1)
                    }
                  >
                    <Minus size={14} />
                  </Button>
                  <span>{i.cantidad}</span>
                  <Button
                    variant="ghost"
                    aria-label={`Sumar una unidad de ${i.nombre}`}
                    disabled={i.cantidad >= i.stock}
                    onClick={() =>
                      cambiarCantidad(i.producto_id, i.cantidad + 1)
                    }
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <strong>{money(i.cantidad * i.precio_unitario)}</strong>
                <Button
                  variant="ghost"
                  aria-label={`Eliminar ${i.nombre}`}
                  onClick={() => quitar(i.producto_id)}
                >
                  <Trash2 size={17} />
                </Button>
              </div>
            ))}
          </Card>
          <Card className="self-start">
            <h2>Resumen</h2>
            <div className="total-row">
              <span>Total estimado</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="muted text-sm mb-5">
              El precio final se calcula en el servidor al confirmar el pedido.
            </p>
            <Link className="btn btn-primary w-full" to="/checkout">
              Continuar <ArrowRight size={17} />
            </Link>
          </Card>
        </div>
      )}
    </>
  );
}
