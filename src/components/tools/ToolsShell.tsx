"use client";

/**
 * ToolsShell — chrome khusus Aomi Tools.
 * Design system sendiri (lihat .tools-layout di globals.css):
 * navbar ringkas, drawer mobile sederhana, tanpa dekorasi buku catatan.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Code2, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CyronimeMark } from "@/components/brand/CyronimeLogo";

const NAV = [
  { href: "/tools", label: "Tools", short: "Semua tools", exact: true },
  { href: "/tools/tiktok", label: "Downloader", short: "TikTok Downloader", exact: false },
  { href: "/tools/anime", label: "Anime", short: "Jelajahi Anime", exact: false },
  { href: "/tools/ai-chat", label: "AI", short: "AI Chat", exact: false },
  { href: "/tools/am-gen", label: "Generator", short: "Alight Motion Pro", exact: false },
];

export function ToolsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="tools-layout flex min-h-screen flex-col">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/tools" className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2" aria-label="Aomi Tools — Beranda">
            <CyronimeMark size={24} className="text-primary" />
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">
              Aomi <span className="text-primary">Tools</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Navigasi tools">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive(n.href, n.exact) ? "text-primary" : "text-ink-muted hover:bg-card-soft hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/docs"
              className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-ink sm:inline-flex"
            >
              <Code2 size={15} /> API Docs
            </Link>
            <ThemeToggle />
            {/* Hamburger mobile — ikon sederhana, tanpa kotak outline */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-card-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ===== Drawer mobile ===== */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div className="tools-fade absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <aside className="tools-drawer absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col border-r border-line bg-card">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <Link href="/tools" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <CyronimeMark size={22} className="text-primary" />
                <span className="font-display text-[15px] font-bold text-ink">Aomi <span className="text-primary">Tools</span></span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-card-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-3" aria-label="Navigasi tools">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href, n.exact) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(n.href, n.exact) ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-card-soft hover:text-ink"
                  }`}
                >
                  {n.short}
                  <ChevronRight size={15} className="text-ink-faint" />
                </Link>
              ))}
              <div className="my-2 border-t border-line" />
              <Link
                href="/docs"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-card-soft hover:text-ink"
              >
                <Code2 size={15} /> API Docs (developer)
              </Link>
            </nav>
            <p className="mt-auto border-t border-line px-4 py-3 text-xs text-ink-faint">
              © 2026 Cyronime — platform tools Aomi.
            </p>
          </aside>
        </div>
      )}

      {/* ===== Konten ===== */}
      <div className="flex flex-1 flex-col">{children}</div>

      {/* ===== Footer tipis ===== */}
      <footer className="border-t border-line px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-faint">© 2026 Cyronime — Aomi Tools.</p>
          <Link href="/docs" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-primary">
            <Code2 size={13} /> Dokumentasi API
          </Link>
        </div>
      </footer>
    </div>
  );
}
