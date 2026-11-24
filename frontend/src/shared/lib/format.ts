export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
export const date = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(
    new Date(
      value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)
        ? value
        : `${value}Z`,
    ),
  );
