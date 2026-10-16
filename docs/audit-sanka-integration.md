# Audit & Integrasi Sanka Vollerei ke Aomi REST API

Tanggal: 2026-10-16 · Status: **Terimplementasi & teruji lokal**

## Ringkasan

Endpoint API Sanka Vollerei (www.sankavollerei.web.id, total 144 terdaftar aktif)
diaudit satu per satu secara langsung (live testing), lalu diklasifikasikan terhadap
endpoint Aomi yang sudah ada. Hasilnya:

- **48 endpoint baru** ditambahkan sebagai fitur baru (dilayani provider Sanka, `sankaOnly`).
- **30 endpoint lama** mendapat Sanka sebagai **sumber alternatif** (fallback otomatis +
  pilihan eksplisit via `?provider=sanka`). Perilaku default endpoint lama TIDAK berubah.
- Total endpoint publik: **197 → 245**.

## Klasifikasi (sesuai instruksi owner)

### Grup A — Fitur baru (endpoint Sanka-native, `sankaOnly: true`)

| Kategori | Endpoint baru |
|---|---|
| ai | arona, realtime (7 model), prompt-to-image |
| anime | ppcp, blue archive character, tts nahida |
| d | videy, ytmp4, ytmp3, aio, npmjs, terabox, pinterest |
| r | quotes, cek-nomor, cek-nomorinter |
| s | playstore, npm, douyin |
| tools | text-to-speech, tinyurl, jadwal-sholat, jadwal-sholat-inter, convert-uang, pagespeed, webtozip, traffic, emojitogif, emojimix, qrcode, 2fa-generate, 2fa-generator, autotranslate, iplookup |
| stalk | genshin, ml, minecraft, cek-resi, whatsapp channel |
| m | to-comic, bratvideo, remini, removebg, upscale, colorize, restore |
| berita | liputan6 search, liputan6 detail |

### Grup B — Sumber alternatif (endpoint lama + fallback Sanka)

d-tiktok, d-capcut, d-spotify, d-igram, d-facebook, d-snackvideo, d-github, d-douyin,
d-twitter, s-youtube, s-pinterest, s-spotify, s-bimg, s-musixmatch, tools-ssweb,
tools-translate, tools-subdomains, tools-vcc-generator, info-cuaca, info-bmkg,
r-quotesanime, r-waifu, r-blue-archive, stalk-instagram, stalk-tiktok, stalk-twitter,
stalk-github, m-brat, berita-cnn, sticker-combot-search.

Urutan resolusi default: **primary → jalur fallback primary → Sanka → scrapr**.
Pengguna bisa memaksa sumber: `?provider=sanka` atau `?provider=primary`.
Response memakai sumber Sanka diberi `meta.provider: "sanka"` (dan header `x-provider`).

### Grup C — Fungsi mirip, tidak diduplikasi

TikTok HD, Spotify Play, s-lirik/musixmatch, Bing image, dsb. diperlakukan sebagai
sumber alternatif (Grup B), bukan endpoint baru, agar tidak ada duplikasi.

### Grup D — Tidak diimplementasikan (dengan alasan)

- **Konten dewasa / tidak sesuai**: XNXX downloader/search, random nsfw, pap ayang, loli.
- **Internal Sanka**: status api, create/check/buy apikey, infouser, secret.
- **Upstream Sanka sedang rusak saat audit** (error 5xx dari sub-provider Sanka,
  jujur dilaporkan supaya bisa ditambahkan nanti saat pulih):
  - AI: planaai/planasession (diblokir Cloudflare 403), ai/session (502),
    image-to-prompt, editimg, generatelyrics, pollinations.
  - Downloader: threads, pixiv (cookie sesi gagal), tiktok-hd.
  - Tools: text2morse, morse2text (dns mati), tempmail generate/bulk/inbox
    (cookie Emailnator gagal), youtubetranscript, ocr, vocal-remover, audio-to-text,
    tts-tokoh, trackip, web2apk (timeout), qris static (QR API gagal).
  - Stalker: ff, npm (bug internal Sanka).
  - Maker: nulis, to-hijab, toanime, toghibli, tozombie, text2anime, text2ghibli,
    gptimage, text-to-image, artgenerator, realistic-image, text-to-video.
  - Game: tebakanime, cekdmml.
  - Search: google (404), location, danbooru, tiktok (403 dari upstream), pixiv (403).

## Arsitektur

```
src/lib/server/providers/sanka.ts     konfigurasi Sanka (base URL + API key dari env, server-only)
src/lib/server/providers/primary.ts   wrapper provider upstream utama
src/lib/api-clients/sanka-client.ts   HTTP client Sanka (inject apikey, SSRF-safe, timeout, limit ukuran)
src/lib/server/services/provider-resolver.ts  rantai kandidat + normalisasi response & error
src/lib/server/services/registry.ts   pencarian endpoint
src/app/api/v1/[...path]/route.ts     route tipis: validasi → SSRF → resolver → response
```

- API key Sanka **hanya** dari env var `SANKA_API_KEY` (Vercel), tidak pernah di kode,
  tidak pernah dikirim ke client, tidak bisa diisi user.
- Error provider tidak pernah dibungkus jadi sukses: `status:false` dari Sanka →
  response error terstandarisasi (PROVIDER_ERROR / PROVIDER_REJECTED).
- Response binary (audio/gambar/video) di-pass-through apa adanya.

## Status verifikasi (jujur)

Diuji end-to-end melalui backend lokal 2026-10-16 (`npx next start -p 3100`,
request valid + cek response):

- **36 endpoint baru terverifikasi** (badge "Terverifikasi" di docs): lihat `verification.ts`
  blok komentar "Endpoint baru via provider Sanka".
- **12 endpoint baru tersedia tapi belum terverifikasi** (badge "Belum terverifikasi"):
  remini, removebg, upscale, colorize, restore (sub-provider image Sanka sedang error),
  terabox & pinterest downloader & stalk-ml & m/to-comic? — lihat detail: yang lolos
  diantaranya to-comic (terverifikasi). Yang belum: d/terabox, d/pinterest (butuh URL
  valid asli), stalk-ml (butuh ID akun ML valid), remini/removebg/upscale/colorize/
  restore (upstream Sanka error saat audit), tools/text-to-speech (model voice error),
  tools/tinyurl (intermiten), tools/emojimix (pasangan emoji terbatas).
- Endpoint lama: perilaku default tidak berubah (regression test info/cuaca, berita-cnn,
  s/youtube tetap via primary).

## Env vars Vercel (wajib ada sebelum push ke produksi)

```
SANKA_BASE_URL=https://www.sankavollerei.web.id
SANKA_API_KEY=<API key resmi, diset via Vercel>
```

Tanpa `SANKA_API_KEY`, seluruh fitur Sanka otomatis nonaktif (error 503 aman) dan
endpoint lama tetap jalan normal.
