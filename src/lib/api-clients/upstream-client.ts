import "server-only";
import { UPSTREAM_BASE_URL, UPSTREAM_MAX_BYTES } from "@/lib/server/upstream";
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
  /** true ketika response upstream melebihi batas ukuran dan tidak diproses */
  tooLarge?: boolean;
}

const JSON_CT = /^\s*(application\/json|text\/plain)/i;

/**
 * Forward a validated request ke upstream API utama.
 * The upstream answers JSON ({status, data} / {status, error, code}) or binary images.
 *
 * Resource control:
 * - timeout per endpoint (AbortController)
 * - redirect mengikuti upstream (host sudah fixed lewat konfigurasi server)
 * - ukuran response dibatasi UPSTREAM_MAX_BYTES (default 4 MB)
 */
export async function callUpstream(
  endpoint: EndpointDefinition,
  values: Record<string, string>,
  opts: { method?: "GET" | "POST" } = {},
): Promise<UpstreamResult> {
  const method = opts.method ?? "GET";
  const url = new URL(UPSTREAM_BASE_URL + endpoint.upstreamPath);
  if (method === "GET") {
    for (const [k, v] of Object.entries(values)) url.searchParams.set(k, v);
  }
  const init: RequestInit = {
    method,
    signal: undefined,
    redirect: "follow",
    headers: { accept: "application/json, image/*" },
    cache: "no-store",
  };
  if (method === "POST") {
    init.headers = { accept: "application/json", "content-type": "application/json" };
    init.body = JSON.stringify(values);
  }

  const started = Date.now();
  const elapsed = () => Date.now() - started;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), endpoint.timeoutMs);

  const tooLarge = (): UpstreamResult => ({
    ok: false, status: 502, contentType: "", text: null, bytes: null,
    timeMs: elapsed(), tooLarge: true,
  });

  /**
   * Satu percobaan ulang ketika request upstream gagal karena jaringan/timeout
   * (bukan error HTTP dari upstream). Endpoint upstream sifatnya baca-saja,
   * jadi retry aman; total tetap dibatasi timeoutMs.
   */
  const ATTEMPTS = 2;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    init.signal = controller.signal;
    const res = await fetch(url, init);

    // Tolak sejak awal bila content-length diketahui melebihi batas.
    const declaredLength = Number(res.headers.get("content-length") ?? 0);
    if (declaredLength > UPSTREAM_MAX_BYTES) return tooLarge();

    const contentType = res.headers.get("content-type") ?? "application/octet-stream";

    if (JSON_CT.test(contentType)) {
      const text = await res.text();
      if (text.length > UPSTREAM_MAX_BYTES) return tooLarge();
      return { ok: res.ok, status: res.status, contentType, text, bytes: null, timeMs: elapsed() };
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > UPSTREAM_MAX_BYTES) return tooLarge();
    return { ok: res.ok, status: res.status, contentType, text: null, bytes: buf, timeMs: elapsed() };
  } catch {
    if (attempt < ATTEMPTS && elapsed() < endpoint.timeoutMs) {
      await new Promise((r) => setTimeout(r, 400));
      continue;
    }
    return { ok: false, status: 504, contentType: "", text: null, bytes: null, timeMs: elapsed() };
  } finally {
    if (attempt === ATTEMPTS) clearTimeout(timer);
  }
  }
  // Unreachable secara praktis; menjaga tipe pengembalian tetap lengkap.
  return { ok: false, status: 504, contentType: "", text: null, bytes: null, timeMs: elapsed() };
}
