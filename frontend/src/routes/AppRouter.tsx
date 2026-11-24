import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { MainLayout, AdminLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { CarritoPage } from "../features/pedidos/pages/CarritoPage";
import { CheckoutPage } from "../features/pedidos/pages/CheckoutPage";
import { MisPedidosPage } from "../features/pedidos/pages/MisPedidosPage";
import { AdminCategoriasPage } from "../features/categorias/pages/AdminCategoriasPage";
import { AdminProductosPage } from "../features/productos/pages/AdminProductosPage";
import { AdminUsuariosPage } from "../features/usuarios/pages/AdminUsuariosPage";
import { AdminResumenPage } from "../features/pedidos/pages/AdminResumenPage";
import { AdminPedidosPage } from "../features/pedidos/pages/AdminPedidosPage";
import { EstadoVacio } from "../shared/components/Feedback";
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<CatalogoPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="carrito" element={<CarritoPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="mis-pedidos" element={<MisPedidosPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="resumen" replace />} />
              <Route path="resumen" element={<AdminResumenPage />} />
              <Route path="categorias" element={<AdminCategoriasPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
            </Route>
          </Route>
          <Route
            path="unauthorized"
            element={
              <EstadoVacio
                title="Esta sección es para administradores"
                description="Tu cuenta no tiene permisos para acceder."
                action={
                  <Link className="btn btn-primary" to="/">
                    Volver al menú
                  </Link>
                }
              />
            }
          />
          <Route
            path="*"
            element={
              <EstadoVacio
                title="Esta página no está en el menú"
                description="Revisá la dirección o volvé al inicio."
                action={
                  <Link className="btn btn-primary" to="/">
                    Volver al menú
                  </Link>
                }
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
