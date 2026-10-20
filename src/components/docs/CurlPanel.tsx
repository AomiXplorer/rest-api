"use client";

import { useMemo, useState } from "react";
import { Terminal, ChevronDown, Copy, Check } from "lucide-react";
import type { EndpointDefinition } from "@/types/api";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";

const BASE = "https://cyronime.my.id";

/** URL lengkap dengan contoh parameter dari registry (sama seperti Try API). */
function exampleUrl(e: EndpointDefinition): string {
  const qs = (e.params ?? [])
    .filter((p) => p.example && p.example !== "")
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.example)}`)
    .join("&");
  const path = `/api/v1${e.upstreamPath.replace(/^\/api/, "")}`;
  return `${BASE}${path}${qs ? "?" + qs : ""}`;
}

function endpointCurl(e: EndpointDefinition): string {
  return `curl -s "${exampleUrl(e)}"`;
}

/** Script bash utuh utk Termux: semua fitur, delay anti rate-limit. */
function fullScript(): string {
  const lines = [
    "#!/usr/bin/env bash",
    "# Aomi API — cURL semua fitur (271 endpoint)",
    `# Dibuat otomatis dari dokumentasi ${BASE} — watermark RendyZ`,
    "# Jalankan di Termux: bash aomi-curl.sh",
    "# catatan: rate limit 40 request/menit, sleep 1.6s antar request.",
    "",
  ];
  let cat = "";
  for (const e of ENDPOINTS) {
    const title = CATEGORIES.find((c) => c.key === e.category)?.title ?? e.category;
    if (title !== cat) {
      cat = title;
      lines.push(`echo "===== ${title.toUpperCase()} ====="`);
    }
    lines.push(`echo "--- ${e.name} (${featureName(e)}) ---"`);
    lines.push(`${endpointCurl(e)}; echo;`);
    lines.push("sleep 1.6");
    lines.push("");
  }
  lines.push('echo "SELESAI. Semua endpoint sudah dicoba."');
  return lines.join("\n");
}

function featureName(e: EndpointDefinition) {
  const segs = e.upstreamPath.split("/").filter(Boolean);
  return segs[segs.length - 1] ?? e.upstreamPath;
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-line-strong bg-accent px-2 py-1 font-code text-[11px] font-semibold text-ink transition hover:bg-lemon/60"
      aria-label={label}
    >
      {done ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      {done ? "Tersalin!" : label}
    </button>
  );
}

export function CurlPanel({ onClose }: { onClose?: () => void }) {
  const groups = useMemo(() => {
    const m = new Map<string, EndpointDefinition[]>();
    for (const e of ENDPOINTS) {
      const l = m.get(e.category) ?? [];
      l.push(e);
      m.set(e.category, l);
    }
    return [...m.entries()];
  }, []);
  const [open, setOpen] = useState<string | null>(groups[0]?.[0] ?? null);
  const script = useMemo(() => fullScript(), []);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl border-2 border-line-strong bg-card p-4 shadow-note">
        <div className="tape-left" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-display text-base font-bold text-ink">
              <Terminal size={18} className="text-primary" /> cURL Semua Fitur — siap Termux
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {ENDPOINTS.length} endpoint. Salin script di bawah, simpan sebagai{" "}
              <code className="font-code text-ink">aomi-curl.sh</code>, lalu jalankan{" "}
              <code className="font-code text-ink">bash aomi-curl.sh</code> di Termux.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CopyBtn text={script} label="Salin semua (.sh)" />
            {onClose ? (
              <button
                onClick={onClose}
                className="rounded-md border-2 border-line-strong bg-secondary px-2 py-1 font-code text-[11px] font-semibold text-ink hover:bg-accent"
              >
                Tutup
              </button>
            ) : null}
          </div>
        </div>
        <pre className="mt-3 max-h-52 overflow-auto rounded-md border-2 border-line bg-muted p-3 font-code text-[11px] leading-relaxed text-ink">
          {script.split("\n").slice(0, 18).join("\n")}
          {"\n... (lengkap di tombol Salin)"}
        </pre>
      </div>

      {groups.map(([cat, list]) => {
        const title = CATEGORIES.find((c) => c.key === cat)?.title ?? cat;
        const isOpen = open === cat;
        return (
          <div key={cat} className="rounded-xl border-2 border-line-strong bg-card p-3 shadow-note">
            <button
              onClick={() => setOpen(isOpen ? null : cat)}
              className="flex w-full items-center justify-between gap-2 px-1 py-1 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-sm font-bold text-ink">
                {title} <span className="text-ink-faint">({list.length})</span>
              </span>
              <ChevronDown size={16} className={`shrink-0 text-ink-muted transition ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen ? (
              <ul className="mt-2 space-y-2">
                {list.map((e) => (
                  <li key={e.id} className="rounded-md border-2 border-line bg-muted p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-code text-[12px] font-semibold text-ink">
                        {featureName(e)}
                      </p>
                      <CopyBtn text={endpointCurl(e)} label="Salin curl" />
                    </div>
                    <code className="mt-1 block break-all font-code text-[11px] text-ink-muted">
                      {endpointCurl(e)}
                    </code>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
