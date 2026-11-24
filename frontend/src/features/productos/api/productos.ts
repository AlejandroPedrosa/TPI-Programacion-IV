import { api } from "../../../shared/api/axiosInstance";
import type {
  Producto,
  ProductoInput,
  ProductoFiltros,
  ProductosPaginados,
} from "../types";
export const productosApi = {
  list: async (params: ProductoFiltros = {}) =>
    (await api.get<ProductosPaginados>("/productos", { params })).data,
  detail: async (id: number) =>
    (await api.get<Producto>(`/productos/${id}`)).data,
  create: async (data: ProductoInput) =>
    (await api.post<Producto>("/productos", data)).data,
  update: async (id: number, data: ProductoInput) =>
    (await api.put<Producto>(`/productos/${id}`, data)).data,
  updatePartial: async (id: number, data: Partial<ProductoInput>) =>
    (await api.put<Producto>(`/productos/${id}`, data)).data,
  stock: async (id: number, data: { stock: number; disponible: boolean }) =>
    (await api.patch<Producto>(`/productos/${id}/stock`, data)).data,
  delete: async (id: number) => {
    await api.delete(`/productos/${id}`);
  },
};
