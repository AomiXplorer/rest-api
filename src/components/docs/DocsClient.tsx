"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Play, X, Terminal } from "lucide-react";
import type { EndpointDefinition } from "@/types/api";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { VERIFIED_IDS } from "@/config/verification";
import { EndpointDetail } from "./EndpointDetail";
import { CurlPanel } from "./CurlPanel";

/* Badge metode: chip mono kecil */
function MethodBadge({ method }: { method: string }) {
  return (
    <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 font-code text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
      {method}
    </span>
  );
}

/* Status endpoint: titik hijau "active" bila terverifikasi */
function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-ink-muted">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${verified ? "bg-mint" : "bg-ink-faint"}`} />
      {verified ? "active" : "beta"}
    </span>
  );
}

export function DocsClient({
  initialCategory,
  initialEndpointId,
}: {
  initialCategory?: string;
  initialEndpointId?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [modalId, setModalId] = useState<string | null>(initialEndpointId ?? null);
  const [curlView, setCurlView] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const verified = useMemo(() => new Set(VERIFIED_IDS), []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of ENDPOINTS) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENDPOINTS.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.upstreamPath.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.method.toLowerCase() === q ||
        CATEGORIES.find((c) => c.key === e.category)?.title.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const byCategory = useMemo(() => {
    const groups = new Map<string, EndpointDefinition[]>();
    for (const e of filtered) {
      const list = groups.get(e.category) ?? [];
      list.push(e);
      groups.set(e.category, list);
    }
    return groups;
  }, [filtered]);

  const active = useMemo(() => ENDPOINTS.find((e) => e.id === modalId) ?? null, [modalId]);

  // Tekan "/" untuk lompat ke pencarian
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prefill ?q= dan fokus pencarian saat datang dari halaman lain (?focus=1)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q");
    if (q) setQuery(q);
    if (q || sp.get("focus")) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, []);

  // Pastikan pill kategori aktif terlihat di baris filter horizontal
  useEffect(() => {
    const el = pillsRef.current?.querySelector<HTMLElement>(`[data-cat="${category}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [category]);

  // Modal: Esc untuk menutup + kunci scroll body saat terbuka
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalId(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const pills = [
    { key: "all", title: "Semua", n: ENDPOINTS.length },
    ...CATEGORIES.map((c) => ({ key: c.key, title: c.title, n: counts.get(c.key) ?? 0 })),
  ];

  return (
    <main className="flex-1">
      <div className="px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Judul + pencarian */}
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Daftar API</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {ENDPOINTS.length} endpoint siap dipakai. Cari, pilih, lalu coba langsung dari sini.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari endpoint, kategori, atau deskripsi…"
                aria-label="Cari endpoint"
                className="h-11 w-full rounded-lg border border-line bg-card pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setCurlView((v) => !v)}
              aria-label="Panel cURL semua fitur"
              title="Panel cURL semua fitur"
              className={`flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                curlView
                  ? "border-primary/40 bg-primary text-onprimary"
                  : "border-line bg-card text-ink-muted hover:text-ink"
              }`}
            >
              <Terminal size={14} /> cURL
            </button>
          </div>

          {/* Pill kategori */}
          <div
            ref={pillsRef}
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {pills.map((p) => (
              <button
                key={p.key}
                data-cat={p.key}
                onClick={() => setCategory(p.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  category === p.key
                    ? "bg-primary text-onprimary"
                    : "border border-line bg-card text-ink-muted hover:text-ink"
                }`}
              >
                {p.title} <span className={category === p.key ? "opacity-70" : "text-ink-faint"}>{p.n}</span>
              </button>
            ))}
          </div>

          {/* Panel cURL */}
          {curlView ? (
            <div className="mt-6">
              <CurlPanel onClose={() => setCurlView(false)} />
            </div>
          ) : null}

          {/* Daftar endpoint per kategori */}
          {filtered.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mascot/mascot-icon.svg"
                alt=""
                aria-hidden="true"
                className="h-16 w-16 rounded-[28%] opacity-70"
              />
              <p className="mt-4 text-sm text-ink-muted">
                Tidak ada endpoint yang cocok dengan{" "}
                <span className="font-semibold text-ink">&ldquo;{query || "pilihan ini"}&rdquo;</span>.
              </p>
              <p className="mt-1 text-xs text-ink-faint">Coba kata kunci lain, atau reset filternya.</p>
            </div>
          ) : (
            [...byCategory.entries()].map(([key, list]) => {
              const c = CATEGORIES.find((x) => x.key === key);
              return (
                <section key={key} className="mt-7">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">{c?.title ?? key}</h2>
                    <span className="rounded bg-surface px-1.5 py-0.5 font-code text-[11px] text-ink-muted">
                      {list.length}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-col gap-2">
                    {list.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setModalId(e.id)}
                        className="group w-full rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <MethodBadge method={e.method} />
                          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold capitalize text-ink sm:text-sm">
                            {e.name}
                          </span>
                          <StatusBadge verified={verified.has(e.id)} />
                          <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 font-code text-[11px] font-bold text-onprimary transition-transform group-hover:scale-[1.02]">
                            <Play size={11} /> {e.method}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-[13px] text-ink-muted">{e.description}</p>
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {e.params.length > 0 ? `${e.params.length} parameter` : "tanpa parameter"}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Modal detail endpoint — tekan GET untuk membuka */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail endpoint ${active.name}`}
        >
          <div
            className="animate-fade-in absolute inset-0 bg-black/60"
            onClick={() => setModalId(null)}
            aria-hidden="true"
          />
          <div className="animate-pop relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-card shadow-2xl">
            <EndpointDetail
              key={active.id}
              endpoint={active}
              verified={verified.has(active.id)}
              variant="modal"
              onClose={() => setModalId(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
