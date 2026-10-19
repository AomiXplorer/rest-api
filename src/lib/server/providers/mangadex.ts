/**
 * Provider natif MangaDex — API publik resmi api.mangadex.org.
 * Tidak butuh API key; tidak tergantung API perantara pihak ketiga.
 */
import "server-only";

const MD_BASE = "https://api.mangadex.org";
const MD_TIMEOUT = 25000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_LANGS = new Set(["id", "en", "ja", "ko", "zh", "pt", "es", "fr"]);

export class MangadexInputError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "MangadexInputError";
  }
}

function clampInt(raw: string | undefined, def: number, min: number, max: number): number {
  if (raw == null || raw.trim() === "") return def;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) throw new MangadexInputError(`Parameter angka tidak valid (diterima: "${raw}").`);
  return Math.min(max, Math.max(min, n));
}

function requireUuid(raw: string | undefined, name: string): string {
  const v = (raw ?? "").trim();
  if (!v) throw new MangadexInputError(`Parameter "${name}" wajib diisi (UUID MangaDex).`);
  if (!UUID_RE.test(v)) throw new MangadexInputError(`Parameter "${name}" harus berupa UUID MangaDex yang valid.`);
  return v;
}

interface MdRel {
  id: string;
  type: string;
  attributes?: Record<string, unknown> & { fileName?: string; name?: string };
}
interface MdItem {
  id: string;
  attributes: Record<string, unknown>;
  relationships?: MdRel[];
}

async function mdRaw(path: string): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), MD_TIMEOUT);
  try {
    const res = await fetch(`${MD_BASE}${path}`, {
      headers: { "user-agent": "AomiAPI/1.0 (mangadex provider)", accept: "application/json" },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let detail = "";
      try { const j = JSON.parse(body) as { errors?: { detail?: string }[] }; detail = j?.errors?.[0]?.detail ?? ""; } catch { /* non-JSON */ }
      if (res.status === 404) throw new MangadexInputError(detail || "ID MangaDex tidak ditemukan.");
      throw new Error(detail || `MangaDex merespons ${res.status}.`);
    }
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

async function mdGet(path: string): Promise<{ data: unknown; total?: number }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), MD_TIMEOUT);
  try {
    const res = await fetch(`${MD_BASE}${path}`, {
      headers: { "user-agent": "AomiAPI/1.0 (mangadex provider)", accept: "application/json" },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      let detail = "";
      try {
        const j = JSON.parse(body) as { errors?: { detail?: string }[] };
        detail = j?.errors?.[0]?.detail ?? "";
      } catch { /* non-JSON */ }
      if (res.status === 404) throw new MangadexInputError(detail || "ID MangaDex tidak ditemukan.");
      throw new Error(detail || `MangaDex merespons ${res.status}.`);
    }
    const j = (await res.json()) as { data: unknown; total?: number };
    return j;
  } finally {
    clearTimeout(t);
  }
}

function titleOf(attrs: Record<string, unknown>): string {
  const t = (attrs.title ?? {}) as Record<string, string>;
  return t.en ?? t["ja-ro"] ?? t.ja ?? Object.values(t)[0] ?? "(tanpa judul)";
}
function coverOf(item: MdItem): string | null {
  const rel = item.relationships?.find((r) => r.type === "cover_art");
  const fn = rel?.attributes?.fileName;
  return rel && fn ? `https://uploads.mangadex.org/covers/${item.id}/${fn}.256.jpg` : null;
}
function relName(item: MdItem, type: string): string | null {
  const rel = item.relationships?.find((r) => r.type === type);
  return rel?.attributes?.name ?? null;
}
function tagsOf(attrs: Record<string, unknown>): string[] {
  const tags = (attrs.tags ?? []) as { attributes?: { name?: Record<string, string> } }[];
  return tags.map((tg) => tg?.attributes?.name?.en ?? "").filter(Boolean);
}

export async function mangadexSearch(values: Record<string, string>) {
  const q = (values.judul ?? "").trim();
  if (!q) throw new MangadexInputError('Parameter "judul" wajib diisi.');
  if (q.length > 100) throw new MangadexInputError("Judul maksimal 100 karakter.");
  const limit = clampInt(values.limit, 10, 1, 32);
  const page = clampInt(values.page, 1, 1, 500);
  const offset = (page - 1) * limit;
  const url =
    `/manga?title=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}` +
    `&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica` +
    `&order[relevance]=desc`;
  const { data, total } = await mdGet(url);
  const items = (data as MdItem[]) ?? [];
  return {
    query: q,
    total: total ?? items.length,
    results: items.map((it) => ({
      id: it.id,
      title: titleOf(it.attributes),
      description: ((it.attributes.description ?? {}) as Record<string, string>).en ?? null,
      cover: coverOf(it),
      status: (it.attributes.status as string) ?? null,
      year: (it.attributes.year as number) ?? null,
      tags: tagsOf(it.attributes),
    })),
  };
}

