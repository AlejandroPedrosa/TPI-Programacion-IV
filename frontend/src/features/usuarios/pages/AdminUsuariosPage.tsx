import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { usuariosApi } from "../api/usuarios";
import type { UserPublic } from "../../auth/types";
import { useAuthStore } from "../../../store/authStore";
import { Card, Button } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError, Skeleton } from "../../../shared/components/Feedback";
import { Confirm } from "../../../shared/components/Confirm";
export function AdminUsuariosPage() {
  const user = useAuthStore((s) => s.usuario);
  const client = useQueryClient();
  const [selected, setSelected] = useState<UserPublic | null>(null);
  const query = useQuery({ queryKey: ["usuarios"], queryFn: usuariosApi.list });
  const toggle = useMutation({
    mutationFn: (u: UserPublic) => usuariosApi.toggle(u.id, u.disabled),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
  const columns: ColumnDef<UserPublic>[] = [
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "full_name", header: "Nombre" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Rol" },
    {
      accessorKey: "disabled",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={
            row.original.disabled ? "status-inactive" : "status-active"
          }
        >
          {row.original.disabled ? "Desactivado" : "Activo"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) =>
        row.original.id === user?.id ? (
          <span className="muted text-sm">Tu cuenta</span>
        ) : (
          <Button
            variant={row.original.disabled ? "secondary" : "danger"}
            onClick={() => setSelected(row.original)}
          >
            {row.original.disabled ? "Activar" : "Desactivar"}
          </Button>
        ),
    },
  ];
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Usuarios</h2>
          <p className="muted">
            Controlá el acceso de clientes y administradores.
          </p>
        </div>
      </div>
      <Card>
        {query.isPending ? (
          <Skeleton />
        ) : query.isError ? (
          <EstadoError error={query.error} />
        ) : (
          <DataTable data={query.data} columns={columns} />
        )}
      </Card>
      {selected && (
        <Confirm
          title={`${selected.disabled ? "Activar" : "Desactivar"} cuenta`}
          message={`${selected.disabled ? "Se habilitará" : "Se bloqueará"} el acceso de ${selected.username}. Sus pedidos se conservarán.`}
          onClose={() => setSelected(null)}
          onConfirm={() => toggle.mutateAsync(selected)}
        />
      )}
    </>
  );
}
