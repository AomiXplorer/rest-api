import { RefreshCw, Wrench, Clock } from "lucide-react";
import { getMaintenance } from "@/lib/server/maintenance";

export const dynamic = "force-dynamic";

/**
 * Halaman maintenance publik — mengikuti design system gelap bersih,
 * dirender server-side (tanpa hydration mismatch: seluruh konten dari
 * status maintenance di Redis).
 */
export default async function MaintenancePage() {
  const m = await getMaintenance();
  const etaWib = m.estimatedEndAt
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(m.estimatedEndAt))
    : null;

  return (
    <main className="flex flex-1 items-center px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-xl border border-line bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky text-primary">
              <Wrench size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Info
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {m.title}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Kami sedang melakukan pemeliharaan sistem untuk meningkatkan
            stabilitas dan kualitas layanan. Silakan kembali beberapa saat lagi.
          </p>

          {m.message !== "Aomi API sedang dalam maintenance. Silakan coba lagi nanti." && (
            <div className="mt-4 rounded-lg bg-card-soft px-4 py-3 text-sm">
              <span className="font-semibold text-ink">pesan admin: </span>
              <span role="status" className="text-ink-muted">{m.message}</span>
            </div>
          )}

          <dl className="mt-5 space-y-2 font-code text-xs text-ink-muted">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
              <dt>Status</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-danger">
                <Clock size={12} aria-hidden="true" /> Maintenance aktif
              </dd>
            </div>
            {etaWib && (
              <div className="flex items-center justify-between gap-3 border-b border-line pb-2">
                <dt>Estimasi selesai</dt>
                <dd className="font-semibold text-ink">{etaWib} WIB</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <dt>Semua endpoint publik</dt>
              <dd className="font-semibold text-ink">HTTP 503 · MAINTENANCE_MODE</dd>
            </div>
          </dl>

          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-onprimary transition-all hover:bg-primary-soft active:scale-[0.98]"
          >
            <RefreshCw size={15} aria-hidden="true" /> Coba lagi
          </a>
        </div>

        <p className="mt-5 text-center text-xs text-ink-faint">
          Layanan akan kembali otomatis setelah maintenance selesai. Terima
          kasih atas kesabarannya.
        </p>
      </div>
    </main>
  );
}
