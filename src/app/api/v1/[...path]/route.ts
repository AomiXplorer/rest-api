import { NextResponse } from "next/server";
import { findEndpoint } from "@/lib/server/services/registry";
import { resolveProvider, type RequestedProvider } from "@/lib/server/services/provider-resolver";
import { assertSafeUrl } from "@/lib/security/url-guard";
import { checkRateLimit, getClientId } from "@/lib/security/rate-limit";
import { validateParams } from "@/lib/validation/validate-params";
import { jsonErr, jsonOk, ERR } from "@/lib/utils/response";
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

/** Parameter kontrol untuk memilih sumber data (provider resolver). */
const PROVIDER_PARAM = "provider";
const VALID_PROVIDERS = new Set(["primary", "sanka"]);

function parseRequestedProvider(raw: string | null | undefined): RequestedProvider {
  return raw && VALID_PROVIDERS.has(raw) ? (raw as RequestedProvider) : undefined;
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

/** Bangun response final dari outcome provider resolver. */
function respondWithOutcome(
  outcome: Awaited<ReturnType<typeof resolveProvider>>,
  pathLabel: string,
  started: number,
): NextResponse {
  if (outcome.kind === "error") {
    const meta = { ...outcome.meta, path: pathLabel, time_ms: Date.now() - started };
    return withCors(jsonErr(outcome.status, outcome.code, outcome.message, undefined, meta));
  }
  if (outcome.binary) {
    return withCors(
      new NextResponse(
        new Blob([outcome.binary.bytes.buffer.slice(
          outcome.binary.bytes.byteOffset,
          outcome.binary.bytes.byteOffset + outcome.binary.bytes.byteLength,
        ) as ArrayBuffer]),
        {
          status: 200,
          headers: {
            "content-type": outcome.binary.contentType,
            "cache-control": "public, max-age=3600",
            "x-provider": outcome.provider,
            "x-time-ms": String(Date.now() - started),
          },
        },
      ),
    );
  }
  const meta = { ...outcome.meta, path: pathLabel, time_ms: Date.now() - started };
  return withCors(
    jsonOk(
      outcome.data,
      outcome.provider === "sanka"
        ? "Request berhasil via provider Sanka"
        : outcome.provider === "scrapr"
          ? "Request berhasil via scraper mandiri (fallback)"
          : "Request berhasil",
      meta,
    ),
  );
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
  const requested = parseRequestedProvider(url.searchParams.get(PROVIDER_PARAM));
  url.searchParams.delete(PROVIDER_PARAM);
  const { values, errors } = validateParams(endpoint, url.searchParams);
  if (Object.keys(errors).length > 0) {
    return withCors(jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Request tidak valid. Periksa parameter Anda.", errors));
  }

  // --- SSRF guard ---
  const guard = guardUrlParams(endpoint, values);
  if (guard) return guard;

  const outcome = await resolveProvider(endpoint, values, {
    method: "GET",
    requested,
    pathLabel: `/api/v1/${path.join("/")}`,
    startedAt: started,
  });
  return respondWithOutcome(outcome, `/api/v1/${path.join("/")}`, started);
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

  // --- pilihan provider (param kontrol; tidak masuk validasi) ---
  const requested = parseRequestedProvider(String(parsed[PROVIDER_PARAM] ?? ""));
  delete parsed[PROVIDER_PARAM];

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

  const outcome = await resolveProvider(endpoint, values, {
    method: "POST",
    requested,
    pathLabel: `/api/v1/${path.join("/")}`,
    startedAt: started,
  });
  return respondWithOutcome(outcome, `/api/v1/${path.join("/")}`, started);
}

/** Preflight untuk pemanggilan lintas origin dari browser. */
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export const dynamic = "force-dynamic";
