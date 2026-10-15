# Aomi Still Learning — REST API Website & Proxy

Website REST API "Aomi Still Learning" dengan backend proxy yang benar-benar memproses request. Sumber endpoint: [api.siputzx.my.id](https://api.siputzx.my.id) (public, tanpa API key). Desain terinspirasi struktur landing page dan halaman docs `apiii-xrina.my.id` (neo-brutalist dark theme, bukan clone visual).

- **197 endpoint** GET dalam **14 kategori**, diinventarisasi dari OpenAPI spec resmi sumber (lihat `docs/endpoint-inventory.md`).
- **148 endpoint terverifikasi** end-to-end melalui backend lokal saat pengujian (lihat `docs/testing-report.md`); 49 lainnya gagal karena node sumber sedang down (503/504) atau route-nya tidak ada (404) — tetap terimplementasi dan terdokumentasi dengan badge jujur.
- Fitur: landing page, dokumentasi interaktif dengan pencarian, navigasi kategori, **Try API** (request nyata), response viewer (status/waktu/ukuran, syntax highlight, preview gambar), validasi Zod, SSRF guard, rate limiting, health check.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Zod · Lucide React. Tanpa dependensi native, tanpa browser automation — kompatibel untuk Vercel.

## Struktur

```
src/
├── app/
│   ├── page.tsx                 # landing page
│   ├── docs/page.tsx            # halaman dokumentasi
│   ├── api/
│   │   ├── health/route.ts      # health check lokal
│   │   └── v1/[...path]/route.ts# semua endpoint /api/v1/*
│   └── globals.css
├── components/
│   ├── layout/  home/  docs/  ui/
├── config/
│   ├── endpoints.ts             # konfigurasi terpusat (197 endpoint) — AUTO-GENERATED
│   └── verification.ts          # id endpoint yang lolos pengujian nyata
├── lib/
│   ├── api-clients/upstream-client.ts   # adapter sumber (timeout, error, binary)
│   ├── security/  rate-limit.ts, ssrf-guard.ts
│   ├── validation/validate-params.ts    # validasi Zod per endpoint
│   └── utils/response.ts                # format response konsisten
├── types/api.ts
tools/generate-endpoints.py      # regenerasi config dari OpenAPI spec sumber
docs/endpoint-inventory.md       # hasil audit sumber
docs/testing-report.md           # hasil pengujian nyata
```

## Environment Variables

| Variabel | Default | Keterangan |
|---|---|---|
| `UPSTREAM_BASE_URL` | `https://api.siputzx.my.id` | Base URL sumber yang di-proxy |
| `RATE_LIMIT_PER_MINUTE` | `40` | Batas request per menit per IP untuk `/api/v1/*` |

Tidak ada API key yang dibutuhkan. Salin `.env.example` ke `.env.local` untuk konfigurasi lokal.

## Menjalankan Lokal

```bash
npm install
npm run dev        # http://localhost:3000
```

Produksi:

```bash
npm run build && npm start
```

## Pengujian

```bash
npx tsc --noEmit                 # type check
npm run build                    # build production
curl http://localhost:3000/api/health
# contoh endpoint:
curl "http://localhost:3000/api/v1/s/youtube?query=lathi"
curl "http://localhost:3000/api/v1/primbon/artinama?nama=putu"
```

Menguji ulang seluruh endpoint secara massal: jalankan server produksi lalu kirim request contoh ke `/api/v1/*` per baris inventaris (`docs/endpoint-inventory.md`). Perbarui `src/config/verification.ts` hanya berdasarkan hasil nyata.

## Regenerasi Konfigurasi Endpoint

```bash
python3 tools/generate-endpoints.py
```

Mengambil OpenAPI spec resmi sumber dan menulis ulang `src/config/endpoints.ts` (197 endpoint, parameter, contoh, timeout per kategori).

## Deployment ke Vercel

```bash
npx vercel        # atau: push ke GitHub → import di vercel.com
```

Semua backend memakai Route Handlers serverless tanpa state persisten dan tanpa dependensi native, sehingga kompatibel dengan lingkungan Vercel. `RATE_LIMIT_PER_MINUTE` bisa diatur di dashboard Vercel (Project → Settings → Environment Variables). Catatan: rate limiter bersifat per-instance; untuk traffic tinggi gunakan penyimpanan terpusat (mis. Upstash Redis).

## Format Response Lokal

```jsonc
// sukses
{ "success": true, "data": { /* data asli sumber, tidak diubah */ }, "message": "Request berhasil", "meta": { "upstream_status": 200, "time_ms": 812 } }

// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { } } }
```

Kode error: `VALIDATION_ERROR` (400) · `URL_REJECTED` (400, SSRF) · `ENDPOINT_NOT_FOUND` (404) · `METHOD_NOT_ALLOWED` (405) · `RATE_LIMITED` (429) · `UPSTREAM_4xx/5xx` (502/503) · `TIMEOUT` (504). Endpoint gambar (canvas/maker/random tertentu) mengembalikan binary asli dengan content-type aslinya.

## Keamanan

- Validasi seluruh input via Zod (tipe, wajib, enum, min/max) — parameter di luar definisi diabaikan (allowlist).
- SSRF guard: hanya `http/https`, blokir loopback/private/link-local/metadata service, cek ulang IP setelah resolusi DNS, redirect tidak diikuti.
- Timeout per kategori, batas ukuran respons upstream (10 MB), rate limiting per IP, tanpa eksekusi input sebagai kode.
- Hanya GET (read-only) yang diekspos; POST/PUT/PATCH/DELETE ditolak 405.
