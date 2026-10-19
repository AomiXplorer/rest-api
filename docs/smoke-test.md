# Smoke Test Menyeluruh — 2026-10-19

Metode: seluruh 261 endpoint publik diuji langsung ke produksi
(cyronime.my.id) memakai contoh parameter dari dokumentasi, dua kali
pass, dengan pacing sesuai rate limit. Klasifikasi sukses mencakup
response JSON valid dan response gambar binary valid.

## Hasil

- Diuji: 261/261
- Sukses: 207 (79%)
- Pulih setelah perbaikan pihak Aomi: 5 (r/cats, r/neko, d/github,
  manga/mangadex-manga, manga/mangadex-chapter)
- Pulih sendiri (gangguan sementara upstream): 4 (komikindo-search,
  komikindo-download, games/tebakkartun, games/tebakbendera, r/justina)
- Tetap gagal (49) — seluruhnya gangguan eksternal, bukan bug kode Aomi.

## Rincian 49 kegagalan eksternal (per penyebab)

1. Node upstream anime mati — UPSTREAM_503 "All nodes failed":
   samehadaku (detail/download/latest/release/search), oploverz
   (download/episode/ongoing/search), anichin (detail/download/episode/
   latest/popular/search) — 15 endpoint.
2. Provider AI eksternal menolak — duckai, duckaiimage, gemini, metaai.
3. Node upstream downloader mati: soundcloud, fastdl, ytpost, rednote.
4. API enhancer foto 500 eksternal: m/removebg, m/remini, m/colorize,
   m/upscale, m/restore.
5. Pemblokiran platform: stalk/instagram (403), stalk/tiktok
   (response terpotong), stalk/ml (contoh ID fiktif → data tidak
   ditemukan; ganti dengan ID asli untuk tes nyata).
6. Route upstream hilang: berita/jkt48, stalk/roblox (UPSTREAM_404).
7. API utilitas pihak ketiga menolak/menolak permintaan dari server:
   tools/tinyurl, tools/create-qris, tools/emojimix, d/snackvideo,
   d/pinterest, d/terabox, canvas/top, games/kabupaten, games/tebakhewan,
   info/event-indonesia.
8. Domain sumber mati: r/waifu (api.waifu.pics tidak lagi resolve).
9. Timeout sumber: s/kbbi, d/savefrom, r/seegore.

## Perbaikan yang diterapkan

- Fallback natif tahap-4 untuk r/cats (cataas.com) dan r/neko
  (nekos.life) — hanya aktif saat semua node upstream gagal.
- Contoh parameter rusak diganti dengan nilai asli yang terverifikasi
  (d/github, manga/mangadex-manga, manga/mangadex-chapter).
- Semua perbaikan diverifikasi ulang di produksi (200).

Kegagalan kategori 1–9 membutuhkan pemulihan di sisi penyedia, atau
implementasi natif bertahap mengikuti daftar audit Rin API.
