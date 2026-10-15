import { Suspense } from "react";
import { DocsClient } from "@/components/docs/DocsClient";

export const metadata = {
  title: "Dokumentasi",
  description: "Dokumentasi lengkap seluruh endpoint Aomi Still Learning: parameter, contoh, dan fitur Try API.",
};

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; e?: string }>;
}) {
  const { cat, e } = await searchParams;
  return (
    <Suspense fallback={<div className="p-6 text-ink-muted">Memuat dokumentasi…</div>}>
      <DocsClient initialCategory={cat} initialEndpointId={e} />
    </Suspense>
  );
}
