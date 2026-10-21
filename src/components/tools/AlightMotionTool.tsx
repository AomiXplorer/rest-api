"use client";

/**
 * Alight Motion Pro Generator — workspace: panel input di kiri, hasil di kanan.
 * Mode Otomatis (am-gen) & Email Sendiri (am-send → am-verify).
 * Hasil asli dari provider: email, uid, orderId, link aktivasi.
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
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-card-soft hover:text-primary"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />} {copied ? "Tersalin" : label}
    </button>
  );
}

function StatusBox({ phase, message }: { phase: Phase; message?: string }) {
  if (phase === "idle") return null;
  if (phase === "working")
    return (
      <div className="tools-rise flex items-center gap-2 rounded-lg bg-card-soft px-3.5 py-3 text-sm text-ink-muted">
        <Loader2 size={15} className="animate-spin text-primary" /> Sedang memproses — butuh sekitar 30-60 detik, jangan tutup halaman ini.
      </div>
    );
  return (
    <div className="tools-rise flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-3 text-sm" role="alert">
      <TriangleAlert size={14} className="mt-0.5 shrink-0 text-danger" />
      <span className="text-ink">
        {phase === "down" ? "Provider sedang tidak bisa dihubungi. Coba lagi beberapa saat." : "Terjadi kesalahan."}
        {message ? <span className="mt-0.5 block text-xs text-ink-muted">{message}</span> : null}
      </span>
    </div>
  );
}

/* Panel hasil: keadaan kosong vs hasil asli */
function ResultPanel({ done, children, hint }: { done: boolean; hint: string; children?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-5 sm:p-6 lg:sticky lg:top-20">
      <h2 className="text-sm font-semibold text-ink">Hasil</h2>
      {done ? (
        <div className="mt-4 tools-rise">{children}</div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line px-4 py-14 text-center">
          <Wand2 size={20} className="text-ink-faint" />
          <p className="max-w-[240px] text-[13px] leading-relaxed text-ink-faint">{hint}</p>
        </div>
      )}
    </section>
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
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
      <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <ArrowLeft size={15} /> Semua tools
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">Alight Motion Pro Generator</h1>
      <p className="mt-1 text-sm text-ink-muted">Buat akun Alight Motion Pro siap pakai — pilih mode kerjanya.</p>

      {/* Panel input + panel hasil */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-5 tools-shadow sm:p-6">
          {/* Pilih mode */}
          <div className="flex gap-0.5 rounded-lg bg-card-soft p-1">
            <button
              onClick={() => setMode("auto")}
              className={`flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                mode === "auto" ? "bg-card text-ink tools-shadow" : "text-ink-muted hover:text-ink"
              }`}
            >
              Otomatis
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                mode === "manual" ? "bg-card text-ink tools-shadow" : "text-ink-muted hover:text-ink"
              }`}
            >
              Pakai Email Sendiri
            </button>
          </div>

          {/* ===== MODE OTOMATIS ===== */}
          {mode === "auto" ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-ink">Generate akun Pro baru</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                Sistem membuat email sementara, menerima verifikasi, dan menyiapkan link aktivasi. Cukup tekan satu tombol.
              </p>
              <button
                onClick={generate}
                disabled={autoPhase === "working"}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {autoPhase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
                {autoPhase === "working" ? "Membuat akun…" : autoData ? "Generate lagi" : "Generate"}
              </button>
              <div className="mt-4"><StatusBox phase={autoPhase} message={autoMsg} /></div>
            </div>
          ) : (
            /* ===== MODE MANUAL ===== */
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-ink">1 — Kirim link ke emailmu</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="emailkamu@gmail.com"
                    className="h-11 rounded-lg border border-line bg-bg px-3.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-label="Alamat email"
                  />
                  <button
                    onClick={sendLink}
                    disabled={sendPhase === "working"}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {sendPhase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Kirim Link
                  </button>
                </div>
                <div className="mt-3"><StatusBox phase={sendPhase} message={sendMsg} /></div>
                {sendPhase === "done" && (
                  <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-card-soft px-3 py-2.5 text-[13px] text-ink-muted">
                    <Check size={14} className="shrink-0 text-primary" /> Link verifikasi dikirim ke <span className="font-semibold text-ink">{email.trim()}</span>.
                  </p>
                )}
              </div>

              <div className={`transition-opacity ${sendPhase !== "done" ? "pointer-events-none opacity-50" : ""}`}>
                <p className="text-sm font-semibold text-ink">2 — Tempel link dari email</p>
                <p className="mt-1 text-[13px] text-ink-muted">Buka email dari Alight Motion, salin URL lengkap tombol aktivasinya (mulai dari https://).</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  <input
                    value={verifyLink}
                    onChange={(e) => setVerifyLink(e.target.value)}
                    placeholder="https://alightcreative.com/auth_action?…"
                    className="h-11 rounded-lg border border-line bg-bg px-3.5 font-code text-xs text-ink outline-none placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-label="Link verifikasi dari email"
                  />
                  <button
                    onClick={verify}
                    disabled={verifyPhase === "working" || sendPhase !== "done"}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
                  >
                    {verifyPhase === "working" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Verifikasi
                  </button>
                </div>
                <div className="mt-3"><StatusBox phase={verifyPhase} message={verifyMsg} /></div>
                {verifyPhase === "error" && verifyMsg ? (
                  <button onClick={() => { setVerifyPhase("idle"); setVerifyMsg(""); }} className="mt-2 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-primary hover:text-primary/80">
                    <RefreshCw size={12} /> Coba link lain
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </section>

        {/* ===== PANEL HASIL ===== */}
        {mode === "auto" ? (
          <ResultPanel done={autoPhase === "done"} hint="Hasil generate akun Pro akan muncul di sini.">
            {autoData && (
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Check size={15} /> Akun berhasil dibuat</p>
                <dl className="mt-3.5 space-y-2.5 text-sm">
                  {autoData.email ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">Email</dt>
                      <dd className="min-w-0 flex-1 truncate font-code text-[13px] font-medium text-ink">{autoData.email}</dd>
                      <CopyChip text={autoData.email} label="Salin" />
                    </div>
                  ) : null}
                  {autoData.uid ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">UID</dt>
                      <dd className="min-w-0 flex-1 truncate font-code text-[13px] font-medium text-ink">{autoData.uid}</dd>
                      <CopyChip text={autoData.uid} label="Salin" />
                    </div>
                  ) : null}
                  {autoData.orderId ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">Order</dt>
                      <dd className="min-w-0 flex-1 truncate font-code text-[13px] font-medium text-ink">{autoData.orderId}</dd>
                    </div>
                  ) : null}
                </dl>
                {autoData.magicLink ? (
                  <div className="mt-4 space-y-2">
                    <a href={autoData.magicLink} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary/90 active:scale-[0.98]">
                      <ExternalLink size={15} /> Buka Link Aktivasi
                    </a>
                    <div className="flex justify-center"><CopyChip text={autoData.magicLink} label="Salin link aktivasi" /></div>
                  </div>
                ) : null}
                <p className="mt-4 rounded-lg bg-card-soft px-3.5 py-3 text-xs leading-relaxed text-ink-muted">
                  Buka link aktivasi di perangkat yang terpasang aplikasi Alight Motion → login dengan email di atas → status Pro aktif otomatis. Link bisa kedaluwarsa, segera dipakai ya.
                </p>
              </div>
            )}
          </ResultPanel>
        ) : (
          <ResultPanel done={verifyPhase === "done"} hint="Setelah verifikasi berhasil, detail akun Pro akan muncul di sini.">
            {verifyData && (
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Check size={15} /> Akun Pro siap dipakai</p>
                <dl className="mt-3.5 space-y-2.5 text-sm">
                  {verifyData.uid ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">UID</dt>
                      <dd className="min-w-0 flex-1 truncate font-code text-[13px] font-medium text-ink">{verifyData.uid}</dd>
                      <CopyChip text={verifyData.uid} label="Salin" />
                    </div>
                  ) : null}
                  {verifyData.orderId ? (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">Order</dt>
                      <dd className="min-w-0 flex-1 truncate font-code text-[13px] font-medium text-ink">{verifyData.orderId}</dd>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-card-soft px-3.5 py-2.5">
                    <dt className="text-[11px] uppercase tracking-wide text-ink-faint">Status</dt>
                    <dd className="font-code text-[13px] font-medium text-ink">{verifyData.status === true || verifyData.status === "true" ? "Pro aktif" : String(verifyData.status ?? "-")}</dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-lg bg-card-soft px-3.5 py-3 text-xs leading-relaxed text-ink-muted">
                  Login di aplikasi Alight Motion dengan email <span className="font-semibold text-ink">{email.trim()}</span> — status Pro mengikuti akunnya.
                </p>
              </div>
            )}
          </ResultPanel>
        )}
      </div>
    </main>
  );
}
