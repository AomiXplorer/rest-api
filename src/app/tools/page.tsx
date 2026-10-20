import type { Metadata } from "next";
import { ToolsDashboard } from "@/components/tools/ToolsUI";

export const metadata: Metadata = {
  title: "Aomi Tools — Semua tools favoritmu dalam satu tempat",
  description: "Download media, jelajahi manga, ngobrol dengan AI, dan coba berbagai tools Aomi tanpa konfigurasi rumit.",
};

export default function ToolsPage() {
  return <ToolsDashboard />;
}
