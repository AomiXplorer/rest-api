"use client";

/**
 * Aomi Tools — dashboard & generic runner.
 * Design system khusus tools (clean editorial): lihat .tools-layout di globals.css.
 * Logika backend/favorit/riwayat sama seperti sebelumnya — hanya identitas visual yang baru.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Download, Music, Video, Camera, Twitter, Sparkles, Book, List, Wand, Mail,
  Moon, Cloud, Activity, Tv, Newspaper, Mic, Youtube, Smartphone, Github, Gauge,
  Image as ImageIcon, Home, Star, History, Send, Loader2, Copy, Check,
  RefreshCw, ArrowLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import { USER_TOOLS, TOOL_CATEGORIES, type UserTool } from "@/config/user-tools";

/* ============================ IKON ============================ */
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  download: Download, music: Music, video: Video, camera: Camera, twitter: Twitter,
  sparkles: Sparkles, book: Book, list: List, wand: Wand, mail: Mail, moon: Moon,
  cloud: Cloud, activity: Activity, tv: Tv, newspaper: Newspaper, mic: Mic,
  youtube: Youtube, smartphone: Smartphone, github: Github, search: Search,
  gauge: Gauge, image: ImageIcon, home: Home, star: Star, history: History,
};

function ToolIcon({ icon, size = 18, className }: { icon: string; size?: number; className?: string }) {
  const C = ICONS[icon] ?? Search;
  return <C size={size} className={className} />;
}

/* ======================= FAVORIT (localStorage) ======================= */
const FAV_KEY = "aomi-tools-favs";
const HIST_KEY = "aomi-tools-history";

function useLocalList(key: string, max = 30) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    try { setList(JSON.parse(localStorage.getItem(key) || "[]")); } catch { /* ignore */ }
  }, [key]);
  const save = (l: string[]) => {
    setList(l);
    try { localStorage.setItem(key, JSON.stringify(l.slice(0, max))); } catch { /* ignore */ }
  };
  return [list, save] as const;
}

