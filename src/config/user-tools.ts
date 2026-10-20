/**
 * Registry "Aomi Tools" — dashboard pengguna biasa (bukan developer).
 * Setiap tool dipetakan ke endpoint backend nyata /api/v1/*.
 * Hanya fitur yang terverifikasi sehat yang didaftarkan di sini.
 */

export type ToolParam = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "url" | "email" | "number" | "textarea";
  required?: boolean;
};

export type ToolKind = "auto" | "chat" | "am-manual" | "tempmail";

/** Halaman penggunaan khusus (bukan form generik) — lihat src/app/tools/[slug]/page.tsx */
export type ToolPage = "tiktok" | "ai" | "anime" | "alight-motion";

export type UserTool = {
  slug: string;
  name: string;
  desc: string;
  category: string;
  icon: string; // kunci ikon lucide
  endpoint: string; // path /api/v1/... (tanpa base)
  params: ToolParam[];
  kind?: ToolKind;
  page?: ToolPage;
  note?: string; // catatan jujur utk pengguna
};

export const TOOL_CATEGORIES: { key: string; title: string; icon: string; blurb: string }[] = [
  { key: "downloader", title: "Downloader", icon: "download", blurb: "Simpan video & musik dari tautan" },
  { key: "ai", title: "AI", icon: "sparkles", blurb: "Ngobrol dan minta bantuan AI" },
  { key: "anime", title: "Anime & Manga", icon: "book", blurb: "Cari manga dan kutipan anime" },
  { key: "alightmotion", title: "Alight Motion", icon: "wand", blurb: "Generator akun Pro" },
  { key: "primbon", title: "Primbon", icon: "moon", blurb: "Arti nama, mimpi, zodiak, weton" },
  { key: "info", title: "Info & Berita", icon: "newspaper", blurb: "Cuaca, gempa, jadwal TV, kabar" },
  { key: "utility", title: "Utilitas", icon: "wrench", blurb: "Email sementara, TTS, penelusuran" },
  { key: "random", title: "Gambar Acak", icon: "image", blurb: "Foto lucu & menyenangkan" },
];

