import "server-only";
import { ENDPOINTS } from "@/config/endpoints";
import { callUpstream, UPSTREAM_MAX_BYTES } from "@/lib/server/providers/primary";
import { callSanka, isSankaConfigured, type SankaTransportResult } from "@/lib/api-clients/sanka-client";
import { scrapeFallback } from "@/lib/server/scrapr-fallback";
import { nsfwPick, NSFW_CATEGORY_KEYS } from "@/lib/server/providers/nsfw-local";
import type { EndpointDefinition } from "@/types/api";

/**
 * Provider Resolver — memilih dan mengeksekusi sumber data untuk sebuah
 * endpoint sesuai urutan prioritas, TANPA mengubah perilaku default endpoint
 * lama (primary tetap sumber utama; Sanka hanya fallback / pilihan eksplisit).
 *
 * Urutan kandidat:
 *   default  : primary -> jalur fallback primary -> sanka (bila terpasang) -> scrapr
 *   ?provider=sanka  : sanka saja
 *   ?provider=primary: primary (+ jalur fallback & scrapr) — perilaku lama
 *   sankaOnly        : sanka saja (endpoint baru milik Sanka)
 */

export type RequestedProvider = "primary" | "sanka" | undefined;

export type ProviderOutcome =
  /** Sukses terstandarisasi, siap dibungkus jsonOk. */
  | {
      kind: "success";
      provider: "primary" | "sanka" | "scrapr";
      data: unknown;
      timeMs: number;
      binary?: { bytes: Uint8Array; contentType: string };
      meta: Record<string, unknown>;
    }
  /** Kegagalan terstandarisasi — error provider TIDAK pernah disamarkan sebagai sukses. */
  | {
      kind: "error";
      provider: "primary" | "sanka";
      status: number;
      code: string;
      message: string;
      timeMs: number;
      meta: Record<string, unknown>;
    };


/**
 * Bersihkan penyebutan brand sumber dari teks hasil AI percakapan.
 * Hanya diterapkan pada data string (teks chat), bukan objek berisi URL
 * (agar link hasil tidak rusak). Server-side, tanpa jejak di output.
 */
function scrubAiText(text: string): string {
  return text
    .replace(/sanka\s+vollerei/gi, "pengembang")
    .replace(/sankavollerei/gi, "pengembang")
    .replace(/sanka/gi, "pengembang");
}

/** Jalur fallback primary yang sudah ada (path alternatif di upstream utama). */
const PRIMARY_FALLBACK_PATHS: Record<string, string[]> = {
  "/api/d/tiktok": ["/api/d/tiktok/v2", "/api/d/savefrom"],
  "/api/d/douyin": ["/api/d/savefrom"],
};

type TransportResult =
  | Awaited<ReturnType<typeof callUpstream>>
  | SankaTransportResult;

function isServerFailure(t: TransportResult): boolean {
  return !t.ok && t.status >= 500;
}

/** Kegagalan provider yang layak dicoba ke kandidat berikutnya (bukan salah input user). */
function shouldFallback(t: TransportResult, tooLarge: boolean): boolean {
  return (!t.ok || t.status >= 500 || t.status === 503 || t.status === 504) && !tooLarge;
}

interface SankaEnvelope {
  status?: boolean | string;
  success?: boolean;
  creator?: string;
  result?: unknown;
  data?: unknown;
  error?: string;
  message?: string;
  code?: number | string;
  [k: string]: unknown;
}

/**
 * Normalisasi response JSON Sanka menjadi outcome terstandarisasi.
 * status:false / HTTP >= 400 -> error (tidak pernah dibungkus jadi sukses).
 */
function normalizeSankaJson(
  raw: string,
  httpStatus: number,
  timeMs: number,
  pathLabel: string,
): ProviderOutcome {
  let body: SankaEnvelope | null = null;
  let parseFailed = false;
  try {
    body = JSON.parse(raw) as SankaEnvelope;
  } catch {
    parseFailed = true;
  }

  const meta = { path: pathLabel, provider: "sanka", upstream_status: httpStatus, time_ms: timeMs };

  if (parseFailed) {
    return {
      kind: "error", provider: "sanka", status: 502, code: "PROVIDER_INVALID_RESPONSE",
      message: "Response provider tidak valid.", timeMs, meta,
    };
  }

  const bodyOk = body !== null && (body.status === true || body.status === "success" || body.success === true);

  if (!bodyOk || httpStatus >= 400) {
    const rawMessage = body?.error ?? body?.message ?? "Provider gagal memproses request.";
    const message =
      typeof rawMessage === "string"
        ? rawMessage
        : JSON.stringify(rawMessage) || "Provider gagal memproses request.";
    const status = httpStatus >= 400 ? httpStatus : 502;
    return {
      kind: "error", provider: "sanka", status,
      code: status >= 500 ? "PROVIDER_ERROR" : "PROVIDER_REJECTED",
      message, timeMs, meta,
    };
  }

  // Sukses: ekstrak result/data, atau seluruh body minus envelope Sanka.
  let data: unknown;
  if (body && ("result" in body)) data = body.result;
  else if (body && "data" in body) data = body.data;
  else {
    const { status: _s, creator: _c, ...rest } = body ?? {};
    data = rest;
  }
  return { kind: "success", provider: "sanka", data, timeMs, meta };
}

