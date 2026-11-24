import { Link, useLocation, useNavigate } from "react-router-dom";
import { Utensils } from "lucide-react";
import { SmartForm } from "../../../shared/components/SmartForm";
import { useAuthStore } from "../../../store/authStore";
export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const state: unknown = location.state;
  const from =
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string" &&
    state.from.startsWith("/") &&
    !state.from.startsWith("//")
      ? state.from
      : "/";
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <span className="eyebrow">BIENVENIDO A FOOD STORE</span>
        <h1>
          Tu próxima
          <br />
          comida favorita
          <br />
          <em>está acá.</em>
        </h1>
        <p>Elegí lo que te gusta. Nosotros nos encargamos del resto.</p>
        <Utensils size={80} strokeWidth={1} />
      </div>
      <div className="auth-card">
        <h2>Qué bueno verte</h2>
        <p className="muted mb-7">
          Ingresá para confirmar tu pedido y seguirlo.
        </p>
        <SmartForm
          initialValues={{ username: "", password: "" }}
          fields={[
            {
              name: "username",
              label: "Usuario",
              required: true,
              autoComplete: "username",
            },
            {
              name: "password",
              label: "Contraseña",
              type: "password",
              required: true,
              autoComplete: "current-password",
            },
          ]}
          submitLabel="Ingresar"
          onSubmit={async (v) => {
            await login(v.username, v.password);
            navigate(from, { replace: true });
          }}
        />
        <p className="auth-bottom">
          ¿Primera vez?{" "}
          <Link className="text-link" to="/register">
            Creá tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
