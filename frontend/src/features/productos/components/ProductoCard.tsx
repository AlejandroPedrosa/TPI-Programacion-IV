import { Plus, Check, Utensils } from "lucide-react";
import { useState } from "react";
import type { Producto } from "../types";
import { useCartStore } from "../../../store/cartStore";
import { money } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui";
export function ProductoCard({ producto: p }: { producto: Producto }) {
  const [broken, setBroken] = useState(false);
  const agregar = useCartStore((s) => s.agregar);
  const cantidad = useCartStore(
    (s) => s.items.find((i) => i.producto_id === p.id)?.cantidad ?? 0,
  );
  const available = p.disponible && p.stock > 0;
  return (
    <article className="product-card">
      <div className="product-image">
        {p.imagen_url && !broken ? (
          <img
            src={p.imagen_url}
            alt={p.nombre}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="image-fallback">
            <Utensils size={48} />
          </div>
        )}
        <span className="product-category">{p.categoria.nombre}</span>
        {!available && <span className="sold-out">No disponible</span>}
      </div>
      <div className="product-body">
        <h3>{p.nombre}</h3>
        <p>{p.descripcion}</p>
        <div className="product-meta">
          <div>
            <strong>{money(p.precio_base)}</strong>
            <small>
              {available ? `${p.stock} disponibles` : "Por ahora, sin stock"}
            </small>
          </div>
          <Button
            variant={cantidad ? "secondary" : "primary"}
            aria-label={`Agregar ${p.nombre}`}
            disabled={!available || cantidad >= p.stock}
            onClick={() => agregar(p)}
          >
            {cantidad ? <Check size={17} /> : <Plus size={18} />}{" "}
            {cantidad || "Agregar"}
          </Button>
        </div>
      </div>
    </article>
  );
}
