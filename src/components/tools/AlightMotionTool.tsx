"use client";

/**
 * Alight Motion Pro Generator — workspace generator.
 * Mode Otomatis (am-gen) & Mode Email Sendiri (am-send → am-verify).
 * Hasil akun asli dari provider: email, uid, orderId, link aktivasi.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Mail, TriangleAlert, Wand2, RefreshCw } from "lucide-react";

type Phase = "idle" | "working" | "done" | "error" | "down";

type AmResult = {
  email?: string;
  uid?: string;
  orderId?: string;
  magicLink?: string;
  status?: boolean | string;
};

async function callApi(path: string): Promise<{ ok: boolean; data?: AmResult; message?: string; down?: boolean }> {
  try {
    const res = await fetch(path, { headers: { accept: "application/json" } });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j || j.success === false) {
      const code = j?.error?.code;
      return { ok: false, down: res.status >= 500 || code === "UPSTREAM_503" || code === "UPSTREAM_5XX", message: j?.error?.message || j?.message || `Gagal (HTTP ${res.status})` };
    }
    return { ok: true, data: (j.data && typeof j.data === "object" ? j.data : j.data ? { status: j.data } : {}) as AmResult };
  } catch {
    return { ok: false, message: "Koneksi bermasalah. Periksa jaringanmu." };
  }
}

function CopyChip({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ } }}
      className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Tersalin!" : label}
    </button>
  );
}

function StatusBox({ phase, message }: { phase: Phase; message?: string }) {
  if (phase === "idle") return null;
  if (phase === "working")
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2.5 text-sm text-ink-muted">
        <Loader2 size={15} className="animate-spin text-primary" /> Sedang memproses — butuh sekitar 30-60 detik, jangan tutup halaman ini.
      </div>
    );
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2.5 text-sm text-ink">
      <TriangleAlert size={14} className="mt-0.5 shrink-0 text-ink-faint" />
      <span>
        {phase === "down" ? "Provider sedang tidak bisa dihubungi. Coba lagi beberapa saat." : "Terjadi kesalahan."}
        {message ? <span className="block font-code text-[11px] text-ink-faint">{message}</span> : null}
      </span>
    </div>
  );
}

export function AlightMotionTool() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  /* mode otomatis */
  const [autoPhase, setAutoPhase] = useState<Phase>("idle");
  const [autoMsg, setAutoMsg] = useState("");
  const [autoData, setAutoData] = useState<AmResult | null>(null);

  const generate = async () => {
    setAutoPhase("working"); setAutoMsg(""); setAutoData(null);
    const r = await callApi("/api/v1/tools/am-gen");
    if (!r.ok) { setAutoPhase(r.down ? "down" : "error"); setAutoMsg(r.message || ""); return; }
    if (!r.data?.magicLink && !r.data?.email) {
      setAutoPhase("error"); setAutoMsg("Provider tidak mengembalikan akun. Coba generate lagi.");
      return;
    }
    setAutoData(r.data); setAutoPhase("done");
  };

  /* mode manual */
  const [email, setEmail] = useState("");
  const [sendPhase, setSendPhase] = useState<Phase>("idle");
  const [sendMsg, setSendMsg] = useState("");
  const [verifyLink, setVerifyLink] = useState("");
  const [verifyPhase, setVerifyPhase] = useState<Phase>("idle");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifyData, setVerifyData] = useState<AmResult | null>(null);

  const sendLink = async () => {
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setSendPhase("error"); setSendMsg("Masukkan alamat email yang valid."); return; }
    setSendPhase("working"); setSendMsg("");
    const r = await callApi(`/api/v1/tools/am-send?email=${encodeURIComponent(e)}`);
    if (!r.ok) { setSendPhase(r.down ? "down" : "error"); setSendMsg(r.message || ""); return; }
    setSendPhase("done");
  };

  const verify = async () => {
    const l = verifyLink.trim();
    if (!/^https?:\/\/.+/.test(l)) { setVerifyPhase("error"); setVerifyMsg("Tempel URL lengkap dari tombol di email verifikasi."); return; }
    setVerifyPhase("working"); setVerifyMsg(""); setVerifyData(null);
    const r = await callApi(`/api/v1/tools/am-verify?email=${encodeURIComponent(email.trim())}&link=${encodeURIComponent(l)}`);
    if (!r.ok) { setVerifyPhase(r.down ? "down" : "error"); setVerifyMsg(r.message || ""); return; }
    setVerifyData(r.data || {}); setVerifyPhase("done");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between gap-2">
        <Link href="/tools" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-2 font-code text-xs font-bold text-ink-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali
        </Link>
      </div>

      <section className="mt-4 rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note sm:p-6">
        <div className="tape-left" />
        <div className="flex items-center gap-3">
          <span className="rounded-lg border-2 border-line bg-sky p-2.5 text-primary"><Wand2 size={22} /></span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">Alight Motion Pro Generator</h1>
            <p className="text-sm text-ink-muted">Buat akun Alight Motion Pro siap pakai — pilih mode di bawah.</p>
          </div>
        </div>

        {/* Pilih mode */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={() => setMode("auto")}
            className={`press rounded-xl border-2 px-4 py-3 text-left ${mode === "auto" ? "border-primary bg-lemon/40 shadow-hard-sm" : "border-line-strong bg-card-soft"}`}
          >
            <p className="font-display text-sm font-extrabold text-ink">Otomatis</p>
            <p className="text-xs text-ink-muted">Sistem buatkan email sementara + aktivasi. Paling gampang.</p>
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`press rounded-xl border-2 px-4 py-3 text-left ${mode === "manual" ? "border-primary bg-lemon/40 shadow-hard-sm" : "border-line-strong bg-card-soft"}`}
          >
            <p className="font-display text-sm font-extrabold text-ink">Pakai Email Sendiri</p>
            <p className="text-xs text-ink-muted">Link aktivasi dikirim ke emailmu, kamu yang buka.</p>
          </button>
        </div>
      </section>

      {/* ===== MODE OTOMATIS ===== */}
      {mode === "auto" && (
        <section className="mt-5 rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="rounded-lg border-2 border-line bg-lemon p-3 text-ink shadow-hard-sm"><Wand2 size={22} /></span>
            <div>
              <p className="font-display text-base font-extrabold text-ink">Generate akun Pro baru</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
                Tekan tombol, sistem akan membuat email sementara, menerima verifikasi, dan menyiapkan link aktivasi akun Pro.
              </p>
            </div>
            <button
              onClick={generate}
              disabled={autoPhase === "working"}
              className="press inline-flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-6 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55"
            >
              {autoPhase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {autoPhase === "working" ? "Membuat akun…" : autoData ? "Generate lagi" : "Generate"}
            </button>
          </div>
          <StatusBox phase={autoPhase} message={autoMsg} />

          {autoPhase === "done" && autoData && (
            <div className="mt-4 rounded-xl border-2 border-line bg-card-soft p-4">
              <p className="flex items-center gap-1.5 font-display text-sm font-extrabold text-ink"><Check size={14} className="text-primary" /> Akun berhasil dibuat</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                {autoData.email ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code text-[10px] uppercase text-ink-faint">Email</span>
                    <span className="font-code font-bold text-ink">{autoData.email}</span>
                    <CopyChip text={autoData.email} label="Salin email" />
                  </div>
                ) : null}
                {autoData.uid ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code text-[10px] uppercase text-ink-faint">UID</span>
                    <span className="font-code font-bold text-ink">{autoData.uid}</span>
                    <CopyChip text={autoData.uid} label="Salin UID" />
                  </div>
                ) : null}
                {autoData.orderId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code text-[10px] uppercase text-ink-faint">Order</span>
                    <span className="font-code font-bold text-ink">{autoData.orderId}</span>
                  </div>
                ) : null}
              </dl>
              {autoData.magicLink ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={autoData.magicLink} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90">
                    <ExternalLink size={14} /> Buka Link Aktivasi
                  </a>
                  <CopyChip text={autoData.magicLink} label="Salin link aktivasi" />
                </div>
              ) : null}
              <div className="mt-3 rounded-lg border-2 border-dashed border-line px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
                Cara pakai: buka link aktivasi di perangkat yang terpasang aplikasi Alight Motion → login dengan email di atas → status Pro aktif otomatis.
                Link ini bisa kedaluwarsa, segera dipakai ya.
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== MODE MANUAL ===== */}
      {mode === "manual" && (
        <section className="mt-5 space-y-4">
          <div className="rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note">
            <p className="font-display text-sm font-extrabold text-ink">Langkah 1 — Kirim link ke emailmu</p>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="emailkamu@gmail.com"
                className="h-12 flex-1 rounded-lg border-2 border-line bg-bg px-3.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                aria-label="Alamat email"
              />
              <button
                onClick={sendLink}
                disabled={sendPhase === "working"}
                className="press inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-4 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55"
              >
                {sendPhase === "working" ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Kirim Link
              </button>
            </div>
            <StatusBox phase={sendPhase} message={sendMsg} />
            {sendPhase === "done" && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg border-2 border-dashed border-line bg-card-soft px-3 py-2 text-sm text-ink-muted">
                <Check size={14} className="text-primary" /> Link verifikasi dikirim ke <span className="font-bold text-ink">{email.trim()}</span>. Buka emailmu lalu lanjut ke langkah 2.
              </p>
            )}
          </div>

          <div className={`rounded-2xl border-2 border-line-strong bg-card p-5 shadow-note transition-opacity ${sendPhase !== "done" ? "pointer-events-none opacity-50" : ""}`}>
            <p className="font-display text-sm font-extrabold text-ink">Langkah 2 — Tempel link dari email</p>
            <p className="mt-1 text-xs text-ink-muted">Buka email dari Alight Motion, salin URL lengkap tombol aktivasinya (mulai dari https://), tempel di sini.</p>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
              <input
                value={verifyLink}
                onChange={(e) => setVerifyLink(e.target.value)}
                placeholder="https://alightcreative.com/auth_action?…"
                className="h-12 flex-1 rounded-lg border-2 border-line bg-bg px-3.5 font-code text-xs text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                aria-label="Link verifikasi dari email"
              />
              <button
                onClick={verify}
                disabled={verifyPhase === "working" || sendPhase !== "done"}
                className="press inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border-2 border-line-strong bg-primary px-4 font-display text-sm font-bold text-onprimary shadow-hard-sm hover:bg-primary/90 disabled:opacity-55"
              >
                {verifyPhase === "working" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Verifikasi
              </button>
            </div>
            <StatusBox phase={verifyPhase} message={verifyMsg} />
            {verifyPhase === "done" && verifyData && (
              <div className="mt-4 rounded-xl border-2 border-line bg-card-soft p-4">
                <p className="flex items-center gap-1.5 font-display text-sm font-extrabold text-ink"><Check size={14} className="text-primary" /> Akun Pro siap dipakai</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {verifyData.uid ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-code text-[10px] uppercase text-ink-faint">UID</span>
                      <span className="font-code font-bold text-ink">{verifyData.uid}</span>
                      <CopyChip text={verifyData.uid} label="Salin UID" />
                    </div>
                  ) : null}
                  {verifyData.orderId ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-code text-[10px] uppercase text-ink-faint">Order</span>
                      <span className="font-code font-bold text-ink">{verifyData.orderId}</span>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-code text-[10px] uppercase text-ink-faint">Status</span>
                    <span className="font-code font-bold text-ink">{verifyData.status === true || verifyData.status === "true" ? "Pro aktif" : String(verifyData.status ?? "-")}</span>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  Login di aplikasi Alight Motion dengan email <span className="font-bold text-ink">{email.trim()}</span> — status Pro mengikuti akunnya.
                </p>
              </div>
            )}
            {verifyPhase === "error" && verifyMsg ? (
              <button onClick={() => { setVerifyPhase("idle"); setVerifyMsg(""); }} className="press mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-line-strong bg-card px-3 py-1.5 font-code text-xs font-bold text-ink-muted hover:text-ink">
                <RefreshCw size={12} /> Coba link lain
              </button>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
