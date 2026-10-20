import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { USER_TOOLS, getTool } from "@/config/user-tools";
import { ToolRunner } from "@/components/tools/ToolsUI";
import { TikTokTool } from "@/components/tools/TikTokTool";
import { AiChatTool } from "@/components/tools/AiChatTool";
import { AnimeTool } from "@/components/tools/AnimeTool";
import { AlightMotionTool } from "@/components/tools/AlightMotionTool";

export function generateStaticParams() {
  return USER_TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTool(slug);
  return t ? { title: `${t.name} — Aomi Tools`, description: t.desc } : { title: "Aomi Tools" };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();

  // Halaman penggunaan khusus: interface yang berbeda sesuai fungsi tool.
  switch (t.page) {
    case "tiktok":
      return <TikTokTool endpoint={t.endpoint} />;
    case "ai":
      return <AiChatTool endpoint={t.endpoint} modelName="QwQ 32B" />;
    case "anime":
      return <AnimeTool />;
    case "alight-motion":
      return <AlightMotionTool />;
    default:
      return <ToolRunner tool={t} />;
  }
}
