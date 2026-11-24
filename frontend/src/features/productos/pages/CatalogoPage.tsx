import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  Clock,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  Utensils,
} from "lucide-react";
import { productosApi } from "../api/productos";
import { categoriasApi } from "../../categorias/api/categorias";
import { ProductoCard } from "../components/ProductoCard";
import { useCartStore } from "../../../store/cartStore";
import { money } from "../../../shared/lib/format";
import {
  Skeleton,
  EstadoError,
  EstadoVacio,
  Paginacion,
} from "../../../shared/components/Feedback";
import { Card, Button } from "../../../shared/ui";
export function CatalogoPage() {
  const [heroBroken, setHeroBroken] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const categories = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasApi.list,
  });
  const filters = {
    skip: page * 6,
    limit: 6,
    search: search || undefined,
    categoria_id: category,
  };
  const products = useQuery({
    queryKey: ["productos", filters],
    queryFn: () => productosApi.list(filters),
  });
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" />
            SIMPLE, RICO Y RECIÉN HECHO
          </p>
          <h1>
            Hoy se come
            <br />
            <em>bien.</em>
          </h1>
          <p>
            Tus favoritos, sin vueltas.
            <br />
            Armá tu pedido y dejá el resto en nuestras manos.
          </p>
          <a href="#menu" className="btn btn-primary">
            Explorar el menú <ArrowUpRight size={18} />
          </a>
          <div className="hero-notes">
            <span>
              <ChefHat size={17} />
              Preparado al momento
            </span>
            <span>
              <Clock size={17} />
              Pedido fácil
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-ring" />
          <span className="hero-sticker">
            BUENA COMIDA.
            <br />
            BUEN MOMENTO.
          </span>
          <div className="hero-food-fallback">
            <Utensils size={100} strokeWidth={1} />
            <span>¡A la mesa!</span>
          </div>
          {!heroBroken && (
            <img
              onError={() => setHeroBroken(true)}
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"
              alt=""
            />
          )}
          <span className="hero-caption">el plan de hoy ↗</span>
        </div>
      </section>
      <div className="catalog-layout" id="menu">
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">ELEGÍ TU PRÓXIMO FAVORITO</p>
              <h2>
                Nuestro menú<span className="accent">.</span>
              </h2>
            </div>
            <span className="muted text-sm">Hecho con ganas, siempre.</span>
          </div>
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              setSearch(draft.trim());
            }}
          >
            <Search size={19} />
            <input
              aria-label="Buscar productos"
              placeholder="¿Qué tenés ganas de comer?"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
          <div className="category-tabs">
            <button
              className={category === undefined ? "active" : ""}
              onClick={() => {
                setCategory(undefined);
                setPage(0);
              }}
            >
              Todo el menú
            </button>
            {categories.data?.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                onClick={() => {
                  setCategory(c.id);
                  setPage(0);
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
          {categories.isError && (
            <EstadoError
              error={categories.error}
              retry={() => {
                void categories.refetch();
              }}
            />
          )}
          {products.isPending ? (
            <Skeleton count={6} />
          ) : products.isError ? (
            <EstadoError
              error={products.error}
              retry={() => {
                void products.refetch();
              }}
            />
          ) : !products.data.items.length ? (
            <EstadoVacio
              title="No encontramos ese antojo"
              description="Probá con otra categoría o una búsqueda diferente."
            />
          ) : (
            <div className="product-grid">
              {products.data.items.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          )}
          {products.data && (
            <Paginacion
              page={page}
              total={products.data.total}
              size={6}
              onChange={setPage}
            />
          )}
        </section>
        <aside className="cart-aside">
          <Card>
            <div className="section-heading">
              <h3>Tu pedido</h3>
              <ShoppingBag size={19} />
            </div>
            {items.length ? (
              <>
                <div className="mini-cart">
                  {items.map((i) => (
                    <div key={i.producto_id}>
                      <span>
                        <b>{i.cantidad}×</b> {i.nombre}
                      </span>
                      <strong>{money(i.cantidad * i.precio_unitario)}</strong>
                    </div>
                  ))}
                </div>
                <div className="total-row">
                  <span>Total estimado</span>
                  <strong>{money(total)}</strong>
                </div>
                <Link className="btn btn-primary w-full" to="/carrito">
                  Revisar pedido <ArrowRight size={16} />
                </Link>
                <p className="tiny-note">
                  Los precios y el stock se verifican al confirmar.
                </p>
              </>
            ) : (
              <div className="mini-empty">
                <span className="empty-icon">
                  <ShoppingBag size={26} />
                </span>
                <strong>Acá empieza algo rico</strong>
                <p>
                  Agregá tus favoritos
                  <br />y armá tu pedido.
                </p>
              </div>
            )}
          </Card>
          <div className="aside-note">
            <ChefHat size={22} />
            <p>
              Comida que se disfruta.
              <br />
              <strong>Sin complicaciones.</strong>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
