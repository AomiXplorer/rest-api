/**
 * Fallback natif gambar acak (SFW) — cataas (kucing) & nekos.best (neko anime).
 * Dipakai hanya bila semua node upstream gagal, agar endpoint tetap hidup.
 */
import "server-only";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!res.ok) throw new Error(`Sumber gambar menolak request (${res.status}).`);
  const ct = res.headers.get("content-type") ?? "image/jpeg";
  if (!ct.startsWith("image/")) throw new Error("Sumber tidak mengembalikan gambar.");
  const buf = new Uint8Array(await res.arrayBuffer());
  return { bytes: buf, contentType: ct };
}

/** Kucing acak (cataas.com) — publik, tanpa key. */
export async function randomCatImage(): Promise<{ bytes: Uint8Array; contentType: string }> {
  return fetchImageBytes(`https://cataas.com/cat?t=${Date.now()}`);
}

/** Neko anime acak (nekos.life) — publik, tanpa key. */
export async function randomNekoImage(): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch("https://nekos.life/api/v2/img/neko", { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000), cache: "no-store" });
  if (!res.ok) throw new Error(`Sumber neko menolak request (${res.status}).`);
  const j = (await res.json()) as { url?: string };
  if (!j.url) throw new Error("Sumber neko tidak mengembalikan URL gambar.");
  return fetchImageBytes(j.url);
}
