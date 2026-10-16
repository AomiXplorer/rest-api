import "server-only";

/**
 * Provider "primary" — upstream utama (default) yang sudah dipakai semua
 * endpoint lama. Modul ini memisahkan konfigurasi/akses primary dari provider
 * alternatif (lihat providers/sanka.ts) agar resolver dapat memilih sumber.
 */
export { UPSTREAM_BASE_URL, UPSTREAM_MAX_BYTES } from "@/lib/server/upstream";
export { callUpstream } from "@/lib/api-clients/upstream-client";
