# Maintenance Mode Global + Bot Admin Telegram

Sistem satu gate terpusat yang memblokir seluruh fitur publik Aomi API saat
maintenance aktif, dikendalikan penuh dari Telegram oleh admin.

## Arsitektur

```
Telegram (@Restapids_bot)
   │ webhook (secret header)
   ▼
/api/telegram/webhook ──► command admin ──► Redis: aomi:maintenance
                                          (sumber kebenaran tunggal)
   ▲                                           │
   │ /api/v1/* (gate 503 + usage log)         │
   │ middleware halaman (rewrite /maintenance) │
   ▼                                           ▼
notifikasi agregat  ◄── aomi:usage:day / aomi:ep / aomi:win
```

## Skema penyimpanan (Upstash Redis REST)

| Key | Bentuk | Retensi |
|---|---|---|
| `aomi:maintenance` | JSON status (enabled, message, title, startedAt, updatedAt, estimatedEndAt, updatedBy) | permanen |
| `aomi:usage:day:{YYYY-MM-DD}` | hash: total, ok, err, maint | EXPIRE 90 hari |
| `aomi:ep` | zset skor = jumlah panggilan per endpoint | permanen |
| `aomi:recent` | list ≤ 100 record ringkas (tanpa data sensitif) | trim otomatis |
| `aomi:win:{epoch15m}` | hash per 15 menit: total, maint | EXPIRE 30 menit |
| `aomi:tg:{update_id}` | dedupe webhook Telegram | EXPIRE 24 jam |

Cache status in-process hanya 5 detik — maksimal keterlambatan perubahan
status antar instance Vercel adalah 5 detik. Jika Redis tidak dapat
dihubungi: **fail-open** (maintenance dianggap nonaktif) supaya ketersediaan
API tidak bergantung pada infrastruktur admin.

## Env (Vercel → Project → Settings → Environment Variables)

```
TELEGRAM_BOT_TOKEN=<dari @BotFather>
TELEGRAM_ADMIN_ID=7666447095
TELEGRAM_WEBHOOK_SECRET=<string acak panjang>
UPSTASH_REDIS_REST_URL=https://<db>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token dari Upstash>
```

Tanpa `UPSTASH_*`, semua fitur nonaktif dengan fail-open (API tetap normal,
bot membalas "penyimpanan belum dikonfigurasi"). Setelah menambah/mengubah
env, deploy ulang diperlukan (env dibaca saat build/runtime).

## Pasang webhook (sekali)

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://cyronime.my.id/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["message"]'
```

Admin wajib membuka @Restapids_bot dan menekan **/start** sekali — Telegram
melarang bot memulai chat dengan user yang belum pernah berinteraksi.

## Perintah bot

| Perintah | Fungsi |
|---|---|
| `/start`, `/help` | daftar perintah |
| `/status` | status maintenance + request hari ini |
| `/maintenance_on [pesan]` | aktifkan maintenance (pesan opsional, maks 500 karakter) |
| `/maintenance_off` | nonaktifkan maintenance |
| `/setmessage [pesan]` | ubah pesan tanpa mengubah status |
| `/seteta YYYY-MM-DD HH:mm` | estimasi selesai (WIB); `/seteta clear` hapus |
| `/stats` | statistik aktual dari data tercatat |

## Grup endpoint terhadap maintenance gate

- **Diblokir (503 MAINTENANCE_MODE, JSON)**: seluruh `/api/v1/*` GET/POST —
  gate di route handler, request tidak diteruskan ke provider eksternal.
- **Ditulis ulang ke halaman /maintenance**: `/`, `/docs`, semua halaman
  publik — via `src/middleware.ts` (rewrite, tanpa flicker/loop).
- **Selalu aktif**: `/api/telegram/webhook` (admin harus bisa mematikan
  maintenance), `/api/health` (menyertakan field `maintenance.active`),
  `/maintenance` sendiri.

## Notifikasi penggunaan

Tidak per-request. Dua ambang agregat per jendela 15 menit: 20 request total
(aktivitas normal) dan 10 request saat maintenance. Isi ringkasan: jumlah,
endpoint teratas, error hari ini, waktu WIB. 429 Telegram ditangani dengan
1 retry (maks 3 detik). Kegagalan notifikasi tidak pernah menggagalkan
request API (pencatatan jalan lewat `after()` next/server).