export async function mangadexManga(values: Record<string, string>) {
  const id = requireUuid(values.id, "id");
  const { data } = await mdGet(`/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
  const it = data as MdItem;
  const stats = await mdGet(`/statistics/manga/${id}`).catch(() => null);
  const st = stats ? ((stats.data as Record<string, unknown>)?.statistics ?? {}) : {};
  return {
    id: it.id,
    title: titleOf(it.attributes),
    altTitles: ((it.attributes.altTitles ?? []) as Record<string, string>[]).map((t) => Object.values(t)[0]).slice(0, 8),
    description: ((it.attributes.description ?? {}) as Record<string, string>).en ?? null,
    status: (it.attributes.status as string) ?? null,
    year: (it.attributes.year as number) ?? null,
    demographic: (it.attributes.publicationDemographic as string) ?? null,
    tags: tagsOf(it.attributes),
    author: relName(it, "author"),
    artist: relName(it, "artist"),
    cover: coverOf(it),
    rating: ((st as Record<string, unknown>).average ?? null) as number | null,
    follows: ((st as Record<string, unknown>).follows ?? null) as number | null,
  };
}

export async function mangadexChapters(values: Record<string, string>) {
  const id = requireUuid(values.id, "id");
  const lang = ((values.lang ?? "id") || "id").trim().toLowerCase();
  if (!ALLOWED_LANGS.has(lang)) throw new MangadexInputError(`Bahasa "${lang}" tidak didukung. Pilihan: ${[...ALLOWED_LANGS].join(", ")}.`);
  const limit = clampInt(values.limit, 30, 1, 100);
  const page = clampInt(values.page, 1, 1, 500);
  const offset = (page - 1) * limit;
  const url =
    `/manga/${id}/feed?translatedLanguage[]=${lang}&limit=${limit}&offset=${offset}` +
    `&order[chapter]=desc&includes[]=scanlation_group&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;
  const { data, total } = await mdGet(url);
  const items = (data as MdItem[]) ?? [];
  return {
    mangaId: id,
    language: lang,
    total: total ?? items.length,
    chapters: items
      .map((it) => ({
        id: it.id,
        chapter: (it.attributes.chapter as string) ?? null,
        title: ((it.attributes.title as string) ?? "").trim() || null,
        pages: (it.attributes.pages as number) ?? 0,
        language: (it.attributes.translatedLanguage as string) ?? null,
        group: relName(it, "scanlation_group"),
        external: Boolean(it.attributes.externalUrl),
        publishedAt: (it.attributes.publishAt as string) ?? null,
      }))
      .filter((c) => c.chapter !== null || c.title)
      .filter((c) => !c.external),
  };
}

export async function mangadexChapter(values: Record<string, string>) {
  const id = requireUuid(values.id, "id");
  const meta = await mdGet(`/chapter/${id}?includes[]=manga&includes[]=scanlation_group`).catch(() => null);
  let mangaTitle: string | null = null;
  let hashCtx: { chapter: string | null; title: string | null; group: string | null; pages: number } = {
    chapter: null, title: null, group: null, pages: 0,
  };
  if (meta) {
    const it = meta.data as MdItem;
    const mangaRel = it.relationships?.find((r) => r.type === "manga");
    mangaTitle = mangaRel ? titleOf(mangaRel.attributes ?? {}) : null;
    hashCtx = {
      chapter: (it.attributes.chapter as string) ?? null,
      title: ((it.attributes.title as string) ?? "").trim() || null,
      group: relName(it, "scanlation_group"),
      pages: (it.attributes.pages as number) ?? 0,
    };
  }
  let homeJ: { baseUrl?: string; chapter?: { hash?: string; data?: string[]; dataSaver?: string[] } } | undefined;
  try {
    homeJ = (await mdRaw(`/at-home/server/${id}`)) as typeof homeJ;
  } catch (err) {
    if (err instanceof MangadexInputError) {
      throw new Error("Chapter ini tidak tersedia untuk dibaca di MangaDex (kemungkinan chapter eksternal atau sudah dihapus).");
    }
    throw err;
  }
  const base = homeJ?.baseUrl;
  const hash = homeJ?.chapter?.hash;
  const files = homeJ?.chapter?.data?.length ? homeJ.chapter.data : (homeJ?.chapter?.dataSaver ?? []);
  if (!base || !hash || files.length === 0) throw new Error("Server pembaca MangaDex tidak mengembalikan halaman.");
  const quality = homeJ?.chapter?.data?.length ? "data" : "data-saver";
  return {
    chapterId: id,
    mangaTitle,
    chapter: hashCtx.chapter,
    title: hashCtx.title,
    group: hashCtx.group,
    pagesTotal: files.length,
    quality,
    pages: files.map((f, i) => ({ page: i + 1, url: `${base}/${quality}/${hash}/${f}` })),
  };
}

export async function mangadexLatest(values: Record<string, string>) {
  const limit = clampInt(values.limit, 20, 1, 50);
  const page = clampInt(values.page, 1, 1, 500);
  const offset = (page - 1) * limit;
  const url =
    `/chapter?order[createdAt]=desc&limit=${limit}&offset=${offset}` +
    `&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=manga`;
  const { data, total } = await mdGet(url);
  const items = (data as MdItem[]) ?? [];
  const out = [];
  for (const it of items) {
    const mangaRel = it.relationships?.find((r) => r.type === "manga");
    if (!mangaRel) continue;
    out.push({
      chapterId: it.id,
      mangaId: mangaRel.id,
      mangaTitle: titleOf(mangaRel.attributes ?? {}),
      chapter: (it.attributes.chapter as string) ?? null,
      language: (it.attributes.translatedLanguage as string) ?? null,
      pages: (it.attributes.pages as number) ?? 0,
      external: Boolean(it.attributes.externalUrl),
      publishedAt: (it.attributes.publishAt as string) ?? null,
    });
    if (out.length >= limit) break;
  }
  return { total: total ?? out.length, latest: out };
}

export async function runMangadex(op: string, values: Record<string, string>) {
  switch (op) {
    case "search": return mangadexSearch(values);
    case "manga": return mangadexManga(values);
    case "chapters": return mangadexChapters(values);
    case "chapter": return mangadexChapter(values);
    case "latest": return mangadexLatest(values);
    default: throw new Error(`Operasi MangaDex tidak dikenal: ${op}`);
  }
}
