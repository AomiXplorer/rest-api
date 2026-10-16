import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { APP_NAME, SITE_URL } from "@/lib/constants";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmsans",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — Your Little API Notebook`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Cyronime adalah koleksi REST API publik gratis: AI, downloader, search engine, anime, primbon, canvas, dan tools lainnya. Tanpa API key, tanpa login — tinggal panggil.",
  keywords: [
    "cyronime",
    "rest api",
    "api gratis",
    "api indonesia",
    "api ai",
    "api downloader",
    "api search",
    "api anime",
    "api primbon",
    "free api",
  ],
  applicationName: APP_NAME,
  authors: [{ name: "Cyronime" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Your Little API Notebook`,
    description:
      "Koleksi REST API publik gratis: AI, downloader, search, anime, primbon, canvas, dan tools lainnya. Tanpa API key, tanpa login.",
    locale: "id_ID",
    images: [
      {
        url: "/brand/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Cyronime — Your Little API Notebook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Your Little API Notebook`,
    description:
      "Koleksi REST API publik gratis: AI, downloader, search, anime, primbon, canvas, dan tools lainnya. Tanpa API key, tanpa login.",
    images: ["/brand/og-banner.jpg"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Default mode gelap; preferensi tersimpan di localStorage ("light" memaksa mode terang).
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${jakarta.variable} ${dmSans.variable} ${jetbrains.variable} ${caveat.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
