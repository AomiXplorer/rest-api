"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Code2, Menu, X, MessageCircle, ArrowUp, Bot } from "lucide-react";
import { APP_NAME, OWNER_NUMBER, OWNER_WHATSAPP } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

function useServiceStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");
  useEffect(() => {
    let alive = true;
    fetch("/api/health")
      .then((r) => {
        if (alive) setStatus(r.ok ? "ok" : "down");
      })
      .catch(() => {
        if (alive) setStatus("down");
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

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
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
        <Link href="/" onClick={onNavigate} className={navCls(pathname === "/")}>
          <Home size={16} /> Beranda
        </Link>
        <Link href="/docs" onClick={onNavigate} className={navCls(pathname.startsWith("/docs"))}>
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b-2 border-line bg-card/95 px-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="press rounded-lg border-2 border-line-strong bg-card p-1.5 text-ink"
        >
          <Menu size={18} />
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-line-strong bg-primary font-display text-sm font-extrabold text-white">
            A
          </div>
          <span className="truncate font-display text-sm font-extrabold text-ink">{APP_NAME}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <StatusPill />
          <ThemeToggle />
          <a
            href={OWNER_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Owner via WhatsApp"
            className="press rounded-lg border-2 border-wa/60 bg-wa/10 p-1.5"
          >
            <MessageCircle size={16} className="text-wa" />
          </a>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r-2 border-line bg-surface">
            <div className="binder absolute inset-y-0 left-0 w-5" />
            <div className="flex items-center justify-between border-b-2 border-line py-3 pl-9 pr-3">
              <span className="font-display text-sm font-bold text-ink">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="rounded-lg p-1 text-ink-muted hover:bg-card"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex h-[calc(100%-49px)] flex-col gap-4 overflow-y-auto p-4 pl-9">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

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