/**
 * Eksekusi rantai kandidat provider untuk satu request yang sudah tervalidasi.
 * Mengembalikan outcome terstandarisasi (sukses atau error) — termasuk
 * fallback scrapr bila semua provider gagal sisi-server.
 */
export async function resolveProvider(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
  opts: { method: "GET" | "POST"; requested: RequestedProvider; pathLabel: string; startedAt: number },
): Promise<ProviderOutcome> {
  const { method, requested, pathLabel, startedAt } = opts;
  const sankaReady = isSankaConfigured() && Boolean(endpoint.sanka);
  const explicitSanka = requested === "sanka" && sankaReady;
  const sankaFirst = endpoint.sankaOnly === true || explicitSanka;

  // ---- tahap 0: sumber lokal NSFW (data JSON self-hosted owner) ----
  // Dipanggang di bundle, tidak bisa gagal karena jaringan upstream.
  if (endpoint.nsfwLocal) {
    const picked = nsfwPick(endpoint.nsfwLocal);
    if (picked) {
      return {
        kind: "success", provider: "scrapr",
        data: { category: picked.category, label: picked.label, url: picked.url, total: picked.total },
        timeMs: Date.now() - startedAt,
        meta: { path: pathLabel, upstream_status: 200, time_ms: Date.now() - startedAt },
      };
    }
    return {
      kind: "error", provider: "primary", status: 400, code: "VALIDATION_ERROR",
      message: `Kategori tidak dikenal. Pilihan valid: ${NSFW_CATEGORY_KEYS.join(", ")}.`,
      timeMs: Date.now() - startedAt,
      meta: { path: pathLabel, time_ms: Date.now() - startedAt },
    };
  }

  // ---- kandidat primary (dilewati bila Sanka jadi satu-satunya sumber) ----
  const primaryCandidates: EndpointDefinition[] = [];
  if (!sankaFirst) {
    primaryCandidates.push(endpoint);
    for (const alt of PRIMARY_FALLBACK_PATHS[endpoint.upstreamPath] ?? []) {
      const altEp = ENDPOINTS.find((e) => e.upstreamPath === alt);
      if (altEp) primaryCandidates.push(altEp);
    }
  }

  let lastOutcome: ProviderOutcome | null = null;
  let lastServerFailure = false;

  // ---- tahap 1: primary (+ jalur alternatifnya) ----
  for (const cand of primaryCandidates) {
    if (cand !== endpoint && cand.upstreamPath !== endpoint.upstreamPath) {
      // fallback path menerima format parameter sama; kirim apa adanya
    }
    const t = await callUpstream(cand, values, { method });
    if (t.bytes) {
      if (t.ok) {
        return {
          kind: "success", provider: "primary", data: null, timeMs: t.timeMs,
          binary: { bytes: t.bytes, contentType: t.contentType },
          meta: { path: pathLabel, provider: "primary", upstream_status: t.status, time_ms: t.timeMs },
        };
      }
      lastOutcome = {
        kind: "error", provider: "primary", status: 502, code: "UPSTREAM_ERROR",
        message: "Layanan sumber gagal memproses request.", timeMs: t.timeMs,
        meta: { path: pathLabel, provider: "primary", upstream_status: t.status, time_ms: t.timeMs },
      };
      lastServerFailure = isServerFailure(t);
      continue;
    }
    const o = normalizePrimaryJson(t.text, t.status, t.ok, t.timeMs, pathLabel, cand === endpoint);
    if (o.kind === "success") return o;
    lastOutcome = o;
    lastServerFailure = isServerFailure(t) || (o.kind === "error" && o.status >= 500);
    // primary 4xx = salah input user -> jangan coba provider lain? Primary punya
    // semantik validasi sendiri; hanya 5xx/jaringan yang melanjutkan rantai.
  }

  // ---- tahap 2: sanka (fallback otomatis / sumber utama endpoint baru) ----
  if (sankaReady) {
    const t = await callSanka(endpoint, values, endpoint.timeoutMs, UPSTREAM_MAX_BYTES);
    if (t.bytes) {
      if (t.ok) {
        return {
          kind: "success", provider: "sanka", data: null, timeMs: t.timeMs,
          binary: { bytes: t.bytes, contentType: t.contentType },
          meta: { path: pathLabel, provider: "sanka", upstream_status: t.status, time_ms: t.timeMs },
        };
      }
      lastOutcome = {
        kind: "error", provider: "sanka", status: 502, code: "PROVIDER_ERROR",
        message: "Provider gagal memproses request.", timeMs: t.timeMs,
        meta: { path: pathLabel, provider: "sanka", upstream_status: t.status, time_ms: t.timeMs },
      };
      lastServerFailure = isServerFailure(t);
    } else if (t.text !== null) {
      const o = normalizeSankaJson(t.text, t.status, t.timeMs, pathLabel);
      if (o.kind === "success") {
        if (endpoint.category === "ai" && typeof o.data === "string") {
          o.data = scrubAiText(o.data);
        }
        return o;
      }
      lastOutcome = o;
      lastServerFailure = t.status >= 500 || o.status >= 500;
    } else {
      lastOutcome = {
        kind: "error", provider: "sanka", status: t.status || 504, code: "PROVIDER_ERROR",
        message: "Provider tidak dapat dihubungi.", timeMs: t.timeMs,
        meta: { path: pathLabel, provider: "sanka", upstream_status: t.status, time_ms: t.timeMs },
      };
      lastServerFailure = true;
    }
  }

  // ---- tahap 3: scrapr (scraper mandiri) — hanya untuk kegagalan sisi server ----
  // Tidak dijalankan bila pengguna memilih sanka secara eksplisit.
  const canScrape = !explicitSanka && !endpoint.sankaOnly && lastServerFailure && Date.now() - startedAt < 40000;
  if (canScrape) {
    const scraped = await scrapeFallback(endpoint.upstreamPath, values, Math.min(startedAt + 40000, Date.now() + 30000));
    if (scraped && scraped.ok) {
      return {
        kind: "success", provider: "scrapr", data: scraped.data, timeMs: Date.now() - startedAt,
        meta: { path: pathLabel, fallback: "scrapr:" + scraped.provider, provider: "scrapr", time_ms: Date.now() - startedAt },
      };
    }
  }

  if (lastOutcome) return lastOutcome;

  // Tidak ada kandidat sama sekali (mis. sanka diminta tapi tidak terpasang).
  return {
    kind: "error", provider: endpoint.sankaOnly ? "sanka" : "primary", status: 503,
    code: "PROVIDER_UNAVAILABLE",
    message: endpoint.sankaOnly
      ? "Sumber provider untuk endpoint ini belum dikonfigurasi."
      : "Tidak ada sumber yang tersedia untuk endpoint ini.",
    timeMs: Date.now() - startedAt,
    meta: { path: pathLabel, time_ms: Date.now() - startedAt },
  };
}

