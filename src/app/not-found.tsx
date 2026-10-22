import Link from "next/link";
import { House } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {/* Maskot — artwork monokrom asli */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/mascot/mascot-original.jpg"
        alt="Maskot Cyronime"
        className="w-40 rounded-xl border border-line sm:w-52"
      />
      <p className="mt-8 font-code text-sm font-semibold text-ink-faint">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Alamat yang kamu tuju tidak ada, atau sudah dipindahkan. Coba mulai dari beranda.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-onprimary transition-all hover:bg-primary-soft active:scale-[0.98]"
      >
        <House size={15} /> Kembali ke beranda
      </Link>
    </main>
  );
}
