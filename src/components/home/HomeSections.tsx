"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Rocket, BarChart3, Zap, LockOpen, ShieldCheck, FlaskConical,
  Globe, BatteryCharging, MonitorSmartphone, Activity,
  Wrench,
} from "lucide-react";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { VERIFIED_IDS } from "@/config/verification";
import { getHealth } from "@/lib/health";

/* ============================================================
   BERANDA — mengikuti struktur referensi (APIii Xrina):
   hero 2 kolom, statistik 3 kartu, info pengunjung,
   fitur 2x2, panel CTA. Tema gelap bersih, aksen sky-blue.
   ============================================================ */

export function Hero() {
  const total = ENDPOINTS.length;
  const cats = CATEGORIES.length;

  return (
    <section className="px-4 pb-10 pt-10 sm:px-6 lg:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Kiri: teks */}
        <div className="order-2 lg:order-1">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[56px]">
            Cyronime
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted sm:text-base">
            REST API gratis untuk bot dan aplikasi. {total} endpoint dari {cats} kategori — AI,
            downloader, search, anime, dan banyak lagi. Simple, fast response, dan aman. Tanpa
            login, langsung dipakai.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Rocket size={15} /> Mulai sekarang
            </Link>
            <a
              href="#stats"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-card px-5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <BarChart3 size={15} /> Lihat statistik
            </a>
            <Link
              href="/tools"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-card px-5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Wrench size={15} /> Aomi Tools
            </Link>
          </div>
        </div>

        {/* Kanan: maskot — artwork monokrom asli */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mascot/mascot-original.jpg"
            alt="Maskot Cyronime — karakter anime monokrom berkacamata bulat"
            width={567}
            height={680}
            className="w-full max-w-[300px] rounded-xl border border-line object-cover sm:max-w-[340px] lg:max-w-[400px]"
            style={{ aspectRatio: "567 / 680" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ===== Statistik: 3 kartu aksen ===== */
export function Stats() {
  const total = ENDPOINTS.length;
  const cats = CATEGORIES.length;
  const verified = VERIFIED_IDS.length;
  const [health, setHealth] = useState<{ ok: boolean } | null>(null);

  useEffect(() => {
    getHealth().then(setHealth);
  }, []);

  const cards = [
    { n: String(total), label: "Total endpoint", accent: true },
    { n: String(cats), label: "Kategori", accent: true },
    { n: String(verified), label: "Endpoint terverifikasi", accent: true },
  ];

  return (
    <section id="stats" className="scroll-mt-20 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-line bg-card p-5 text-center">
              <p className="font-display text-3xl font-bold text-primary">{c.n}</p>
              <p className="mt-1 text-[13px] text-ink-muted">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${health === null ? "bg-ink-faint" : health.ok ? "bg-mint" : "bg-danger"}`} />
          {health === null ? "Memeriksa status server…" : health.ok ? "Semua sistem aktif" : "Server sedang gangguan"}
        </p>
      </div>
    </section>
  );
}

/* ===== Info pengunjung ===== */
interface BatteryLike {
  level: number;
  charging: boolean;
  addEventListener?: (t: string, l: () => void) => void;
  removeEventListener?: (t: string, l: () => void) => void;
}

export function VisitorInfo() {
  const [ip, setIp] = useState<string | null>(null);
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [browser, setBrowser] = useState<string>("");

  useEffect(() => {
    getHealth().then((h) => setIp(h.ip));
    // Browser ringkas dari userAgent
    const ua = navigator.userAgent;
    const name = /Edg\//.test(ua) ? "Edge"
      : /OPR\//.test(ua) ? "Opera"
      : /Chrome\//.test(ua) ? "Chrome"
      : /Firefox\//.test(ua) ? "Firefox"
      : /Safari\//.test(ua) ? "Safari"
      : "Browser";
    setBrowser(`${name} · ${screen.width}×${screen.height}`);
    // Baterai (jika didukung browser)
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
    nav.getBattery?.().then((b) => {
      const read = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging });
      read();
      b.addEventListener?.("levelchange", read);
      b.addEventListener?.("chargingchange", read);
    }).catch(() => undefined);
  }, []);

  const rows = [
    { icon: MonitorSmartphone, label: "User", value: browser || "Memuat…" },
    { icon: Globe, label: "IP address", value: ip ?? "Memuat…" },
    {
      icon: BatteryCharging,
      label: "Baterai",
      value: battery ? `${battery.level}%` : "Memuat…",
      sub: battery ? (battery.charging ? "Sedang mengisi daya" : "Tidak mengisi daya") : null,
    },
  ];

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-xl font-bold text-ink">Info pengunjung</h2>
        <p className="mt-1 text-sm text-ink-muted">Data perangkatmu saat ini</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl border border-line bg-card p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                <r.icon size={12} /> {r.label}
              </div>
              <p className="mt-2 truncate font-code text-sm font-medium text-ink" title={r.value}>{r.value}</p>
              {r.sub ? <p className="mt-0.5 text-xs text-ink-muted">{r.sub}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== Fitur ===== */
const FEATURES = [
  {
    icon: Zap,
    title: "Super responsif",
    desc: "Performa endpoint yang cepat.",
  },
  {
    icon: LockOpen,
    title: "Tanpa login",
    desc: "Pakai kapan saja dan di mana saja, tanpa ribet.",
  },
  {
    icon: ShieldCheck,
    title: "Aman",
    desc: "Ada validasi parameter dan pembatasan request.",
  },
  {
    icon: FlaskConical,
    title: "Coba langsung",
    desc: "Isi parameter, klik GET, hasilnya muncul saat itu juga.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-xl font-bold text-ink">Kenapa pakai Cyronime?</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
          Semua endpoint bisa dicoba langsung dari browser, tanpa daftar akun.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-line bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky text-primary">
                <f.icon size={18} />
              </span>
              <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== CTA ===== */
export function Cta() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-card p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Siap mencoba?</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Buka daftar API dan pilih endpoint yang kamu butuhkan.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Activity size={15} /> Buka Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
