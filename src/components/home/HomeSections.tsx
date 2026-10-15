import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { ArrowRight, BookOpen, ShieldCheck, Zap, Globe, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/ui/CopyButton";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { OWNER_WHATSAPP } from "@/components/layout/Navbar";

const sampleRequest = `curl "https://your-domain.vercel.app/api/v1/s/youtube?query=lathi"`;

const sampleResponse = `{
  "success": true,
  "data": [
    {
      "title": "Weird Genius - Lathi (ft. Sara Fajira) ...",
      "url": "https://youtube.com/watch?v=8uy7G2JXVSA",
      "image": "https://i.ytimg.com/vi/8uy7G2JXVSA/hq720.jpg"
    }
  ],
  "message": "Request berhasil",
  "meta": { "upstream_status": 200, "time_ms": 812 }
}`;

export function Hero() {
  return (
    <section className="bg-grid border-b-2 border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 pb-16 pt-16 md:flex-row md:items-center md:gap-12 md:pt-20">
        <div className="flex-1">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-card px-3 py-1 font-code text-xs text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-mint" />
            Gratis · Tanpa API Key · Tanpa Login
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            REST API untuk<br />
            apa saja yang kamu <span className="text-primary">butuhkan</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
            Aomi Still Learning menghubungkanmu ke {ENDPOINTS.length} endpoint publik dalam {CATEGORIES.length} kategori —
            AI, downloader media, search engine, anime, primbon, sampai tools harian.
            Semua lewat proxy yang tervalidasi, dengan error handling dan rate limiting.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="press inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-5 py-3 font-display font-bold text-[#140f00] shadow-hard"
            >
              <BookOpen size={17} /> Buka Dokumentasi
            </Link>
            <a
              href="/api/v1/r/quotesanime"
              className="press inline-flex items-center gap-2 rounded-md border-2 border-line-strong bg-card px-5 py-3 font-display font-bold text-ink shadow-hard"
            >
              <MousePointerClick size={17} className="text-lemon" /> Coba Sekarang
            </a>
          </div>
        </div>

        <div className="w-full shrink-0 md:w-[420px]">
          <div className="rounded-lg border-2 border-line-strong bg-card-soft p-4 shadow-hard">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-code text-xs text-ink-faint">contoh request</span>
              <CopyButton text={sampleRequest} />
            </div>
            <pre className="overflow-x-auto rounded-md border-2 border-line bg-[#120e24] p-3 font-code text-xs leading-relaxed text-mint">
              {sampleRequest}
            </pre>
            <p className="mt-3 mb-2 font-code text-xs text-ink-faint">contoh response</p>
            <pre className="max-h-48 overflow-auto rounded-md border-2 border-line bg-[#120e24] p-3 font-code text-xs leading-relaxed text-ink-muted">
              {sampleResponse}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsRow({ verifiedCount }: { verifiedCount: number }) {
  return (
    <section className="border-b-2 border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 md:grid-cols-4">
        {[
          { value: String(ENDPOINTS.length), label: "Total Endpoint" },
          { value: String(CATEGORIES.length), label: "Kategori" },
          { value: String(verifiedCount), label: "Terverifikasi" },
          { value: "GET", label: "Metode" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 border-r-2 border-line px-2 py-5 text-center last:border-r-0 md:border-r-2">
            <span className="font-display text-3xl font-extrabold text-lemon md:text-4xl">{s.value}</span>
            <span className="font-code text-[11px] uppercase tracking-wide text-ink-faint">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid() {
  const counts = new Map<string, number>();
  for (const e of ENDPOINTS) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">Kategori Endpoint</h2>
      <p className="mt-2 max-w-xl text-ink-muted">
        Semua kategori di bawah berasal dari inventaris nyata endpoint sumber. Klik untuk masuk ke dokumentasi.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/docs?cat=${c.key}`}
            className="press group rounded-lg border-2 border-line-strong bg-card p-5 shadow-hard-sm hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{c.title}</h3>
              <span className="rounded-md border-2 border-line bg-card-soft px-2 py-0.5 font-code text-xs text-lemon">
                {counts.get(c.key) ?? 0}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{c.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 font-code text-xs text-primary-soft opacity-0 transition-opacity group-hover:opacity-100">
              buka <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Fast & Konsisten",
      desc: "Proxy ringan dengan timeout per kategori dan response terstandardisasi (success/data/meta).",
    },
    {
      icon: ShieldCheck,
      title: "Aman",
      desc: "Validasi parameter dengan Zod, SSRF guard untuk parameter URL, dan rate limiting per IP.",
    },
    {
      icon: Globe,
      title: "Tanpa API Key",
      desc: "Semua endpoint sumber publik. Tidak perlu registrasi, cukup panggil lewat /api/v1.",
    },
    {
      icon: MousePointerClick,
      title: "Coba Langsung",
      desc: "Fitur Try API di dokumentasi mengirim request nyata ke backend — bukan contoh statis.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="font-display text-2xl font-extrabold md:text-3xl">Kenapa pakai Aomi Still Learning?</h2>
      <p className="mt-2 max-w-xl text-ink-muted">Satu pintu untuk ratusan endpoint, dengan pengalaman developer yang rapi.</p>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border-2 border-line bg-card-soft p-5">
            <f.icon size={22} className="text-primary" />
            <h3 className="mt-3 font-display text-base font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-primary bg-card px-6 py-12 text-center shadow-hard-primary md:py-14">
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Siap mencoba?</h2>
        <p className="max-w-md text-ink-muted">Buka daftar endpoint, isi parameter, dan lihat hasilnya saat itu juga.</p>
        <Link
          href="/docs"
          className="press mt-2 inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-5 py-3 font-display font-bold text-[#140f00] shadow-hard"
        >
          Buka Docs <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="kontak" className="mx-auto max-w-6xl px-4 pt-14">
      <div className="flex flex-col items-center gap-5 rounded-lg border-2 border-line-strong bg-card-soft px-6 py-12 text-center shadow-hard md:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-wa bg-wa/10 text-wa shadow-hard-sm">
          <WhatsAppIcon size={28} />
        </span>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">Kontak Owner</h2>
        <p className="max-w-md text-ink-muted">
          Ada pertanyaan, request endpoint, atau mau kolaborasi? Hubungi owner langsung lewat WhatsApp.
        </p>
        <div className="font-code text-lg font-bold tracking-wide text-ink">+62 812-4957-8370</div>
        <a
          href={`https://wa.me/${OWNER_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press mt-1 inline-flex items-center gap-2 rounded-md border-2 border-wa bg-wa px-5 py-3 font-display font-bold text-[#04331d] shadow-hard"
        >
          <WhatsAppIcon size={18} /> Chat via WhatsApp
        </a>
      </div>
    </section>
  );
}
