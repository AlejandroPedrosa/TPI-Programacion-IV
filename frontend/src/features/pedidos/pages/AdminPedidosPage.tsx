import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { pedidosApi } from "../api/pedidos";
import { useOrderMutations } from "../hooks/useOrderMutations";
import { estados, nombresEstado } from "../types";
import type { Pedido, EstadoPedido } from "../types";
import { money, date } from "../../../shared/lib/format";
import { Card, Button, BadgeEstado } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import {
  Skeleton,
  EstadoError,
  Paginacion,
} from "../../../shared/components/Feedback";
import { Confirm } from "../../../shared/components/Confirm";
import { OrderDetail } from "../components/OrderDetail";
export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>();
  const [batch, setBatch] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);
  const [transition, setTransition] = useState<{
    id: number;
    estado: EstadoPedido;
  } | null>(null);
  const query = useQuery({
    queryKey: ["pedidos", "admin", estado, batch],
    queryFn: () => pedidosApi.list(batch * 100, 100, estado),
  });
  const mutations = useOrderMutations();
  const columns: ColumnDef<Pedido>[] = [
    {
      accessorKey: "id",
      header: "Pedido",
      cell: ({ row }) => <strong>#{row.original.id}</strong>,
    },
    { accessorKey: "usuario_id", header: "Cliente ID" },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm">{date(row.original.created_at)}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => money(row.original.total),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="row-buttons">
            <Button variant="secondary" onClick={() => setDetail(p.id)}>
              Detalle
            </Button>
            {p.estado === "PENDIENTE" && (
              <Button
                onClick={() =>
                  setTransition({ id: p.id, estado: "EN_PREPARACION" })
                }
              >
                Preparar
              </Button>
            )}
            {p.estado === "EN_PREPARACION" && (
              <Button
                onClick={() => setTransition({ id: p.id, estado: "ENTREGADO" })}
              >
                Entregar
              </Button>
            )}
            {(p.estado === "PENDIENTE" || p.estado === "EN_PREPARACION") && (
              <Button
                variant="danger"
                onClick={() => setTransition({ id: p.id, estado: "CANCELADO" })}
              >
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Pedidos</h2>
          <p className="muted">Cada pedido, en su momento.</p>
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
      <div className="category-tabs">
        <button
          className={!estado ? "active" : ""}
          onClick={() => {
            setEstado(undefined);
            setBatch(0);
          }}
        >
          Todos
        </button>
        {estados.map((s) => (
          <button
            key={s}
            className={estado === s ? "active" : ""}
            onClick={() => {
              setEstado(s);
              setBatch(0);
            }}
          >
            {nombresEstado[s]}
          </button>
        ))}
      </div>
      <Card>
        {query.isPending ? (
          <Skeleton />
        ) : query.isError ? (
          <EstadoError error={query.error} />
        ) : (
          <>
            <DataTable data={query.data.items} columns={columns} />
            {query.data.total > 100 && (
              <Paginacion
                page={batch}
                total={query.data.total}
                size={100}
                onChange={setBatch}
              />
            )}
          </>
        )}
      </Card>
      {detail !== null && (
        <OrderDetail id={detail} onClose={() => setDetail(null)} />
      )}
      {transition && (
        <Confirm
          title={`Pedido #${transition.id} · ${nombresEstado[transition.estado]}`}
          message={
            transition.estado === "CANCELADO"
              ? "Se cancelará el pedido y se restituirá el stock de todos sus productos."
              : `El pedido pasará a ${nombresEstado[transition.estado].toLowerCase()}.`
          }
          onClose={() => setTransition(null)}
          onConfirm={() => mutations.change.mutateAsync(transition)}
        />
      )}
    </>
  );
}
