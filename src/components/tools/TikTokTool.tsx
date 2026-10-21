"use client";

/**
 * TikTok Downloader — halaman penggunaan tool downloader.
 * Fokus satu tugas: masukkan tautan → proses → pakai hasilnya.
 * Preview media asli dari provider; tombol unduhan hanya format yang tersedia.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Link2, Loader2, Music, RefreshCw, Trash2, ExternalLink,
  Play, Heart, MessageCircle, Share2, Eye, Music2, ArrowRight,
} from "lucide-react";

type TikTokData = {
  original?: string;
  aweme_link?: string;
  music_link?: string;
  watermark_link?: string;
  no_watermark_link?: string;
  no_watermark_link_hd?: string;
  cover_link?: string;
  origin_cover?: string;
  text?: string;
  create_time?: string;
  duration?: string;
  author_unique_id?: string;
  author_nickname?: string;
  comment_count?: string;
  play_count?: string;
  share_count?: string;
  like_count?: string;
  slides?: string;
  type?: number;
  itemId?: string;
};

type Phase = "idle" | "working" | "done" | "error";
type ErrKind = "invalid" | "empty" | "provider" | "network" | "other";

const TIKTOK_URL_RE = /^https?:\/\/(www\.|vm\.|vt\.|m\.)?tiktok\.com\/\S+$/i;

function fmtDuration(ms?: string | number) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return null;
  const s = Math.round(n / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function parseSlides(raw?: string): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  } catch { /* bukan JSON */ }
  return [];
}

