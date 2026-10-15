import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, MessageCircle, Plus, Star } from "lucide-react";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { VERIFIED_IDS } from "@/config/verification";
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

export function Hero() {
  const total = ENDPOINTS.length;
  const cats = CATEGORIES.length;
  const verified = VERIFIED_IDS.length;

  return (
    <section className="px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center gap-2 font-code text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          catatan API · gratis · tanpa login
        </p>

        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          <span className="-rotate-1 inline-block rounded-lg bg-sky px-2">Aomi</span> Still Learning
        </h1>

        <p className="mt-4 font-display text-lg font-bold text-ink sm:text-xl">
          API gratis, kok pakek{" "}
          <span className="-rotate-1 inline-block rounded-md border-2 border-dashed border-line-strong bg-lav px-2 py-0.5">
            API key?
          </span>
        </p>

        <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
          Koleksi {total} endpoint publik dalam {cats} kategori — AI, downloader media, search
          engine, anime, primbon, sampai tools harian. Semua lewat proxy yang tervalidasi, dengan
          error handling dan rate limiting.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-primary px-2.5 py-1 font-code text-xs font-bold text-primary">
            <Check size={13} /> NO API KEY
          </span>
          <StatusWidget />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="press inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-white shadow-hard-sm"
          >
            Buka Dokumentasi <ArrowRight size={15} />
          </Link>
          <a
            href={OWNER_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-sticky px-4 py-2.5 font-display text-sm font-bold text-sticky-ink shadow-hard-sm"
          >
            <MessageCircle size={15} /> Saluran WhatsApp
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border-2 border-line-strong bg-sticky p-4 shadow-note">
            <p className="font-display text-2xl font-extrabold text-sticky-ink">GET</p>
            <p className="mt-1 font-code text-xs text-sticky-ink/70">Method</p>
          </div>
          <div className="rounded-xl border-2 border-line-strong bg-sky p-4 shadow-note">
            <p className="font-display text-2xl font-extrabold text-ink">{total}</p>
            <p className="mt-1 font-code text-xs text-ink-muted">Endpoints</p>
          </div>
          <div className="rounded-xl border-2 border-line-strong bg-lav p-4 shadow-note">
            <p className="font-display text-2xl font-extrabold text-ink">{cats}</p>
            <p className="mt-1 font-code text-xs text-ink-muted">Kategori</p>
          </div>
          <div className="rounded-xl border-2 border-line-strong bg-mintp p-4 shadow-note">
            <p className="font-display text-2xl font-extrabold text-ink">{verified}</p>
            <p className="mt-1 font-code text-xs text-ink-muted">Terverifikasi</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const MARQUEE = ["Gratis", "No API Key", "Tanpa Login", "Tanpa Ribet", "Coba Langsung"];

function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center">
      {MARQUEE.map((t) => (
        <span
          key={t}
          className="mx-4 flex items-center gap-2 whitespace-nowrap font-display text-sm font-bold text-ink-muted"
        >
          <Star size={13} className="fill-lemon text-lemon" /> {t}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-y-2 border-dashed border-line bg-surface/70 py-3">
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-code text-xs font-semibold text-ink-faint">contoh request</span>
          <CopyButton text={sampleRequest} label="Salin" />
        </div>
        <pre className="mt-2 overflow-x-auto rounded-xl border-2 border-line-strong bg-code p-4 font-code text-[13px] leading-relaxed text-code-text">
          {sampleRequest}
        </pre>
        <p className="mt-5 font-code text-xs font-semibold text-ink-faint">contoh response</p>
        <div className="mt-2 overflow-hidden rounded-xl border-2 border-line-strong">
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
        <p className="mt-1.5 max-w-2xl text-ink-muted">
          Pilih kategori, buka endpoint, isi parameter, klik Kirim Request. Hasilnya langsung
          muncul dari backend nyata.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/docs?cat=${c.key}`}
              className="press group rounded-xl border-2 border-line-strong bg-card p-4 shadow-note hover:bg-card-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-ink">{c.title}</h3>
                <span className="shrink-0 rounded-md bg-sky px-2 py-0.5 font-code text-xs font-bold text-ink">
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
        <div className="mt-5 overflow-hidden rounded-xl border-2 border-line-strong bg-card shadow-note">
          {FAQS.map(([q, a], i) => (
            <details key={q} className={`group px-5 ${i > 0 ? "border-t border-dashed border-line" : ""}`}>
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
      <div className="mx-auto max-w-5xl rounded-xl border-2 border-dashed border-line-strong bg-card-soft p-6 shadow-note sm:p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Tinggal coba.</h2>
        <p className="mt-2 max-w-lg text-ink-muted">
          Pilih endpoint, isi parameter, klik Kirim Request. Selesai.
        </p>
        <Link
          href="/docs"
          className="press mt-5 inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-white shadow-hard-sm"
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
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto w-full max-w-md -rotate-1 rounded-sm border-2 border-sticky-ink/20 bg-sticky p-5 shadow-note">
          <p className="font-hand text-2xl leading-snug text-sticky-ink">
            Ada pertanyaan atau request endpoint? Chat owner langsung ↓
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={OWNER_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center gap-2 rounded-lg border-2 border-line-strong bg-wa px-3.5 py-2 font-display text-sm font-bold text-white shadow-hard-sm"
            >
              <MessageCircle size={15} /> {OWNER_NUMBER}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
