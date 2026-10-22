"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, FileText, Send } from "lucide-react";
import { APP_NAME, OWNER_WHATSAPP } from "@/lib/constants";
import { CyronimeLogo, CyronimeMark } from "@/components/brand/CyronimeLogo";

/**
 * Chrome situs dokumentasi & beranda — mengikuti referensi:
 * navbar sticky tipis (avatar + brand + link ringkas + 1 tombol kontekstual) dan
 * footer sederhana (Contact + copyright + tagline). Tema gelap tunggal.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onDocs = pathname.startsWith("/docs");

  const solid =
    "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-bg px-3.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-primary/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Cyronime — Beranda" className="flex items-center gap-2.5">
            <CyronimeLogo size={34} />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Navigasi utama">
            {onDocs ? (
              <Link href="/" className={solid}>
                <House size={14} /> Beranda
              </Link>
            ) : (
              <Link href="/docs" className={solid}>
                <FileText size={14} /> Docs
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* ===== Konten ===== */}
      <div className="flex flex-1 flex-col">{children}</div>

      {/* ===== Footer ===== */}
      <footer className="mt-16 border-t border-line px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={OWNER_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-primary/40 hover:text-ink"
            >
              <Send size={13} /> Contact
            </a>
            <Link
              href="/docs"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-primary/40 hover:text-ink"
            >
              <FileText size={13} /> Docs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CyronimeMark size={20} />
            <p className="text-[13px] text-ink-faint">© 2026 {APP_NAME}. All rights reserved.</p>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-ink-faint">
            Dibuat untuk bantu developer bikin bot dan aplikasi lebih cepat.
          </p>
        </div>
      </footer>
    </div>
  );
}
