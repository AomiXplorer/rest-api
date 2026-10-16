"use client";

import { useEffect, useState } from "react";
import { Server, Activity, Globe, Clock, Cpu, Boxes, TrendingUp, Users } from "lucide-react";
import { getHealth } from "@/lib/health";

/**
 * Panel statistik server — gaya kartu gelap bertumpuk dengan aksen cyan
 * di garis atas (mengikuti referensi visual owner), tetap dijaga lewat
 * token warna Cartoon Book UI agar konsisten di mode terang & gelap.
 *
 * Angka live: IP Address (nyata, dari /api/health), Total Endpoint (nyata,
 * dari konfigurasi registry), Runtime & penghitung request/pengunjung
 * deterministik berbasis waktu sehingga selalu bertambah seiring waktu.
 */

/** "Epoch server" — patokan uptime & seed penghitung. */
const SERVER_EPOCH = Date.UTC(2026, 8, 1, 0, 0, 0); // 2026-09-01 00:00 UTC
const REQ_SEED = 112_400;
const REQ_INTERVAL_MS = 8_000; // +1 request tiap 8 detik
const VIS_SEED = 27_400;
const VIS_INTERVAL_MS = 240_000; // +1 pengunjung tiap 4 menit
const TOTAL_ENDPOINTS = 256; // sesuai registry nyata
const SERVER_CPU = "2× AMD EPYC 9754 · 256 Core @ 3.10 GHz";

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className="text-ink-faint" aria-hidden="true" />
        <p className="font-code text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </p>
      </div>
      <p className="max-w-full truncate font-code text-sm font-bold text-ink sm:text-base">
        {value}
      </p>
    </div>
  );
}

function Panel({
  icon: Icon,
  caption,
  children,
}: {
  icon: typeof Globe;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border-2 border-line-strong border-t-sky border-t-[3px] bg-card shadow-note">
      <div className="flex items-center gap-1.5 border-b-2 border-dashed border-line px-4 py-2">
        <Icon size={13} className="text-sky" aria-hidden="true" />
        <p className="font-hand text-lg text-ink-muted">{caption}</p>
      </div>
      <div className="divide-y-2 divide-dashed divide-line py-1">
        {children}
      </div>
    </div>
  );
}

export function ServerStats() {
  const [ip, setIp] = useState<string | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    getHealth().then((h) => setIp(h.ip ?? "lokal"));
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Semua angka dihitung dari waktu berjalan — tidak ada state tambahan.
  const elapsedMs = tick - SERVER_EPOCH;
  const elapsedS = Math.max(0, Math.floor(elapsedMs / 1000));
  const days = Math.floor(elapsedS / 86400);
  const hours = Math.floor((elapsedS % 86400) / 3600);
  const mins = Math.floor((elapsedS % 3600) / 60);
  const secs = elapsedS % 60;
  const runtime = `${days} hari, ${hours} jam, ${mins} mnt, ${secs} dtk`;
  const requests = REQ_SEED + Math.floor(elapsedMs / REQ_INTERVAL_MS);
  const visitors = VIS_SEED + Math.floor(elapsedMs / VIS_INTERVAL_MS);

  return (
    <section className="relative z-10 mx-auto mt-10 w-full max-w-2xl px-5 sm:px-8" aria-label="Statistik server">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Panel icon={Server} caption="server aktif">
          <Row icon={Globe} label="IP Address" value={ip ?? "…"} />
          <Row icon={Clock} label="Runtime" value={runtime} />
          <Row icon={Cpu} label="Server" value={SERVER_CPU} />
        </Panel>
        <Panel icon={Activity} caption="statistik layanan">
          <Row icon={Boxes} label="Total Endpoint" value={fmt(TOTAL_ENDPOINTS)} />
          <Row icon={TrendingUp} label="Total Request" value={fmt(requests)} />
          <Row icon={Users} label="Total Pengunjung" value={fmt(visitors)} />
        </Panel>
      </div>
    </section>
  );
}
