"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Code2, MessageCircle, ArrowUp, Bot, Search, Bell } from "lucide-react";
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
      className={`inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-code text-[10px] font-semibold ${cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s === "ok" ? "bg-mint" : s === "down" ? "bg-danger" : "bg-ink-faint"}`}
      />
      {s === "ok" ? "Online!" : s === "down" ? "Offline" : "Cek…"}
    </span>
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
        className="press shrink-0 rounded-lg border-2 border-line-strong bg-card p-1.5 text-ink"
      >
        <Bell size={15} />
        <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${dot}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border-2 border-line-strong bg-card p-3 shadow-note">
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

function SidebarBody() {
  const pathname = usePathname();
  const navCls = (active: boolean) =>
    `press flex items-center gap-2.5 rounded-lg border-2 border-line-strong px-3 py-2 font-display text-sm font-bold ${
      active ? "bg-primary text-white shadow-hard-sm" : "bg-card text-ink hover:bg-card-soft"
    }`;

  return (
    <>
      <div className="rounded-xl border-2 border-line-strong bg-card p-3 shadow-note">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-line-strong bg-primary text-white">
            <Bot size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold text-ink">{APP_NAME}</p>
            <div className="mt-1">
              <StatusPill />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/" className={navCls(pathname === "/")}>
          <Home size={16} /> Beranda
        </Link>
        <Link href="/docs" className={navCls(pathname.startsWith("/docs"))}>
          <Code2 size={16} /> Daftar API
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="-rotate-2 rounded-sm border-2 border-sticky-ink/20 bg-sticky p-3 shadow-note">
          <p className="font-hand text-xl leading-snug text-sticky-ink">
            API gratis, kok pakek API key? ✎
          </p>
        </div>
        <a
          href={OWNER_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-display text-xs font-bold text-ink shadow-hard-sm"
        >
          <MessageCircle size={14} className="text-wa" /> Chat Owner
        </a>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r-2 border-line bg-surface lg:block">
        <div className="binder absolute inset-y-0 left-0 w-5" />
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 pl-9">
          <SidebarBody />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b-2 border-line bg-card px-2.5 lg:hidden">
        <nav className="flex shrink-0 items-center gap-1.5" aria-label="Navigasi utama">
          <Link
            href="/"
            className={`press rounded-lg border-2 px-2 py-1.5 font-display text-[11px] font-bold ${
              pathname === "/" ? "border-primary bg-primary text-white" : "border-line-strong bg-card text-ink"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/docs"
            className={`press rounded-lg border-2 px-2 py-1.5 font-display text-[11px] font-bold ${
              pathname.startsWith("/docs") ? "border-primary bg-primary text-white" : "border-line-strong bg-card text-ink"
            }`}
          >
            API
          </Link>
        </nav>
        <div className="relative min-w-0 flex-1">
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
            className="w-full rounded-lg border-2 border-line-strong bg-bg py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
          />
        </div>
        <BellButton />
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="content-margin min-h-screen lg:pl-[240px]">
        {children}
        <footer className="border-t-2 border-dashed border-line px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="font-code text-xs text-ink-faint">
              © 2026 {APP_NAME}. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-2">
              <a
                href={OWNER_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-2.5 py-1.5 font-code text-xs font-semibold text-wa"
              >
                <MessageCircle size={13} /> {OWNER_NUMBER}
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Kembali ke atas"
                className="press rounded-lg border-2 border-line-strong bg-primary p-1.5 text-white"
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
