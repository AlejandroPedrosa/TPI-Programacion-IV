import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidos";
import { useOrderMutations } from "../hooks/useOrderMutations";
import { useAuthStore } from "../../../store/authStore";
import { Card, BadgeEstado, Button } from "../../../shared/ui";
import {
  EstadoError,
  EstadoVacio,
  Skeleton,
  Paginacion,
} from "../../../shared/components/Feedback";
import { Confirm } from "../../../shared/components/Confirm";
import { OrderDetail } from "../components/OrderDetail";
import { money, date } from "../../../shared/lib/format";
export function MisPedidosPage() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const user = useAuthStore((s) => s.usuario);
  const query = useQuery({
    queryKey: ["pedidos", "mis", user?.id, page],
    queryFn: () => pedidosApi.list(page * 8, 8),
  });
  const mutations = useOrderMutations();
  const location = useLocation();
  const state: unknown = location.state;
  const created =
    typeof state === "object" &&
    state !== null &&
    "creado" in state &&
    typeof state.creado === "number"
      ? state.creado
      : null;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DE LA COCINA A TU MESA</p>
          <h1>Mis pedidos</h1>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            void query.refetch();
          }}
        >
          Actualizar
        </Button>
      </div>
      {created && (
        <div role="status" className="success mb-6">
          ¡Pedido #{created} confirmado! Ya lo estamos esperando en cocina.
        </div>
      )}
      {user?.role === "admin" && (
        <p className="muted mb-6">
          Como administrador, tu sesión puede ver todos los pedidos.
        </p>
      )}
      {query.isPending ? (
        <Skeleton />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : !query.data.items.length ? (
        <EstadoVacio
          title="Tu primer pedido te espera"
          description="Pasá por el menú y elegí tu favorito."
          action={
            <Link className="btn btn-primary" to="/">
              Ver menú
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {query.data.items.map((p) => (
            <Card key={p.id}>
              <div className="section-heading">
                <div>
                  <h3>Pedido #{p.id}</h3>
                  <p className="muted text-sm">{date(p.created_at)}</p>
                </div>
                <BadgeEstado estado={p.estado} />
              </div>
              <p className="muted">
                {p.items
                  .map((i) => `${i.cantidad}× ${i.nombre_producto}`)
                  .join(" · ")}
              </p>
              <div className="order-actions">
                <strong>{money(p.total)}</strong>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setSelected(p.id)}>
                    Ver detalle
                  </Button>
                  {p.estado === "PENDIENTE" && (
                    <Button variant="danger" onClick={() => setCancelId(p.id)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {query.data && (
        <Paginacion
          page={page}
          total={query.data.total}
          size={8}
          onChange={setPage}
        />
      )}
      {selected !== null && (
        <OrderDetail id={selected} onClose={() => setSelected(null)} />
      )}{" "}
      {cancelId !== null && (
        <Confirm
          title={`Cancelar pedido #${cancelId}`}
          message="Vamos a cancelar el pedido y restituir el stock de sus productos."
          onClose={() => setCancelId(null)}
          onConfirm={() => mutations.cancel.mutateAsync(cancelId)}
        />
      )}
    </>
  );
}
