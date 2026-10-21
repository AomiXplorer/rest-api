import type { Metadata } from "next";
import { ToolsShell } from "@/components/tools/ToolsShell";

export const metadata: Metadata = {
  title: "Aomi Tools — Semua tools, satu tempat",
  description: "Unduh media, jelajahi anime, gunakan AI, dan buat konten langsung dari satu platform.",
};

/** Chrome + design system khusus Aomi Tools — terpisah dari halaman dokumentasi. */
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <ToolsShell>{children}</ToolsShell>;
}
