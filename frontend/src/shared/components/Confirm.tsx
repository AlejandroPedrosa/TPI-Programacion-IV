import { useState } from "react";
import { Modal, Button } from "../ui";
import { EstadoError } from "./Feedback";
export function Confirm({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p className="muted mb-6">{message}</p>
      {error !== null && <EstadoError error={error} />}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" disabled={pending} onClick={onClose}>
          Volver
        </Button>
        <Button
          variant="danger"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError(e);
            } finally {
              setPending(false);
            }
          }}
        >
          {pending ? "Procesando…" : "Confirmar"}
        </Button>
      </div>
    </Modal>
  );
}