export function TikTokTool({ endpoint }: { endpoint: string }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errKind, setErrKind] = useState<ErrKind>("other");
  const [errMsg, setErrMsg] = useState("");
  const [data, setData] = useState<TikTokData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch { /* clipboard tidak tersedia */ }
  };

  const process = async () => {
    const u = url.trim();
    if (!TIKTOK_URL_RE.test(u)) {
      setPhase("error"); setErrKind("invalid");
      setErrMsg("Tautan tidak terlihat seperti tautan TikTok. Contoh: https://vt.tiktok.com/ZSjXNEnbC/ atau https://www.tiktok.com/@user/video/123");
      return;
    }
    setPhase("working"); setData(null); setErrMsg("");
    setVideoFailed(false); setCoverFailed(false); setAudioFailed(false);
    try {
      const res = await fetch(`${endpoint}?url=${encodeURIComponent(u)}`, { headers: { accept: "application/json" } });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j || j.success === false) {
        const code = j?.error?.code || j?.code;
        const msg = j?.error?.message || j?.message || `Gagal (HTTP ${res.status})`;
        if (code === "UPSTREAM_503" || code === "UPSTREAM_5XX" || res.status >= 500) {
          setErrKind("provider");
          setErrMsg("Provider sedang tidak bisa dihubungi. Coba lagi beberapa saat.");
        } else {
          setErrKind("other");
          setErrMsg(String(msg));
        }
        setPhase("error");
        return;
      }
      const d: TikTokData = (j.data && typeof j.data === "object") ? j.data : {};
      const hasMedia = Boolean(d.no_watermark_link || d.no_watermark_link_hd || d.watermark_link || d.aweme_link || parseSlides(d.slides).length > 0);
      if (!hasMedia) {
        setErrKind("empty");
        setErrMsg("Video tidak ditemukan. Mungkin tautannya privat, sudah dihapus, atau bukan video.");
        setPhase("error");
        return;
      }
      setData(d);
      setPhase("done");
    } catch {
      setPhase("error"); setErrKind("network");
      setErrMsg("Koneksi bermasalah. Periksa jaringanmu lalu coba lagi.");
    }
  };

  const reset = () => { setPhase("idle"); setData(null); setUrl(""); setErrMsg(""); };

  const slides = data ? parseSlides(data.slides) : [];
  const downloads: { label: string; href: string; primary?: boolean }[] = [];
  if (data?.no_watermark_link) downloads.push({ label: "Download Video", href: data.no_watermark_link, primary: true });
  if (data?.no_watermark_link_hd) downloads.push({ label: "Download HD", href: data.no_watermark_link_hd });
  if (data?.watermark_link) downloads.push({ label: "Download (Watermark)", href: data.watermark_link });
  if (data?.aweme_link && !data?.no_watermark_link) downloads.push({ label: "Download Video", href: data.aweme_link, primary: true });
  if (data?.music_link) downloads.push({ label: "Download MP3", href: data.music_link });

  const stats = [
    data?.play_count ? { icon: Eye, v: data.play_count } : null,
    data?.like_count ? { icon: Heart, v: data.like_count } : null,
    data?.comment_count ? { icon: MessageCircle, v: data.comment_count } : null,
    data?.share_count ? { icon: Share2, v: data.share_count } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number; className?: string }>; v: string }[];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
      <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <ArrowLeft size={15} /> Semua tools
      </Link>

      {/* Panel utama: satu tugas */}
      <section className="mx-auto mt-6 max-w-xl text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky text-primary">
          <Music2 size={24} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">TikTok Downloader</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Unduh video TikTok dari tautannya — tanpa watermark, langsung pakai.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") process(); }}
            inputMode="url"
            placeholder="https://vt.tiktok.com/…"
            className="h-12 flex-1 rounded-lg border border-line bg-card px-3.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Tautan video TikTok"
            disabled={phase === "working"}
          />
          <button
            onClick={process}
            disabled={phase === "working"}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {phase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {phase === "working" ? "Memproses…" : "Proses Video"}
          </button>
        </div>
        <p className="mt-2.5 text-xs text-ink-faint">
          Buka TikTok → bagikan video → salin tautan → tempel di atas.
        </p>
      </section>

      {/* Status */}
      <section className="mx-auto mt-5 max-w-xl">
        {phase === "working" && (
          <div className="tools-rise flex items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink-muted">
            <Loader2 size={15} className="animate-spin text-primary" /> Sedang memproses video, biasanya beberapa detik…
          </div>
        )}
        {phase === "error" && (
          <div className="tools-rise rounded-lg border border-danger/30 bg-danger/5 px-4 py-3.5" role="alert">
            <p className="text-sm font-semibold text-danger">
              {errKind === "invalid" ? "Tautan tidak valid" : errKind === "empty" ? "Video tidak ditemukan" : errKind === "provider" ? "Provider tidak tersedia" : errKind === "network" ? "Koneksi bermasalah" : "Terjadi kesalahan"}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">{errMsg}</p>
            <button onClick={() => setPhase("idle")} className="mt-2.5 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-primary hover:text-primary/80">
              <RefreshCw size={12} /> Coba lagi
            </button>
          </div>
        )}
      </section>

      {/* Hasil: media di kiri, detail + unduhan di kanan */}
      {phase === "done" && data && (
        <section className="tools-rise mx-auto mt-6 max-w-4xl">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
            {/* Media */}
            <div>
              {(data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link) && !videoFailed ? (
                <div className="overflow-hidden rounded-xl bg-code">
                  <video
                    src={data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link}
                    poster={data.cover_link || data.origin_cover || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                    className="max-h-[70vh] w-full"
                  />
                </div>
              ) : (data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link) && videoFailed ? (
                data.cover_link && !coverFailed ? (
                  <figure className="overflow-hidden rounded-xl bg-code">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.cover_link} alt="Sampul video" onError={() => setCoverFailed(true)} className="max-h-[60vh] w-full object-contain" />
                    <figcaption className="px-3 py-2 text-[11px] text-ink-faint">
                      Sumber tidak mengizinkan pemutaran langsung — ini sampul asli videonya. Unduh lewat tombol di samping.
                    </figcaption>
                  </figure>
                ) : (
                  <div className="flex aspect-[3/4] max-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 text-center">
                    <Play size={22} className="text-ink-faint" />
                    <p className="mt-2 text-sm font-semibold text-ink">Preview tidak bisa diputar</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">Sumber media tidak mengizinkan pemutaran langsung di browser. Video tetap bisa diunduh.</p>
                  </div>
                )
              ) : slides.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-code p-2">
                  {slides.slice(0, 8).map((s, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={s} alt={`Slide ${i + 1}`} loading="lazy" className="w-full rounded-md object-cover" />
                  ))}
                </div>
              ) : data.cover_link && !coverFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.cover_link} alt="Sampul video" onError={() => setCoverFailed(true)} className="max-h-[60vh] w-full rounded-xl bg-code object-contain" />
              ) : null}
            </div>

            {/* Detail + unduhan */}
            <div className="flex flex-col rounded-xl border border-line bg-card p-5 tools-shadow">
              {data.text ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{data.text}</p> : <p className="text-sm font-medium text-ink">Video TikTok</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {data.author_nickname ? (
                  <span className="font-semibold text-ink">{data.author_unique_id ? `@${data.author_unique_id}` : data.author_nickname}</span>
                ) : null}
                {fmtDuration(data.duration) ? <span className="text-xs text-ink-muted">{fmtDuration(data.duration)}</span> : null}
              </div>
              {stats.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {stats.map(({ icon: I, v }, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <I size={13} /> {v}
                    </span>
                  ))}
                </div>
              )}

              {/* Audio */}
              {data.music_link && !audioFailed ? (
                <div className="mt-4 rounded-lg bg-card-soft p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint"><Music size={11} /> Suara asli</p>
                  <audio src={data.music_link} controls preload="metadata" onError={() => setAudioFailed(true)} className="w-full" />
                </div>
              ) : null}

              {/* Tombol unduhan — hanya format yang benar-benar ada */}
              {downloads.length > 0 && (
                <div className="mt-5 flex flex-col gap-2">
                  {downloads.map((d) => (
                    <a
                      key={d.label}
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                        d.primary ? "bg-primary text-onprimary hover:bg-primary/90" : "border border-line bg-card text-ink hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      <Download size={15} /> {d.label} <ArrowRight size={14} className="opacity-60" />
                    </a>
                  ))}
                </div>
              )}
              {slides.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {slides.map((s, i) => (
                    <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary/50 hover:text-primary">
                      <Download size={12} /> Slide {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Aksi tambahan */}
              <div className="mt-4 flex flex-wrap gap-0.5 border-t border-line pt-3">
                <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-primary">
                  <Play size={12} /> Proses video lain
                </button>
                  {data.original ? (
                    <button onClick={() => copy(data.original!, "src")} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-primary">
                      <Link2 size={12} /> {copied === "src" ? "Tersalin" : "Salin tautan sumber"}
                    </button>
                  ) : null}
                  {data.original ? (
                    <a href={data.original} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-primary">
                      <ExternalLink size={12} /> Buka di TikTok
                    </a>
                  ) : null}
                  <button onClick={() => { setData(null); setPhase("idle"); }} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-danger">
                    <Trash2 size={12} /> Hapus hasil
                  </button>
                </div>
              </div>
            </div>
        </section>
      )}
    </main>
  );
}
