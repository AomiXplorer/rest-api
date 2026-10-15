"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Menu, X, CheckCircle2, CircleDashed } from "lucide-react";
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

export function DocsClient({
  initialCategory,
  initialEndpointId,
}: {
  initialCategory?: string;
  initialEndpointId?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [selectedId, setSelectedId] = useState<string | null>(initialEndpointId ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.key))
  );
  const searchRef = useRef<HTMLInputElement>(null);

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

  const selected = useMemo(() => ENDPOINTS.find((e) => e.id === selectedId) ?? null, [selectedId]);

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

  // Saat datang dari beranda (klik kategori / search topbar), langsung
  // tampilkan daftar endpoint di mobile tanpa perlu tekan tombol Endpoint
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const hasIntent = Boolean(initialCategory || initialEndpointId || sp.get("q") || sp.get("focus"));
    if (hasIntent && window.innerWidth < 1024) {
      setDrawerOpen(true);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [initialCategory, initialEndpointId]);

  function selectEndpoint(id: string) {
    setSelectedId(id);
    setDrawerOpen(false);
  }

  const searchBox = (
    <div className="relative">
      <Search
        size={15}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        ref={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari API… (tekan /)"
        className="w-full rounded-lg border-2 border-line bg-bg py-2 pl-8 pr-8 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
      />
    </div>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-line p-3">
        {searchBox}
        {query && (
          <p className="mt-2 font-code text-[11px] text-ink-faint">
            {filtered.length} endpoint cocok
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => setCategory("all")}
          className={`mb-1 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm font-medium ${
            category === "all" ? "bg-sky font-semibold text-ink" : "text-ink-muted hover:bg-card"
          }`}
        >
          Semua Kategori
          <span className="font-code text-[11px] text-ink-faint">{ENDPOINTS.length}</span>
        </button>

        {CATEGORIES.filter((c) => byCategory.has(c.key) || (!query && category === "all") || query === "").map(
          (c) => {
            const list = byCategory.get(c.key) ?? [];
            const isCollapsed = collapsed.has(c.key);
            const catSelected = category === c.key;
            return (
              <div key={c.key} className="mb-1">
                <div
                  className={`flex items-center justify-between rounded-md px-2.5 py-1.5 ${
                    catSelected ? "bg-sky font-semibold text-ink" : "text-ink-muted hover:bg-card"
                  }`}
                >
                  <button
                    onClick={() => {
                      setCategory(catSelected ? "all" : c.key);
                      if (!catSelected) setCollapsed(new Set(CATEGORIES.filter((x) => x.key !== c.key).map((x) => x.key)));
                      else setCollapsed(new Set(CATEGORIES.map((x) => x.key)));
                    }}
                    className="flex flex-1 items-center justify-between text-left text-sm font-medium"
                  >
                    {c.title}
                    <span className="font-code text-[11px] text-ink-faint">{counts.get(c.key) ?? 0}</span>
                  </button>
                  <button
                    aria-label={isCollapsed ? "Buka grup" : "Tutup grup"}
                    onClick={() =>
                      setCollapsed((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.key)) next.delete(c.key);
                        else next.add(c.key);
                        return next;
                      })
                    }
                    className="ml-1 rounded p-0.5 hover:bg-line"
                  >
                    <ChevronDown size={13} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                  </button>
                </div>

                {(!isCollapsed || catSelected || query) &&
                  list.slice(0, catSelected || query ? list.length : 6).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => selectEndpoint(e.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 pl-4 text-left ${
                        selectedId === e.id
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-ink-muted hover:bg-card"
                      }`}
                    >
                      <MethodBadge method={e.method} />
                      <span className="truncate text-[13px]">{e.name}</span>
                      {verified.has(e.id) ? (
                        <CheckCircle2 size={12} className="ml-auto shrink-0 text-mint" aria-label="terverifikasi" />
                      ) : (
                        <CircleDashed size={12} className="ml-auto shrink-0 text-ink-faint" aria-label="belum terverifikasi" />
                      )}
                    </button>
                  ))}

                {!isCollapsed && !catSelected && !query && list.length > 6 && (
                  <button
                    onClick={() => setCategory(c.key)}
                    className="w-full px-4 py-1 text-left font-code text-[11px] text-primary-soft hover:text-primary"
                  >
                    +{list.length - 6} lainnya
                  </button>
                )}
              </div>
            );
          },
        )}

        {filtered.length === 0 && query !== "" && (
          <div className="p-4 text-center text-sm text-ink-faint">
            Tidak ada endpoint yang cocok dengan{" "}
            <span className="text-ink-muted">&ldquo;{query}&rdquo;</span>.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-48px)] lg:min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r-2 border-line bg-card lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col border-r-2 border-line bg-card pl-6">
            <div className="binder absolute inset-y-0 left-0 w-5" />
            <div className="flex items-center justify-between border-b-2 border-line py-2 pl-4 pr-3">
              <span className="font-display text-sm font-bold text-ink">Navigasi Endpoint</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup"
                className="rounded p-1 text-ink-muted hover:bg-card-soft"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">{sidebar}</div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="min-w-0 flex-1">
        <div className="sticky top-12 z-30 flex items-center gap-2 border-b-2 border-line bg-bg px-4 py-2 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="press inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-display text-sm font-bold text-ink shadow-hard-sm"
          >
            <Menu size={16} /> Endpoint
          </button>
          <span className="truncate font-code text-xs text-ink-faint">
            {selected ? selected.name : `${filtered.length} endpoint tersedia`}
          </span>
        </div>

        {selected ? (
          <EndpointDetail key={selected.id} endpoint={selected} verified={verified.has(selected.id)} />
        ) : (
          <div className="px-5 py-6 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-4xl">
              <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Dokumentasi API
              </h1>
              <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
                Pilih endpoint di daftar untuk melihat detail parameter dan mencobanya langsung.
                Semua request Try API dikirim nyata ke backend{" "}
                <code className="rounded bg-sky px-1 py-0.5 font-code text-[13px] font-semibold text-ink">
                  /api/v1
                </code>{" "}
                milik website ini.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      setCategory(c.key);
                      setCollapsed(new Set(CATEGORIES.filter((x) => x.key !== c.key).map((x) => x.key)));
                      if (window.innerWidth < 1024) setDrawerOpen(true);
                    }}
                    className={`press rounded-xl border-2 p-4 text-left shadow-note transition-colors ${
                      category === c.key
                        ? "border-primary bg-primary/5"
                        : "border-line-strong bg-card hover:bg-card-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-ink">{c.title}</span>
                      <span className="rounded-md bg-sky px-2 py-0.5 font-code text-xs font-bold text-ink">
                        {counts.get(c.key) ?? 0}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{c.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
