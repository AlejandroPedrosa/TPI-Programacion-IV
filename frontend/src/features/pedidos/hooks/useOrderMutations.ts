import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidos";
import type { EstadoPedido } from "../types";
export function useOrderMutations() {
  const client = useQueryClient();
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["pedidos"] }),
      client.invalidateQueries({ queryKey: ["productos"] }),
      client.invalidateQueries({ queryKey: ["resumen"] }),
    ]);
  };
  return {
    cancel: useMutation({
      mutationFn: pedidosApi.cancel,
      onSuccess: invalidate,
    }),
    change: useMutation({
      mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
        pedidosApi.state(id, estado),
      onSuccess: invalidate,
    }),
  };
}
