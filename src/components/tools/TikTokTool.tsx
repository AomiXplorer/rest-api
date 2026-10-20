"use client";

/**
 * TikTok Downloader — halaman penggunaan tool downloader sungguhan.
 * Bukan katalog API: input URL utama, preview media asli dari provider,
 * pilihan unduhan hanya yang benar-benar tersedia di respons.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Link2, Loader2, Music, RefreshCw, Trash2, ExternalLink,
  Play, Heart, MessageCircle, Share2, Eye, Music2,
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
    <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali
        </Link>
      </div>

      {/* Panel utama downloader */}
      <section className="mt-4 rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note sm:p-6">
        <div className="tape-left" />
        <div className="flex items-center gap-3">
          <span className="rounded-lg border-2 border-line bg-sky p-2.5 text-primary"><Music2 size={22} /></span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">TikTok Downloader</h1>
            <p className="text-sm text-ink-muted">Tempel tautan video TikTok, ambil videonya tanpa watermark.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") process(); }}
            inputMode="url"
            placeholder="https://vt.tiktok.com/…"
            className="h-13 min-h-12 flex-1 rounded-lg border-2 border-line bg-bg px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
            aria-label="Tautan video TikTok"
            disabled={phase === "working"}
          />
          <button
            onClick={process}
            disabled={phase === "working"}
            className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-5 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55"
          >
            {phase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {phase === "working" ? "Memproses…" : "Ambil Video"}
          </button>
        </div>
        <p className="mt-2 font-code text-[11px] text-ink-faint">
          Cara pakai: buka TikTok → bagikan video → salin tautan → tempel di atas → Ambil Video.
        </p>

        {/* Status */}
        {phase === "working" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2.5 text-sm text-ink-muted">
            <Loader2 size={15} className="animate-spin text-primary" /> Sedang memproses video, biasanya beberapa detik…
          </div>
        )}
        {phase === "error" && (
          <div className="mt-4 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-3">
            <p className="text-sm font-bold text-ink">
              {errKind === "invalid" ? "Tautan tidak valid" : errKind === "empty" ? "Video tidak ditemukan" : errKind === "provider" ? "Provider tidak tersedia" : errKind === "network" ? "Koneksi bermasalah" : "Terjadi kesalahan"}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{errMsg}</p>
            <button onClick={() => setPhase("idle")} className="press mt-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink">
              <RefreshCw size={12} /> Coba lagi
            </button>
          </div>
        )}
      </section>

      {/* Hasil */}
      {phase === "done" && data && (
        <section className="mt-5 rounded-2xl border-2 border-line-strong bg-card p-4 shadow-note sm:p-5">
          {/* Preview — kalau media tak bisa diputar di browser, fallback ke sampul/placeholder jujur */}
          {(data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link) && !videoFailed ? (
            <div className="mx-auto max-w-[min(100%,420px)] overflow-hidden rounded-xl border-2 border-line bg-code">
              <video
                src={data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link}
                poster={data.cover_link || data.origin_cover || undefined}
                controls
                playsInline
                preload="metadata"
                onError={() => setVideoFailed(true)}
                className="max-h-[72vh] w-full"
              />
            </div>
          ) : (data.no_watermark_link || data.no_watermark_link_hd || data.aweme_link) && videoFailed ? (
            data.cover_link && !coverFailed ? (
              <figure className="mx-auto max-w-[min(100%,420px)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.cover_link} alt="Sampul video" onError={() => setCoverFailed(true)} className="max-h-[52vh] w-full rounded-xl border-2 border-line bg-code object-contain" />
                <figcaption className="mt-2 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2 text-xs text-ink-muted">
                  Sumber media tidak mengizinkan pemutaran langsung di browser, jadi ini sampul asli videonya. Video tetap bisa diunduh lewat tombol di bawah.
                </figcaption>
              </figure>
            ) : (
              <div className="mx-auto max-w-[min(100%,420px)] rounded-xl border-2 border-dashed border-line bg-card-soft px-4 py-8 text-center">
                <Play size={22} className="mx-auto text-ink-faint" />
                <p className="mt-2 font-display text-sm font-bold text-ink">Preview tidak bisa diputar di browser</p>
                <p className="mt-1 text-sm text-ink-muted">Sumber media tidak mengizinkan pemutaran langsung. Video tetap bisa diunduh lewat tombol di bawah, atau buka hasilnya di tab baru.</p>
              </div>
            )
          ) : slides.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slides.slice(0, 12).map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border-2 border-line bg-code">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt={`Slide ${i + 1}`} loading="lazy" className="w-full object-cover" />
                </a>
              ))}
            </div>
          ) : data.cover_link && !coverFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.cover_link} alt="Sampul video" onError={() => setCoverFailed(true)} className="mx-auto max-h-[60vh] rounded-xl border-2 border-line bg-code object-contain" />
          ) : null}

          {/* Info video */}
          <div className="mt-4">
            {data.text ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{data.text}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              {data.author_nickname ? (
                <span className="font-bold text-ink">
                  {data.author_unique_id ? `@${data.author_unique_id}` : data.author_nickname}
                </span>
              ) : null}
              {fmtDuration(data.duration) ? <span className="font-code text-xs">{fmtDuration(data.duration)}</span> : null}
            </div>
            {stats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {stats.map(({ icon: I, v }, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-card-soft px-2.5 py-0.5 font-code text-[11px] font-bold text-ink-muted">
                    <I size={11} /> {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Audio */}
          {data.music_link && !audioFailed ? (
            <div className="mt-4 rounded-xl border-2 border-line bg-code p-3">
              <p className="mb-1.5 flex items-center gap-1.5 font-code text-[11px] font-bold uppercase text-ink-faint"><Music size={11} /> Suara asli</p>
              <audio src={data.music_link} controls preload="metadata" onError={() => setAudioFailed(true)} className="w-full" />
            </div>
          ) : null}

          {/* Tombol unduhan — hanya format yang benar-benar ada */}
          {downloads.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {downloads.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`press inline-flex items-center gap-1.5 rounded-lg border-2 px-4 py-2.5 font-display text-sm font-bold shadow-hard-sm ${
                    d.primary ? "border-line-strong bg-primary text-onprimary hover:bg-primary/90" : "border-line-strong bg-lemon text-ink hover:bg-lemon/70"
                  }`}
                >
                  <Download size={14} /> {d.label}
                </a>
              ))}
            </div>
          )}
          {slides.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {slides.map((s, i) => (
                <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-lemon px-3 py-2 font-code text-xs font-bold text-ink shadow-hard-sm hover:bg-lemon/70">
                  <Download size={12} /> Slide {i + 1}
                </a>
              ))}
            </div>
          )}

          {/* Aksi tambahan */}
          <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-dashed border-line pt-4">
            <button onClick={reset} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
              <Play size={12} /> Proses video lain
            </button>
            {data.original ? (
              <button onClick={() => copy(data.original!, "src")} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
                <Link2 size={12} /> {copied === "src" ? "Tersalin!" : "Salin tautan sumber"}
              </button>
            ) : null}
            {data.original ? (
              <a href={data.original} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
                <ExternalLink size={12} /> Buka di TikTok
              </a>
            ) : null}
            <button onClick={() => { setData(null); setPhase("idle"); }} className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
              <Trash2 size={12} /> Hapus hasil
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
