"use client";

/**
 * AI Chat — interface percakapan sungguhan (bukan form API).
 * Respons tidak streaming: jawaban tampil setelah provider selesai memproses.
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 sm:px-8">
      {/* Header chat */}
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali
        </Link>
        <div className="flex items-center gap-2">
          {modelName ? <span className="hidden font-code text-[11px] text-ink-faint sm:block">Model: {modelName}</span> : null}
          <button onClick={newChat} disabled={msgs.length === 0 && !error} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink disabled:opacity-50">
            <RotateCcw size={13} /> Chat baru
          </button>
        </div>
      </div>

      <section className="mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-line-strong bg-card shadow-note">
        <div className="flex items-center gap-2.5 border-b-2 border-dashed border-line px-4 py-3">
          <span className="rounded-lg border-2 border-line bg-sky p-1.5 text-primary"><Sparkles size={16} /></span>
          <div className="min-w-0">
            <h1 className="font-display text-base font-extrabold text-ink">AI Chat</h1>
            <p className="truncate text-xs text-ink-muted">Tanya apa saja — dari tugas sampai ide konten.</p>
          </div>
        </div>

        {/* Area percakapan */}
        <div ref={scrollRef} className="min-h-[46vh] flex-1 space-y-3 overflow-y-auto bg-card-soft px-4 py-4">
          {msgs.length === 0 && !busy ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="rounded-lg border-2 border-line bg-card p-3 text-primary shadow-hard-sm"><Sparkles size={22} /></span>
              <p className="font-display text-base font-bold text-ink">Mau nanya apa hari ini?</p>
              <p className="max-w-sm text-sm text-ink-muted">Tulis pesanmu di bawah. Jawaban muncul setelah AI selesai berpikir — model ini suka mikir dulu, sabar sebentar ya.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {["Jelaskan apa itu API dengan bahasa santai", "Buat caption Instagram lucu", "Bikin ide konten TikTok tentang kucing"].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="press rounded-full border-2 border-line bg-card px-3 py-1 font-code text-[11px] font-bold text-ink-muted hover:text-ink">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[85%] rounded-xl border-2 px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "border-primary bg-primary text-onprimary" : "border-line bg-card text-ink"
              }`}>
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                {m.role === "ai" ? (
                  <button onClick={() => copy(m.text, i)} className="mt-1 inline-flex items-center gap-1 font-code text-[10px] font-bold text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                    {copiedIdx === i ? <><Check size={11} /> Tersalin</> : <><Copy size={11} /> Salin jawaban</>}
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          {busy ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl border-2 border-line bg-card px-3.5 py-2.5 text-sm text-ink-muted">
                <Loader2 size={14} className="animate-spin text-primary" /> AI sedang berpikir…
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 rounded-xl border-2 border-dashed border-line bg-card px-3.5 py-2.5 text-sm text-ink">
                <TriangleAlert size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                <span>{error}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Input */}
        <div className="border-t-2 border-dashed border-line px-4 py-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tulis pesanmu di sini…"
              className="h-12 flex-1 rounded-lg border-2 border-line bg-bg px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
              disabled={busy}
              aria-label="Pesan untuk AI"
            />
            <button onClick={send} disabled={busy || !input.trim()} className="press inline-flex h-12 items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-4 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Kirim
            </button>
          </div>
          <p className="mt-1.5 font-code text-[10px] text-ink-faint">Jawaban muncul utuh setelah selesai diproses (tidak streaming).</p>
        </div>
      </section>
    </div>
  );
}
