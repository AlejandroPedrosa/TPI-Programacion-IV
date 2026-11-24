import type { ReactNode } from "react";
import { ShoppingBag, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui";
import { handleApiError } from "../api/handleApiError";
export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card animate-pulse h-72 bg-stone-100" />
      ))}
    </div>
  );
}
export function EstadoVacio({
  title = "Todavía no hay resultados",
  description = "Probá con otra búsqueda.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <ShoppingBag size={36} />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function EstadoError({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  return (
    <div className="error" role="alert">
      <AlertCircle size={18} />
      <span>{handleApiError(error)}</span>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function Paginacion({
  page,
  total,
  size,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        {total} resultados · Página {page + 1} de {pages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          aria-label="Página anterior"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ArrowLeft size={16} />
        </Button>
        <Button
          variant="secondary"
          aria-label="Página siguiente"
          disabled={page + 1 >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
