"use client";

import { useEffect, useState } from "react";
import { Globe, BatteryCharging, Wifi, Clock } from "lucide-react";
import { getHealth } from "@/lib/health";

interface BatteryLike {
  level: number;
  charging: boolean;
  addEventListener?: (t: string, l: () => void) => void;
}

function Card({
  icon: Icon,
  label,
  value,
  chipCls,
  iconText = "text-ink",
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  chipCls: string;
  iconText?: string;
}) {
  return (
    <div className="relative rounded-xl border-2 border-line-strong bg-card p-3 shadow-note">
      <div className="tape-left" />
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line-strong ${chipCls} ${iconText}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-hand text-lg leading-tight text-ink">{label}</p>
          <p className="truncate font-code text-[12px] font-semibold text-ink-muted">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* Kartu waktu terisolasi — interval 10 detik tidak me-render ulang kartu lain */
function ClockCard() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      const d = new Date();
      const date = new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(d);
      const hm = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(d);
      setTime(`${date} • ${hm}`);
    };
    read();
    const t = setInterval(read, 10000);
    return () => clearInterval(t);
  }, []);
  return <Card icon={Clock} label="Waktu" value={time ?? "…"} chipCls="bg-mintp" />;
}

export function StatusWidget() {
  const [ip, setIp] = useState<string | null>(null);
  const [battery, setBattery] = useState<string | null>(null);
  const [conn, setConn] = useState<string | null>(null);

  useEffect(() => {
    // IP dari satu request health yang di-cache bersama widget lain
    getHealth().then((h) => setIp(h.ip ?? "lokal"));

    // Baterai (Browser API, jika tersedia)
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
    if (nav.getBattery) {
      nav
        .getBattery()
        .then((b) => {
          const read = () =>
            setBattery(`${Math.round(b.level * 100)}%${b.charging ? " ⚡" : ""}`);
          read();
          b.addEventListener?.("levelchange", read);
          b.addEventListener?.("chargingchange", read);
        })
        .catch(() => setBattery("—"));
    } else {
      setBattery("—");
    }

    // Tipe koneksi jaringan
    const cnav = navigator as Navigator & { connection?: { effectiveType?: string } };
    if (cnav.connection?.effectiveType) {
      setConn(cnav.connection.effectiveType.toUpperCase());
    } else {
      setConn(navigator.onLine ? "Online" : "Offline");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card icon={Globe} label="IP Address" value={ip ?? "…"} chipCls="bg-sky" />
      <Card icon={BatteryCharging} label="Baterai" value={battery ?? "…"} chipCls="bg-sticky" iconText="text-sticky-ink" />
      <Card icon={Wifi} label="Koneksi" value={conn ?? "…"} chipCls="bg-lav" />
      <ClockCard />
    </div>
  );
}

/* Tile "Status" live: 200 saat layanan sehat, 503 saat tidak */
export function LiveStatusTile() {
  const [code, setCode] = useState<string>("…");
  useEffect(() => {
    getHealth().then((h) => setCode(String(h.status)));
  }, []);
  return (
    <div className="relative rounded-xl border-2 border-line-strong bg-sky p-4 shadow-note">
      <div className="tape" />
      <p className="font-hand text-3xl font-semibold leading-none text-ink">{code}</p>
      <p className="mt-1.5 font-code text-xs text-ink-muted">Status</p>
    </div>
  );
}
