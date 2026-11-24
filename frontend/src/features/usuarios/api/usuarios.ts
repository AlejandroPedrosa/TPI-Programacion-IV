import { api } from "../../../shared/api/axiosInstance";
import type { UserPublic } from "../../auth/types";
export const usuariosApi = {
  list: async () => (await api.get<UserPublic[]>("/admin/usuarios")).data,
  toggle: async (id: number, activar: boolean) =>
    (
      await api.post<UserPublic>(
        `/admin/usuarios/${id}/${activar ? "activar" : "desactivar"}`,
      )
    ).data,
};
