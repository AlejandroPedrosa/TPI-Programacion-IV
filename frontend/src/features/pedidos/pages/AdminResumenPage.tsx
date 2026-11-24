import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Clock,
  ChefHat,
  CheckCheck,
  XCircle,
  CalendarDays,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { pedidosApi } from "../api/pedidos";
import { EstadoError, Skeleton } from "../../../shared/components/Feedback";
import { Card, Button } from "../../../shared/ui";
import { money } from "../../../shared/lib/format";
export function AdminResumenPage() {
  const query = useQuery({
    queryKey: ["resumen"],
    queryFn: pedidosApi.summary,
  });
  const p = query.data;
  const cards = p
    ? [
        {
          label: "Pendientes",
          value: p.pendientes,
          icon: Clock,
          style: "orange",
        },
        {
          label: "En preparación",
          value: p.en_preparacion,
          icon: ChefHat,
          style: "blue",
        },
        {
          label: "Entregados",
          value: p.entregados,
          icon: CheckCheck,
          style: "green",
        },
        {
          label: "Cancelados",
          value: p.cancelados,
          icon: XCircle,
          style: "gray",
        },
        {
          label: "Pedidos de hoy",
          value: p.pedidos_hoy,
          icon: CalendarDays,
          style: "orange",
        },
        {
          label: "Ingresos entregados",
          value: money(p.ingresos_entregados),
          icon: Wallet,
          style: "green",
        },
      ]
    : [];
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Así viene el negocio</h2>
          <p className="muted">
            Conteos históricos, pedidos de hoy en UTC e ingresos de pedidos
            entregados.
          </p>
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
      {query.isPending ? (
        <Skeleton count={6} />
      ) : query.isError ? (
        <EstadoError error={query.error} />
      ) : (
        <div className="stats-grid">
          {cards.map((c) => (
            <Card key={c.label}>
              <div className="flex justify-between items-center">
                <span className="muted">{c.label}</span>
                <span className={`stat-icon stat-${c.style}`}>
                  <c.icon size={21} />
                </span>
              </div>
              <strong className="stat-value">{c.value}</strong>
            </Card>
          ))}
        </div>
      )}
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3>Todo listo para el próximo pedido</h3>
          <p className="muted">
            Revisá los pendientes y poné la cocina en marcha.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/pedidos">
          Gestionar pedidos <ArrowUpRight size={17} />
        </Link>
      </Card>
    </>
  );
}