export const USER_TOOLS: UserTool[] = [
  // ===== Downloader =====
  { slug: "tiktok", name: "TikTok Downloader", desc: "Unduh video TikTok tanpa watermark dari tautannya.", category: "downloader", icon: "music", endpoint: "/api/v1/d/tiktok", page: "tiktok",
    params: [{ name: "url", label: "Tautan video TikTok", type: "url", required: true, placeholder: "https://vt.tiktok.com/..." }] },
  { slug: "ytmp3", name: "YouTube ke MP3", desc: "Ambil audio (MP3) dari video YouTube.", category: "downloader", icon: "music", endpoint: "/api/v1/d/ytmp3",
    params: [{ name: "url", label: "Tautan video YouTube", type: "url", required: true, placeholder: "https://youtu.be/..." }] },
  { slug: "ytmp4", name: "YouTube ke MP4", desc: "Unduh video YouTube dalam format MP4.", category: "downloader", icon: "video", endpoint: "/api/v1/d/ytmp4",
    params: [{ name: "url", label: "Tautan video YouTube", type: "url", required: true, placeholder: "https://youtu.be/..." }] },
  { slug: "instagram", name: "Instagram Downloader", desc: "Simpan foto atau video dari postingan Instagram.", category: "downloader", icon: "camera", endpoint: "/api/v1/d/igram",
    params: [{ name: "url", label: "Tautan postingan Instagram", type: "url", required: true, placeholder: "https://www.instagram.com/reel/..." }] },
  { slug: "facebook", name: "Facebook Downloader", desc: "Unduh video dari tautan Facebook.", category: "downloader", icon: "video", endpoint: "/api/v1/d/facebook",
    params: [{ name: "url", label: "Tautan video Facebook", type: "url", required: true, placeholder: "https://www.facebook.com/..." }] },
  { slug: "twitter", name: "X (Twitter) Downloader", desc: "Simpan video dari tweet lewat tautannya.", category: "downloader", icon: "twitter", endpoint: "/api/v1/d/ssstwiter",
    params: [{ name: "url", label: "Tautan tweet", type: "url", required: true, placeholder: "https://x.com/i/status/..." }] },
  { slug: "aio", name: "All-in-One Downloader", desc: "Tempel tautan dari berbagai platform, sistem memilih caranya otomatis.", category: "downloader", icon: "download", endpoint: "/api/v1/d/aio",
    params: [{ name: "url", label: "Tautan media (apa saja)", type: "url", required: true, placeholder: "https://..." }] },

  // ===== AI =====
  { slug: "ai-chat", name: "AI Chat", desc: "Ngobrol dengan AI. Tanya apa saja, dari tugas sampai ide konten.", category: "ai", icon: "sparkles", endpoint: "/api/v1/ai/qwq32b", kind: "chat", page: "ai",
    params: [] },

  // ===== Anime & Manga =====
  { slug: "anime", name: "Jelajahi Anime", desc: "Cari anime, lihat info lengkap dan daftar episode langsung dari sumbernya.", category: "anime", icon: "tv", endpoint: "/api/v1/anime/otakudesu/ongoing", page: "anime", params: [] },
  { slug: "manga-search", name: "Cari Manga", desc: "Cari judul manga lengkap dengan sinopsis dan sampul.", category: "anime", icon: "book", endpoint: "/api/v1/manga/mangadex-search",
    params: [{ name: "judul", label: "Judul manga", required: true, placeholder: "one piece" }] },
  { slug: "manga-chapters", name: "Daftar Chapter", desc: "Lihat daftar chapter sebuah manga (pakai ID dari hasil pencarian).", category: "anime", icon: "list", endpoint: "/api/v1/manga/mangadex-chapters",
    params: [{ name: "id", label: "ID manga", required: true, placeholder: "a1c7c817-4e59-43b7-9365-09675a149a6f" }, { name: "lang", label: "Bahasa", placeholder: "id" }] },

  // ===== Alight Motion =====
  { slug: "am-gen", name: "AM Pro Generator (Otomatis)", desc: "Buat akun Alight Motion Pro baru secara otomatis. Proses ±30-60 detik.", category: "alightmotion", icon: "wand", endpoint: "/api/v1/tools/am-gen", page: "alight-motion",
    params: [], note: "Tinggal tekan Generate — email sementara dan verifikasi ditangani sistem." },
  { slug: "am-manual", name: "AM Pro (Email Sendiri)", desc: "Pakai email milikmu: kirim link verifikasi, buka emailmu, tempel linknya di sini.", category: "alightmotion", icon: "mail", endpoint: "/api/v1/tools/am-send", kind: "am-manual", page: "alight-motion",
    params: [] },

  // ===== Primbon =====
  { slug: "arti-nama", name: "Arti Nama", desc: "Ketahui arti dan karakter dari sebuah nama.", category: "primbon", icon: "moon", endpoint: "/api/v1/primbon/artinama",
    params: [{ name: "nama", label: "Nama", required: true, placeholder: "putu" }] },
  { slug: "nomor-hoki", name: "Nomor Hoki", desc: "Ramalan angka keberuntungan dari nomor HP.", category: "primbon", icon: "moon", endpoint: "/api/v1/primbon/nomorhoki",
    params: [{ name: "phoneNumber", label: "Nomor HP", required: true, placeholder: "6285658939117" }] },
  { slug: "rejeki-weton", name: "Rejeki & Weton", desc: "Ramalan rejeki harian berdasarkan tanggal lahir.", category: "primbon", icon: "moon", endpoint: "/api/v1/primbon/rejeki_hoki_weton",
    params: [
      { name: "tgl", label: "Tanggal lahir", type: "number", required: true, placeholder: "1" },
      { name: "bln", label: "Bulan lahir", type: "number", required: true, placeholder: "1" },
      { name: "thn", label: "Tahun lahir", type: "number", required: true, placeholder: "2005" },
    ] },
  { slug: "zodiak", name: "Ramalan Zodiak", desc: "Ramalan harian sesuai zodiakmu.", category: "primbon", icon: "moon", endpoint: "/api/v1/primbon/zodiak",
    params: [{ name: "zodiak", label: "Zodiak", required: true, placeholder: "gemini" }] },
  { slug: "tafsir-mimpi", name: "Tafsir Mimpi", desc: "Cari arti mimpi yang kamu alami.", category: "primbon", icon: "moon", endpoint: "/api/v1/primbon/tafsirmimpi",
    params: [{ name: "mimpi", label: "Kata kunci mimpi", required: true, placeholder: "bertemu" }] },

  // ===== Info & Berita =====
  { slug: "cuaca", name: "Cek Cuaca", desc: "Prakiraan cuaca kota di Indonesia.", category: "info", icon: "cloud", endpoint: "/api/v1/info/cuaca",
    params: [{ name: "q", label: "Nama kota/daerah", required: true, placeholder: "pasiran jaya" }] },
  { slug: "gempa", name: "Info Gempa Terkini", desc: "Daftar gempa terbaru dari BMKG.", category: "info", icon: "activity", endpoint: "/api/v1/info/bmkg", params: [] },
  { slug: "jadwal-tv", name: "Jadwal TV", desc: "Jadwal acara TV hari ini sesuai stasiun.", category: "info", icon: "tv", endpoint: "/api/v1/info/jadwaltv",
    params: [{ name: "channel", label: "Stasiun TV", required: true, placeholder: "sctv" }] },
  { slug: "berita", name: "Berita Terkini", desc: "Kabar terbaru dari Kompas.", category: "info", icon: "newspaper", endpoint: "/api/v1/berita/kompas", params: [] },

  // ===== Utilitas =====
  { slug: "tempmail", name: "Email Sementara", desc: "Buat email temporer, lalu baca inboxnya di sini.", category: "utility", icon: "mail", endpoint: "/api/v1/tools/tempmail", kind: "tempmail", params: [] },
  { slug: "tts", name: "Text ke Suara", desc: "Ubah tulisan menjadi suara yang bisa diputar.", category: "utility", icon: "mic", endpoint: "/api/v1/tools/text-to-speech",
    params: [{ name: "text", label: "Teks", type: "textarea", required: true, placeholder: "selamat datang di aomi api" }] },
  { slug: "cari-youtube", name: "Cari di YouTube", desc: "Cari video YouTube dan lihat hasilnya.", category: "utility", icon: "youtube", endpoint: "/api/v1/s/youtube",
    params: [{ name: "query", label: "Kata kunci", required: true, placeholder: "sc bot" }] },
  { slug: "playstore", name: "Cari Aplikasi Play Store", desc: "Cari aplikasi Android lengkap dengan rating dan developernya.", category: "utility", icon: "smartphone", endpoint: "/api/v1/tools/playstore-search",
    params: [{ name: "q", label: "Nama aplikasi", required: true, placeholder: "whatsapp" }] },
  { slug: "github-stalk", name: "Lihat Profil GitHub", desc: "Lihat statistik akun GitHub: repo, follower, dan lainnya.", category: "utility", icon: "github", endpoint: "/api/v1/stalk/github",
    params: [{ name: "user", label: "Username GitHub", required: true, placeholder: "octocat" }] },
  { slug: "subdomain", name: "Pencari Subdomain", desc: "Temukan subdomain dari sebuah website.", category: "utility", icon: "search", endpoint: "/api/v1/tools/subdomains",
    params: [{ name: "subdomain finder", label: "Domain", required: true, placeholder: "example.com" }] },
  { slug: "pagespeed", name: "Tes Kecepatan Website", desc: "Ukur skor performa sebuah halaman web.", category: "utility", icon: "gauge", endpoint: "/api/v1/tools/pagespeed",
    params: [{ name: "url", label: "Tautan website", type: "url", required: true, placeholder: "https://cyronime.my.id" }] },

  // ===== Gambar Acak =====
  { slug: "kucing", name: "Foto Kucing Acak", desc: "Satu klik, satu foto kucing untuk memperbaiki hari.", category: "random", icon: "image", endpoint: "/api/v1/r/cats", params: [] },
  { slug: "neko", name: "Gambar Neko Acak", desc: "Ilustrasi neko anime pilihan acak.", category: "random", icon: "image", endpoint: "/api/v1/r/neko", params: [] },
];

export function getTool(slug: string): UserTool | undefined {
  return USER_TOOLS.find((t) => t.slug === slug);
}
