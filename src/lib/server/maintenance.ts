/**
 * Status maintenance global — sumber kebenaran tunggal di Redis.
 * Cache in-process 5 detik agar tidak memanggil Redis untuk setiap request,
 * dengan jendela kedaluwarsa yang sempit dan aman (maks 5 detik stale).
 *
 * Strategi kegagalan (fail-open): jika Redis tidak dapat dihubungi,
 * maintenance dianggap NONAKTIF supaya ketersediaan API tidak
 * bergantung pada infrastruktur notifikasi/admin. Dokumentasikan di
 * docs/maintenance-telegram.md.
 */
import { redisConfigured, redisTry } from "./store/redis";

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  title: string;
  startedAt: string | null;
  updatedAt: string | null;
  estimatedEndAt: string | null;
  updatedBy: string | null;
}

export const DEFAULT_TITLE = "Aomi API Sedang Maintenance";
export const DEFAULT_MESSAGE = "Aomi API sedang dalam maintenance. Silakan coba lagi nanti.";

const KEY = "aomi:maintenance";
const CACHE_TTL_MS = 5000;
const MAX_MESSAGE_LEN = 500;

const DEFAULT_STATE: MaintenanceState = {
  enabled: false,
  message: DEFAULT_MESSAGE,
  title: DEFAULT_TITLE,
  startedAt: null,
  updatedAt: null,
  estimatedEndAt: null,
  updatedBy: null,
};

let cache: { value: MaintenanceState; at: number } | null = null;

function coerce(raw: unknown): MaintenanceState | null {
  if (typeof raw !== "string") return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      enabled: o.enabled === true,
      message: typeof o.message === "string" && o.message ? o.message : DEFAULT_MESSAGE,
      title: typeof o.title === "string" && o.title ? o.title : DEFAULT_TITLE,
      startedAt: typeof o.startedAt === "string" ? o.startedAt : null,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : null,
      estimatedEndAt: typeof o.estimatedEndAt === "string" ? o.estimatedEndAt : null,
      updatedBy: typeof o.updatedBy === "string" ? o.updatedBy : null,
    };
  } catch {
    return null;
  }
}

/** Baca status maintenance (cache 5 detik, fail-open). */
export async function getMaintenance(): Promise<MaintenanceState> {
  if (!redisConfigured()) return DEFAULT_STATE;
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  const res = await redisTry([["get", KEY]]);
  if (!res) return cache?.value ?? DEFAULT_STATE;
  const value = coerce(res[0]) ?? DEFAULT_STATE;
  cache = { value, at: Date.now() };
  return value;
}

export interface MaintenancePatch {
  enabled?: boolean;
  message?: string;
  estimatedEndAt?: string | null;
}

/** Tulis perubahan status. Melempar Error bila Redis tidak tersedia. */
export async function setMaintenance(patch: MaintenancePatch, updatedBy: string): Promise<MaintenanceState> {
  if (!redisConfigured()) throw new Error("Penyimpanan belum dikonfigurasi. Set UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN.");
  if (patch.message !== undefined && patch.message.length > MAX_MESSAGE_LEN) {
    throw new Error(`Pesan maintenance maksimal ${MAX_MESSAGE_LEN} karakter.`);
  }
  const current = await getMaintenance();
  const next: MaintenanceState = {
    enabled: patch.enabled ?? current.enabled,
    message: patch.message?.trim() ? patch.message.trim() : patch.message === "" ? DEFAULT_MESSAGE : current.message,
    title: current.title,
    startedAt: patch.enabled === true ? (current.startedAt ?? new Date().toISOString()) : patch.enabled === false ? null : current.startedAt,
    updatedAt: new Date().toISOString(),
    estimatedEndAt: patch.estimatedEndAt === undefined ? current.estimatedEndAt : patch.estimatedEndAt,
    updatedBy,
  };
  const res = await redisTry([["set", KEY, JSON.stringify(next)]]);
  if (!res) throw new Error("Gagal menulis status maintenance ke penyimpanan.");
  cache = { value: next, at: Date.now() };
  return next;
}
