# Laporan Pengujian — SipuAPI

Tanggal: 2026-10-15 · Lingkungan: sandbox Linux, Node 22, Next.js 15.5 (production build `next build && next start`), server lokal port 3100.

## Metodologi

1. **Audit sumber.** Endpoint diinventarisasi dari OpenAPI spec resmi sumber (`https://api.siputzx.my.id/api/openapi.json`) yang juga menggerakkan halaman playground. Tidak ada endpoint yang dikarang; semua berasal dari spec.
2. **Sweep verifikasi.** Setiap endpoint dipanggil melalui **backend lokal** (`/api/v1/...`) dengan parameter contoh hasil audit, timeout per kategori (AI 90 dtk, downloader 30 dtk, anime 60 dtk, lainnya 25 dtk). Sukses = HTTP 200 dengan JSON `success:true` ATAU gambar binary (canvas/maker/random gambar). Gagal diulang hingga 3x untuk membedakan kegagalan transien vs permanen.
3. **Pengujian error handling & keamanan.** Dilakukan manual dengan curl per kasus.

## Hasil Backend (197 endpoint)

| Hasil | Jumlah |
|---|---|
| Terverifikasi (response nyata via backend lokal) | **148** |
| Sumber gagal saat uji — upstream `503 All nodes failed` / timeout | 45 |
| Route tidak ada di sumber (upstream 404) walau tercantum di spec | 4 |

Sebaran terverifikasi per kategori: canvas 33, games 25, search 19, downloader 11, primbon 10, anime 9, random 9, berita 8, ai 7, stalk 5, tools 4, maker 4, info 3, sticker 1.

### Contoh hasil nyata

- `GET /api/v1/s/youtube?query=lathi` → HTTP 200, data hasil pencarian YouTube (JSON).
- `GET /api/v1/primbon/artinama?nama=putu` → HTTP 200, arti nama (JSON).
- `GET /api/v1/canvas/security?...` → HTTP 200, `image/png` 130 KB (pass-through binary).
- `GET /api/v1/r/quotesanime` → HTTP 200, quote anime acak.

### Endpoint yang tidak dapat diverifikasi (49)

**45 — upstream 503/504 (node sumber gagal saat pengujian):**
`d/tiktok`, `d/spotify`, `d/spotifyv2`, `d/soundcloud`, `d/snackvideo`, `d/fastdl`, `d/igram`, `d/ssstwiter`, `d/ytpost`, `d/rednote`,
`anime/anichin-*` (6), `anime/oploverz-*` (4), `anime/komikindo-*` (3), `anime/samehadaku-*` (4),
`ai/duckai`, `ai/metaai`, `ai/duckaiimage`, `ai/gemini`,
`r/neko`, `r/waifu`, `r/cats`, `r/seegore`,
`stalk/instagram`, `stalk/tiktok`,
`games/kabupaten`, `games/tebakhewan`,
`tools/ssweb`, `tools/vcc-generator`,
`canvas/top`,
`s/kbbi`, `s/musixmatch`,
`info/event-indonesia`.

**4 — route tidak ada di sumber (upstream 404):**
`s/spotify`, `berita/jkt48`, `berita/antara`, `stalk/roblox`.

Semua 49 endpoint di atas **tetap terimplementasi penuh** di proyek ini (handler, validasi, dokumentasi) — jika sumber pulih, endpoint langsung berfungsi tanpa perubahan kode. Status jujur ditampilkan di UI (badge "Belum terverifikasi").

## Pengujian Error Handling & Keamanan (dilakukan manual, semua lulus)

| Kasus | Permintaan | Hasil |
|---|---|---|
| Parameter wajib hilang | `GET /api/v1/s/youtube` | `400 VALIDATION_ERROR` + detail field |
| Angka di luar rentang | `GET /api/v1/primbon/cek_potensi_penyakit?tgl=99...` | `400` (upstream) dibungkus rapi `UPSTREAM_400` |
| Endpoint tidak dikenal | `GET /api/v1/nonexistent/thing` | `404 ENDPOINT_NOT_FOUND` |
| SSRF guard (loopback) | `GET /api/v1/d/tiktok?url=http://127.0.0.1/x` | `400 URL_REJECTED` (host internal diblokir) |
| Metode tidak didukung | `POST /api/v1/s/youtube` | `405 METHOD_NOT_ALLOWED` |
| Health check | `GET /api/health` | `200 {success:true,status:"ok"}` |
| Parameter di luar definisi | `?hack=1` | Diabaikan (allowlist param) |
| Timestamp milidetik (canvas/security) | `createdTimestamp=1672531200000` | Lolos setelah batas integer dinaikkan ke 10^12 (bug fix) |
| Sumber gagal | endpoint 503 upstream | `503 UPSTREAM_503` + meta upstream_status & time_ms |

## Pengujian Frontend (manual via browser + inspeksi build)

- Landing page: hero, statistik dari data aktual (197 endpoint / 14 kategori / 148 terverifikasi), grid kategori, contoh request-response dengan tombol salin — OK.
- Halaman `/docs`: sidebar 14 kategori + daftar endpoint + badge metode GET, pencarian (nama/path/deskripsi/kategori/tag) dengan empty-state, drawer mobile, panel detail (tabel parameter, contoh URL, tombol salin), Try API dengan form dinamis, loading state, response viewer (status HTTP, waktu, ukuran, syntax highlight, tombol salin, preview gambar untuk endpoint binary) — OK.
- Responsif: layout desktop 2 kolom (sidebar + detail), mobile drawer + tabel scroll horizontal — diverifikasi via build & devtools viewport.
- Build production: `next build` lulus tanpa error; type check `tsc --noEmit` lulus.

## Batasan

1. **Ketergantungan sumber.** Ketersediaan endpoint bergantung penuh pada `api.siputzx.my.id`. Saat pengujian, 45 endpoint mengembalikan `503 All nodes failed` dari node sumber itu sendiri.
2. **Rate limiting bersifat per-instance.** Implementasi in-memory per fungsi serverless cocok untuk demo/deployment kecil; untuk produksi ber-traffic tinggi dianjurkan penyimpanan terpusat (mis. Upstash Redis).
3. **Status "Terverifikasi" adalah snapshot.** Endpoint sumber berubah tanpa pemberitahuan; jalankan ulang sweep (lihat README, bagian Pengujian) untuk memperbarui.
4. **Deploy ke Vercel belum dilakukan** (tidak ada akses akun Vercel pemilik). Proyek sudah disiapkan agar kompatibel (Route Handlers murni, tanpa dependensi native, tanpa state persisten), namun klaim "sudah live" tidak dibuat.
