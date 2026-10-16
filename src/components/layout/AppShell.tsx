"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Code2, MessageCircle, ArrowUp, Zap, Search, Bell } from "lucide-react";
import { APP_NAME, OWNER_NUMBER, OWNER_WHATSAPP } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getHealth } from "@/lib/health";

function useServiceStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");
  useEffect(() => {
    let alive = true;
    getHealth().then((h) => {
      if (alive) setStatus(h.ok ? "ok" : "down");
    });
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

function StatusPill() {
  const s = useServiceStatus();
  const cls =
    s === "ok"
      ? "border-mint/60 text-mint"
      : s === "down"
        ? "border-danger/50 text-danger"
        : "border-ink-faint/40 text-ink-faint";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-code text-[10px] font-semibold ${cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s === "ok" ? "bg-mint" : s === "down" ? "bg-danger" : "bg-ink-faint"}`}
      />
      {s === "ok" ? "Online" : s === "down" ? "Offline" : "Cek…"}
    </span>
  );
}

function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <div className={`relative min-w-0 ${className}`}>
      <Search
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        placeholder="Cari API… (tekan /)"
        aria-label="Cari API"
        onClick={() => router.push("/docs?focus=1")}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push("/docs?focus=1");
          if (e.key === "/") {
            e.preventDefault();
            router.push("/docs?focus=1");
          }
        }}
        className="w-full rounded-lg border-2 border-line bg-bg py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function BellButton() {
  const s = useServiceStatus();
  const [open, setOpen] = useState(false);
  const dot = s === "ok" ? "bg-mint" : s === "down" ? "bg-danger" : "bg-ink-faint";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        className="press shrink-0 rounded-lg border-2 border-line bg-card p-1.5 text-ink-muted hover:text-ink"
      >
        <Bell size={15} />
        <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${dot}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border-2 border-line bg-card p-3 shadow-note">
            <p className="font-display text-xs font-bold text-ink">Notifikasi</p>
            <p className="mt-1.5 flex items-center gap-1.5 font-code text-[11px] text-ink-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {s === "ok" ? "Semua layanan online" : s === "down" ? "Layanan sedang gangguan" : "Memeriksa layanan…"}
            </p>
            <p className="mt-1 font-code text-[11px] text-ink-muted">197 endpoint siap dipakai</p>
            <p className="mt-1 font-code text-[11px] text-ink-faint">Tanpa API key, tanpa login</p>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navCls = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-sm font-semibold transition-colors ${
      active ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-card-soft hover:text-ink"
    }`;

  return (
    <div className="min-h-screen">
      {/* Navbar desktop */}
      <header className="sticky top-0 z-40 hidden h-16 items-center gap-4 border-b-2 border-line bg-card px-6 lg:flex">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-onprimary">
            <Zap size={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Aomi<span className="text-primary">API</span>
          </span>
        </Link>
        <StatusPill />
        <nav className="ml-2 flex items-center gap-1" aria-label="Navigasi utama">
          <Link href="/" className={navCls(pathname === "/")}>
            <Home size={15} /> Beranda
          </Link>
          <Link href="/docs" className={navCls(pathname.startsWith("/docs"))}>
            <Code2 size={15} /> Dokumentasi
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <SearchBox className="w-56 xl:w-72" />
          <BellButton />
          <ThemeToggle />
        </div>
      </header>

      {/* Navbar mobile */}
      <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b-2 border-line bg-card px-2.5 lg:hidden">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-onprimary">
            <Zap size={14} />
          </span>
          <span className="font-display text-sm font-extrabold text-ink">
            Aomi<span className="text-primary">API</span>
          </span>
        </Link>
        <SearchBox className="min-w-0 flex-1" />
        <BellButton />
        <ThemeToggle />
        <nav className="flex shrink-0 items-center gap-1" aria-label="Navigasi utama">
          <Link
            href="/"
            className={`rounded-lg border-2 px-2 py-1.5 font-display text-[11px] font-bold ${
              pathname === "/" ? "border-primary bg-primary text-onprimary" : "border-line bg-card text-ink-muted"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/docs"
            className={`rounded-lg border-2 px-2 py-1.5 font-display text-[11px] font-bold ${
              pathname.startsWith("/docs") ? "border-primary bg-primary text-onprimary" : "border-line bg-card text-ink-muted"
            }`}
          >
            API
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <div className="min-h-screen">
        {children}
        <footer className="border-t-2 border-line bg-surface px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="font-code text-xs text-ink-faint">
              © 2026 {APP_NAME}. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-2">
              <a
                href={OWNER_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line bg-card px-2.5 py-1.5 font-code text-xs font-semibold text-wa"
              >
                <MessageCircle size={13} /> {OWNER_NUMBER}
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Kembali ke atas"
                className="press rounded-lg border-2 border-line bg-primary p-1.5 text-onprimary"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
