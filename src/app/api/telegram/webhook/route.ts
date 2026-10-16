/**
 * Webhook Telegram untuk bot admin maintenance.
 *
 * KELENGKAPAN KEAMANAN:
 * - Validasi header X-Telegram-Bot-Api-Secret-Token (dipasang saat setWebhook
 *   dengan secret_token) — request tanpa secret benar ditolak 403.
 * - Maintenance gate sengaja TIDAK dipasang di sini: admin harus tetap bisa
 *   menonaktifkan maintenance.
 * - Payload dibatasi 64 KB, struktur divalidasi, update duplikat diabaikan
 *   lewat Redis SET NX.
 * - Otorisasi command memakai numeric Telegram user ID (lihat telegram.ts).
 */
import { NextResponse } from "next/server";
import { redisConfigured, redisTry } from "@/lib/server/store/redis";
import { handleUpdate, tgSendMessage } from "@/lib/server/telegram";

const MAX_BODY = 64 * 1024;

export async function POST(req: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || !got || got !== expected) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let update: { update_id?: unknown; message?: unknown };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { update_id?: unknown }).update_id !== "number") {
      return NextResponse.json({ ok: true }); // struktur tidak valid — abaikan
    }
    update = parsed as typeof update;
  } catch {
    return NextResponse.json({ ok: true }); // JSON tidak valid — abaikan
  }

  // Dedup: update_id yang sama hanya diproses sekali (Telegram bisa mengirim ulang).
  if (redisConfigured()) {
    const res = await redisTry([["set", `aomi:tg:${update.update_id}`, "1", "NX", "EX", "86400"]]);
    if (res && res[0] !== "OK") {
      return NextResponse.json({ ok: true }); // duplikat — abaikan
    }
  }

  const reply = await handleUpdate(update as Parameters<typeof handleUpdate>[0]);
  if (reply && typeof update.message === "object" && update.message !== null) {
    const chatId = (update.message as { chat?: { id?: number } }).chat?.id;
    if (typeof chatId === "number") {
      await tgSendMessage(chatId, reply);
    }
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
