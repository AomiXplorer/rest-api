"use client";

/**
 * AI Chat — interface percakapan modern, identitas sendiri.
 * Respons tidak streaming: jawaban tampil utuh setelah provider selesai.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Loader2, RotateCcw, Send, Sparkles, TriangleAlert } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

export function AiChatTool({ endpoint, modelName }: { endpoint: string; modelName?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput(""); setError(null);
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}?prompt=${encodeURIComponent(q)}`, { headers: { accept: "application/json" } });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.success === false) {
        const msg = j?.error?.message || j?.message || (res.status >= 500 ? "Provider sedang tidak bisa dihubungi. Coba lagi nanti." : `Gagal (HTTP ${res.status})`);
        setError(String(msg));
        return;
      }
      const d = j.data;
      const text =
        (typeof d === "string" && d) ||
        (d && typeof d === "object" && typeof (d as Record<string, unknown>).response === "string" && (d as Record<string, unknown>).response as string) ||
        (typeof j.message === "string" && j.message) ||
        null;
      if (!text) {
        setError("Provider tidak mengembalikan jawaban. Coba kirim ulang pertanyaanmu.");
        return;
      }
      setMsgs((m) => [...m, { role: "ai", text: String(text) }]);
    } catch {
      setError("Koneksi bermasalah. Periksa jaringanmu lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const newChat = () => { setMsgs([]); setError(null); setInput(""); setBusy(false); };

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1600);
    } catch { /* clipboard tidak tersedia */ }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      {/* Header chat */}
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <ArrowLeft size={15} /> Semua tools
        </Link>
        <div className="flex items-center gap-1">
          {modelName ? <span className="hidden rounded-full bg-card-soft px-2.5 py-1 font-code text-[11px] text-ink-muted sm:block">{modelName}</span> : null}
          <button onClick={newChat} disabled={msgs.length === 0 && !error} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-ink disabled:opacity-40">
            <RotateCcw size={13} /> Chat baru
          </button>
        </div>
      </div>

      {/* Area percakapan */}
      <section className="mt-4 flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border border-line bg-card tools-shadow">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky text-primary"><Sparkles size={16} /></span>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-ink">AI Chat</h1>
            <p className="truncate text-xs text-ink-muted">Tanya apa saja — dari tugas sampai ide konten.</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-bg px-4 py-5">
          {msgs.length === 0 && !busy ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky text-primary">
                <Sparkles size={22} />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-ink">Mau nanya apa hari ini?</p>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">
                  Jawaban muncul utuh setelah AI selesai berpikir — model ini suka mikir dulu, sabar sebentar ya.
                </p>
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                {["Jelaskan apa itu API dengan bahasa santai", "Buat caption Instagram lucu", "Bikin ide konten TikTok tentang kucing"].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-primary/50 hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {msgs.map((m, i) => (
            <div key={i} className={`tools-rise flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "rounded-br-md bg-primary text-onprimary" : "rounded-bl-md border border-line bg-card text-ink"
              }`}>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                {m.role === "ai" ? (
                  <button onClick={() => copy(m.text, i)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-ink-faint transition-colors hover:text-primary">
                    {copiedIdx === i ? <><Check size={11} /> Tersalin</> : <><Copy size={11} /> Salin</>}
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          {busy ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-card px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 rounded-2xl rounded-bl-md border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Input */}
        <div className="border-t border-line px-4 py-3.5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tulis pesanmu di sini…"
              className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={busy}
              aria-label="Pesan untuk AI"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Kirim pesan"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-onprimary transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-faint">Jawaban muncul utuh setelah selesai diproses (tidak streaming).</p>
        </div>
      </section>
    </main>
  );
}
