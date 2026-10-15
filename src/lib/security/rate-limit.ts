/**
 * Best-effort in-memory rate limiter (sliding window, per client IP).
 *
 * NOTE: On serverless platforms (Vercel) each instance keeps its own window,
 * so this is a soft limit per instance, not a global guarantee. For a hard
 * global limit plug in a centralized store (e.g. Upstash Redis) — see
 * docs/README. Kept dependency-free by design.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 40);

interface Bucket {
  timestamps: number[];
}

declare global {
  // eslint-disable-next-line no-var
  var __rateBuckets: Map<string, Bucket> | undefined;
}

const buckets = (globalThis.__rateBuckets ??= new Map<string, Bucket>());

export function checkRateLimit(clientId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const bucket = buckets.get(clientId) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldest = bucket.timestamps[0]!;
    buckets.set(clientId, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }
  bucket.timestamps.push(now);
  buckets.set(clientId, bucket);

  // opportunistic cleanup
  if (buckets.size > 10_000) {
    for (const [key, b] of buckets) {
      if (b.timestamps.every((t) => now - t >= WINDOW_MS)) buckets.delete(key);
    }
  }
  return { allowed: true };
}

export function getClientId(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
