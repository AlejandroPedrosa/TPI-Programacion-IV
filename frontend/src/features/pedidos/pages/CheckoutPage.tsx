import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { SmartForm } from "../../../shared/components/SmartForm";
import { Card } from "../../../shared/ui";
import { EstadoVacio } from "../../../shared/components/Feedback";
import { useCartStore } from "../../../store/cartStore";
import { pedidosApi } from "../api/pedidos";
import { money } from "../../../shared/lib/format";
export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: pedidosApi.create,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["productos"] }),
        client.invalidateQueries({ queryKey: ["pedidos"] }),
        client.invalidateQueries({ queryKey: ["resumen"] }),
      ]);
    },
  });
  if (!items.length)
    return (
      <EstadoVacio
        title="Primero elegí tu comida"
        description="Tu carrito está vacío."
        action={
          <Link className="btn btn-primary" to="/">
            Ir al menú
          </Link>
        }
      />
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EL ÚLTIMO PASO</p>
          <h1>Confirmá tu pedido</h1>
        </div>
      </div>
      <div className="checkout-layout">
        <Card>
          <h2>¿Dónde lo llevamos?</h2>
          <p className="muted mb-6">
            El pago se coordina manualmente con el negocio.
          </p>
          <SmartForm
            initialValues={{
              direccion_entrega: "",
              forma_pago: "EFECTIVO",
              notas: "",
            }}
            fields={[
              {
                name: "direccion_entrega",
                label: "Dirección de entrega",
                required: true,
                minLength: 5,
                maxLength: 200,
                autoComplete: "street-address",
                help: "Calle, altura, piso y barrio si corresponde.",
              },
              {
                name: "forma_pago",
                label: "Forma de pago",
                type: "select",
                required: true,
                options: [
                  { value: "EFECTIVO", label: "Efectivo" },
                  { value: "TRANSFERENCIA", label: "Transferencia" },
                ],
              },
              {
                name: "notas",
                label: "Notas para el negocio",
                type: "textarea",
              },
            ]}
            submitLabel="Confirmar pedido"
            onSubmit={async (v) => {
              const pago = v.forma_pago;
              if (pago !== "EFECTIVO" && pago !== "TRANSFERENCIA")
                throw new Error("Forma de pago inválida");
              const order = await mutation.mutateAsync({
                items: items.map((i) => ({
                  producto_id: i.producto_id,
                  cantidad: i.cantidad,
                })),
                direccion_entrega: v.direccion_entrega,
                forma_pago: pago,
                notas: v.notas,
              });
              vaciar();
              navigate("/mis-pedidos", {
                state: { creado: order.id },
                replace: true,
              });
            }}
          />
        </Card>
        <Card className="self-start">
          <h2>Tu pedido</h2>
          <div className="mini-cart">
            {items.map((i) => (
              <div key={i.producto_id}>
                <span>
                  {i.cantidad}× {i.nombre}
                </span>
                <strong>{money(i.precio_unitario * i.cantidad)}</strong>
              </div>
            ))}
          </div>
          <div className="total-row">
            <span>Total estimado</span>
            <strong>{money(total)}</strong>
          </div>
          <p className="tiny-note">
            Stock y precios sujetos a validación al confirmar.
          </p>
        </Card>
      </div>
    </>
  );
}
