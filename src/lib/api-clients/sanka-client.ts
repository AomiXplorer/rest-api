import "server-only";
import { SANKA_BASE_URL, SANKA_API_KEY } from "@/lib/server/providers/sanka";
import type { EndpointDefinition } from "@/types/api";

/**
 * Provider "Sanka" — sumber upstream eksternal opsional (API Sanka Vollerei).
 * Konfigurasi host & API key berada di environment variable (server-only):
 *   SANKA_BASE_URL, SANKA_API_KEY
 * Endpoint yang memakai provider ini didefinisikan lewat field `sanka`
 * pada EndpointDefinition (path + pemetaan parameter), tanpa rahasia apa pun.
 */

export interface SankaTransportResult {
  ok: boolean;
  status: number;
  contentType: string;
  text: string | null;
  bytes: Uint8Array | null;
  timeMs: number;
}

const JSON_CT = /^\s*(application\/json|text\/plain)/i;

/** true bila provider Sanka aktif (base url + api key terpasang). */
export function isSankaConfigured(): boolean {
  return Boolean(SANKA_BASE_URL && SANKA_API_KEY);
}

/**
 * Kirim request GET ke endpoint Sanka dengan parameter yang sudah tervalidasi.
 * - apikey di-inject dari env, tidak pernah berasal dari pengguna.
 * - pemetaan nama parameter Aomi -> Sanka via sanka.paramMap (default identitas).
 * - sanka.fixedParams memungkinkan nilai default tetap dikirim ke Sanka.
 * Timeout & batas ukuran response mengikuti endpoint (timeoutMs).
 */
export async function callSanka(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
  timeoutMs: number,
  maxBytes: number,
): Promise<SankaTransportResult> {
  if (!isSankaConfigured()) {
    return { ok: false, status: 503, contentType: "", text: null, bytes: null, timeMs: 0 };
  }
  const cfg = endpoint.sanka;
  if (!cfg) {
    return { ok: false, status: 500, contentType: "", text: null, bytes: null, timeMs: 0 };
  }

  const url = new URL(SANKA_BASE_URL + cfg.path);
  url.searchParams.set("apikey", SANKA_API_KEY as string);
  const paramMap = cfg.paramMap ?? {};
  for (const [k, v] of Object.entries(values)) {
    url.searchParams.set(paramMap[k] ?? k, v);
  }
  for (const [k, v] of Object.entries(cfg.fixedParams ?? {})) {
    if (!url.searchParams.has(k)) url.searchParams.set(k, v);
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json, image/*, audio/*, video/*" },
      cache: "no-store",
      signal: controller.signal,
    });
    const declaredLength = Number(res.headers.get("content-length") ?? 0);
    if (declaredLength > maxBytes) {
      return { ok: false, status: 502, contentType: "", text: null, bytes: null, timeMs: Date.now() - started };
    }
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    if (JSON_CT.test(contentType)) {
      const text = await res.text();
      if (text.length > maxBytes) {
        return { ok: false, status: 502, contentType: "", text: null, bytes: null, timeMs: Date.now() - started };
      }
      return { ok: res.ok, status: res.status, contentType, text, bytes: null, timeMs: Date.now() - started };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > maxBytes) {
      return { ok: false, status: 502, contentType: "", text: null, bytes: null, timeMs: Date.now() - started };
    }
    return { ok: res.ok, status: res.status, contentType, text: null, bytes: buf, timeMs: Date.now() - started };
  } catch {
    return { ok: false, status: 504, contentType: "", text: null, bytes: null, timeMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
