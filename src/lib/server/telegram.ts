/**
 * Klien Telegram Bot API + pemroses command admin.
 *
 * Keamanan:
 * - Token hanya dari env server (TELEGRAM_BOT_TOKEN), tidak pernah dikirim
 *   ke browser/log. Otorisasi command = numeric Telegram user ID
 *   (TELEGRAM_ADMIN_ID), bukan username.
 * - 429 ditangani dengan 1 retry terbatas (maks 3 detik), tanpa retry tanpa henti.
 */
import { getMaintenance, setMaintenance, DEFAULT_MESSAGE } from "./maintenance";
import { getUsageStats } from "./usage";

const TG_API = "https://api.telegram.org";

function token(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  return t && t.trim() ? t.trim() : null;
}

export function adminId(): number | null {
  const v = process.env.TELEGRAM_ADMIN_ID;
  const n = v ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Kirim pesan teks polos (tanpa parse_mode agar bebas masalah formatting). */
export async function tgSendMessage(chatId: number | string, text: string): Promise<boolean> {
  const t = token();
  if (!t) return false;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${TG_API}/bot${t}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000) }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.status === 429 && attempt === 0) {
        const body = (await res.json().catch(() => ({}))) as { parameters?: { retry_after?: number } };
        const wait = Math.min(body.parameters?.retry_after ?? 1, 3);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      return res.ok;
    } catch {
      if (attempt > 0) return false;
    }
  }
  return false;
}

/** Notifikasi agregat penggunaan — dipanggil usage.ts per ambang jendela. */
export async function tgNotifyUsage(kind: "total" | "maintenance", _win: number, total: number): Promise<void> {
  const admin = adminId();
  if (!admin) return;
  const stats = await getUsageStats();
  const top = stats?.topEndpoints[0];
  const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium" }).format(new Date());
  const lines =
    kind === "maintenance"
      ? [
          "🛠 AOMI API — REQUEST SAAT MAINTENANCE",
          "",
          `Jumlah: ${total} request dalam jendela 15 menit`,
          top ? `Endpoint teratas: ${top.path} (${top.count})` : "",
          `Waktu: ${time} WIB`,
        ]
      : [
          "📡 AOMI API — AKTIVITAS PENGGUNAAN",
          "",
          `Jumlah: ${total} request dalam jendela 15 menit`,
          `Hari ini: ${stats?.today.total ?? total} request, ${stats?.today.err ?? 0} error`,
          top ? `Endpoint teratas: ${top.path} (${top.count})` : "",
          `Waktu: ${time} WIB`,
        ];
  await tgSendMessage(admin, lines.filter(Boolean).join("\n"));
}

function fmtWib(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

/** "YYYY-MM-DD HH:mm" WIB -> ISO UTC. Return null bila format salah. */
export function parseEtaWib(raw: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const [_, y, mo, d, h, mi] = m;
  const guess = new Date(`${y}-${mo}-${d}T${h}:${mi}:00+07:00`);
  if (Number.isNaN(guess.getTime())) return null;
  return guess.toISOString();
}

const HELP = [
  "🤖 Aomi API Admin Bot",
  "",
  "/status — lihat status maintenance saat ini",
  "/maintenance_on [pesan] — aktifkan maintenance (pesan opsional)",
  "/maintenance_off — nonaktifkan maintenance",
  "/setmessage [pesan] — ubah pesan maintenance",
  "/seteta YYYY-MM-DD HH:mm — estimasi selesai (WIB), /seteta clear untuk hapus",
  "/stats — statistik penggunaan API hari ini",
  "/help — daftar perintah",
].join("\n");

export interface TgUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
  };
}

