/**
 * SSRF guard for user-supplied URL parameters.
 *
 * We never fetch user URLs ourselves — they are forwarded to the upstream
 * service which performs the actual download. Still, we reject obviously
 * dangerous targets before forwarding, so this API cannot be used to probe
 * internal networks through the upstream.
 */

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);
const BLOCKED_HOSTNAMES = /^(localhost|127\.|0\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|\[?::1\]?|metadata\.|169\.254\.169\.254)/i;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function isPrivateIpv4(host: string): boolean {
  const m = host.match(IPV4_RE);
  if (!m) return false;
  const parts = host.split(".").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

export type UrlGuardResult = { ok: true; url: string } | { ok: false; reason: string };

export function assertSafeUrl(input: string): UrlGuardResult {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { ok: false, reason: "URL tidak valid" };
  }
  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    return { ok: false, reason: "Hanya skema http dan https yang diizinkan" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "URL dengan kredensial tersemat tidak diizinkan" };
  }
  const host = parsed.hostname.toLowerCase();
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) {
    return { ok: false, reason: "Hostname internal tidak diizinkan" };
  }
  if (BLOCKED_HOSTNAMES.test(host) || isPrivateIpv4(host)) {
    return { ok: false, reason: "URL menuju alamat internal/private tidak diizinkan" };
  }
  if (parsed.href.length > 2000) {
    return { ok: false, reason: "URL terlalu panjang (maksimum 2000 karakter)" };
  }
  return { ok: true, url: parsed.href };
}
