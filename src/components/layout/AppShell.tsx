"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Code2, ListOrdered, Menu, X, MessageCircle, ArrowUp, Search } from "lucide-react";
import { APP_NAME, OWNER_NUMBER, OWNER_WHATSAPP } from "@/lib/constants";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CyronimeLogo, CyronimeMark } from "@/components/brand/CyronimeLogo";

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
        className="w-full rounded-lg border-2 border-line-strong bg-card py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
      />
    </div>
  );
}

const NAV = [
  { href: "/", label: "Beranda", icon: Home, match: (p: string) => p === "/" },
  { href: "/docs", label: "Dokumentasi", icon: Code2, match: (p: string) => p.startsWith("/docs") },
  { href: "/#kategori", label: "Endpoint", icon: ListOrdered, match: (p: string) => p === "/#kategori" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup drawer saat pindah halaman + tombol Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navCls = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-display text-sm font-bold transition-colors ${
      active
        ? "border-2 border-primary bg-sky text-primary"
        : "border-2 border-transparent text-ink-muted hover:bg-card-soft hover:text-ink"
    }`;

  return (
    <div className="min-h-screen">
      {/* ===== Navbar desktop ===== */}
      <header className="sticky top-0 z-40 hidden h-16 items-center gap-3 border-b-2 border-line-strong bg-card px-6 lg:flex">
        <Link href="/" aria-label="Cyronime — Beranda">
          <CyronimeLogo />
        </Link>
        <nav className="ml-2 flex items-center gap-1" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className={navCls(n.match(pathname))}>
              <n.icon size={15} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <SearchBox className="w-60 xl:w-72" />
          <ThemeToggle />
        </div>
      </header>

      {/* ===== Navbar mobile ===== */}
      <header className="sticky top-0 z-40 border-b-2 border-line-strong bg-card lg:hidden">
        <div className="flex h-12 items-center gap-2 px-2.5">
          <Link href="/" aria-label="Cyronime — Beranda" className="shrink-0">
            <CyronimeMark size={26} className="text-ink" />
          </Link>
          <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold text-ink">
            Cyronime<span className="text-primary">API</span>
          </span>
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="press shrink-0 rounded-lg border-2 border-line-strong bg-card p-2 text-ink"
          >
            <Menu size={16} />
          </button>
          <ThemeToggle />
        </div>
        <div className="px-2.5 pb-2">
          <SearchBox className="w-full" />
        </div>
      </header>

      {/* ===== Drawer mobile ===== */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r-2 border-line-strong bg-surface p-4 animate-pop">
            <div className="flex items-center justify-between">
              <CyronimeLogo size={28} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="rounded-lg p-2 text-ink-muted hover:bg-card-soft"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-5 flex flex-col gap-2" aria-label="Navigasi utama">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 font-display text-sm font-bold ${
                    n.match(pathname)
                      ? "border-primary bg-sky text-primary"
                      : "border-line-strong bg-card text-ink hover:bg-card-soft"
                  }`}
                >
                  <n.icon size={16} /> {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href={OWNER_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-sticky px-3 py-2.5 font-display text-sm font-bold text-sticky-ink shadow-hard-sm"
              >
                <MessageCircle size={15} /> Chat Owner
              </a>
              <p className="text-center font-hand text-lg text-ink-faint">
                ditulis dengan pensil &amp; semangat ✎
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Konten ===== */}
      <div className="min-h-screen">
        {children}
        <footer className="border-t-2 border-dashed border-line-strong px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CyronimeMark size={22} className="text-ink" />
              <p className="font-code text-xs text-ink-faint">
                © 2026 {APP_NAME} — buku catatan API-mu.
              </p>
            </div>
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
                className="press rounded-lg border-2 border-line-strong bg-primary p-1.5 text-onprimary shadow-hard-sm"
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
