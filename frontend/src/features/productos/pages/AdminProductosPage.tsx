import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { productosApi } from "../api/productos";
import { categoriasApi } from "../../categorias/api/categorias";
import type { Producto, ProductoInput } from "../types";
import { money } from "../../../shared/lib/format";
import { SmartForm } from "../../../shared/components/SmartForm";
import type { FieldSpec } from "../../../shared/components/SmartForm";
import { Card, Button, Modal } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import {
  EstadoError,
  Skeleton,
  Paginacion,
} from "../../../shared/components/Feedback";
import { Confirm } from "../../../shared/components/Confirm";
export function AdminProductosPage() {
  const [edit, setEdit] = useState<Producto | "new" | null>(null);
  const [stock, setStock] = useState<Producto | null>(null);
  const [deleted, setDeleted] = useState<Producto | null>(null);
  const [batch, setBatch] = useState(0);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["productos", "admin", batch],
    queryFn: () => productosApi.list({ skip: batch * 100, limit: 100 }),
  });
  const categories = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasApi.list,
  });
  const invalidate = async () => {
    await client.invalidateQueries({ queryKey: ["productos"] });
  };
  const save = useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductoInput }) => {
      if (
        id &&
        p &&
        !p.categoria.activo &&
        data.categoria_id === p.categoria_id
      ) {
        const { categoria_id: _category, ...partial } = data;
        return productosApi.updatePartial(id, partial);
      }
      return id ? productosApi.update(id, data) : productosApi.create(data);
    },
    onSuccess: invalidate,
  });
  const changeStock = useMutation({
    mutationFn: ({
      id,
      stock,
      disponible,
    }: {
      id: number;
      stock: number;
      disponible: boolean;
    }) => productosApi.stock(id, { stock, disponible }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: productosApi.delete,
    onSuccess: invalidate,
  });
  const columns: ColumnDef<Producto>[] = [
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div>
          <strong>{row.original.nombre}</strong>
          <small className="block muted">{row.original.categoria.nombre}</small>
        </div>
      ),
    },
    {
      accessorKey: "precio_base",
      header: "Precio",
      cell: ({ row }) => money(row.original.precio_base),
    },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "disponible",
      header: "Disponible",
      cell: ({ row }) => (
        <span
          className={
            row.original.disponible ? "status-active" : "status-inactive"
          }
        >
          {row.original.disponible ? "Sí" : "No"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="row-buttons">
          <Button variant="secondary" onClick={() => setEdit(row.original)}>
            Editar
          </Button>
          <Button variant="secondary" onClick={() => setStock(row.original)}>
            Stock
          </Button>
          <Button variant="danger" onClick={() => setDeleted(row.original)}>
            Baja
          </Button>
        </div>
      ),
    },
  ];
  const p = edit !== "new" ? edit : null;
  const options = (categories.data ?? []).map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));
  if (p && !options.some((o) => o.value === String(p.categoria_id)))
    options.push({
      value: String(p.categoria_id),
      label: `${p.categoria.nombre} (dada de baja)`,
    });
  const fields: FieldSpec[] = [
    {
      name: "nombre",
      label: "Nombre",
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    {
      name: "categoria_id",
      label: "Categoría",
      type: "select",
      required: true,
      options: [{ value: "", label: "Elegí una categoría" }, ...options],
    },
    { name: "descripcion", label: "Descripción", type: "textarea" },
    {
      name: "precio_base",
      label: "Precio ($)",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "imagen_url",
      label: "URL de imagen",
      type: "url",
      help: "Enlace http o https. Puede quedar vacío.",
    },
    {
      name: "stock",
      label: "Stock",
      type: "number",
      required: true,
      integer: true,
      min: 0,
    },
    {
      name: "disponible",
      label: "Disponible para vender",
      type: "select",
      options: [
        { value: "true", label: "Sí" },
        { value: "false", label: "No" },
      ],
    },
  ];
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Productos y stock</h2>
          <p className="muted">
            Precios, disponibilidad y existencias, en un solo lugar.
          </p>
        </div>
        <Button
          onClick={() => setEdit("new")}
          disabled={!categories.data?.length}
        >
          <Plus size={17} />
          Nuevo producto
        </Button>
      </div>
      {categories.isError && <EstadoError error={categories.error} />}
      <Card>
        {query.isPending ? (
          <Skeleton />
        ) : query.isError ? (
          <EstadoError error={query.error} />
        ) : (
          <>
            <DataTable data={query.data.items} columns={columns} />
            {query.data.total > 100 && (
              <>
                <p className="muted text-sm mt-4">
                  Bloques de hasta 100 productos. La tabla pagina dentro del
                  bloque actual.
                </p>
                <Paginacion
                  page={batch}
                  total={query.data.total}
                  size={100}
                  onChange={setBatch}
                />
              </>
            )}
          </>
        )}
      </Card>
      {edit !== null && (
        <Modal
          title={edit === "new" ? "Nuevo producto" : "Editar producto"}
          onClose={() => {
            if (!save.isPending) setEdit(null);
          }}
        >
          <SmartForm
            key={p?.id ?? "new"}
            fields={fields}
            initialValues={{
              nombre: p?.nombre ?? "",
              descripcion: p?.descripcion ?? "",
              categoria_id: String(p?.categoria_id ?? ""),
              precio_base: String(p?.precio_base ?? ""),
              imagen_url: p?.imagen_url ?? "",
              stock: String(p?.stock ?? 0),
              disponible: String(p?.disponible ?? true),
            }}
            onSubmit={async (v) => {
              // PUT conserva la categoría histórica si fue dada de baja y no se modificó.
              const data: ProductoInput = {
                nombre: v.nombre,
                descripcion: v.descripcion,
                categoria_id: Number(v.categoria_id),
                precio_base: Number(v.precio_base),
                imagen_url: v.imagen_url,
                stock: Number(v.stock),
                disponible: v.disponible === "true",
              };
              await save.mutateAsync({ id: p?.id, data });
              setEdit(null);
            }}
          />
        </Modal>
      )}
      {stock && (
        <Modal
          title={`Stock · ${stock.nombre}`}
          onClose={() => {
            if (!changeStock.isPending) setStock(null);
          }}
        >
          <SmartForm
            initialValues={{
              stock: String(stock.stock),
              disponible: String(stock.disponible),
            }}
            fields={fields.filter(
              (f) => f.name === "stock" || f.name === "disponible",
            )}
            onSubmit={async (v) => {
              await changeStock.mutateAsync({
                id: stock.id,
                stock: Number(v.stock),
                disponible: v.disponible === "true",
              });
              setStock(null);
            }}
          />
        </Modal>
      )}
      {deleted && (
        <Confirm
          title="Dar de baja producto"
          message={`“${deleted.nombre}” dejará de aparecer en el catálogo. Sus pedidos anteriores se conservarán.`}
          onClose={() => setDeleted(null)}
          onConfirm={() => remove.mutateAsync(deleted.id)}
        />
      )}
    </>
  );
}
