// Cache sederhana untuk /api/health — semua widget berbagi satu request,
// hasil disimpan 30 detik supaya tidak ada fetch berulang tiap komponen.

export interface HealthInfo {
  ok: boolean;
  status: number;
  ip: string | null;
}

let cached: { at: number; data: HealthInfo } | null = null;
let inflight: Promise<HealthInfo> | null = null;

const TTL = 30_000;

export function getHealth(): Promise<HealthInfo> {
  if (cached && Date.now() - cached.at < TTL) return Promise.resolve(cached.data);
  if (inflight) return inflight;
  inflight = fetch("/api/health")
    .then(async (r) => {
      let ip: string | null = null;
      try {
        ip = (await r.json())?.ip ?? null;
      } catch {
        /* abaikan */
      }
      const data: HealthInfo = { ok: r.ok, status: r.status, ip };
      cached = { at: Date.now(), data };
      return data;
    })
    .catch(() => ({ ok: false, status: 503, ip: null }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
