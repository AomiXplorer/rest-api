import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gift,
  KeyRound,
  MessageCircle,
  Play,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonViewer } from "@/components/ui/JsonViewer";
import { StatusWidget } from "@/components/home/StatusWidget";
import { OWNER_NUMBER, OWNER_WHATSAPP, SITE_URL } from "@/lib/constants";

const sampleRequest = `curl "${SITE_URL}/api/v1/s/youtube?query=lathi"`;

const sampleResponse = {
  success: true,
  data: [
    {
      title: "Weird Genius - Lathi (ft. Sara Fajira) ...",
      url: "https://youtube.com/watch?v=8uy7G2JXVSA",
      image: "https://i.ytimg.com/vi/8uy7G2JXVSA/hq720.jpg",
    },
  ],
  message: "Request berhasil",
  meta: { upstream_status: 200, time_ms: 812 },
};

const FEATURES = [
  { icon: ShieldCheck, label: "Tanpa Login" },
  { icon: KeyRound, label: "Tanpa API Key" },
  { icon: Gift, label: "Gratis 100%" },
];

export function Hero() {
  const total = ENDPOINTS.length;

  const stats = [
    { value: `${total}`, label: "Endpoints" },
    { value: `${CATEGORIES.length}`, label: "Kategori" },
    { value: "100%", label: "Gratis" },
    { value: "24/7", label: "Akses" },
  ];

  return (
    <section className="px-5 pb-10 pt-10 sm:px-8 lg:px-12 lg:pt-16">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-card px-3 py-1 font-code text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Free &amp; Easy to Use
        </p>

        <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
          Aomi <span className="text-primary">API</span>
          <br />
          Free &amp; Easy to Use
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          {total} endpoint publik dalam {CATEGORIES.length} kategori — AI, downloader, search,
          anime, primbon, sampai tools harian. Tinggal panggil dari aplikasi kamu, tanpa
          registrasi, tanpa API key.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Link
            href="/docs"
            className="press inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm"
          >
            Lihat Dokumentasi <ArrowRight size={15} />
          </Link>
          <Link
            href="/docs?focus=1"
            className="press inline-flex items-center gap-2 rounded-xl border-2 border-line-strong bg-card px-4 py-2.5 font-display text-sm font-bold text-ink"
          >
            <Play size={14} className="text-primary" /> Coba API
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-3 py-1 font-code text-xs font-semibold text-ink-muted"
            >
              <f.icon size={13} className="text-primary" /> {f.label}
            </span>
          ))}
        </div>

        {/* Bar statistik */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border-2 border-line bg-line lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card px-5 py-4">
              <p className="font-display text-2xl font-extrabold text-ink">{s.value}</p>
              <p className="mt-0.5 font-code text-xs text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <StatusWidget />
        </div>
      </div>
    </section>
  );
}

function MarqueeRow() {
  const items = ["Gratis", "No API Key", "Tanpa Login", "Tanpa Ribet", "Coba Langsung"];
  return (
    <div className="flex shrink-0 items-center">
      {items.map((t) => (
        <span
          key={t}
          className="mx-4 flex items-center gap-2 whitespace-nowrap font-code text-xs font-semibold text-ink-faint"
        >
          <span className="h-1 w-1 rounded-full bg-primary" /> {t}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-y-2 border-line bg-surface py-3">
      <div className="animate-marquee flex w-max">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  );
}

export function SampleCode() {
  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Contoh Request
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Satu request sederhana, response JSON langsung jadi.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <span className="font-code text-xs font-semibold text-ink-faint">request</span>
          <CopyButton text={sampleRequest} label="Salin" />
        </div>
        <pre className="mt-2 overflow-x-auto rounded-xl border-2 border-line bg-code p-4 font-code text-[13px] leading-relaxed text-code-text">
          {sampleRequest}
        </pre>
        <p className="mt-5 font-code text-xs font-semibold text-ink-faint">response</p>
        <div className="mt-2 overflow-hidden rounded-xl border-2 border-line">
          <JsonViewer value={sampleResponse} />
        </div>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  const counts = new Map<string, number>();
  for (const e of ENDPOINTS) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);

  return (
    <section id="kategori" className="px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          API yang Tersedia
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
          Pilih kategori, buka endpoint, isi parameter, tekan GET untuk mencoba langsung.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/docs?cat=${c.key}`}
              className="press group rounded-2xl border-2 border-line bg-card p-4 shadow-note hover:border-primary/40 hover:bg-card-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-ink">{c.title}</h3>
                <span className="shrink-0 rounded-md bg-sky px-2 py-0.5 font-code text-xs font-bold text-primary">
                  {counts.get(c.key) ?? 0}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-muted">
                {c.description}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 font-code text-xs font-semibold text-primary">
                buka
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS: Array<[string, string]> = [
  [
    "Benar-benar gratis?",
    "Ya. Semua endpoint publik dan bisa dipakai tanpa biaya, tanpa kuota pembayaran. Ada rate limiting per IP supaya layanan tetap adil untuk semua orang.",
  ],
  [
    "Perlu daftar atau API key?",
    "Tidak. Tidak ada registrasi, tidak ada API key, tidak ada login. Cukup panggil /api/v1/... langsung dari aplikasi atau browser kamu.",
  ],
  [
    "Gimana cara pakainya?",
    "Buka Daftar API, pilih endpoint, isi parameter, klik Kirim Request untuk melihat hasil langsung di halaman dokumentasi. Untuk dipakai di aplikasi, cukup panggil URL endpoint lokal dengan parameter yang sama.",
  ],
  [
    "Kalau hasilnya error?",
    "Setiap response error menyertakan kode dan pesan yang jelas. Endpoint yang bergantung ke sumber eksternal bisa gagal kalau sumbernya sedang down atau membatasi request. Status HTTP yang dikembalikan selalu sesuai kondisi nyata.",
  ],
];

export function Faq() {
  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Sering ditanyakan
        </h2>
        <div className="mt-5 overflow-hidden rounded-2xl border-2 border-line bg-card shadow-note">
          {FAQS.map(([q, a], i) => (
            <details key={q} className={`group px-5 ${i > 0 ? "border-t border-line" : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-display text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <Plus size={16} className="shrink-0 text-primary transition-transform group-open:rotate-45" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-ink-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaCard() {
  return (
    <section className="px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-2xl border-2 border-line bg-card p-6 shadow-note sm:p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Tinggal coba.</h2>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Pilih endpoint, isi parameter, klik Kirim Request. Selesai.
        </p>
        <Link
          href="/docs"
          className="press mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard-sm"
        >
          Ke daftar API <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}

export function ContactNote() {
  return (
    <section className="px-5 pb-14 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-2xl border-2 border-line bg-card p-6 shadow-note sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-ink">
          Ada pertanyaan atau request endpoint?
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">Chat owner langsung, biasanya fast respon.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <a
            href={OWNER_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-2 rounded-xl bg-wa px-3.5 py-2.5 font-display text-sm font-bold text-white shadow-hard-sm"
          >
            <MessageCircle size={15} /> {OWNER_NUMBER}
          </a>
          <span className="inline-flex items-center gap-1.5 font-code text-xs text-ink-faint">
            <Check size={13} className="text-mint" /> gratis, tanpa syarat
          </span>
        </div>
      </div>
    </section>
  );
}
