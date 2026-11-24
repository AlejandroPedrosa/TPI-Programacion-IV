import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Utensils,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui";
import { EstadoError } from "../components/Feedback";
const adminLinks = [
  ["/admin/resumen", "Resumen"],
  ["/admin/categorias", "Categorías"],
  ["/admin/productos", "Productos y stock"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/usuarios", "Usuarios"],
];
export function MainLayout() {
  const user = useAuthStore((s) => s.usuario);
  const loading = useAuthStore((s) => s.cargando);
  const logout = useAuthStore((s) => s.logout);
  const count = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.cantidad, 0),
  );
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [leaving, setLeaving] = useState(false);
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <header className="header">
        <div className="shell nav">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Utensils size={21} />
            </span>
            food<span className="font-normal">store</span>
            <span className="brand-dot">.</span>
          </Link>
          <button
            className="mobile-menu"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <nav
            className={`nav-links ${menu ? "nav-open" : ""}`}
            onClick={() => setMenu(false)}
          >
            <NavLink to="/" end>
              Menú
            </NavLink>
            {user && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
            {user?.role === "admin" && (
              <NavLink to="/admin/resumen">
                <LayoutDashboard size={16} />
                Administración
              </NavLink>
            )}
          </nav>
          <div className="nav-actions">
            <Link
              className="cart-link"
              to="/carrito"
              aria-label={`Carrito, ${count} productos`}
            >
              <ShoppingBag size={19} />
              <span className="cart-count">{count}</span>
            </Link>
            {loading ? (
              <span className="muted text-sm">Cargando…</span>
            ) : user ? (
              <>
                <div className="user-label">
                  <strong>{user.full_name.split(" ")[0]}</strong>
                  <small>
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </small>
                </div>
                <Button
                  variant="ghost"
                  aria-label="Cerrar sesión"
                  disabled={leaving}
                  onClick={async () => {
                    setLeaving(true);
                    setError(null);
                    try {
                      await logout();
                      navigate("/login");
                    } catch (e) {
                      setError(e);
                    } finally {
                      setLeaving(false);
                    }
                  }}
                >
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <Link className="btn btn-secondary" to="/login">
                Ingresar <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </header>
      {error !== null && (
        <div className="shell pt-4">
          <EstadoError error={error} />
        </div>
      )}
      <main id="contenido" className="shell main">
        <Outlet />
      </main>
      <footer className="shell footer">
        <span>Food Store · Hecho con ganas.</span>
        <span>Programación 4 · UTN · Alejandro Pedrosa</span>
      </footer>
    </>
  );
}
export function AdminLayout() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EL NEGOCIO, EN ORDEN</p>
          <h1>Administración</h1>
        </div>
        <Link className="text-link" to="/">
          Ver tienda <ArrowUpRight size={16} />
        </Link>
      </div>
      <nav className="admin-nav">
        {adminLinks.map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
