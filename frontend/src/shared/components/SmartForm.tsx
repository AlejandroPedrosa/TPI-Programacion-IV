import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "../ui";
import { handleApiError } from "../api/handleApiError";
export interface FieldSpec {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "url";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  integer?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  autoComplete?: string;
}
function validate(value: string, spec: FieldSpec): string | undefined {
  if (spec.required && !value.trim()) return "Este campo es obligatorio";
  if (!value) return undefined;
  if (spec.minLength && value.trim().length < spec.minLength)
    return `Mínimo ${spec.minLength} caracteres`;
  if (spec.maxLength && value.length > spec.maxLength)
    return `Máximo ${spec.maxLength} caracteres`;
  if (spec.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Ingresá un email válido";
  if (spec.name === "username" && !/^[a-zA-Z0-9_.-]+$/.test(value))
    return "Usá letras, números, puntos, guiones o guion bajo";
  if (spec.type === "password" && new TextEncoder().encode(value).length > 72)
    return "Máximo 72 bytes UTF-8";
  if (
    spec.type === "number" &&
    (!Number.isFinite(Number(value)) ||
      (spec.min !== undefined && Number(value) < spec.min) ||
      (spec.integer && !Number.isInteger(Number(value))))
  )
    return spec.integer
      ? `Ingresá un entero desde ${spec.min ?? 0}`
      : `Ingresá un número desde ${spec.min ?? 0}`;
  if (spec.type === "url") {
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol))
        return "Usá una URL http o https";
    } catch {
      return "Ingresá una URL válida";
    }
  }
  return undefined;
}
export function SmartForm({
  initialValues,
  fields,
  onSubmit,
  submitLabel = "Guardar",
  disabled = false,
}: {
  initialValues: Record<string, string>;
  fields: FieldSpec[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
}) {
  const [error, setError] = useState("");
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await onSubmit(value);
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });
  return (
    <form
      noValidate
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {fields.map((spec) => (
        <form.Field
          key={spec.name}
          name={spec.name}
          validators={{
            onChange: ({ value }) => validate(value, spec),
            onBlur: ({ value }) => validate(value, spec),
            onSubmit: ({ value }) => validate(value, spec),
          }}
        >
          {(field) => {
            const id = `field-${spec.name}`;
            const invalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0;
            const common = {
              id,
              name: spec.name,
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (
                e: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
              ) => field.handleChange(e.target.value),
              "aria-invalid": invalid,
              "aria-describedby": `${id}-help`,
              required: spec.required,
              className: "input",
            };
            return (
              <div className="field">
                <label htmlFor={id}>
                  {spec.label}
                  {spec.required && <span className="text-orange-700"> *</span>}
                </label>
                {spec.type === "select" ? (
                  <select {...common}>
                    {spec.options?.map((o) => (
                      <option value={o.value} key={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : spec.type === "textarea" ? (
                  <textarea {...common} rows={3} />
                ) : (
                  <input
                    {...common}
                    type={spec.type ?? "text"}
                    autoComplete={spec.autoComplete}
                    min={spec.min}
                    minLength={spec.minLength}
                    maxLength={spec.maxLength}
                    step={spec.integer ? 1 : "any"}
                  />
                )}
                <span
                  id={`${id}-help`}
                  className={invalid ? "field-error" : "field-help"}
                >
                  {invalid ? field.state.meta.errors.join(". ") : spec.help}
                </span>
              </div>
            );
          }}
        </form.Field>
      ))}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={disabled || !canSubmit || isSubmitting}
          >
            {isSubmitting ? "Guardando…" : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
