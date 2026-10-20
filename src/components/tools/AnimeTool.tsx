"use client";

/**
 * Jelajahi Anime — platform eksplorasi (bukan daftar endpoint).
 * Semua data nyata dari provider via proxy. Provider sedang down?
 * Ditampilkan apa adanya, tanpa data dummy.
 * Pemutaran langsung tidak tersedia (endpoint hanya memberi info & tautan),
 * jadi tidak ada tombol "Tonton Sekarang" palsu.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ImageOff, Loader2, RefreshCw, Search, Tv, ChevronLeft } from "lucide-react";

type Provider = {
  key: string;
  label: string;
  /** endpoint list "terbaru/populer" (bisa null kalau provider tidak punya) */
  latest?: string;
  search?: { endpoint: string; param: string };
  detail?: { endpoint: string; param: string };
  note?: string;
};

const PROVIDERS: Provider[] = [
  {
    key: "otakudesu", label: "Otakudesu",
    latest: "/api/v1/anime/otakudesu/ongoing",
    search: { endpoint: "/api/v1/anime/otakudesu/search", param: "s" },
    detail: { endpoint: "/api/v1/anime/otakudesu/detail", param: "url" },
  },
  {
    key: "anichin", label: "Anichin",
    latest: "/api/v1/anime/anichin-popular",
    search: { endpoint: "/api/v1/anime/anichin-search", param: "query" },
    detail: { endpoint: "/api/v1/anime/anichin-detail", param: "url" },
  },
  {
    key: "samehadaku", label: "Samehadaku",
    latest: "/api/v1/anime/samehadaku/latest",
    search: { endpoint: "/api/v1/anime/samehadaku/search", param: "query" },
    detail: { endpoint: "/api/v1/anime/samehadaku/detail", param: "link" },
  },
  {
    key: "oploverz", label: "Oploverz",
    latest: "/api/v1/anime/oploverz-ongoing",
    search: { endpoint: "/api/v1/anime/oploverz-search", param: "query" },
    detail: { endpoint: "/api/v1/anime/oploverz-episode", param: "url" },
  },
  {
    key: "auratail", label: "Auratail",
    latest: "/api/v1/anime/auratail-latest",
    search: { endpoint: "/api/v1/anime/auratail-search", param: "query" },
    detail: { endpoint: "/api/v1/anime/auratail-detail", param: "url" },
  },
];

type Item = {
  title: string;
  image?: string;
  link?: string;
  badges: string[];
  raw: Record<string, unknown>;
};

type Status = "idle" | "loading" | "ok" | "down" | "error";

/* ---------- deteksi field adaptif (shape provider berbeda-beda) ---------- */
function pick(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}
function findUrl(o: Record<string, unknown>): string | undefined {
  return pick(o, ["url", "link", "href", "page", "slug"]);
}
function findTitle(o: Record<string, unknown>): string | undefined {
  return pick(o, ["title", "name", "judul", "anime_title", "animeTitle"]);
}
function findImage(o: Record<string, unknown>): string | undefined {
  for (const k of ["image", "thumb", "thumbnail", "poster", "cover", "img", "gambar"]) {
    const v = o[k];
    if (typeof v === "string" && /^https?:\/\//i.test(v)) return v;
    if (v && typeof v === "object") {
      const inner = v as Record<string, unknown>;
      const u = findUrl(inner);
      if (u && /^https?:\/\//i.test(u)) return u;
    }
  }
  return undefined;
}
function findBadges(o: Record<string, unknown>): string[] {
  const out: string[] = [];
  for (const k of ["episode", "episodes", "uploaded", "uploaded_on", "date", "status", "day", "type", "rating", "score", "genre", "genres"]) {
    const v = o[k];
    if (typeof v === "string" && v.trim() && v.trim().length <= 40) out.push(v.trim());
    else if (typeof v === "number") out.push(String(v));
    else if (Array.isArray(v) && v.every((x) => typeof x === "string") && v.length > 0 && v.join("").length <= 40) out.push(v.join(", "));
  }
  return out.slice(0, 3);
}
function toItems(data: unknown): Item[] {
  let arr: unknown[] = [];
  if (Array.isArray(data)) arr = data;
  else if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const k of ["results", "data", "animeList", "list", "items", "ongoing", "latest"]) {
      if (Array.isArray(o[k])) { arr = o[k] as unknown[]; break; }
    }
  }
  return arr
    .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object" && !Array.isArray(x)))
    .map((o) => {
      const title = findTitle(o) ?? "(tanpa judul)";
      return { title, image: findImage(o), link: findUrl(o), badges: findBadges(o), raw: o };
    })
    .filter((it) => it.title !== "(tanpa judul)" || it.image || it.link);
}

