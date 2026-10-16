import "server-only";

/**
 * Scrape mandiri untuk video random 18+ (3D/SFM) dari sumber publik.
 * Server-side only, tanpa dependensi API pihak ketiga.
 */

import * as cheerio from "cheerio";

export interface SfmVideo {
  title: string;
  category: string;
  views: string;
  shares: string;
  link: string;
  type: string;
  video: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const MAX_PAGE = 1153;
const ATTEMPTS = 3;

/**
 * Ambil satu video acak. Mencoba hingga ATTEMPTS halaman acak;
 * mengembalikan null bila semua gagal (caller melanjutkan ke error jujur).
 */
export async function fetchSfmRandom(): Promise<SfmVideo | null> {
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const page = 1 + Math.floor(Math.random() * MAX_PAGE);
      const res = await fetch(`https://sfmcompile.club/page/${page}/`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      });
      if (!res.ok) continue;

      const $ = cheerio.load(await res.text());
      const arts = $("#primary article").length ? $("#primary article") : $("article");
      const items: SfmVideo[] = [];

      arts.each((_, el) => {
        const b = $(el);
        const video =
          b.find("source").attr("src") ||
          b.find("video > a").attr("href") ||
          b.find("img").attr("data-src") ||
          "";
        if (!video) return;
        items.push({
          title: b.find("header > h2").text().trim(),
          link: b.find("header > h2 > a").attr("href") || "",
          category: b.find("header > div.entry-before-title > span > span").text().replace("in ", "").trim(),
          views: b.find("header > div.entry-after-title > p > span.entry-views").text().trim(),
          shares: b.find("header > div.entry-after-title > p > span.entry-shares").text().trim(),
          type: b.find("source").attr("type") || "image/jpeg",
          video,
        });
      });

      if (items.length > 0) return items[Math.floor(Math.random() * items.length)] ?? null;
    } catch {
      // halaman berikutnya
    }
  }
  return null;
}
