import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { queryClient } from "./queryClient";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  timeout: 15_000,
});
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: string }>(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? "";
      const unauthorized =
        status === 401 &&
        !url.endsWith("/auth/token") &&
        !url.endsWith("/auth/me");
      const disabled =
        status === 400 &&
        error.response?.data.detail === "Cuenta de usuario desactivada";
      if (unauthorized || disabled) {
        useAuthStore.getState().clearSession();
        queryClient.clear();
      }
    }
    return Promise.reject(error);
  },
);
