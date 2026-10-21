import { RefreshCw, Wrench, Clock, NotebookPen } from "lucide-react";
import { getMaintenance } from "@/lib/server/maintenance";

export const dynamic = "force-dynamic";

/**
 * Halaman maintenance publik — Cartoon Book UI, dukungan terang/gelap
 * via design token, dirender server-side (tanpa hydration mismatch:
 * seluruh konten dari status maintenance di Redis).
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
    <main className="relative z-10 px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-xl">
        <div className="relative rounded-2xl border-2 border-line-strong bg-card p-6 shadow-note sm:p-8">
          <div className="tape" aria-hidden="true" />
          <div className="flex items-start gap-4">
            <span className="shrink-0 rounded-xl border-2 border-line-strong bg-sticky p-3 text-sticky-ink shadow-hard-sm">
              <Wrench size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="flex items-center gap-1.5 font-hand text-xl text-primary">
                <NotebookPen size={15} aria-hidden="true" /> catatan admin
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                {m.title}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Kami sedang melakukan pemeliharaan sistem untuk meningkatkan
            stabilitas dan kualitas layanan. Silakan kembali beberapa saat lagi.
          </p>

          {m.message !== "Aomi API sedang dalam maintenance. Silakan coba lagi nanti." && (
            <div className="mt-4 rounded-lg border-2 border-dashed border-line-strong bg-card-soft px-4 py-3 text-sm text-ink">
              <span className="font-hand text-lg text-lemon">pesan admin: </span>
              <span role="status" className="text-ink-muted">{m.message}</span>
            </div>
          )}

          <dl className="mt-5 space-y-2 font-code text-xs text-ink-muted">
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-2">
              <dt>Status</dt>
              <dd className="flex items-center gap-1.5 font-semibold text-danger">
                <Clock size={12} aria-hidden="true" /> Maintenance aktif
              </dd>
            </div>
            {etaWib && (
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-2">
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
            className="press mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm"
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
