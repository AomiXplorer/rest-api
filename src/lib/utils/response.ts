import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess, ApiEnvelopeMeta } from "@/types/api";

export function jsonOk<T>(data: T, message: string, meta: ApiEnvelopeMeta, status = 200) {
  const body: ApiSuccess<T> = { success: true, data, message, meta };
  return NextResponse.json(body, {
    status,
    headers: meta.time_ms != null ? { "x-time-ms": String(meta.time_ms) } : undefined,
  });
}

export function jsonErr(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
  meta?: ApiEnvelopeMeta,
) {
  const body: ApiError = { success: false, error: { code, message, ...(details ? { details } : {}) }, meta };
  return NextResponse.json(body, { status, headers: meta?.time_ms != null ? { "x-time-ms": String(meta.time_ms) } : undefined });
}

export const ERR = {
  NOT_FOUND: { status: 404, code: "ENDPOINT_NOT_FOUND", message: "Endpoint tidak ditemukan. Periksa path API." },
  VALIDATION: { status: 400, code: "VALIDATION_ERROR" },
  METHOD: { status: 405, code: "METHOD_NOT_ALLOWED", message: "Metode tidak didukung. Gunakan GET dengan query parameter." },
  TIMEOUT: { status: 504, code: "UPSTREAM_TIMEOUT", message: "Layanan sumber tidak merespons dalam batas waktu." },
  UPSTREAM: { status: 502, code: "UPSTREAM_ERROR", message: "Layanan sumber gagal memproses request." },
  RATE: { status: 429, code: "RATE_LIMITED", message: "Terlalu banyak request. Coba lagi beberapa saat lagi." },
  URL_REJECTED: { status: 400, code: "URL_REJECTED" },
} as const;
