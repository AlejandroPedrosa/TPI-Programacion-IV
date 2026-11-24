import axios from "axios";
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    const detail = error.response?.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail
        .map((item: unknown) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          )
            return item.msg;
          return "Revisá los datos ingresados";
        })
        .join(". ");
    if (!error.response)
      return "No pudimos conectar con el servidor. Revisá que el backend esté encendido.";
    return `No se pudo completar la operación (${error.response.status}).`;
  }
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}
