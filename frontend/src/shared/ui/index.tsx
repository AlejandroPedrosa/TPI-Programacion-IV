import { useRef, useId } from "react";
import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  Ref,
} from "react";
import { X } from "lucide-react";
import type { EstadoPedido } from "../../features/pedidos/types";
import { nombresEstado } from "../../features/pedidos/types";
export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  ref?: Ref<HTMLButtonElement>;
}) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />;
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`badge badge-${estado}`}>{nombresEstado[estado]}</span>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  // El diálogo nativo provee foco inicial, Escape y aislamiento del fondo.
  return (
    <dialog
      aria-labelledby={id}
      ref={(node) => {
        if (node && !node.open) {
          node.showModal();
          closeRef.current?.focus();
        }
      }}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="section-heading">
          <h2 id={id}>{title}</h2>
          <Button
            ref={closeRef}
            variant="ghost"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
