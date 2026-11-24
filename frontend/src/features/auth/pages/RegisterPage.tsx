import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SmartForm } from "../../../shared/components/SmartForm";
import { authApi } from "../api/auth";
export function RegisterPage() {
  const [created, setCreated] = useState(false);
  const mutation = useMutation({ mutationFn: authApi.register });
  return (
    <div className="auth-card mx-auto max-w-lg">
      <p className="eyebrow">SUMATE A LA MESA</p>
      <h1>Creá tu cuenta</h1>
      <p className="muted mb-7">
        Unos datos y ya podés hacer tu primer pedido.
      </p>
      {created ? (
        <div className="success" role="status">
          ¡Cuenta creada!{" "}
          <Link className="text-link" to="/login">
            Iniciá sesión para continuar.
          </Link>
        </div>
      ) : (
        <SmartForm
          initialValues={{
            full_name: "",
            username: "",
            email: "",
            password: "",
          }}
          fields={[
            {
              name: "full_name",
              label: "Nombre completo",
              required: true,
              minLength: 2,
              maxLength: 100,
              autoComplete: "name",
            },
            {
              name: "username",
              label: "Usuario",
              required: true,
              minLength: 3,
              maxLength: 50,
              autoComplete: "username",
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              required: true,
              autoComplete: "email",
            },
            {
              name: "password",
              label: "Contraseña",
              type: "password",
              required: true,
              minLength: 8,
              help: "Al menos 8 caracteres.",
              autoComplete: "new-password",
            },
          ]}
          submitLabel="Crear cuenta"
          onSubmit={async (v) => {
            await mutation.mutateAsync({
              full_name: v.full_name,
              username: v.username,
              email: v.email,
              password: v.password,
            });
            setCreated(true);
          }}
        />
      )}
      <p className="auth-bottom">
        ¿Ya tenés cuenta?{" "}
        <Link className="text-link" to="/login">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
