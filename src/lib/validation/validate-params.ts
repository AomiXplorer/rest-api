import { z } from "zod";
import type { EndpointDefinition, EndpointParam } from "@/types/api";

const MAX_STRING_LENGTH = 2000;

function buildParamSchema(p: EndpointParam): z.ZodTypeAny {
  let schema: z.ZodTypeAny;
  switch (p.type) {
    case "integer":
    case "number": {
      const num = z.coerce
        .number()
        .max(p.max ?? 10_000_000_000_000, `Parameter '${p.name}' melebihi batas maksimum (${p.max ?? 1_000_000_000})`);
      const boundedMin = p.min != null ? num.min(p.min, `Parameter '${p.name}' di bawah batas minimum (${p.min})`) : num;
      schema =
        p.type === "integer"
          ? boundedMin.int(`Parameter '${p.name}' harus berupa angka bulat`)
          : boundedMin;
      break;
    }
    case "boolean":
      schema = z.coerce.boolean();
      break;
    case "enum":
      schema = p.enum && p.enum.length > 0 ? z.enum(p.enum as [string, ...string[]]) : z.string();
      break;
    default:
      schema = z.string();
  }
  schema = schema.refine((v) => typeof v !== "string" || v.length <= MAX_STRING_LENGTH, {
    message: `Parameter '${p.name}' melebihi ${MAX_STRING_LENGTH} karakter`,
  });
  return p.required ? schema : schema.optional();
}

/**
 * Validate query params for an endpoint against its definition.
 * Returns { values, errors } — values contains only params that passed validation.
 */
export function validateParams(
  endpoint: EndpointDefinition,
  searchParams: URLSearchParams,
): { values: Record<string, string>; errors: Record<string, string> } {
  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};

  const allowed = new Set(endpoint.params.map((p) => p.name));
  for (const key of searchParams.keys()) {
    if (!allowed.has(key)) {
      errors[key] = `Parameter '${key}' tidak dikenal oleh endpoint ini`;
    }
  }

  for (const p of endpoint.params) {
    const raw = searchParams.get(p.name);
    if (raw == null || raw === "") {
      if (p.required) errors[p.name] = `Parameter '${p.name}' wajib diisi`;
      continue;
    }
    const schema = buildParamSchema(p);
    const result = schema.safeParse(raw);
    if (result.success) {
      values[p.name] = String(result.data);
    } else {
      const issue = result.error.issues[0];
      errors[p.name] = issue?.message ?? `Parameter '${p.name}' tidak valid`;
    }
  }
  return { values, errors };
}
