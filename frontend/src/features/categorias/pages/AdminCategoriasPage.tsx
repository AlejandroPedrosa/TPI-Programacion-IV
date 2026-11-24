import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { categoriasApi } from "../api/categorias";
import type { Categoria, CategoriaInput } from "../types";
import { Button, Card, Modal } from "../../../shared/ui";
import { SmartForm } from "../../../shared/components/SmartForm";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError, Skeleton } from "../../../shared/components/Feedback";
import { Confirm } from "../../../shared/components/Confirm";
export function AdminCategoriasPage() {
  const [edit, setEdit] = useState<Categoria | "new" | null>(null);
  const [deleted, setDeleted] = useState<Categoria | null>(null);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasApi.list,
  });
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["categorias"] }),
      client.invalidateQueries({ queryKey: ["productos"] }),
    ]);
  };
  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CategoriaInput }) =>
      id ? categoriasApi.update(id, data) : categoriasApi.create(data),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: categoriasApi.delete,
    onSuccess: invalidate,
  });
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nombre", header: "Categoría" },
    { accessorKey: "descripcion", header: "Descripción" },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="row-buttons">
          <Button variant="secondary" onClick={() => setEdit(row.original)}>
            Editar
          </Button>
          <Button variant="danger" onClick={() => setDeleted(row.original)}>
            Dar de baja
          </Button>
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Categorías</h2>
          <p className="muted">Organizá el menú del negocio.</p>
        </div>
        <Button onClick={() => setEdit("new")}>
          <Plus size={17} />
          Nueva categoría
        </Button>
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
      {edit !== null && (
        <Modal
          title={edit === "new" ? "Nueva categoría" : "Editar categoría"}
          onClose={() => {
            if (!save.isPending) setEdit(null);
          }}
        >
          <SmartForm
            key={edit === "new" ? "new" : edit.id}
            initialValues={{
              nombre: edit === "new" ? "" : edit.nombre,
              descripcion: edit === "new" ? "" : edit.descripcion,
            }}
            fields={[
              {
                name: "nombre",
                label: "Nombre",
                required: true,
                minLength: 2,
                maxLength: 100,
              },
              { name: "descripcion", label: "Descripción", type: "textarea" },
            ]}
            onSubmit={async (v) => {
              await save.mutateAsync({
                id: edit === "new" ? undefined : edit.id,
                data: { nombre: v.nombre, descripcion: v.descripcion },
              });
              setEdit(null);
            }}
          />
        </Modal>
      )}
      {deleted && (
        <Confirm
          title="Dar de baja categoría"
          message={`Se ocultará “${deleted.nombre}”. Sus productos seguirán visibles; dalos de baja por separado si querés retirarlos. El nombre queda reservado.`}
          onClose={() => setDeleted(null)}
          onConfirm={() => remove.mutateAsync(deleted.id)}
        />
      )}
    </>
  );
}
