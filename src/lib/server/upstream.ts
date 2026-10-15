import "server-only";

/**
 * Konfigurasi upstream — SERVER ONLY.
 * Modul ini tidak boleh (dan tidak bisa, via `server-only`) diimpor dari
 * komponen client. Base URL dikelola lewat environment variable agar
 * penggantian sumber tidak menyentuh kode frontend.
 *
 * SIPUTZX_BASE_URL  : base URL upstream (tanpa trailing slash)
 * UPSTREAM_MAX_BYTES: batas ukuran response upstream yang diproses (default 4 MB)
 */
export const SIPUTZX_BASE_URL = process.env.SIPUTZX_BASE_URL ?? "https://api.siputzx.my.id";

export const UPSTREAM_MAX_BYTES = Number(process.env.UPSTREAM_MAX_BYTES ?? 4 * 1024 * 1024);
