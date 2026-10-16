import "server-only";

/**
 * Konfigurasi provider Sanka — SERVER ONLY.
 * API key TIDAK pernah di-hardcode di sini; ia hanya datang dari environment
 * variable (Vercel / .env lokal). Modul ini tidak boleh diimpor dari client.
 *
 * SANKA_BASE_URL : base URL API Sanka (tanpa trailing slash)
 * SANKA_API_KEY  : API key resmi; tanpa ini provider Sanka nonaktif.
 */
export const SANKA_BASE_URL = process.env.SANKA_BASE_URL ?? "https://www.sankavollerei.web.id";

/** Kosong / tidak diset -> provider Sanka dinonaktifkan. */
export const SANKA_API_KEY = process.env.SANKA_API_KEY ?? "";
