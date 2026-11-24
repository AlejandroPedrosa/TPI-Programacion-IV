import { useQuery } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidos";
import { Modal, BadgeEstado } from "../../../shared/ui";
import { EstadoError } from "../../../shared/components/Feedback";
import { money, date } from "../../../shared/lib/format";
export function OrderDetail({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ["pedidos", "detalle", id],
    queryFn: () => pedidosApi.detail(id),
  });
  const p = query.data;
  return (
    <Modal title={`Pedido #${id}`} onClose={onClose}>
      {query.isPending ? (
        <p role="status">Cargando detalle…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        p && (
          <>
            <div className="flex justify-between items-center mb-6">
              <BadgeEstado estado={p.estado} />
              <span className="muted text-sm">{date(p.created_at)}</span>
            </div>
            <dl className="order-info">
              <dt>Entrega</dt>
              <dd>{p.direccion_entrega}</dd>
              <dt>Pago</dt>
              <dd>
                {p.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
              </dd>
              {p.notas && (
                <>
                  <dt>Notas</dt>
                  <dd>{p.notas}</dd>
                </>
              )}
            </dl>
            <div className="mini-cart">
              {p.items.map((i) => (
                <div key={i.producto_id}>
                  <span>
                    {i.cantidad}× {i.nombre_producto}
                    <small className="block muted">
                      {money(i.precio_unitario)} por unidad
                    </small>
                  </span>
                  <strong>{money(i.subtotal)}</strong>
                </div>
              ))}
            </div>
            <div className="total-row">
              <span>Total confirmado</span>
              <strong>{money(p.total)}</strong>
            </div>
            <p className="tiny-note">
              Los nombres y precios corresponden al momento de la compra.
            </p>
          </>
        )
      )}
    </Modal>
  );
}
