import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
export function ProtectedRoute({ roles }: { roles?: ("user" | "admin")[] }) {
  const { usuario, cargando } = useAuthStore();
  const location = useLocation();
  if (cargando)
    return (
      <div className="empty" role="status">
        Verificando tu sesión…
      </div>
    );
  if (!usuario)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(usuario.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
