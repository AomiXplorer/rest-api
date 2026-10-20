"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Download, Music, Video, Camera, Twitter, Sparkles, Book, List, Wand, Mail,
  Moon, Cloud, Activity, Tv, Newspaper, Mic, Youtube, Smartphone, Github, Gauge,
  Image as ImageIcon, Home, Star, History, Menu, X, Send, Loader2, Copy, Check,
  RefreshCw, ArrowLeft, Play,
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

/* ======================= FAVORIT & RIWAYAT (localStorage) ======================= */
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
      className="press shrink-0 rounded-lg border-2 border-line bg-card p-1.5 hover:bg-lemon/40"
    >
      <Star size={14} className={active ? "fill-lemon text-ink" : "text-ink-faint"} />
    </button>
  );
}

/* ============================ DASHBOARD ============================ */
export function ToolsDashboard() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [showFavs, setShowFavs] = useState(false);
  const [favs, saveFavs] = useLocalList(FAV_KEY);
  const pathname = usePathname();

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

  return (
    <div className="min-h-[calc(100vh-48px)] flex-1 lg:flex lg:min-h-screen">
      {/* Sidebar desktop */}
      <ToolsSidebar cat={cat} setCat={setCat} showFavs={showFavs} setShowFavs={setShowFavs} pathname={pathname} />

      <main className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8">
        {/* Hero */}
        <section className="rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note sm:p-7">
          <div className="tape-left" />
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Aomi Tools</h1>
          <p className="mt-2 max-w-xl leading-relaxed text-ink-muted">
            Semua tools favoritmu, dalam satu tempat. Download media, jelajahi manga, ngobrol dengan AI, dan coba berbagai tools — tanpa konfigurasi rumit.
          </p>
          <div className="relative mt-4 max-w-xl">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari tools… misal: download, ai, manga, cuaca"
              className="h-12 w-full rounded-lg border border-line bg-bg pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />
          </div>
        </section>

        {/* Kategori chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => { setCat("all"); setShowFavs(false); }}
            className={`press shrink-0 rounded-full border-2 px-3 py-1 font-code text-xs font-bold ${cat === "all" && !showFavs ? "border-primary bg-primary text-onprimary shadow-hard-sm" : "border-line-strong bg-card text-ink-muted hover:text-ink"}`}
          >
            Semua <span className="opacity-70">{USER_TOOLS.length}</span>
          </button>
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => { setCat(c.key); setShowFavs(false); }}
              className={`press shrink-0 rounded-full border-2 px-3 py-1 font-code text-xs font-bold ${cat === c.key && !showFavs ? "border-primary bg-primary text-onprimary shadow-hard-sm" : "border-line-strong bg-card text-ink-muted hover:text-ink"}`}
            >
              {c.title} <span className="opacity-70">{USER_TOOLS.filter((t) => t.category === c.key).length}</span>
            </button>
          ))}
        </div>

        {/* Grid tools */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border-2 border-line bg-card p-8 text-center text-sm text-ink-faint">
            Tidak ada tools yang cocok dengan <span className="text-ink-muted">&ldquo;{query || "pilihan ini"}&rdquo;</span>.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <article key={t.slug} className="flex flex-col rounded-xl border-2 border-line-strong bg-card p-4 shadow-note">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg border-2 border-line bg-sky p-2 text-primary">
                    <ToolIcon icon={t.icon} />
                  </span>
                  <StarButton active={isFav(favs, t.slug)} onClick={() => toggleFav(saveFavs, favs, t.slug)} />
                </div>
                <h2 className="mt-3 font-display text-base font-bold text-ink">{t.name}</h2>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">{t.desc}</p>
                <Link
                  href={`/tools/${t.slug}`}
                  className="press mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-3 py-2 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90"
                >
                  <Play size={14} /> Gunakan
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ToolsSidebar({ cat, setCat, showFavs, setShowFavs, pathname }: {
  cat: string; setCat: (v: string) => void; showFavs: boolean; setShowFavs: (v: boolean) => void; pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [favs] = useLocalList(FAV_KEY);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setOpen(pathname.includes("/tools")); }, [pathname]);

  const MenuItem = ({ active, label, icon, count, onClick }: { active: boolean; label: string; icon: string; count?: number; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg border-2 px-3 py-2 text-left font-display text-sm font-bold transition-colors ${
        active ? "border-primary bg-primary text-onprimary shadow-hard-sm" : "border-transparent text-ink-muted hover:bg-card hover:text-ink"
      }`}
    >
      <ToolIcon icon={icon} size={16} />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && <span className="font-code text-[11px] opacity-70">{count}</span>}
    </button>
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      <MenuItem active={cat === "all" && !showFavs} label="Semua Tools" icon="home" count={USER_TOOLS.length} onClick={() => { setCat("all"); setShowFavs(false); setDrawer(false); }} />
      {TOOL_CATEGORIES.map((c) => (
        <MenuItem key={c.key} active={cat === c.key && !showFavs} label={c.title} icon={c.icon} count={USER_TOOLS.filter((t) => t.category === c.key).length} onClick={() => { setCat(c.key); setShowFavs(false); setDrawer(false); }} />
      ))}
      <div className="my-2 border-t-2 border-dashed border-line" />
      <MenuItem active={showFavs} label="Favorit" icon="star" count={favs.length} onClick={() => { setShowFavs(true); setDrawer(false); }} />
      <Link href="/docs" className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-display text-sm font-bold text-ink-faint hover:text-ink">
        <ToolIcon icon="book" size={16} /> Docs (developer)
      </Link>
    </nav>
  );

  if (!open) return null;

  return (
    <>
      {/* Mobile: drawer */}
      <button
        onClick={() => setDrawer(true)}
        className="press fixed left-4 top-[60px] z-40 rounded-lg border-2 border-line-strong bg-card p-2 shadow-hard-sm lg:hidden"
        aria-label="Buka menu kategori"
      >
        <Menu size={18} className="text-ink" />
      </button>
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80%] overflow-y-auto border-r-2 border-line-strong bg-bg p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-extrabold text-ink">Kategori</span>
              <button onClick={() => setDrawer(false)} aria-label="Tutup menu" className="rounded-lg border-2 border-line bg-card p-1.5"><X size={16} className="text-ink" /></button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      {/* Desktop: sidebar */}
      <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-60 shrink-0 overflow-y-auto border-r-2 border-dashed border-line-strong bg-bg/60 p-4 lg:block">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-lg border-2 border-line bg-sticky p-1.5 text-sticky-ink shadow-hard-sm"><ToolIcon icon="wand" size={16} /></span>
          <span className="font-display text-base font-extrabold text-ink">Aomi Tools</span>
        </div>
        {nav}
      </aside>
    </>
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
    <div className="min-h-[calc(100vh-48px)] flex-1 lg:flex lg:min-h-screen">
      <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <Link href="/tools" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
            <ArrowLeft size={14} /> Kembali
          </Link>
          <StarButton active={isFav(favs, tool.slug)} onClick={() => toggleFav(saveFavs, favs, tool.slug)} />
        </div>

        <section className="mt-4 rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border-2 border-line bg-sky p-2.5 text-primary"><ToolIcon icon={tool.icon} size={22} /></span>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">{tool.name}</h1>
              <p className="text-sm text-ink-muted">{tool.desc}</p>
            </div>
          </div>
          {tool.note ? (
            <p className="mt-3 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2 text-sm text-ink-muted">{tool.note}</p>
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
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tool.params.map((p) => (
                    <label key={p.name} className="flex flex-col gap-1.5">
                      <span className="font-code text-xs text-ink-muted">
                        {p.label} {p.required ? <span className="font-bold text-danger">*</span> : <span className="text-ink-faint">(opsional)</span>}
                      </span>
                      {p.type === "textarea" ? (
                        <textarea
                          value={values[p.name] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                          placeholder={p.placeholder}
                          rows={3}
                          className="rounded-lg border-2 border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                        />
                      ) : (
                        <input
                          value={values[p.name] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                          placeholder={p.placeholder}
                          type={p.type === "number" ? "number" : p.type === "email" ? "email" : "text"}
                          className="h-11 rounded-lg border-2 border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                        />
                      )}
                    </label>
                  ))}
                </div>
              ) : null}
              <button
                onClick={() => send(values)}
                disabled={loading || tool.params.some((p) => p.required && !values[p.name])}
                className="press mt-5 inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-5 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-55"
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
      </div>
    </div>
  );
}

/* ============================ RENDER HASIL ============================ */
function CopyText({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className="press inline-flex items-center gap-1 rounded-md border-2 border-line-strong bg-card px-2 py-1 font-code text-[11px] font-semibold text-ink hover:bg-lemon/40"
    >
      {ok ? <Check size={12} className="text-green-600" /> : <Copy size={12} />} {ok ? "Tersalin!" : (label ?? "Salin")}
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
      <div role="alert" className="mt-5 rounded-xl border-2 border-danger bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
        {result.error?.includes("MAINTENANCE") ? "Sistem sedang dalam pemeliharaan. Coba lagi nanti ya." : (result.error || "Terjadi kesalahan. Coba lagi.")}
      </div>
    );
  }
  // gambar binary (r/cats, r/neko)
  if (result.contentType.startsWith("image/")) {
    return (
      <div className="mt-5">
        <div className="flex justify-center rounded-xl border-2 border-line bg-code p-4">
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
    <div className="mt-5 space-y-4">
      {media.length > 0 ? (
        <div className="space-y-3">
          {isAudioOnly ? (
            <div className="rounded-xl border-2 border-line bg-code p-4">
              {media.slice(0, 2).map((u, i) => (<audio key={i} src={u} controls preload="metadata" className="w-full" />))}
            </div>
          ) : (
            <video src={media[0]} controls preload="metadata" className="max-h-[380px] w-full rounded-xl border-2 border-line bg-code" />
          )}
          <div className="flex flex-wrap gap-2">
            {media.map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-lemon px-3 py-2 font-code text-xs font-bold text-ink shadow-hard-sm hover:bg-lemon/70">
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
            <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border-2 border-line bg-code">
              <img src={u} alt={`Gambar ${i + 1}`} loading="lazy" className="h-32 w-full object-cover" />
            </a>
          ))}
        </div>
      ) : null}
      <StructuredData data={result.data} />
      <details className="rounded-lg border-2 border-dashed border-line bg-card-soft">
        <summary className="cursor-pointer px-3 py-2 font-code text-xs font-bold text-ink-muted">Data mentah</summary>
        <pre className="max-h-60 overflow-auto border-t-2 border-dashed border-line px-3 py-2 font-code text-[11px] text-ink-muted">{(() => { try { return JSON.stringify(result.data, null, 2); } catch { return result.raw; } })()}</pre>
      </details>
    </div>
  );
}

/* Kvp / list walker: render data terstruktur jadi kartu kecil yang mudah dibaca */
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
    <div className="rounded-lg border-2 border-line bg-card-soft p-3">
      {n.path.length > 0 ? <p className="mb-1 font-code text-[10px] font-bold uppercase tracking-wide text-ink-faint">{n.path.join(" › ")}</p> : null}
      <dl className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {entries.slice(0, 12).map(([k, v]) => (
          <div key={k} className="flex min-w-0 flex-col border-b border-dashed border-line py-0.5">
            <dt className="font-code text-[10px] uppercase text-ink-faint">{k.replace(/_/g, " ")}</dt>
            <dd className="truncate text-[13px] text-ink" title={String(v)}>{Array.isArray(v) ? v.join(", ").slice(0, 120) : String(v ?? "").slice(0, 160)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ============================ CHAT (AI) ============================ */
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
    <div className="mt-5">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border-2 border-line bg-card-soft p-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl border-2 px-3 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "border-primary bg-primary text-onprimary" : "border-line bg-card text-ink"
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
          className="h-12 flex-1 rounded-lg border-2 border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
        <button onClick={sendMsg} disabled={busy || !input.trim()} className="press inline-flex h-12 items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-4 font-display text-sm font-bold text-onprimary shadow-hard-sm disabled:opacity-55">
          <Send size={15} /> Kirim
        </button>
      </div>
    </div>
  );
}

/* ============================ AM MANUAL ============================ */
function AmManualUI({ send }: { send: (params: Record<string, string>, endpoint?: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border-2 border-line bg-card-soft p-4">
        <p className="font-display text-sm font-bold text-ink">Langkah 1 — Kirim link ke emailmu</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="emailkamu@gmail.com"
            className="h-11 flex-1 rounded-lg border-2 border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
          />
          <button
            onClick={async () => {
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setMsg("Masukkan alamat email yang valid."); return; }
              setMsg(null);
              await send({ email }, "/api/v1/tools/am-send");
              setSent(true);
            }}
            className="press inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-4 font-display text-sm font-bold text-onprimary shadow-hard-sm"
          >
            <Mail size={15} /> Kirim Link
          </button>
        </div>
      </div>
      {sent ? (
        <div className="rounded-xl border-2 border-line bg-card-soft p-4">
          <p className="font-display text-sm font-bold text-ink">Langkah 2 — Tempel link dari emailmu</p>
          <p className="mt-1 text-sm text-ink-muted">Buka email dari Alight Motion, salin tautan pada tombolnya, lalu tempel di bawah ini.</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://alightcreative.com/auth_action?..."
              className="h-11 flex-1 rounded-lg border-2 border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => { if (link.startsWith("https://")) { setMsg(null); send({ email, link }, "/api/v1/tools/am-verify"); } else setMsg("Link harus diawali https://"); }}
              className="press inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border-2 border-line-strong bg-lemon px-4 font-display text-sm font-bold text-ink shadow-hard-sm"
            >
              <Wand size={15} /> Verifikasi
            </button>
          </div>
        </div>
      ) : null}
      {msg ? <p className="text-sm font-semibold text-danger">{msg}</p> : null}
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
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={create} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm">
          <Mail size={15} /> Buat Email Baru
        </button>
        {address ? (
          <>
            <span className="min-w-0 flex-1 truncate rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2 font-code text-sm font-bold text-ink">{address}</span>
            <CopyText text={address} label="Salin" />
            <button onClick={check} disabled={checking} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-lemon px-3 py-2 font-display text-sm font-bold text-ink shadow-hard-sm disabled:opacity-55">
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} /> Cek Inbox
            </button>
          </>
        ) : null}
      </div>
      {address ? (
        <div className="space-y-2">
          {inbox.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-3 text-sm text-ink-faint">Belum ada email masuk. Tekan Cek Inbox setelah beberapa saat.</p>
          ) : inbox.map((m, i) => (
            <div key={i} className="rounded-lg border-2 border-line bg-card-soft p-3">
              <p className="font-display text-sm font-bold text-ink">{m.subject || "(tanpa subjek)"}</p>
              <p className="font-code text-[11px] text-ink-faint">dari {m.from_address || "?"}</p>
              <p className="mt-2 whitespace-pre-wrap break-all text-[13px] leading-relaxed text-ink-muted">{(m.text || m.content || "").replace(/<[^>]+>/g, " ").slice(0, 800)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
