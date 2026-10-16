import { NextResponse } from "next/server";
import { ENDPOINTS } from "@/config/endpoints";
import { callUpstream } from "@/lib/api-clients/upstream-client";
import { assertSafeUrl } from "@/lib/security/url-guard";
import { checkRateLimit, getClientId } from "@/lib/security/rate-limit";
import { validateParams } from "@/lib/validation/validate-params";
import { jsonErr, jsonOk, ERR } from "@/lib/utils/response";
import { scrapeFallback } from "@/lib/server/scrapr-fallback";
import type { EndpointDefinition } from "@/types/api";

/**
 * CORS: API ini memang publik dan dipakai lintas origin oleh developer.
 * Kebijakan: GET dan POST boleh dipanggil dari origin mana pun,
 * tanpa credential (endpoint tidak membaca cookie), jadi "*" aman.
 * Ubah di sini jika suatu saat perlu dibatasi per-origin.
 */
const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};
function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

/** Parameter names that carry a URL the upstream will fetch — SSRF-guarded. */
const URLISH = /^(url|link|.*_?url.*|image.*|avatar.*|background.*|.*photo.*|guildicon)$/i;

/** Batas ukuran body JSON untuk POST — cukup untuk parameter, bukan file. */
const MAX_BODY_BYTES = 16 * 1024;

function findEndpoint(segments: string[]): EndpointDefinition | undefined {
  const upstreamPath = `/api/${segments.join("/")}`;
  return ENDPOINTS.find((e) => e.upstreamPath === upstreamPath);
}

/** Guard SSRF pada parameter yang membawa URL — dipakai GET dan POST. */
function guardUrlParams(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
): NextResponse | null {
  for (const p of endpoint.params) {
    const v = values[p.name];
    if (!v) continue;
    if (URLISH.test(p.name) && /^https?:\/\//i.test(v)) {
      const guard = assertSafeUrl(v);
      if (!guard.ok) {
        return withCors(jsonErr(ERR.URL_REJECTED.status, ERR.URL_REJECTED.code, guard.reason, { [p.name]: guard.reason }));
      }
    }
  }
  return null;
}

/**
 * Jalur upstream alternatif bila node utama sedang down (mis. 503 "All nodes failed").
 * Parameter dikirim apa adanya ke path alternatif yang menerima format sama;
 * fallback hanya dijalankan untuk kegagalan sisi server upstream (5xx/jaringan),
 * bukan untuk error validasi dari sisi pengguna.
 */
const FALLBACK_PATHS: Record<string, string[]> = {
  "/api/d/tiktok": ["/api/d/tiktok/v2", "/api/d/savefrom"],
  "/api/d/douyin": ["/api/d/savefrom"],
};

/** Kegagalan upstream yang layak dicoba lewat jalur alternatif. */
function isUpstreamServerFailure(result: Awaited<ReturnType<typeof callUpstream>>): boolean {
  return !result.ok && !result.tooLarge && result.status >= 500;
}

