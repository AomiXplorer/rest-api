# Aomi API — Design System (Cartoon Book UI)

Dokumen ini adalah sumber kebenaran desain Aomi API. Metodologi audit dan
prioritas mengikuti UI/UX Pro Max (accessibility → touch → performance →
style → layout → typography/color → animation → forms → navigation).

Prinsip: **Less but better.** Setiap elemen punya alasan; dekorasi tidak boleh
mengalahkan keterbacaan; identitas buku catatan dipertahankan tanpa membabi
buta.

## 1. Konsep visual

| Aspek | Keputusan |
|---|---|
| Style | Cartoon Book / editorial notebook — kertas bergaris, sticky note, selotip, ilustrasi orisinal (buku + pensil) |
| Karakter | Editorial, terstruktur, ramah, tidak kaku |
| Larangan | Gradient dekoratif, glassmorphism, glow neon, kartu dalam kartu, border tebal di semua komponen, emoji sebagai ikon |
| Sumber token | `src/app/globals.css` (`--c-*` + `@theme`) — satu-satunya tempat nilai warna hidup |

## 2. Color system

Terang (default) dan gelap memakai struktur visual identik; hanya token yang
berubah. Kontras diukur (WCAG AA, teks ≥ 4.5:1; placeholder ≥ 3:1).

| Token | Light | Dark | Peran |
|---|---|---|---|
| `--c-bg` | #FFF9ED | #151923 | Kertas ivory / navy gelap |
| `--c-surface` | #F6EEDD | #1C2230 | Paper dalam (thead, zona sekunder) |
| `--c-card` | #FFFCF5 | #1E2532 | Kartu & header |
| `--c-card-soft` | #FFF6E8 | #242C3C | Kartu hover / panel parameter |
| `--c-ink` | #202B40 | #F4EBDD | Teks utama (13.5:1 / 14.9:1) |
| `--c-ink-muted` | #64666C | #B5B6BD | Teks sekunder (5.5:1 / 8.7:1) |
| `--c-ink-faint` | #7D7A74 | #8B8E96 | Placeholder/label tersier (4.2:1 / 4.7:1) |
| `--c-primary` | #287F80 | #57C5C4 | Aksen teal — CTA, fokus, link aktif |
| `--c-onprimary` | #FFFFFF | #15252D | Teks di atas primary (4.7:1 / 7.6:1) |
| `--c-line` | #EDE5D4 | #252B36 | Garis buku & border halus |
| `--c-line-strong` | #D8CBA8 | #394253 | Border komponen |
| `--c-rule` | rgba(32,43,64,.05) | rgba(244,235,221,.04) | Tekstur garis kertas |
| `--c-shadow` | rgba(32,43,64,.16) | rgba(0,0,0,.24) | Shadow lembut |
| `--c-code` | #202B40 | #10151E | Panel kode (navy, kedua tema) |
| `--c-hl-key/str/num/punct` | #7FD4C4 / #FFD98A / #9CC3E8 / #8FA0B8 | #8ADFD0 / #FFD98A / #9FC9EA / #77869E | Syntax highlight JSON |
| Status | `--c-mint` sukses, `--c-danger` error, `--c-lemon` aksen kuning, `--c-wa` WhatsApp | sama, versi terang | |
| `--c-sticky` | #F6DF83 | #E8C95C | Header band endpoint (sticky note) |

## 3. Typography

Empat keluarga font, bobot terencana. Body 14–16px, line-height 1.5–1.6.

| Peran | Font | Ukuran |
|---|---|---|
| Display / heading | Plus Jakarta Sans extrabold | 19–24 brand, 32–48 hero |
| Body | DM Sans | 14–16, max-width ~65ch |
| Hand / label naratif | Caveat | 18–24, hanya aksen |
| Kode | JetBrains Mono | 11–13px |

## 4. Spacing & radius

- Skala: 4 / 8 / 10 / 12 / 16 / 24 / 40px (`gap-1/2/2.5/3/4/6/10`).
- Radius: `rounded-lg` input & tombol, `rounded-xl/2xl` kartu — hierarki, bukan
  membulat seragam.
- Border: 1px pada kontrol (tombol, input), 2px hanya pada kartu & panel
  bertekstur (identitas), `border-dashed` untuk pemisah naratif.

## 5. Elevation

| Level | Class | Pemakaian |
|---|---|---|
| 0 | tanpa shadow | input, chip |
| 1 | `shadow-note` | kartu kategori, endpoint |
| 2 | `shadow-hard-sm` | tombol sekunder, pill aktif |
| 2 | `shadow-hard` (3px offset, alpha .7) | tombol utama — dikurangi 22% dari versi lama |

## 6. Interaction

- Hover/active: `.press` (translateY ±1px, 0.14s ease).
- Focus: `:focus-visible` ring 2px `--c-primary` global — tidak pernah
  dihilangkan, bukan hanya warna.
- Disabled: opacity .55, cursor not-allowed.
- Loading: tombol disable + spinner + `aria-busy`.
- Feedback: CopyButton berubah "Tersalin" 1.6s.
- Response playground: `role="status" aria-live="polite"`; error
  `role="alert"`.
- Animasi hanya untuk hover/fokus/menu/copy/loading/marquee;
  `prefers-reduced-motion` mematikan semuanya.
- Touch target ≥ 40×40px, jarak antar target ≥ 8px.

## 7. Components ringkas

- **Navbar**: desktop 68px (logo 36, tombol 40×40, search 44px); mobile 56px +
  search baris kedua.
- **Search**: 1px border, 44px, placeholder 14px, `/` shortcut → docs fokus.
- **Code/JSON viewer**: panel navy + token warna, indent 2, truncate 40.000
  karakter, salin penuh, horizontal scroll hanya di dalam `pre`.
- **Endpoint detail**: band sticky-note (method + nama + status verifikasi),
  tabel parameter, contoh GET/POST, Try API dengan status/time/size,
  preview media (gambar/video/audio) bila content-type sesuai.
- **Empty state**: pesan membantu + saran tindakan (docs search).
- **Tema**: init script anti-flash; toggle simpan di localStorage.

## 8. Checklist pre-delivery

1. `npx tsc --noEmit` + `npm run build` bersih.
2. Headless browser: 360/390/430/768/1024/1440px × 2 tema — tanpa overflow,
   tanpa layout shift antar tema, kontras AA.
3. Interaksi: search, drawer, theme toggle, Try API, copy.
4. Screenshot light+dark disimpan sebagai bukti.
