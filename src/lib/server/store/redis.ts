/**
 * Klien Upstash Redis REST — tanpa dependency, aman untuk Node & Edge runtime.
 *
 * Semua command dikirim lewat endpoint /pipeline (satu round-trip).
 * Jika UPSTASH_REDIS_REST_URL/TOKEN tidak dikonfigurasi, exec() melempar
 * RedisNotConfigured — pemanggil wajib menangani dengan fail-open.
 *
 * NOTE: ini satu-satunya penyimpanan persisten proyek. Status maintenance
 * TIDAK disimpan in-memory saja (Vercel serverless = banyak instance),
 * cache in-process hanya berumur 5 detik.
 */

const REST_URL = () => process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN;

export class RedisNotConfigured extends Error {
  constructor() {
    super("Redis tidak dikonfigurasi (UPSTASH_REDIS_REST_URL/TOKEN).");
    this.name = "RedisNotConfigured";
  }
}

export function redisConfigured(): boolean {
  return Boolean(REST_URL() && REST_TOKEN());
}

export type RedisCommand = (string | number)[];

/** Jalankan pipeline command. Melempar Error saat Redis tidak tersedia. */
export async function redisExec(commands: RedisCommand[]): Promise<unknown[]> {
  const url = REST_URL();
  const token = REST_TOKEN();
  if (!url || !token) throw new RedisNotConfigured();
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Redis response tidak valid");
  return data.map((entry) => {
    const e = entry as { result?: unknown; error?: string };
    if (e && typeof e === "object" && "error" in e && e.error) {
      throw new Error(`Redis error: ${e.error}`);
    }
    return e?.result;
  });
}

/** Exec yang tidak pernah melempar — return null saat gagal/konfigurasi kosong. */
export async function redisTry(commands: RedisCommand[]): Promise<unknown[] | null> {
  try {
    return await redisExec(commands);
  } catch {
    return null;
  }
}