/** Panggil upstream dan terjemahkan response-nya ke format Cyronime — sama untuk GET/POST. */
async function respondWithUpstream(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
  method: "GET" | "POST",
  pathLabel: string,
  started: number,
): Promise<NextResponse> {
  // Jalur utama + jalur fallback (jika ada) — coba berurutan sampai ada yang berhasil.
  const candidates: EndpointDefinition[] = [endpoint];
  for (const alt of FALLBACK_PATHS[endpoint.upstreamPath] ?? []) {
    const altEndpoint = ENDPOINTS.find((e) => e.upstreamPath === alt);
    if (altEndpoint) candidates.push(altEndpoint);
  }

  let result: Awaited<ReturnType<typeof callUpstream>> = await callUpstream(endpoint, values, { method });
  for (let i = 1; i < candidates.length && isUpstreamServerFailure(result); i++) {
    result = await callUpstream(candidates[i] as EndpointDefinition, values, { method });
  }

  // Tahap terakhir: semua jalur upstream gagal 5xx → coba scraper mandiri (scrapr).
  // Deadline 40s: sisakan margin respons sebelum maxDuration (60s).
  if (isUpstreamServerFailure(result) && Date.now() - started < 40000) {
    const scraped = await scrapeFallback(endpoint.upstreamPath, values, Math.min(started + 40000, Date.now() + 30000));
    if (scraped && scraped.ok) {
      return withCors(
        jsonOk(scraped.data, `Request berhasil via scraper ${scraped.provider} (fallback)`, {
          path: pathLabel,
          upstream_status: result.status,
          fallback: "scrapr:" + scraped.provider,
          time_ms: Date.now() - started,
        }),
      );
    }
  }

  if (result.tooLarge) {
    return withCors(jsonErr(ERR.UPSTREAM.status, "UPSTREAM_TOO_LARGE", "Response sumber terlalu besar untuk diproses.", undefined, { path: pathLabel, upstream_status: 502, time_ms: Date.now() - started }));
  }
  const timeMs = Date.now() - started;
  const meta = { path: pathLabel, upstream_status: result.status, time_ms: timeMs };

  // Binary (image) upstream response: pass bytes through as-is.
  if (result.bytes) {
    if (!result.ok) return withCors(jsonErr(ERR.UPSTREAM.status, ERR.UPSTREAM.code, ERR.UPSTREAM.message, undefined, meta));
    return new NextResponse(new Blob([result.bytes.buffer.slice(result.bytes.byteOffset, result.bytes.byteOffset + result.bytes.byteLength) as ArrayBuffer]), {
      status: 200,
      headers: {
        "content-type": result.contentType,
        "cache-control": "public, max-age=3600",
        "x-upstream-status": String(result.status),
        "x-time-ms": String(timeMs),
      },
    });
  }

  // JSON / text upstream response.
  let body: unknown = null;
  let parseFailed = false;
  try {
    body = result.text ? JSON.parse(result.text) : null;
  } catch {
    parseFailed = true;
  }

  const upstreamBody = body as { status?: boolean; error?: string; code?: number | string } | null;

  if (!result.ok || parseFailed || (upstreamBody && upstreamBody.status === false)) {
    const upstreamMessage =
      parseFailed && result.ok
        ? "Response sumber tidak valid"
        : upstreamBody?.error ?? ERR.UPSTREAM.message;
    const status = result.status >= 400 ? result.status : ERR.UPSTREAM.status;
    const code = upstreamBody?.code ? `UPSTREAM_${upstreamBody.code}` : ERR.UPSTREAM.code;
    return withCors(jsonErr(status, code, upstreamMessage ?? ERR.UPSTREAM.message, undefined, meta));
  }

  const data =
    upstreamBody && typeof upstreamBody === "object" && "data" in (upstreamBody as Record<string, unknown>)
      ? (upstreamBody as Record<string, unknown>).data
      : body;

  return withCors(jsonOk(data, "Request berhasil", { ...meta, size_bytes: result.text ? result.text.length : undefined }));
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const started = Date.now();

  // --- rate limiting ---
  const rate = checkRateLimit(getClientId(req));
  if (!rate.allowed) {
    const res = jsonErr(429, ERR.RATE.code, ERR.RATE.message);
    res.headers.set("retry-after", String(rate.retryAfterSeconds ?? 60));
    return res;
  }

  // --- endpoint lookup ---
  const endpoint = findEndpoint(path);
  if (!endpoint) return withCors(jsonErr(ERR.NOT_FOUND.status, ERR.NOT_FOUND.code, ERR.NOT_FOUND.message));

  // --- validation (query string) ---
  const url = new URL(req.url);
  const { values, errors } = validateParams(endpoint, url.searchParams);
  if (Object.keys(errors).length > 0) {
    return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Request tidak valid. Periksa parameter Anda.", errors));
  }

  // --- SSRF guard ---
  const guard = guardUrlParams(endpoint, values);
  if (guard) return guard;

  return respondWithUpstream(endpoint, values, "GET", `/api/v1/${path.join("/")}`, started);
}

/**
 * POST: parameter dikirim sebagai JSON body, divalidasi dengan skema Zod
 * yang sama seperti GET (termasuk guard SSRF, rate limit, timeout, dan
 * batas ukuran response).
 */
export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const started = Date.now();

  // --- rate limiting ---
  const rate = checkRateLimit(getClientId(req));
  if (!rate.allowed) {
    const res = jsonErr(429, ERR.RATE.code, ERR.RATE.message);
    res.headers.set("retry-after", String(rate.retryAfterSeconds ?? 60));
    return res;
  }

  // --- endpoint lookup ---
  const endpoint = findEndpoint(path);
  if (!endpoint) return withCors(jsonErr(ERR.NOT_FOUND.status, ERR.NOT_FOUND.code, ERR.NOT_FOUND.message));

  // --- body: wajib JSON object, dibatasi ukurannya ---
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return withCors(jsonErr(ERR.VALIDATION.status, "BODY_TOO_LARGE", "Body request terlalu besar (maksimum 16 KB)."));
  }
  let parsed: Record<string, unknown>;
  try {
    const obj: unknown = JSON.parse(raw || "{}");
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Body harus berupa JSON object berisi parameter endpoint."));
    }
    parsed = obj as Record<string, unknown>;
  } catch {
    return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Body harus berupa JSON yang valid."));
  }

  // --- validation: nilai body diperlakukan sama seperti query string ---
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") {
      return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, `Nilai parameter '${k}' harus string, number, atau boolean.`));
    }
    searchParams.set(k, String(v));
  }
  const { values, errors } = validateParams(endpoint, searchParams);
  if (Object.keys(errors).length > 0) {
    return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Request tidak valid. Periksa parameter Anda.", errors));
  }

  // --- SSRF guard ---
  const guard = guardUrlParams(endpoint, values);
  if (guard) return guard;

  return respondWithUpstream(endpoint, values, "POST", `/api/v1/${path.join("/")}`, started);
}

/** Preflight untuk pemanggilan lintas origin dari browser. */
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export const dynamic = "force-dynamic";
