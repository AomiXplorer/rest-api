import Link from "next/link";
import {
  Wand2,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  MessageCircle,
  Pencil,
  Plus,
  Zap,
} from "lucide-react";
import { CATEGORIES, ENDPOINTS } from "@/config/endpoints";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonViewer } from "@/components/ui/JsonViewer";
import { StatusWidget, LiveStatusTile } from "@/components/home/StatusWidget";
import { CyronimeMark } from "@/components/brand/CyronimeLogo";
import { OWNER_NUMBER, OWNER_WHATSAPP, SITE_URL } from "@/lib/constants";

const sampleRequest = `curl "${SITE_URL}/api/v1/s/youtube?query=lathi"`;

const sampleResponse = {
  success: true,
  author: "RendyZ",
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

/* Ilustrasi hero orisinal: buku terbuka, pensil menggambar jalur request, doodle */
function HeroDoodle() {
  return (
    <svg
      viewBox="0 0 340 260"
      width="320"
      height="245"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-[340px] text-ink"
    >
      {/* bayangan meja */}
      <ellipse cx="170" cy="238" rx="120" ry="10" fill="var(--c-line)" />

      {/* buku catatan terbuka */}
      <path
        d="M170 52 C140 38 96 38 56 50 L56 206 C96 194 140 194 170 208 Z"
        fill="#FFFDF6" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"
      />
      <path
        d="M170 52 C200 38 244 38 284 50 L284 206 C244 194 200 194 170 208 Z"
        fill="#FFF8E8" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"
      />
      {/* garis tulis halaman kiri */}
      <line x1="78" y1="86" x2="150" y2="80" stroke="#C9B98C" strokeWidth="4" strokeLinecap="round" />
      <line x1="78" y1="110" x2="150" y2="104" stroke="#C9B98C" strokeWidth="4" strokeLinecap="round" />
      <line x1="78" y1="134" x2="128" y2="130" stroke="#C9B98C" strokeWidth="4" strokeLinecap="round" />
      {/* simbol kode di halaman kiri */}
      <path d="M112 156 L96 170 L112 184" stroke="#277C82" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M124 156 L140 170 L124 184" stroke="#277C82" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* catatan GET di halaman kanan */}
      <g transform="rotate(-3 215 100)">
        <rect x="184" y="78" width="66" height="44" rx="4" fill="#F6DF83" stroke="currentColor" strokeWidth="4" />
        <text x="217" y="107" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="17" fontWeight="600" fill="#3A3222">GET</text>
      </g>
      {/* jalur request bergaris */}
      <path
        d="M240 148 C252 156 252 172 238 176 C222 180 214 168 220 158"
        stroke="#277C82" strokeWidth="4" strokeLinecap="round" strokeDasharray="7 8" fill="none"
      />
      <line x1="192" y1="132" x2="232" y2="146" stroke="#277C82" strokeWidth="4" strokeLinecap="round" strokeDasharray="7 8" />

      {/* pensil di atas */}
      <g transform="rotate(38 258 74)">
        <rect x="248" y="34" width="20" height="86" rx="6" fill="#F6DF83" stroke="currentColor" strokeWidth="4" />
        <path d="M248 120 L268 120 L258 138 Z" fill="#F2D7A0" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M252 130 L264 130 L258 140 Z" fill="#243247" />
        <rect x="252" y="44" width="12" height="10" rx="3" fill="#CDE5F2" stroke="currentColor" strokeWidth="3" />
      </g>

      {/* doodle: kilau */}
      <path d="M36 26 L39 33 L46 36 L39 39 L36 46 L33 39 L26 36 L33 33 Z" fill="#F6DF83" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M308 18 L310 23 L315 25 L310 27 L308 32 L306 27 L301 25 L306 23 Z" fill="#CDE5F2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      {/* doodle: petir */}
      <path d="M312 96 L300 118 L310 118 L304 136 L322 112 L312 112 Z" fill="#E4D9F3" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      {/* doodle: panah melengkung kecil */}
      <path d="M28 190 C44 178 62 178 76 190" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M70 184 L78 191 L68 195" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* doodle: bintang kecil */}
      <path d="M300 176 L302 181 L307 183 L302 185 L300 190 L298 185 L293 183 L298 181 Z" fill="#D5EBD9" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  const total = ENDPOINTS.length;
  const cats = CATEGORIES.length;

  return (
    <section className="relative z-10 px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.15fr,1fr]">
        <div>
          <p className="inline-flex items-center gap-2 font-hand text-2xl text-primary">
            <Pencil size={18} /> buku catatan API-mu
          </p>

          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Semua tools favoritmu,
            <br />
            dalam <span className="text-primary">satu API</span>.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Jelajahi {total} endpoint untuk AI, downloader, pencarian, anime, primbon, dan
            kebutuhan digital lainnya. Tinggal buka halaman, isi parameter, tekan GET — tanpa
            API key, tanpa login.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/tools"
              className="press inline-flex items-center gap-2 rounded-xl border-2 border-line-strong bg-lemon px-5 py-2.5 font-display text-sm font-bold text-ink shadow-hard"
            >
              <Wand2 size={15} /> Aomi Tools
            </Link>
            <Link
              href="/docs"
              className="press inline-flex items-center gap-2 rounded-xl border-2 border-line-strong bg-primary px-5 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard"
            >
              <BookOpen size={15} /> Buka Dokumentasi
            </Link>
            <Link
              href="/docs?focus=1"
              className="press inline-flex items-center gap-2 rounded-xl border-2 border-line-strong bg-card px-4 py-2.5 font-display text-sm font-bold text-ink shadow-hard-sm"
            >
              <Zap size={14} className="text-primary" /> Coba API
            </Link>
          </div>
        </div>

        <HeroDoodle />
      </div>

      {/* Statistik: sticky notes dengan selotip */}
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <div className="relative -rotate-1 rounded-sm border-2 border-line-strong bg-sticky p-4 pt-5 shadow-note">
          <div className="tape" />
          <p className="font-hand text-4xl font-semibold leading-none text-sticky-ink">{total}</p>
          <p className="mt-1.5 font-code text-xs font-semibold text-sticky-ink/70">Endpoint</p>
        </div>
        <div className="relative rotate-1 rounded-sm border-2 border-line-strong bg-sky p-4 pt-5 shadow-note">
          <div className="tape" />
          <p className="font-hand text-4xl font-semibold leading-none text-ink">{cats}</p>
          <p className="mt-1.5 font-code text-xs font-semibold text-ink/70">Kategori</p>
        </div>
        <div className="relative -rotate-1 rounded-sm border-2 border-line-strong bg-lav p-4 pt-5 shadow-note">
          <div className="tape" />
          <p className="font-hand text-4xl font-semibold leading-none text-ink">GET</p>
          <p className="mt-1.5 font-code text-xs font-semibold text-ink/70">Metode HTTP</p>
        </div>
        <div className="relative rotate-1 rounded-sm border-2 border-line-strong bg-mintp p-4 pt-5 shadow-note">
          <div className="tape" />
          <LiveStatusTile />
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-5xl">
        <StatusWidget />
      </div>
    </section>
  );
}

function MarqueeRow() {
  const items = ["Tanpa API Key", "Tanpa Login", "Tanpa Ribet", "Coba Langsung", "Gratis"];
  return (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span
          key={t}
          className="mx-4 flex items-center gap-2 whitespace-nowrap font-hand text-lg text-ink-muted"
        >
          <Pencil size={12} className={i % 2 ? "text-primary" : "text-lemon"} /> {t}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="relative z-10 overflow-hidden border-y-2 border-dashed border-line-strong bg-card/70 py-2.5">
      <div className="animate-marquee flex w-max">
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </div>
  );
}

export function SampleCode() {
  return (
    <section className="relative z-10 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
          <CyronimeMark size={26} className="text-ink" /> Contoh halaman buku
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Satu request sederhana, response JSON langsung jadi — beginilah isi catatannya.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <span className="font-hand text-xl text-ink-faint">contoh request</span>
          <CopyButton text={sampleRequest} label="Salin" />
        </div>
        <pre className="mt-2 overflow-x-auto rounded-xl border-2 border-line-strong bg-code p-4 font-code text-[13px] leading-relaxed text-code-text">
          {sampleRequest}
        </pre>
        <p className="mt-5 font-hand text-xl text-ink-faint">contoh response</p>
        <div className="mt-2 overflow-hidden rounded-xl border-2 border-line-strong">
          <JsonViewer value={sampleResponse} />
        </div>
      </div>
    </section>
  );
}

/* Warna stempel per kategori — konsisten, bukan acak */
const CAT_STAMPS = new Map([
  ["ai", "bg-lav"], ["anime", "bg-sky"], ["canvas", "bg-sticky"], ["downloader", "bg-mintp"],
]);

export function CategoryGrid() {
  const counts = new Map<string, number>();
  for (const e of ENDPOINTS) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);

  return (
    <section id="kategori" className="relative z-10 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Daftar Endpoint
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
          {CATEGORIES.length} kategori, ditulis rapi seperti indeks buku. Pilih salah satu untuk
          membuka dokumentasinya.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              href={`/docs?cat=${c.key}`}
              className={`press group rounded-xl border-2 border-line-strong bg-card p-4 shadow-note hover:border-primary ${
                i % 3 === 1 ? "sm:rotate-[0.4deg]" : i % 3 === 2 ? "sm:-rotate-[0.4deg]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-ink">{c.title}</h3>
                <span
                  className={`shrink-0 rounded-md border-2 border-line-strong px-2 py-0.5 font-code text-xs font-bold text-ink ${CAT_STAMPS.get(c.key) ?? "bg-sky"}`}
                >
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
    "Buka Dokumentasi, pilih endpoint, isi parameter, klik Kirim Request untuk melihat hasil langsung. Untuk dipakai di aplikasi, cukup panggil URL endpoint dengan parameter yang sama.",
  ],
  [
    "Kalau hasilnya error?",
    "Setiap response error menyertakan kode dan pesan yang jelas. Endpoint yang bergantung ke sumber eksternal bisa gagal kalau sumbernya sedang down atau membatasi request. Status HTTP yang dikembalikan selalu sesuai kondisi nyata.",
  ],
];

export function Faq() {
  return (
    <section className="relative z-10 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          Sering ditanyakan
        </h2>
        <div className="mt-5 overflow-hidden rounded-xl border-2 border-line-strong bg-card shadow-note">
          {FAQS.map(([q, a], i) => (
            <details key={q} className={`group px-5 ${i > 0 ? "border-t-2 border-dashed border-line" : ""}`}>
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
    <section className="relative z-10 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-xl border-2 border-dashed border-line-strong bg-card-soft p-6 sm:p-8">
        <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Tinggal coba.</h2>
        <p className="mt-2 max-w-lg text-sm text-ink-muted">
          Pilih endpoint, isi parameter, klik Kirim Request. Selesai — seperti mencatat, tapi
          hasilnya langsung jalan.
        </p>
        <Link
          href="/docs"
          className="press mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-line-strong bg-primary px-4 py-2.5 font-display text-sm font-bold text-onprimary shadow-hard"
        >
          Ke daftar API <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}

export function ContactNote() {
  return (
    <section className="relative z-10 px-5 pb-14 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="relative mx-auto w-full max-w-md -rotate-1 rounded-sm border-2 border-line-strong bg-sticky p-5 shadow-note">
          <div className="tape-left" />
          <p className="font-hand text-2xl leading-snug text-sticky-ink">
            Ada pertanyaan atau request endpoint baru? Chat owner langsung ↓
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
