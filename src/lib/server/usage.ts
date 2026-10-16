/**
 * Riwayat & agregat penggunaan API (persisten di Redis).
 *
 * Prinsip:
 * - Dicatat TANPA data sensitif (tidak ada query string, header, body, IP penuh).
 * - Pencatatan dilakukan via next/server `after()` — tidak pernah menahan
 *   response dan tidak pernah membuat request gagal.
 * - Notifikasi Telegram diagregasi per jendela 15 menit (bukan per request)
 *   supaya admin tidak dibanjiri; rate limit 429 ditangani di client Telegram.
 *
 * Skema (retensi):
 * - aomi:usage:day:{YYYY-MM-DD}  hash: total, ok, err, maint   (EXPIRE 90 hari)
 * - aomi:ep                      zset: skor = jumlah panggilan per endpoint
 * - aomi:recent                  list ≤ 100 record ringkas (terbaru dulu)
 * - aomi:win:{epoch15m}          hash per 15 menit: total, maint (EXPIRE 30 mnt)
 */
import { redisConfigured, redisTry } from "./store/redis";
import { tgNotifyUsage } from "./telegram";

export interface UsageRecord {
  id: string;
  ts: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  source: "web" | "api-client" | "unknown";
  maintenance: boolean;
  errorCode?: string;
}

/** Klasifikasi sumber — heuristik sederhana & jujur, bukan identitas pengguna. */
export function classifySource(req: Request): UsageRecord["source"] {
  const ua = req.headers.get("user-agent") ?? "";
  const hasSecFetch = req.headers.has("sec-fetch-site") || req.headers.has("sec-fetch-dest");
  if (hasSecFetch && ua.includes("Mozilla")) return "web";
  if (ua) return "api-client";
  return "unknown";
}

function dayKeyJakarta(d = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  });
  return `aomi:usage:day:${fmt.format(d)}`;
}

const WIN_MS = 15 * 60 * 1000;
const NOTIFY_TOTAL_THRESHOLD = 20; // ringkasan pertama per jendela
const NOTIFY_MAINT_THRESHOLD = 10;

/** Catat satu request + kirim ringkasan agregat bila ambang tercapai. */
export async function recordUsage(rec: UsageRecord): Promise<void> {
  if (!redisConfigured()) return;
  try {
    const win = Math.floor(Date.now() / WIN_MS);
    const day = dayKeyJakarta();
    const bucket = rec.status < 400 ? "ok" : rec.status < 500 ? "err" : "err";
    const cmds = [
      ["hincrby", day, "total", 1],
      ["hincrby", day, bucket, 1],
      ["expire", day, 7776000],
      ["zincrby", "aomi:ep", 1, rec.path],
      ["lpush", "aomi:recent", JSON.stringify(rec)],
      ["ltrim", "aomi:recent", 0, 99],
      ["hincrby", `aomi:win:${win}`, "total", 1],
      ["expire", `aomi:win:${win}`, 1800],
    ];
    if (rec.maintenance) {
      cmds.push(["hincrby", day, "maint", 1]);
      cmds.push(["hincrby", `aomi:win:${win}`, "maint", 1]);
    }
    const res = await redisTry(cmds);
    if (!res) return;
    const winTotal = Number(res[6]);
    const winMaint = rec.maintenance ? Number(res[8]) : 0;
    if (winTotal === NOTIFY_TOTAL_THRESHOLD) {
      await tgNotifyUsage("total", win, winTotal);
    } else if (rec.maintenance && winMaint === NOTIFY_MAINT_THRESHOLD) {
      await tgNotifyUsage("maintenance", win, winTotal);
    }
  } catch {
    /* tidak pernah merusak request utama */
  }
}

export interface UsageStats {
  today: { total: number; ok: number; err: number; maint: number };
  topEndpoints: { path: string; count: number }[];
  recentCount: number;
}

/** Statistik dari data aktual — tidak ada angka buatan. */
export async function getUsageStats(): Promise<UsageStats | null> {
  if (!redisConfigured()) return null;
  const day = dayKeyJakarta();
  const res = await redisTry([
    ["hgetall", day],
    ["zrevrange", "aomi:ep", "0", "4", "WITHSCORES"],
    ["llen", "aomi:recent"],
  ]);
  if (!res) return null;
  const h = (res[0] ?? {}) as Record<string, string>;
  const z = (res[1] ?? []) as string[];
  const top: { path: string; count: number }[] = [];
  for (let i = 0; i < z.length; i += 2) {
    top.push({ path: z[i] ?? "", count: Number(z[i + 1]) });
  }
  return {
    today: {
      total: Number(h.total ?? 0),
      ok: Number(h.ok ?? 0),
      err: Number(h.err ?? 0),
      maint: Number(h.maint ?? 0),
    },
    topEndpoints: top,
    recentCount: Number(res[2] ?? 0),
  };
}
