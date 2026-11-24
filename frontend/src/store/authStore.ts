import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../features/auth/api/auth";
import type { UserPublic } from "../features/auth/types";
import { queryClient } from "../shared/api/queryClient";
interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      clearSession: () => set({ usuario: null, cargando: false }),
      login: async (username, password) => {
        await authApi.login(username, password);
        const usuario = await authApi.me();
        queryClient.clear();
        set({ usuario, cargando: false });
      },
      logout: async () => {
        await authApi.logout();
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
      checkSession: async () => {
        try {
          set({ usuario: await authApi.me(), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },
    }),
    {
      name: "food-store-session",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
