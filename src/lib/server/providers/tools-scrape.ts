/**
 * Provider natif tools-scrape — porting dari scraper open-source
 * (alightmotion, tempmail, playstore) ke Aomi API tanpa playwright.
 * Watermark output: "RendyZ" (identitas Aomi API).
 */
import "server-only";
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const WM = "RendyZ";
const AM_BASE = "https://am.kyzzz.xyz";
const TM_BASE = "https://api.tempmail.ing";
const TM_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Origin: "https://tempmail.ing",
  Referer: "https://tempmail.ing/id/",
  "User-Agent": UA,
};

export class ToolInputError extends Error {}

async function jfetch(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init?.headers as Record<string, string> | undefined) }, cache: "no-store" });
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`Sumber menolak request (HTTP ${res.status}).`); }
}

/* ============ ALIGHT MOTION (generator akun Pro via tempmail.ing) ============ */

async function amSendLink(email: string): Promise<void> {
  const d = (await jfetch(AM_BASE + "/api/send-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })) as { ok?: boolean; error?: string; message?: string };
  if (!d || d.ok !== true) throw new Error(d?.error || d?.message || "Sumber verifikasi Alight Motion menolak request.");
}

type MailBox = { kind: "tm" | "mailtm"; address: string; token?: string };

/** Tunggu email verifikasi AM di inbox lalu ekstrak magic link. */
async function amWaitMagic(box: MailBox, timeoutSec: number): Promise<string> {
  const start = Date.now();
  let resent = false;
  while (Date.now() - start < timeoutSec * 1000) {
    await new Promise((r) => setTimeout(r, 3000));
    let hitBody = "";
    if (box.kind === "tm") {
      const j2 = (await jfetch(TM_BASE + "/api/emails/" + encodeURIComponent(box.address) + "?_=" + Date.now(), { headers: TM_HEADERS })) as { success?: boolean; emails?: { id: string | number; from_address?: string; subject?: string; text?: string; content?: string }[] };
      const hit = (j2.emails || []).find((m) =>
        /alight|sign in/i.test(m.subject || "") || /firebase|alight/i.test(m.from_address || ""));
      if (hit) hitBody = (hit.content || "") + "\n" + (hit.text || "");
    } else if (box.token) {
      const j2 = (await jfetch("https://api.mail.tm/messages?_=" + Date.now(), { headers: { accept: "application/json", authorization: "Bearer " + box.token } })) as { "hydra:member"?: { id?: string; subject?: string; from?: { address?: string } }[] };
      const hit = (j2["hydra:member"] || []).find((m) =>
        /alight|sign in/i.test(m.subject || "") || /firebase|alight/i.test(m.from?.address || ""));
      if (hit?.id) {
        const det = (await jfetch("https://api.mail.tm/messages/" + hit.id, { headers: { accept: "application/json", authorization: "Bearer " + box.token } })) as { text?: string; html?: string[] };
        hitBody = (det.html || []).join("\n") + "\n" + (det.text || "");
      }
    }
    if (hitBody) {
      const urls = hitBody.match(/https?:\/\/[^\s"<>]+/g) || [];
      const magic = urls.find((u) => /oobCode|signInWithEmailLink|apiKey/.test(u));
      if (magic) return magic.replace(/&amp;/g, "&");
    }
    if (!resent && Date.now() - start > 20000) {
      resent = true;
      try { await amSendLink(box.address); } catch { /* biarkan polling lanjut */ }
    }
  }
  throw new Error("Timeout menunggu link verifikasi dari Alight Motion. Coba lagi beberapa saat lagi.");
}

/* mail.tm — cadangan email sementara bila tempmail.ing menolak (mis. blokir IP datacenter) */

async function mailTmAccount(): Promise<MailBox> {
  const dom = (await jfetch("https://api.mail.tm/domains", { headers: { accept: "application/json" } })) as { "hydra:member"?: { domain?: string }[] };
  const domain = dom["hydra:member"]?.[0]?.domain;
  if (!domain) throw new Error("Domain mail.tm tidak tersedia.");
  const address = "aomi" + Math.random().toString(36).slice(2, 12) + "@" + domain;
  const password = "AomiPass" + Math.random().toString(36).slice(2, 10);
  const acc = (await jfetch("https://api.mail.tm/accounts", { method: "POST", headers: { "Content-Type": "application/json", accept: "application/json" }, body: JSON.stringify({ address, password }) })) as Record<string, unknown>;
  if (!acc || !(acc.id || acc.address)) throw new Error("Pembuatan akun mail.tm gagal.");
  const tok = (await jfetch("https://api.mail.tm/token", { method: "POST", headers: { "Content-Type": "application/json", accept: "application/json" }, body: JSON.stringify({ address, password }) })) as { token?: string };
  if (!tok?.token) throw new Error("Login mail.tm gagal.");
  return { kind: "mailtm", address, token: tok.token };
}

async function amMailBox(): Promise<MailBox> {
  try {
    const box = (await jfetch(TM_BASE + "/api/generate", { method: "POST", headers: TM_HEADERS, body: JSON.stringify({ duration: 10 }) })) as { success?: boolean; email?: { address?: string } };
    if (box?.success && box.email?.address) return { kind: "tm", address: box.email.address };
  } catch { /* lanjut ke mail.tm */ }
  return mailTmAccount();
}

async function amGenerateOne(): Promise<Record<string, unknown>> {
  const box = await amMailBox();
  const email = box.address;
  await amSendLink(email);
  const magicLink = await amWaitMagic(box, 52);
  const verif = (await jfetch(AM_BASE + "/api/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, link: magicLink }),
  })) as { orderId?: string; uid?: string; isNewUser?: boolean };
  return { status: true, email, orderId: verif.orderId ?? null, uid: verif.uid ?? null, isNewUser: verif.isNewUser ?? true, magicLink, author: WM };
}

/* ============ PLAY STORE (SSR + cheerio) ============ */

interface PsApp { package: string; title: string; developer: string; rating: string | null; icon: string; }

function parseSearchHtml(html: string): PsApp[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const out: PsApp[] = [];
  $("a[href*='/store/apps/details']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const pkg = (href.match(/id=([^&]+)/) || [])[1] || "";
    if (!pkg || seen.has(pkg)) return;
    seen.add(pkg);
    let spans = $(el).find(".ubGTjb > span").map((_, sp) => $(sp).text().trim()).get() as string[];
    let icon = $(el).find("img[src*='s64']").attr("src") || $(el).find("img").last().attr("src") || "";
    // Kartu beranda: title ada di alt "Icon image ..." (markup beda dari hasil pencarian)
    if (!spans.length) {
      const alt = $(el).find("img[alt*='Icon image']").attr("alt") || "";
      const am = alt.match(/Icon image (.*)$/);
      if (am) spans = [am[1] ?? "", ""];
      icon = $(el).find("img").first().attr("src") || icon;
    }
    const title = spans[0] || "";
    const developer = spans[1] || "";
    const ratingLbl = $(el).find("div[role='img'][aria-label*='star']").attr("aria-label") || "";
    const rm = ratingLbl.match(/([\d.]+)/);
    const rating: string | null = rm ? rm[1] ?? null : null;
    if (title) out.push({ package: pkg, title, developer, rating, icon });
  });
  return out;
}

async function psSearch(q: string): Promise<PsApp[]> {
  const res = await fetch(`https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps&hl=en`, { headers: { "User-Agent": UA }, cache: "no-store", signal: AbortSignal.timeout(20000) });
  return parseSearchHtml(await res.text());
}

function parseDetailHtml(html: string, pkg: string): Record<string, unknown> {
  const $ = cheerio.load(html);
  const title = $("meta[property='og:title']").attr("content")?.replace(/ - Apps on Google Play$/, "") || $("title").text().replace(/ - Apps on Google Play$/, "");
  const description = $("meta[name='description']").attr("content") || "";
  const ratingLbl = $("[aria-label*='stars out of five']").first().attr("aria-label") || "";
  const rm = ratingLbl.match(/([\d.]+)/);
  let rating: string | null = rm ? rm[1] ?? null : null;
  const developer = $("a[href*='/store/apps/dev']").first().text().trim() || "";
  const screenshots: string[] = [];
  const icon = $("img").attr("src") || "";
  $("img").each((_, el) => {
    const s = $(el).attr("src") || "";
    if (s.includes("play-lh.googleusercontent.com") && /w526|w1052/.test(s)) screenshots.push(s);
  });
  const dataText = $("h2:contains('About this app')").nextAll("div").first().text() || "";
  return {
    package: pkg, title, developer, description, rating, icon,
    screenshots: [...new Set(screenshots)].slice(0, 6),
    info: dataText.split("\n").filter(Boolean).slice(0, 8),
    author: WM,
  };
}

/* ============ DISPATCH ============ */

export async function runTool(op: string, values: Record<string, string>): Promise<unknown> {
  switch (op) {
    case "am-send": {
      const email = (values.email || "").trim().toLowerCase();
      if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) throw new ToolInputError('Parameter "email" harus berupa alamat email yang valid.');
      await amSendLink(email);
      return { status: true, email, message: "Link verifikasi Alight Motion terkirim ke email kamu. Buka email tersebut, salin link pada tombolnya, lalu panggil endpoint am-verify dengan email dan link itu.", author: WM };
    }
    case "am-verify": {
      const email = (values.email || "").trim().toLowerCase();
      const link = (values.link || "").trim();
      if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) throw new ToolInputError('Parameter "email" harus berupa alamat email yang valid.');
      if (!/^https:\/\//.test(link) || link.length > 2000) throw new ToolInputError('Parameter "link" harus berupa URL https lengkap dari email verifikasi Alight Motion.');
      const verif = (await jfetch(AM_BASE + "/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link }),
      })) as { orderId?: string; uid?: string; isNewUser?: boolean };
      return { status: true, email, orderId: verif.orderId ?? null, uid: verif.uid ?? null, isNewUser: verif.isNewUser ?? true, author: WM };
    }
    case "am-gen":
      return amGenerateOne();
    case "am-bulk": {
      const count = Math.min(Math.max(parseInt(values.count || "1", 10) || 1, 1), 2);
      const results = await Promise.allSettled(Array.from({ length: count }, () => amGenerateOne()));
      const accounts = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<Record<string, unknown>>).value);
      const errors = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason instanceof Error ? (r as PromiseRejectedResult).reason.message : String((r as PromiseRejectedResult).reason));
      return { status: true, total_requested: count, total_success: accounts.length, total_failed: errors.length, accounts, ...(errors.length ? { errors } : {}), author: WM };
    }
    case "tempmail-gen": {
      const duration = Math.min(Math.max(parseInt(values.duration || "10", 10) || 10, 1), 60);
      const d = (await jfetch(`${TM_BASE}/api/generate`, { method: "POST", headers: TM_HEADERS, body: JSON.stringify({ duration }) })) as { success?: boolean; email?: Record<string, string> };
      if (!d.success || !d.email) throw new Error("Gagal membuat email sementara.");
      return { ...d.email, author: WM };
    }
    case "tempmail-inbox": {
      const email = (values.email || "").trim().toLowerCase();
      if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) throw new ToolInputError('Parameter "email" harus berupa alamat email yang valid.');
      const d = (await jfetch(`${TM_BASE}/api/emails/${encodeURIComponent(email)}`, { headers: TM_HEADERS })) as { success?: boolean; emails?: unknown[] };
      return { success: true, emails: Array.isArray(d.emails) ? d.emails : [], author: WM };
    }
    case "tempmail-delete": {
      const id = (values.id || "").trim();
      const email = (values.email || "").trim().toLowerCase();
      if (!id || !email) throw new ToolInputError('Parameter "id" dan "email" wajib diisi.');
      const d = (await jfetch(`${TM_BASE}/api/emails/${encodeURIComponent(id)}`, { method: "DELETE", headers: TM_HEADERS, body: JSON.stringify({ emailAddress: email }) })) as { success?: boolean };
      return { success: Boolean(d.success), deleted: Boolean(d.success), id, email, author: WM };
    }
    case "ps-home": {
      const res = await fetch("https://play.google.com/store/apps?hl=en", { headers: { "User-Agent": UA }, cache: "no-store", signal: AbortSignal.timeout(20000) });
      const apps = parseSearchHtml(await res.text()).slice(0, 12);
      return { apps, total: apps.length, author: WM };
    }
    case "ps-search": {
      const q = (values.q || "").trim();
      if (!q) throw new ToolInputError('Parameter "q" wajib diisi.');
      const apps = await psSearch(q);
      return { query: q, apps: apps.slice(0, 10), total: apps.length, author: WM };
    }
    case "ps-detail": {
      let q = (values.q || "").trim();
      if (!q) throw new ToolInputError('Parameter "q" wajib diisi (nama aplikasi atau nama package).');
      let pkg = q.includes(".") && !q.includes(" ") ? q : "";
      if (!pkg) {
        const apps = await psSearch(q);
        const first = apps[0]?.package;
        if (!first) throw new Error(`Aplikasi "${q}" tidak ditemukan di Play Store.`);
        pkg = first;
      }
      const res = await fetch(`https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en`, { headers: { "User-Agent": UA }, cache: "no-store", signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error("Aplikasi tidak ditemukan di Play Store.");
      return parseDetailHtml(await res.text(), pkg);
    }
    default:
      throw new ToolInputError("Operasi tools tidak dikenal.");
  }
}
