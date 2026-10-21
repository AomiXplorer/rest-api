import { AppShell } from "@/components/layout/AppShell";

/** Chrome dokumentasi (Cartoon Book) — hanya untuk grup halaman utama, tidak untuk /tools. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
