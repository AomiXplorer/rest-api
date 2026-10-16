/**
 * Maintenance gate untuk seluruh halaman publik (frontend).
 *
 * - Berjalan di middleware (edge) SEBELUM render — tidak ada flicker halaman
 *   normal dan tidak ada redirect loop (rewrite, bukan redirect).
 * - Route /api/* TIDAK di-rewrite: API mengembalikan JSON 503 dari gate di
 *   route handler (lihat src/app/api/v1/[...path]/route.ts). Webhook Telegram
 *   dan /api/health tidak pernah diblokir.
 * - Status dibaca dari Redis dengan cache 5 detik — konsisten antar instance.
 */
import { NextRequest, NextResponse } from "next/server";
import { getMaintenance } from "@/lib/server/maintenance";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const maintenance = await getMaintenance();

  if (maintenance.enabled && pathname !== "/maintenance") {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }
  if (!maintenance.enabled && pathname === "/maintenance") {
    return NextResponse.rewrite(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|og.png|icon|manifest).*)"],
};
