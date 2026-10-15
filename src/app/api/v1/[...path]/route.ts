import { NextResponse } from "next/server";
import { ENDPOINTS } from "@/config/endpoints";
import { callUpstream } from "@/lib/api-clients/siputzx-client";
import { assertSafeUrl } from "@/lib/security/url-guard";
import { checkRateLimit, getClientId } from "@/lib/security/rate-limit";
import { validateParams } from "@/lib/validation/validate-params";
import { jsonErr, jsonOk, ERR } from "@/lib/utils/response";
import type { EndpointDefinition } from "@/types/api";

/** Parameter names that carry a URL the upstream will fetch — SSRF-guarded. */
const URLISH = /^(url|link|.*_?url.*|image.*|avatar.*|background.*|.*photo.*|guildicon)$/i;

function findEndpoint(segments: string[]): EndpointDefinition | undefined {
  const upstreamPath = `/api/${segments.join("/")}`;
  return ENDPOINTS.find((e) => e.upstreamPath === upstreamPath);
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
  if (!endpoint) return jsonErr(ERR.NOT_FOUND.status, ERR.NOT_FOUND.code, ERR.NOT_FOUND.message);

  // --- validation ---
  const url = new URL(req.url);
  const { values, errors } = validateParams(endpoint, url.searchParams);
  if (Object.keys(errors).length > 0) {
    return jsonErr(ERR.VALIDATION.status, ERR.VALIDATION.code, "Request tidak valid. Periksa parameter Anda.", errors);
  }

  // --- SSRF guard on URL-carrying params ---
  for (const p of endpoint.params) {
    const v = values[p.name];
    if (!v) continue;
    if (URLISH.test(p.name) && /^https?:\/\//i.test(v)) {
      const guard = assertSafeUrl(v);
      if (!guard.ok) {
        return jsonErr(ERR.URL_REJECTED.status, ERR.URL_REJECTED.code, guard.reason, { [p.name]: guard.reason });
      }
    }
  }

  // --- forward to upstream ---
  const result = await callUpstream(endpoint, values);
  const timeMs = Date.now() - started;
  const meta = { path: `/api/v1/${path.join("/")}`, upstream_status: result.status, time_ms: timeMs };

  // Binary (image) upstream response: pass bytes through as-is.
  if (result.bytes) {
    if (!result.ok) return jsonErr(ERR.UPSTREAM.status, ERR.UPSTREAM.code, ERR.UPSTREAM.message, undefined, meta);
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
    return jsonErr(status, code, upstreamMessage ?? ERR.UPSTREAM.message, undefined, meta);
  }

  const data =
    upstreamBody && typeof upstreamBody === "object" && "data" in (upstreamBody as Record<string, unknown>)
      ? (upstreamBody as Record<string, unknown>).data
      : body;

  return jsonOk(data, "Request berhasil", { ...meta, size_bytes: result.text ? result.text.length : undefined });
}

export async function POST() {
  return jsonErr(ERR.METHOD.status, ERR.METHOD.code, ERR.METHOD.message);
}

export const dynamic = "force-dynamic";
