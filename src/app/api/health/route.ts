import { NextResponse } from "next/server";
import { UPSTREAM_BASE_URL } from "@/config/endpoints";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkUpstream = searchParams.get("check") === "upstream";

  const base = {
    success: true,
    service: "aomi-rest-api",
    status: "ok",
    time: new Date().toISOString(),
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
