"use client";

import { ArrowUp, Star } from "lucide-react";

const FOOTER_MARQUEE = ["Tanpa API Key", "Tanpa Login", "Tanpa Ribet", "Coba Langsung", "Gratis"];

function FooterMarqueeRow() {
  return (
    <div className="flex shrink-0 items-center">
      {FOOTER_MARQUEE.map((t) => (
        <span
          key={t}
          className="mx-5 flex items-center gap-2 whitespace-nowrap font-code text-xs font-bold text-ink"
        >
          {t} <Star size={11} className="fill-ink text-ink" />
        </span>
      ))}
    </div>
  );
}

export function StickyFooter() {
  return (
    <>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
        className="press fixed bottom-14 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border-2 border-line-strong bg-primary text-white shadow-hard-sm"
      >
        <ArrowUp size={16} />
      </button>
      <div className="fixed inset-x-0 bottom-0 z-30 overflow-hidden border-t-2 border-line-strong bg-sky">
        <div className="animate-marquee flex w-max py-1.5">
          <FooterMarqueeRow />
          <FooterMarqueeRow />
        </div>
      </div>
    </>
  );
}