async function callApi(path: string): Promise<{ ok: boolean; data?: unknown; message?: string; down?: boolean }> {
  try {
    const res = await fetch(path, { headers: { accept: "application/json" } });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j || j.success === false) {
      const code = j?.error?.code;
      return { ok: false, down: res.status >= 500 || code === "UPSTREAM_503" || code === "UPSTREAM_5XX", message: j?.error?.message || j?.message || `Gagal (HTTP ${res.status})` };
    }
    return { ok: true, data: j.data ?? j };
  } catch {
    return { ok: false, message: "Koneksi bermasalah. Periksa jaringanmu." };
  }
}

/* ============================ Komponen ============================ */

export function AnimeTool() {
  const [prov, setProv] = useState<Provider>(PROVIDERS[0] ?? PROVIDERS[1]!);
  const [query, setQuery] = useState("");
  const [listStatus, setListStatus] = useState<Status>("idle");
  const [listItems, setListItems] = useState<Item[]>([]);
  const [listMsg, setListMsg] = useState("");
  const [searching, setSearching] = useState(false);

  const [detail, setDetail] = useState<{ item: Item; status: Status; data?: unknown; message?: string } | null>(null);

  const loadLatest = useCallback(async (p: Provider) => {
    if (!p.latest) { setListItems([]); setListStatus("ok"); return; }
    setListStatus("loading"); setListMsg("");
    const r = await callApi(p.latest);
    if (!r.ok) {
      setListStatus(r.down ? "down" : "error");
      setListMsg(r.message || "");
      setListItems([]);
      return;
    }
    setListItems(toItems(r.data));
    setListStatus("ok");
  }, []);

  useEffect(() => { loadLatest(prov); }, [prov, loadLatest]);

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || !prov.search || searching) return;
    setSearching(true); setDetail(null); setListStatus("loading"); setListMsg("");
    const r = await callApi(`${prov.search.endpoint}?${prov.search.param}=${encodeURIComponent(q)}`);
    setSearching(false);
    if (!r.ok) {
      setListStatus(r.down ? "down" : "error");
      setListMsg(r.message || "");
      setListItems([]);
      return;
    }
    setListItems(toItems(r.data));
    setListStatus("ok");
  };

  const openDetail = async (item: Item) => {
    if (!prov.detail || !item.link) {
      // tidak ada sumber detail untuk provider/ini → tampilkan yang ada
      setDetail({ item, status: "ok", data: item.raw });
      return;
    }
    setDetail({ item, status: "loading" });
    const r = await callApi(`${prov.detail.endpoint}?${prov.detail.param}=${encodeURIComponent(item.link)}`);
    if (!r.ok) { setDetail({ item, status: r.down ? "down" : "error", message: r.message }); return; }
    setDetail({ item, status: "ok", data: r.data });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali
        </Link>
      </div>

      {/* Header anime */}
      <section className="mt-4 rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note sm:p-6">
        <div className="tape-left" />
        <div className="flex items-center gap-3">
          <span className="rounded-lg border-2 border-line bg-sky p-2.5 text-primary"><Tv size={22} /></span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">Jelajahi Anime</h1>
            <p className="text-sm text-ink-muted">Cari anime, lihat info & daftar episode langsung dari sumber. Info detail & episode mengikuti data yang tersedia.</p>
          </div>
        </div>

        {/* Pencarian */}
        <form onSubmit={doSearch} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cari judul anime di ${prov.label}…`}
              className="h-12 w-full rounded-lg border-2 border-line bg-bg pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
              aria-label="Cari anime"
            />
          </div>
          <button type="submit" disabled={searching || !query.trim()} className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-5 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55">
            {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Cari
          </button>
        </form>

        {/* Chip provider */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROVIDERS.map((p) => (
            <button
              key={p.key}
              onClick={() => { setProv(p); setDetail(null); setQuery(""); }}
              className={`press shrink-0 rounded-full border-2 px-3 py-1 font-code text-xs font-bold ${p.key === prov.key ? "border-primary bg-primary text-onprimary shadow-hard-sm" : "border-line-strong bg-card text-ink-muted hover:text-ink"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Detail anime */}
      {detail ? (
        <section className="mt-5 rounded-2xl border-2 border-line-strong bg-card p-4 shadow-note sm:p-5">
          <button onClick={() => setDetail(null)} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink">
            <ChevronLeft size={13} /> Kembali ke daftar
          </button>

          {detail.status === "loading" ? (
            <div className="mt-6 flex items-center justify-center gap-2 py-10 text-sm text-ink-muted"><Loader2 size={16} className="animate-spin text-primary" /> Mengambil detail…</div>
          ) : detail.status === "down" || detail.status === "error" ? (
            <div className="mt-4 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-4 text-sm text-ink-muted">
              {detail.status === "down" ? "Provider sedang tidak tersedia, coba lagi nanti." : "Gagal mengambil detail."}
              {detail.message ? <span className="block font-code text-[11px] text-ink-faint">{detail.message}</span> : null}
            </div>
          ) : (
            <div className="mt-4">
              <DetailBody item={detail.item} data={detail.data} />
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Daftar */}
          <div className="mt-6">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <Clock size={15} className="text-primary" />
              {query.trim() ? `Hasil pencarian "${query.trim()}"` : `Sedang tayang / terbaru — ${prov.label}`}
            </h2>

            {listStatus === "loading" ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-line bg-card py-10 text-sm text-ink-muted">
                <Loader2 size={16} className="animate-spin text-primary" /> Memuat daftar anime…
              </div>
            ) : listStatus === "down" ? (
              <div className="mt-4 rounded-xl border-2 border-dashed border-line bg-card-soft px-4 py-8 text-center">
                <ImageOff size={22} className="mx-auto text-ink-faint" />
                <p className="mt-2 font-display text-sm font-bold text-ink">Provider sedang tidak tersedia</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
                  Sumber {prov.label} sedang tidak bisa dihubungi. {listMsg ? <span className="block font-code text-[11px] text-ink-faint">{listMsg}</span> : null}
                </p>
                <button onClick={() => loadLatest(prov)} className="press mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink">
                  <RefreshCw size={12} /> Coba lagi
                </button>
              </div>
            ) : listStatus === "error" ? (
              <div className="mt-4 rounded-xl border-2 border-dashed border-line bg-card-soft px-4 py-8 text-center text-sm text-ink-muted">
                Gagal memuat daftar. {listMsg}
                <button onClick={() => loadLatest(prov)} className="press mt-3 block rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink">Coba lagi</button>
              </div>
            ) : listItems.length === 0 ? (
              <div className="mt-4 rounded-xl border-2 border-dashed border-line bg-card-soft px-4 py-8 text-center">
                <BookOpen size={22} className="mx-auto text-ink-faint" />
                <p className="mt-2 font-display text-sm font-bold text-ink">Belum ada data dari {prov.label}</p>
                <p className="mt-1 text-sm text-ink-muted">Coba cari judul lewat pencarian, atau pilih provider lain.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {listItems.map((it, i) => (
                  <button key={i} onClick={() => openDetail(it)} className="press group overflow-hidden rounded-xl border-2 border-line-strong bg-card text-left shadow-note hover:border-primary">
                    <div className="aspect-[3/4] w-full overflow-hidden bg-code">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-faint"><ImageOff size={22} /></div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="line-clamp-2 font-display text-[13px] font-bold text-ink">{it.title}</p>
                      {it.badges.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {it.badges.map((b, j) => (
                            <span key={j} className="rounded-full border border-line bg-card-soft px-1.5 py-0.5 font-code text-[10px] font-bold text-ink-muted">{b}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Detail adaptif: hanya data yang benar-benar ada ---------- */
function DetailBody({ item, data }: { item: Item; data: unknown }) {
  const obj = (data && typeof data === "object" && !Array.isArray(data) ? data : item.raw) as Record<string, unknown>;

  const title = findTitle(obj) ?? item.title;
  const image = findImage(obj) ?? item.image;
  const synopsis = pick(obj, ["description", "sinopsis", "synopsis", "summary", "plot", "overview"]);
  const genres = ((): string[] => {
    for (const k of ["genre", "genres"]) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v.split(/[,;]\s*/).slice(0, 10);
      if (Array.isArray(v)) {
        const arr = v.map((x) => (typeof x === "string" ? x : x && typeof x === "object" ? findTitle(x as Record<string, unknown>) : null)).filter(Boolean) as string[];
        if (arr.length) return arr.slice(0, 10);
      }
    }
    return [];
  })();

  /* episode: array dalam data yang isinya punya judul/episode + link */
  const episodes = ((): { label: string; link?: string }[] => {
    const candidates: unknown[] = [];
    for (const k of ["episodes", "episodeList", "episode_list", "list", "downloads", "links"]) {
      const v = obj[k];
      if (Array.isArray(v)) candidates.push(...v);
      else if (v && typeof v === "object") candidates.push(v);
    }
    const out: { label: string; link?: string }[] = [];
    for (const c of candidates) {
      if (!c || typeof c !== "object" || Array.isArray(c)) continue;
      const o = c as Record<string, unknown>;
      const label = findTitle(o) ?? pick(o, ["episode", "ep", "episode_number", "quality", "format"]);
      const link = findUrl(o);
      if (label || link) out.push({ label: label ?? "Tautan", link });
      if (out.length >= 60) break;
    }
    return out;
  })();

  /* info kunci sederhana */
  const infoKeys = ["status", "type", "year", "tahun", "season", "studio", "rating", "score", "total_episodes", "totalEpisodes", "duration", "durasi", "release", "day", "hari", "updated", "uploaded", "author"];
  const infos = Object.entries(obj)
    .filter(([k, v]) => infoKeys.includes(k) && (typeof v === "string" || typeof v === "number") && String(v).trim().length > 0)
    .slice(0, 8);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-32 shrink-0 self-start rounded-xl border-2 border-line bg-code object-cover sm:w-40" />
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold text-ink sm:text-xl">{title}</h2>
          {infos.length > 0 ? (
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {infos.map(([k, v]) => (
                <div key={k} className="text-sm">
                  <dt className="inline font-code text-[10px] uppercase text-ink-faint">{k.replace(/_/g, " ")}:{" "}</dt>
                  <dd className="inline font-bold text-ink">{String(v)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {genres.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {genres.map((g, i) => (
                <span key={i} className="rounded-full border-2 border-line bg-card-soft px-2 py-0.5 font-code text-[10px] font-bold text-ink-muted">{g}</span>
              ))}
            </div>
          ) : null}
          {synopsis ? <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">{synopsis}</p> : null}
        </div>
      </div>

      {episodes.length > 0 ? (
        <div className="mt-5">
          <h3 className="font-display text-sm font-extrabold text-ink">Episode / tautan</h3>
          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {episodes.map((ep, i) => (
              ep.link ? (
                <a key={i} href={ep.link} target="_blank" rel="noopener noreferrer" className="press truncate rounded-lg border-2 border-line bg-card-soft px-3 py-2 font-code text-xs font-bold text-ink hover:border-primary">
                  {ep.label}
                </a>
              ) : (
                <span key={i} className="truncate rounded-lg border-2 border-dashed border-line px-3 py-2 font-code text-xs text-ink-muted">{ep.label}</span>
              )
            ))}
          </div>
          <p className="mt-2 font-code text-[10px] text-ink-faint">Tautan dibuka di tab baru mengikuti sumber aslinya.</p>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2 text-sm text-ink-muted">
          Info lengkap mengikuti data yang tersedia dari provider ini. Pemutaran langsung belum tersedia di Aomi.
        </p>
      )}
    </div>
  );
}
