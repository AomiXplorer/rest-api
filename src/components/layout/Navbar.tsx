import Link from "next/link";
import { BookOpen, Boxes, Home, Activity } from "lucide-react";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const OWNER_WHATSAPP = "6281249578370";

export function Navbar({ active }: { active?: "home" | "docs" }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-line-strong bg-card font-display text-sm font-extrabold text-lemon shadow-hard-sm">
            A
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Aomi <span className="text-primary">Still Learning</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className={`hidden items-center gap-1.5 rounded-md px-3 py-1.5 font-medium hover:bg-card sm:inline-flex ${
              active === "home" ? "text-lemon" : "text-ink-muted"
            }`}
          >
            <Home size={15} /> Home
          </Link>
          <Link
            href="/docs"
            className={`hidden items-center gap-1.5 rounded-md px-3 py-1.5 font-medium hover:bg-card sm:inline-flex ${
              active === "docs" ? "text-lemon" : "text-ink-muted"
            }`}
          >
            <BookOpen size={15} /> Docs
          </Link>
          <span className="hidden items-center gap-1.5 rounded-md border-2 border-line bg-card px-3 py-1.5 font-code text-xs text-ink-muted md:inline-flex">
            <Boxes size={14} className="text-mint" />
            {ENDPOINTS.length} endpoints · {CATEGORIES.length} kategori
          </span>
          <a
            href={`https://wa.me/${OWNER_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-1.5 rounded-md border-2 border-wa bg-wa px-3.5 py-1.5 font-display text-sm font-bold text-[#04331d] shadow-hard-sm"
            aria-label="Hubungi owner via WhatsApp"
          >
            <WhatsAppIcon size={15} /> <span className="hidden xs:inline">Kontak</span>
          </a>
          <Link
            href="/docs"
            className="press inline-flex items-center gap-1.5 rounded-md border-2 border-primary bg-primary px-3.5 py-1.5 font-display text-sm font-bold text-[#140f00] shadow-hard-sm"
          >
            <Activity size={15} /> <span className="hidden xs:inline">Buka</span> Docs
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/" className="text-ink-muted hover:text-lemon">Home</Link>
          <Link href="/docs" className="text-ink-muted hover:text-lemon">Dokumentasi</Link>
          <a href="/api/health" className="text-ink-muted hover:text-lemon">Status</a>
        </div>
        <p className="text-sm text-ink-faint">
          <strong className="text-ink-muted">Aomi Still Learning</strong> — REST API untuk developer.
        </p>
        <a
          href={`https://wa.me/${OWNER_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-2 rounded-md border-2 border-wa bg-wa px-4 py-2 font-display text-sm font-bold text-[#04331d] shadow-hard-sm"
        >
          <WhatsAppIcon size={16} /> Kontak Owner: +62 812-4957-8370
        </a>
        <p className="font-code text-xs text-ink-faint">
          Butuh bantuan atau ada request endpoint? Chat owner langsung.
        </p>
      </div>
    </footer>
  );
}
