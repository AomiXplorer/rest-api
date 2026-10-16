import "server-only";

/**
 * Sumber NSFW lokal (self-hosted) — data JSON dari owner, dipanggang ke
 * dalam bundle server. Tidak bergantung API pihak ketiga (waifu.pics dsb.
 * sudah mati), jadi tidak akan down karena upstream eksternal.
 *
 * Konten 18+; endpoint wajib membawa label peringatan di docs.
 */

import ass from "@/data/nsfw/ass.json";
import bdsm from "@/data/nsfw/bdsm.json";
import cum from "@/data/nsfw/cum.json";
import gangbang from "@/data/nsfw/gangbang.json";
import hentai from "@/data/nsfw/hentai.json";
import kasedaiki from "@/data/nsfw/kasedaiki.json";
import manstrubation from "@/data/nsfw/manstrubation.json";
import opaianime from "@/data/nsfw/opaianime.json";

type NsfwCategory = { key: string; label: string; urls: string[] };

const CATEGORIES: Record<string, NsfwCategory> = {
  ass: { key: "ass", label: "Ass Anime", urls: ass as string[] },
  bdsm: { key: "bdsm", label: "BDSM Anime", urls: bdsm as string[] },
  cum: { key: "cum", label: "Cum Anime", urls: cum as string[] },
  gangbang: { key: "gangbang", label: "Gangbang Anime", urls: gangbang as string[] },
  hentai: { key: "hentai", label: "Hentai", urls: hentai as string[] },
  kasedaiki: { key: "kasedaiki", label: "Kasedaiki", urls: kasedaiki as string[] },
  manstrubation: { key: "manstrubation", label: "Manstrubation Anime", urls: manstrubation as string[] },
  opaianime: { key: "opaianime", label: "Oppai Anime", urls: opaianime as string[] },
};

export const NSFW_CATEGORY_KEYS = Object.keys(CATEGORIES);

export interface NsfwPick {
  category: string;
  label: string;
  url: string;
  total: number;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

/**
 * Ambil satu gambar random. Tanpa kategori = acak dari seluruh kategori.
 * Mengembalikan null bila nama kategori tidak dikenal (ditangani caller
 * sebagai error validasi yang jujur).
 */
export function nsfwPick(category?: string | null): NsfwPick | null {
  if (category) {
    const cat = CATEGORIES[category.toLowerCase()];
    if (!cat) return null;
    return { category: cat.key, label: cat.label, url: pickRandom(cat.urls), total: cat.urls.length };
  }
  const cat = CATEGORIES[pickRandom(NSFW_CATEGORY_KEYS)] as NsfwCategory;
  return { category: cat.key, label: cat.label, url: pickRandom(cat.urls), total: cat.urls.length };
}