type HistItem = { slug: string; name: string; at: number; ok: boolean; summary: string };
function useHistory() {
  const [items, setItems] = useState<HistItem[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  const push = (it: HistItem) => {
    setItems((prev) => {
      const next = [it, ...prev].slice(0, 30);
      try { localStorage.setItem(HIST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  return [items, push] as const;
}

/* ============================ HELPER ============================ */
const isFav = (favs: string[], slug: string) => favs.includes(slug);
const toggleFav = (save: (l: string[]) => void, favs: string[], slug: string) =>
  save(isFav(favs, slug) ? favs.filter((f) => f !== slug) : [...favs, slug]);

function StarButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? "Hapus dari favorit" : "Tambah ke favorit"}
      className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-card-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Star size={15} className={active ? "fill-primary text-primary" : ""} />
    </button>
  );
}

/* ============================ DASHBOARD ============================ */
export function ToolsDashboard() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [showFavs, setShowFavs] = useState(false);
  const [favs, saveFavs] = useLocalList(FAV_KEY);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return USER_TOOLS.filter((t) => {
      if (showFavs && !isFav(favs, t.slug)) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (!q) return true;
      const hay = `${t.name} ${t.desc} ${TOOL_CATEGORIES.find((c) => c.key === t.category)?.title ?? ""} ${t.category}`.toLowerCase();
      return q.split(/\s+/).every((tok) => hay.includes(tok));
    });
  }, [query, cat, showFavs, favs]);

  /* Tools unggulan punya halaman khusus — komposisi akses cepat, bukan kartu katalog */
  const FEATURED_SLUGS = ["tiktok", "ai-chat", "anime", "am-gen"];
  const featured = FEATURED_SLUGS.map((sl) => USER_TOOLS.find((t) => t.slug === sl)).filter(Boolean) as UserTool[];
  const hero = featured[0];
  const quick = featured.slice(1);
  const isFiltering = Boolean(query.trim()) || cat !== "all" || showFavs;
  const gridTools = isFiltering ? filtered : filtered.filter((t) => !FEATURED_SLUGS.includes(t.slug));

  const segBtn = (active: boolean) =>
    `shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active ? "bg-card text-ink tools-shadow" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      {/* ===== Pembuka ===== */}
      <header className="max-w-xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          Semua tools, satu tempat.
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
          Unduh media, jelajahi anime, gunakan AI, dan buat konten langsung dari satu platform.
        </p>
        <div className="relative mt-5">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tools… misal: download, ai, manga, cuaca"
            aria-label="Cari tools"
            className="h-11 w-full rounded-lg border border-line bg-card pl-10 pr-3 text-sm text-ink shadow-none outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </header>

      {/* ===== Akses cepat (tanpa filter aktif) ===== */}
      {!isFiltering && hero ? (
        <section className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-3" aria-label="Tools unggulan">
          {/* Panel utama: downloader */}
          <Link
            href={`/tools/${hero.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-card p-5 tools-shadow transition-all hover:border-primary/50 sm:p-6 lg:col-span-2"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky text-primary">
                  <ToolIcon icon={hero.icon} size={22} />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">{hero.name}</h2>
              </div>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-muted">{hero.desc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-transform group-hover:translate-x-0.5">
                Mulai unduh <ChevronRight size={15} />
              </span>
              <span className="hidden text-xs text-ink-faint sm:block">Tempel tautan → ambil video</span>
            </div>
          </Link>

          {/* Akses cepat lainnya */}
          <div className="flex flex-col gap-3">
            {quick.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="group flex flex-1 items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5 transition-colors hover:border-primary/50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky text-primary">
                  <ToolIcon icon={t.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{t.name}</span>
                  <span className="block truncate text-xs text-ink-muted">{t.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ===== Kategori: segmented control ===== */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-card-soft p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => { setCat("all"); setShowFavs(false); }} className={segBtn(cat === "all" && !showFavs)}>
            Semua <span className="ml-1 text-ink-faint">{USER_TOOLS.length}</span>
          </button>
          {TOOL_CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => { setCat(c.key); setShowFavs(false); }} className={segBtn(cat === c.key && !showFavs)}>
              {c.title} <span className="ml-1 text-ink-faint">{USER_TOOLS.filter((t) => t.category === c.key).length}</span>
            </button>
          ))}
          <button onClick={() => setShowFavs(true)} className={segBtn(showFavs)}>
            <span className="inline-flex items-center gap-1.5"><Star size={13} /> Favorit</span>
          </button>
        </div>
      </div>

      {/* ===== Grid tools ===== */}
      <section className="mt-5" aria-label="Daftar tools">
        <h2 className="sr-only">
          {isFiltering ? (showFavs ? "Favoritmu" : cat === "all" ? "Hasil pencarian" : TOOL_CATEGORIES.find((c) => c.key === cat)?.title ?? "Tools") : "Semua tools"}
        </h2>
        {gridTools.length === 0 && filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
            <Search size={20} className="mx-auto text-ink-faint" />
            <p className="mt-3 text-sm text-ink-muted">
              Tidak ada tools yang cocok dengan <span className="font-semibold text-ink">&ldquo;{query || "pilihan ini"}&rdquo;</span>.
            </p>
          </div>
        ) : gridTools.length === 0 && showFavs ? (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
            <Star size={20} className="mx-auto text-ink-faint" />
            <p className="mt-3 text-sm text-ink-muted">Belum ada tools favorit. Tandai bintang pada tools untuk menyimpannya di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {gridTools.map((t) => (
              <article key={t.slug} className="group relative flex items-start gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-primary/50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky text-primary">
                  <ToolIcon icon={t.icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-ink">{t.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-muted">{t.desc}</p>
                </div>
                <StarButton active={isFav(favs, t.slug)} onClick={() => toggleFav(saveFavs, favs, t.slug)} />
                <Link
                  href={`/tools/${t.slug}`}
                  className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={`Buka ${t.name}`}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ============================ HALAMAN TOOL ============================ */
export function ToolRunner({ tool }: { tool: UserTool }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; data?: unknown; error?: string; contentType: string; raw: string } | null>(null);
  const [favs, saveFavs] = useLocalList(FAV_KEY);
  const [, pushHistory] = useHistory();

  const send = async (params: Record<string, string>, endpoint = tool.endpoint) => {
    setLoading(true); setResult(null);
    const qs = Object.entries(params).filter(([, v]) => v !== "").map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    try {
      const res = await fetch(endpoint + (qs ? "?" + qs : ""), { headers: { accept: "application/json" } });
      const ct = res.headers.get("content-type") || "";
      if (ct.startsWith("image/")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResult({ ok: res.ok, contentType: ct, raw: url, data: url });
        pushHistory({ slug: tool.slug, name: tool.name, at: Date.now(), ok: res.ok, summary: "Gambar berhasil dimuat" });
        return;
      }
      const text = await res.text();
      let j: { success?: boolean; data?: unknown; error?: { message?: string }; message?: string } | null = null;
      try { j = JSON.parse(text); } catch { /* non-json */ }
      const ok = res.ok && (!j || j.success !== false);
      setResult({ ok, contentType: ct, raw: text, data: j?.data ?? j ?? null, error: !ok ? (j?.error?.message || j?.message || `Gagal (HTTP ${res.status})`) : undefined });
      pushHistory({ slug: tool.slug, name: tool.name, at: Date.now(), ok, summary: ok ? "Berhasil" : (j?.error?.message || "Gagal").slice(0, 60) });
    } catch {
      setResult({ ok: false, contentType: "", raw: "", data: null, error: "Koneksi bermasalah. Coba lagi." });
      pushHistory({ slug: tool.slug, name: tool.name, at: Date.now(), ok: false, summary: "Koneksi bermasalah" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <ArrowLeft size={15} /> Semua tools
        </Link>
        <StarButton active={isFav(favs, tool.slug)} onClick={() => toggleFav(saveFavs, favs, tool.slug)} />
      </div>

      <section className="mt-5 rounded-xl border border-line bg-card p-5 tools-shadow sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky text-primary">
            <ToolIcon icon={tool.icon} size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">{tool.name}</h1>
            <p className="text-sm text-ink-muted">{tool.desc}</p>
          </div>
        </div>
        {tool.note ? (
          <p className="mt-4 rounded-lg bg-card-soft px-3 py-2 text-sm text-ink-muted">{tool.note}</p>
        ) : null}

        {tool.kind === "chat" ? (
          <ChatUI tool={tool} />
        ) : tool.kind === "am-manual" ? (
          <AmManualUI send={send} />
        ) : tool.kind === "tempmail" ? (
          <TempmailUI send={send} />
        ) : (
          <>
            {tool.params.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {tool.params.map((p) => (
                  <label key={p.name} className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-medium text-ink-muted">
                      {p.label} {p.required ? <span className="font-semibold text-danger">*</span> : <span className="text-ink-faint">(opsional)</span>}
                    </span>
                    {p.type === "textarea" ? (
                      <textarea
                        value={values[p.name] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                        placeholder={p.placeholder}
                        rows={3}
                        className="rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <input
                        value={values[p.name] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                        placeholder={p.placeholder}
                        type={p.type === "number" ? "number" : p.type === "email" ? "email" : "text"}
                        className="h-11 rounded-lg border border-line bg-bg px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : null}
            <button
              onClick={() => send(values)}
              disabled={loading || tool.params.some((p) => p.required && !values[p.name])}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? "Memproses…" : "Jalankan"}
            </button>
          </>
        )}

        {/* Hasil */}
        {result && tool.kind !== "chat" ? (
          <div className="mt-2"><ResultView result={result} loading={loading} tool={tool} /></div>
        ) : null}
      </section>
    </main>
  );
}

/* ============================ RENDER HASIL ============================ */
function CopyText({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-primary/50 hover:text-ink"
    >
      {ok ? <Check size={12} className="text-primary" /> : <Copy size={12} />} {ok ? "Tersalin" : (label ?? "Salin")}
    </button>
  );
}

const MEDIA_RE = /\.(mp4|mp3|webm|m4a|wav|ogg|mov|mkv|aac|flac|m3u8|opus|amr)(\?|$)/i;
const IMG_RE = /\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i;

function collectUrls(node: unknown, out: { media: string[]; images: string[]; others: string[] }, depth = 0) {
  if (depth > 6 || node == null) return;
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node)) {
      if (MEDIA_RE.test(node)) out.media.push(node);
      else if (IMG_RE.test(node) || /(googleusercontent|i\.ytimg)/.test(node)) out.images.push(node);
      else out.others.push(node);
    }
    return;
  }
  if (Array.isArray(node)) { for (const x of node) collectUrls(x, out, depth + 1); return; }
  if (typeof node === "object") { for (const v of Object.values(node as Record<string, unknown>)) collectUrls(v, out, depth + 1); }
}

function ResultView({ result, loading, tool }: { result: { ok: boolean; data?: unknown; error?: string; contentType: string; raw: string }; loading: boolean; tool: UserTool }) {
  if (!result.ok) {
    return (
      <div role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
        {result.error?.includes("MAINTENANCE") ? "Sistem sedang dalam pemeliharaan. Coba lagi nanti ya." : (result.error || "Terjadi kesalahan. Coba lagi.")}
      </div>
    );
  }
  // gambar binary (r/cats, r/neko)
  if (result.contentType.startsWith("image/")) {
    return (
      <div className="mt-6">
        <div className="flex justify-center rounded-xl bg-code p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.raw} alt={`Hasil ${tool.name}`} className="max-h-[420px] max-w-full rounded-lg object-contain" />
        </div>
        <div className="mt-3 flex justify-center"><CopyText text={tool.endpoint ? window.location.origin + tool.endpoint : ""} label="Salin tautan" /></div>
      </div>
    );
  }
  const urls = { media: [] as string[], images: [] as string[], others: [] as string[] };
  collectUrls(result.data, urls);
  const unique = <T,>(a: T[]) => [...new Set(a)];
  const media = unique(urls.media).slice(0, 8);
  const images = unique(urls.images).slice(0, 12);

  const isAudioOnly = media.length > 0 && media.every((u) => /\.(mp3|m4a|wav|ogg|aac|flac|opus)(\?|$)/i.test(u));
  return (
    <div className="mt-6 space-y-4 tools-rise">
      {media.length > 0 ? (
        <div className="space-y-3">
          {isAudioOnly ? (
            <div className="rounded-xl bg-code p-4">
              {media.slice(0, 2).map((u, i) => (<audio key={i} src={u} controls preload="metadata" className="w-full" />))}
            </div>
          ) : (
            <video src={media[0]} controls preload="metadata" className="max-h-[380px] w-full rounded-xl bg-code" />
          )}
          <div className="flex flex-wrap gap-2">
            {media.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-primary/50 hover:text-primary">
                <Download size={13} /> Unduh {/\.(mp3|m4a|wav|ogg|aac|flac|opus)(\?|$)/i.test(u) ? "Audio" : "Video"} {media.length > 1 ? `(${i + 1})` : ""}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-line bg-code">
              <img src={u} alt={`Gambar ${i + 1}`} loading="lazy" className="h-32 w-full object-cover" />
            </a>
          ))}
        </div>
      ) : null}
      <StructuredData data={result.data} />
      <details className="rounded-lg border border-line bg-card-soft">
        <summary className="cursor-pointer px-3.5 py-2.5 text-xs font-medium text-ink-muted">Data mentah (JSON)</summary>
        <pre className="max-h-60 overflow-auto border-t border-line px-3.5 py-2.5 font-code text-[11px] leading-relaxed text-ink-muted">{(() => { try { return JSON.stringify(result.data, null, 2); } catch { return result.raw; } })()}</pre>
      </details>
    </div>
  );
}

/* Kvp / list walker: render data terstruktur jadi blok yang mudah dibaca */
function isSimple(v: unknown) { return typeof v === "string" || typeof v === "number" || typeof v === "boolean"; }

function StructuredData({ data }: { data: unknown }) {
  const nodes = walk(data);
  if (nodes.length === 0) return null;
  return <div className="space-y-2">{nodes.slice(0, 40).map((n, i) => <DataCard key={i} n={n} />)}</div>;
}

function walk(data: unknown, path: string[] = [], out: { path: string[]; item: Record<string, unknown> }[] = [], depth = 0): { path: string[]; item: Record<string, unknown> }[] {
  if (data == null || depth > 4) return out;
  if (Array.isArray(data)) {
    const arr = data.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[];
    if (arr.length > 0 && arr.length <= 60) {
      for (const it of arr) out.push({ path, item: it });
    } else if (data.every(isSimple)) {
      out.push({ path, item: { "hasil": data.join(", ").slice(0, 400) } });
    }
    for (const v of data) if (v && typeof v === "object") walk(v, path, out, depth + 1);
  } else if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.some((k) => isSimple(obj[k]))) out.push({ path, item: obj });
    for (const [k, v] of Object.entries(obj)) if (v && typeof v === "object") walk(v, [...path, k], out, depth + 1);
  }
  return out;
}

function DataCard({ n }: { n: { path: string[]; item: Record<string, unknown> } }) {
  const entries = Object.entries(n.item).filter(([, v]) => isSimple(v) || (Array.isArray(v) && v.every(isSimple)));
  if (entries.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-card-soft p-3.5">
      {n.path.length > 0 ? <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{n.path.join(" › ")}</p> : null}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {entries.slice(0, 12).map(([k, v]) => (
          <div key={k} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{k.replace(/_/g, " ")}</dt>
            <dd className="truncate text-[13px] text-ink" title={String(v)}>{Array.isArray(v) ? v.join(", ").slice(0, 120) : String(v ?? "").slice(0, 160)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ============================ CHAT (fallback AI di runner generik) ============================ */
function ChatUI({ tool }: { tool: UserTool }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hai! Aku AI Aomi. Tanya apa saja ya." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const sendMsg = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch(tool.endpoint + "?prompt=" + encodeURIComponent(q), { headers: { accept: "application/json" } });
      const j = await res.json().catch(() => null);
      const text =
        (j && typeof j.data === "string" && j.data) ||
        (j && j.data && typeof j.data === "object" && (j.data.result || j.data.answer || j.data.message || JSON.stringify(j.data).slice(0, 600))) ||
        (j && typeof j.message === "string" && j.message) || "Maaf, aku belum bisa menjawab sekarang. Coba lagi ya.";
      setMsgs((m) => [...m, { role: "ai", text: String(text) }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: "Koneksi bermasalah. Coba lagi ya." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-card-soft p-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "rounded-br-md bg-primary text-onprimary" : "rounded-bl-md bg-card text-ink"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 text-sm text-ink-faint"><Loader2 size={14} className="animate-spin" /> AI sedang mengetik…</div>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          placeholder="Tulis pesanmu di sini…"
          className="h-11 flex-1 rounded-lg border border-line bg-bg px-3.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button onClick={sendMsg} disabled={busy || !input.trim()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50">
          <Send size={15} /> Kirim
        </button>
      </div>
    </div>
  );
}

/* ============================ AM MANUAL (fallback runner generik) ============================ */
function AmManualUI({ send }: { send: (params: Record<string, string>, endpoint?: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl bg-card-soft p-4">
        <p className="text-sm font-semibold text-ink">Langkah 1 — Kirim link ke emailmu</p>
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="emailkamu@gmail.com"
            className="h-11 flex-1 rounded-lg border border-line bg-bg px-3.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={async () => {
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setMsg("Masukkan alamat email yang valid."); return; }
              setMsg(null);
              await send({ email }, "/api/v1/tools/am-send");
              setSent(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Mail size={15} /> Kirim Link
          </button>
        </div>
      </div>
      {sent ? (
        <div className="rounded-xl bg-card-soft p-4">
          <p className="text-sm font-semibold text-ink">Langkah 2 — Tempel link dari emailmu</p>
          <p className="mt-1 text-sm text-ink-muted">Buka email dari Alight Motion, salin tautan pada tombolnya, lalu tempel di bawah ini.</p>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://alightcreative.com/auth_action?..."
              className="h-11 flex-1 rounded-lg border border-line bg-bg px-3.5 font-code text-xs text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => { if (link.startsWith("https://")) { setMsg(null); send({ email, link }, "/api/v1/tools/am-verify"); } else setMsg("Link harus diawali https://"); }}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink transition-colors hover:border-primary/50"
            >
              <Wand size={15} /> Verifikasi
            </button>
          </div>
        </div>
      ) : null}
      {msg ? <p className="text-sm font-medium text-danger">{msg}</p> : null}
    </div>
  );
}

/* ============================ TEMPMAIL ============================ */
function TempmailUI({ send }: { send: (params: Record<string, string>, endpoint?: string) => Promise<void> }) {
  const [address, setAddress] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [inbox, setInbox] = useState<{ subject?: string; from_address?: string; text?: string; content?: string }[]>([]);

  const create = async () => {
    setInbox([]);
    await send({ duration: "10" }, "/api/v1/tools/tempmail");
    try {
      const res = await fetch("/api/v1/tools/tempmail?duration=10", { headers: { accept: "application/json" } });
      const j = await res.json();
      if (j?.data?.address) setAddress(j.data.address);
    } catch { /* ignore */ }
  };

  const check = async () => {
    if (!address) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/v1/tools/tempmail-inbox?email=${encodeURIComponent(address)}&_=${Date.now()}`, { headers: { accept: "application/json" } });
      const j = await res.json();
      setInbox(j?.data?.emails ?? []);
    } catch { /* ignore */ } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={create} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98]">
          <Mail size={15} /> Buat Email Baru
        </button>
        {address ? (
          <>
            <span className="min-w-0 flex-1 truncate rounded-lg border border-line bg-card-soft px-3 py-2 font-code text-sm font-medium text-ink">{address}</span>
            <CopyText text={address} label="Salin" />
            <button onClick={check} disabled={checking} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-primary/50 disabled:opacity-50">
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} /> Cek Inbox
            </button>
          </>
        ) : null}
      </div>
      {address ? (
        <div className="space-y-2">
          {inbox.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3.5 py-3 text-sm text-ink-faint">Belum ada email masuk. Tekan Cek Inbox setelah beberapa saat.</p>
          ) : inbox.map((m, i) => (
            <div key={i} className="rounded-lg border border-line bg-card-soft p-3.5">
              <p className="text-sm font-semibold text-ink">{m.subject || "(tanpa subjek)"}</p>
              <p className="mt-0.5 font-code text-[11px] text-ink-faint">dari {m.from_address || "?"}</p>
              <p className="mt-2 whitespace-pre-wrap break-all text-[13px] leading-relaxed text-ink-muted">{(m.text || m.content || "").replace(/<[^>]+>/g, " ").slice(0, 800)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
