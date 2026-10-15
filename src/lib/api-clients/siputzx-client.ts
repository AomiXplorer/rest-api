import { UPSTREAM_BASE_URL } from "@/config/endpoints";
import type { EndpointDefinition } from "@/types/api";

export interface UpstreamResult {
  ok: boolean;
  /** HTTP status of the response actually received */
  status: number;
  contentType: string;
  /** Raw body text when content is JSON/text, else null */
  text: string | null;
  /** Raw bytes when content is binary (image etc.), else null */
  bytes: Uint8Array | null;
  timeMs: number;
}

const JSON_CT = /^\s*(application\/json|text\/plain)/i;

/**
 * Forward a validated request to the siputzx upstream API.
 * The upstream answers JSON ({status, data} / {status, error, code}) or binary images.
 */
export async function callUpstream(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
): Promise<UpstreamResult> {
  const url = new URL(UPSTREAM_BASE_URL + endpoint.upstreamPath);
  for (const [k, v] of Object.entries(values)) url.searchParams.set(k, v);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), endpoint.timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: { accept: "application/json, image/*" },
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const elapsed = Date.now() - started;

    if (JSON_CT.test(contentType)) {
      const text = await res.text();
      return { ok: res.ok, status: res.status, contentType, text, bytes: null, timeMs: elapsed };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    return { ok: res.ok, status: res.status, contentType, text: null, bytes: buf, timeMs: elapsed };
  } catch {
    const elapsed = Date.now() - started;
    return { ok: false, status: 504, contentType: "", text: null, bytes: null, timeMs: elapsed };
  } finally {
    clearTimeout(timer);
  }
}
