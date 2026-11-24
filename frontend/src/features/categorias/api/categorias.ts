import { api } from "../../../shared/api/axiosInstance";
import type { Categoria, CategoriaInput } from "../types";
export const categoriasApi = {
  list: async () => (await api.get<Categoria[]>("/categorias")).data,
  create: async (data: CategoriaInput) =>
    (await api.post<Categoria>("/categorias", data)).data,
  update: async (id: number, data: CategoriaInput) =>
    (await api.put<Categoria>(`/categorias/${id}`, data)).data,
  delete: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  },
};
