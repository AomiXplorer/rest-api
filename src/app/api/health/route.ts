import { NextResponse } from "next/server";
import { UPSTREAM_BASE_URL } from "@/lib/server/upstream";
import { getMaintenance } from "@/lib/server/maintenance";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkUpstream = searchParams.get("check") === "upstream";

  const fwd = req.headers.get("x-forwarded-for");
  const ip =
    (fwd ? (fwd.split(",")[0] ?? "").trim() : req.headers.get("x-real-ip")) || null;

  const maintenance = await getMaintenance();
  const base = {
    success: true,
    author: "RendyZ",
    service: "aomi-rest-api",
    status: "ok",
    time: new Date().toISOString(),
    ip,
    maintenance: {
      active: maintenance.enabled,
      estimatedEndAt: maintenance.estimatedEndAt,
    },
  };

  if (!checkUpstream) return NextResponse.json(base);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const started = Date.now();
    const res = await fetch(`${UPSTREAM_BASE_URL}/api/r/quotesanime`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    return NextResponse.json({
      ...base,
      upstream: {
        reachable: res.ok,
        status_code: res.status,
        latency_ms: Date.now() - started,
      },
    });
  } catch {
    return NextResponse.json({
      ...base,
      upstream: { reachable: false, note: "Sumber tidak dapat dijangkau saat ini. Ini tidak mempengaruhi status aplikasi lokal." },
    });
  }
}

export const dynamic = "force-dynamic";