/** Proses satu update terverifikasi. Return teks balasan (atau null). */
export async function handleUpdate(update: TgUpdate): Promise<string | null> {
  const msg = update.message;
  const text = msg?.text?.trim();
  if (!msg || !text) return null;
  const chatId = msg.chat?.id;
  if (!chatId) return null;

  // Otorisasi: numeric user ID Telegram, bukan username.
  const admin = adminId();
  if (!admin || msg.from?.id !== admin) {
    return "⛔ Anda tidak diizinkan menggunakan perintah ini.";
  }

  const [rawCmd = "", ...rest] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@[\w_]+$/, ""); // /cmd@BotName -> /cmd
  const arg = rest.join(" ");

  switch (cmd) {
    case "/start":
    case "/help":
      return HELP;

    case "/status": {
      const m = await getMaintenance();
      const stats = await getUsageStats();
      const eta = fmtWib(m.estimatedEndAt);
      const lines = [
        m.enabled ? "🛠 Maintenance: AKTIF" : "✅ Maintenance: nonaktif — layanan berjalan normal",
        `Pesan: ${m.message}`,
        m.startedAt ? `Mulai: ${fmtWib(m.startedAt)} WIB` : "",
        eta ? `Estimasi selesai: ${eta} WIB` : "",
        m.updatedAt ? `Terakhir diubah: ${fmtWib(m.updatedAt)} WIB` : "",
        stats ? `Request hari ini: ${stats.today.total} (error: ${stats.today.err})` : "Statistik belum tersedia (penyimpanan belum dikonfigurasi).",
      ].filter(Boolean);
      return lines.join("\n");
    }

    case "/maintenance_on": {
      try {
        const next = await setMaintenance(
          { enabled: true, ...(arg ? { message: arg } : {}) },
          "telegram-admin",
        );
        return [
          "🛠 Maintenance DIAKTIFKAN.",
          `Pesan: ${next.message}`,
          "Seluruh endpoint publik sekarang mengembalikan 503 MAINTENANCE_MODE.",
        ].join("\n");
      } catch (e) {
        return `❌ ${e instanceof Error ? e.message : "Gagal mengaktifkan maintenance."}`;
      }
    }

    case "/maintenance_off": {
      try {
        await setMaintenance({ enabled: false, estimatedEndAt: null }, "telegram-admin");
        return "✅ Maintenance dinonaktifkan. Layanan publik aktif kembali.";
      } catch (e) {
        return `❌ ${e instanceof Error ? e.message : "Gagal menonaktifkan maintenance."}`;
      }
    }

    case "/setmessage": {
      if (!arg) return "Format: /setmessage [pesan] (maks 500 karakter)";
      try {
        const next = await setMaintenance({ message: arg }, "telegram-admin");
        return `✏️ Pesan maintenance diperbarui:\n${next.message}`;
      } catch (e) {
        return `❌ ${e instanceof Error ? e.message : "Gagal mengubah pesan."}`;
      }
    }

    case "/seteta": {
      if (arg.toLowerCase() === "clear") {
        await setMaintenance({ estimatedEndAt: null }, "telegram-admin").catch(() => {});
        return "🗑 Estimasi waktu selesai dihapus.";
      }
      const iso = parseEtaWib(arg);
      if (!iso) return "Format salah. Contoh: /seteta 2026-10-17 14:30 (WIB)";
      try {
        await setMaintenance({ estimatedEndAt: iso }, "telegram-admin");
        return `🕒 Estimasi selesai: ${fmtWib(iso)} WIB`;
      } catch (e) {
        return `❌ ${e instanceof Error ? e.message : "Gagal mengatur estimasi."}`;
      }
    }

    case "/stats": {
      const stats = await getUsageStats();
      if (!stats) return "Statistik belum tersedia — penyimpanan belum dikonfigurasi atau kosong.";
      const top = stats.topEndpoints.map((t, i) => `${i + 1}. ${t.path} — ${t.count}x`).join("\n") || "(belum ada)";
      return [
        "📊 Aomi API — Statistik (data aktual)",
        `Hari ini: ${stats.today.total} request`,
        `Sukses: ${stats.today.ok} · Error: ${stats.today.err}`,
        `Saat maintenance: ${stats.today.maint}`,
        "",
        `Endpoint terpopuler:\n${top}`,
      ].join("\n");
    }

    default:
      return `Perintah tidak dikenali. ${cmd === DEFAULT_MESSAGE ? "" : ""}Ketik /help untuk daftar perintah.`;
  }
}
