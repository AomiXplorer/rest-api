"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  text,
  label,
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Salin"
      className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1 font-code text-xs font-semibold text-ink-muted transition-colors hover:border-primary/40 hover:text-ink ${className}`}
    >
      {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
      {copied ? "Tersalin" : (label ?? "Salin")}
    </button>
  );
}