/** Normalisasi response JSON upstream primary (perilaku lama, dipertahankan). */
function normalizePrimaryJson(
  text: string | null,
  httpStatus: number,
  transportOk: boolean,
  timeMs: number,
  pathLabel: string,
  isMainEndpoint: boolean,
): ProviderOutcome {
  const meta: Record<string, unknown> = { path: pathLabel, provider: "primary", upstream_status: httpStatus, time_ms: timeMs };
  let body: unknown = null;
  let parseFailed = false;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    parseFailed = true;
  }
  const upstreamBody = body as { status?: boolean; error?: string; code?: number | string } | null;

  if (!transportOk || parseFailed || (upstreamBody && upstreamBody.status === false)) {
    const upstreamMessage =
      parseFailed && transportOk ? "Response sumber tidak valid" : upstreamBody?.error ?? "Layanan sumber gagal memproses request.";
    const status = httpStatus >= 400 ? httpStatus : 502;
    const code = upstreamBody?.code ? `UPSTREAM_${upstreamBody.code}` : "UPSTREAM_ERROR";
    return { kind: "error", provider: "primary", status, code, message: upstreamMessage, timeMs, meta };
  }

  const data =
    upstreamBody && typeof upstreamBody === "object" && "data" in (upstreamBody as Record<string, unknown>)
      ? (upstreamBody as Record<string, unknown>).data
      : body;
  void isMainEndpoint;
  return {
    kind: "success", provider: "primary", data, timeMs,
    meta: { ...meta, size_bytes: text ? text.length : undefined },
  };
}
