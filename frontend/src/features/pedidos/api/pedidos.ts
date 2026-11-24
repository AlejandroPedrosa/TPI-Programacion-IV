import { api } from "../../../shared/api/axiosInstance";
import type {
  PedidoCreate,
  Pedido,
  EstadoPedido,
  PedidosPaginados,
  ResumenPedidos,
} from "../types";
export const pedidosApi = {
  list: async (skip: number, limit: number, estado?: EstadoPedido) =>
    (
      await api.get<PedidosPaginados>("/pedidos", {
        params: { skip, limit, estado },
      })
    ).data,
  detail: async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  create: async (data: PedidoCreate) =>
    (await api.post<Pedido>("/pedidos", data)).data,
  cancel: async (id: number) =>
    (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
  state: async (id: number, estado: EstadoPedido) =>
    (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  summary: async () => (await api.get<ResumenPedidos>("/pedidos/resumen")).data,
};
