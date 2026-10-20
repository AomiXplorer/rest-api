import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { USER_TOOLS, getTool } from "@/config/user-tools";
import { ToolRunner } from "@/components/tools/ToolsUI";

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
  return <ToolRunner tool={t} />;
}
