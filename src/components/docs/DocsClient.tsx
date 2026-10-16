"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Play, X, CheckCircle2, CircleDashed } from "lucide-react";
import type { EndpointDefinition } from "@/types/api";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { VERIFIED_IDS } from "@/config/verification";
import { EndpointDetail } from "./EndpointDetail";

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET"
      ? "border-primary text-primary"
      : method === "POST"
        ? "border-lemon text-lemon"
        : "border-danger text-danger";
  return (
    <span className={`shrink-0 rounded border px-1.5 py-px font-code text-[10px] font-semibold ${color}`}>
      {method}
    </span>
  );
}

function localPath(e: EndpointDefinition) {
  return `/api/v1${e.upstreamPath.replace(/^\/api/, "")}`;
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

  // Press "/" to jump to search
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

  // Prefill ?q= dan fokus pencarian saat datang dari topbar (?focus=1)
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
    <main className="min-h-[calc(100vh-48px)] flex-1 lg:min-h-screen">
      {/* Bar pencarian + filter kategori */}
      <div className="sticky top-12 z-30 border-b-2 border-line bg-bg lg:top-0">
        <div className="mx-auto max-w-4xl px-5 py-4 sm:px-8">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari endpoint, kategori, atau deskripsi… (tekan /)"
              className="w-full rounded-lg border-2 border-line bg-bg py-2 pl-8 pr-8 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            />
          </div>
          <div
            ref={pillsRef}
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {pills.map((p) => (
              <button
                key={p.key}
                data-cat={p.key}
                onClick={() => setCategory(p.key)}
                className={`press shrink-0 rounded-full border-2 px-3 py-1 font-code text-xs font-bold transition-colors ${
                  category === p.key
                    ? "border-primary bg-primary text-onprimary shadow-hard-sm"
                    : "border-line-strong bg-card text-ink-muted hover:text-ink"
                }`}
              >
                {p.title} <span className="opacity-70">{p.n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar endpoint */}
      <div className="px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Dokumentasi API
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            {ENDPOINTS.length} endpoint siap dipakai. Cari, pilih kategori, lalu tekan{" "}
            <span className="font-semibold text-primary">GET</span> untuk mencoba langsung.
            Semua request dikirim nyata ke backend{" "}
            <code className="rounded bg-sky px-1 py-0.5 font-code text-[13px] font-semibold text-ink">
              /api/v1
            </code>{" "}
            milik website ini.
          </p>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-xl border-2 border-line bg-card p-6 text-center text-sm text-ink-faint">
              Tidak ada endpoint yang cocok dengan{" "}
              <span className="text-ink-muted">&ldquo;{query}&rdquo;</span>.
            </div>
          ) : (
            [...byCategory.entries()].map(([key, list]) => {
              const c = CATEGORIES.find((x) => x.key === key);
              return (
                <section key={key} className="mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-ink">
                      {c?.title ?? key}
                    </h2>
                    <span className="rounded-md bg-sky px-2 py-0.5 font-code text-xs font-bold text-ink">
                      {list.length}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {list.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setModalId(e.id)}
                        className="press w-full rounded-xl border-2 border-line-strong bg-card p-4 text-left shadow-note transition-colors hover:bg-card-soft"
                      >
                        <div className="flex items-center gap-2.5">
                          <MethodBadge method={e.method} />
                          <code className="min-w-0 flex-1 truncate font-code text-sm font-semibold text-ink">
                            {localPath(e)}
                          </code>
                          {verified.has(e.id) ? (
                            <CheckCircle2
                              size={13}
                              className="shrink-0 text-mint"
                              aria-label="terverifikasi"
                            />
                          ) : (
                            <CircleDashed
                              size={13}
                              className="shrink-0 text-ink-faint"
                              aria-label="belum terverifikasi"
                            />
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{e.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-code text-[11px] text-ink-faint">
                            {e.params.length > 0 ? `${e.params.length} parameter` : "tanpa parameter"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-display text-xs font-bold text-onprimary">
                            <Play size={11} /> {e.method}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Pop up detail endpoint — tekan GET untuk membuka */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail endpoint ${active.name}`}
        >
          <div
            className="absolute inset-0 bg-ink/45"
            onClick={() => setModalId(null)}
            aria-hidden="true"
          />
          <div className="animate-pop relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-line-strong bg-card shadow-note">
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
