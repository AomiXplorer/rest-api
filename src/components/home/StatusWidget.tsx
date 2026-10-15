"use client";

import { useEffect, useState } from "react";

export function StatusWidget() {
  const [time, setTime] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [service, setService] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    setTime(fmt());
    setOnline(navigator.onLine);
    const t = setInterval(() => setTime(fmt()), 30000);
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    fetch("/api/health")
      .then((r) => setService(r.ok ? "ok" : "down"))
      .catch(() => setService("down"));
    return () => {
      clearInterval(t);
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 font-code text-[11px] text-ink-muted">
      <span className="rounded-md border border-line bg-card px-2 py-1">
        Waktu: {time ?? "…"}
      </span>
      <span className="rounded-md border border-line bg-card px-2 py-1">
        Koneksi: {online === null ? "…" : online ? "Online" : "Offline"}
      </span>
      <span className="rounded-md border border-line bg-card px-2 py-1">
        Layanan: {service === "ok" ? "Online!" : service === "down" ? "Gangguan" : "…"}
      </span>
    </div>
  );
}
