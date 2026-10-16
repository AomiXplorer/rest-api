import "server-only";
// scrapr (@coflyn/scrapr, MIT) — scraper mandiri multi-provider.
// Dipakai sebagai jalur terakhir ketika semua node upstream utama down (5xx),
// sehingga endpoint downloader tetap bisa melayani lewat provider scrape publik.
// Deep-import per provider — index root menarik provider berbasis browser
// (savetik/snapinsta/fdown → puppeteer, optional dep yang tidak dipasang).
import snaptikMod from "@coflyn/scrapr/lib/tiktok/snaptik";
import ssstikMod from "@coflyn/scrapr/lib/tiktok/ssstik";
import tiktokioMod from "@coflyn/scrapr/lib/tiktok/tiktokio";
import tikdownloaderMod from "@coflyn/scrapr/lib/tiktok/tikdownloader";
import twitterDirectMod from "@coflyn/scrapr/lib/twitter/direct";
import tweeloadMod from "@coflyn/scrapr/lib/twitter/tweeload";
import tvdMod from "@coflyn/scrapr/lib/twitter/tvd";
import savetwtMod from "@coflyn/scrapr/lib/twitter/savetwt";
import igDirectMod from "@coflyn/scrapr/lib/instagram/direct";
import indownMod from "@coflyn/scrapr/lib/instagram/indown";
import igSnapsaveMod from "@coflyn/scrapr/lib/instagram/snapsave";
import klickaudMod from "@coflyn/scrapr/lib/soundcloud/klickaud";
import spotidownMod from "@coflyn/scrapr/lib/spotify/spotidown";
import soundloadersMod from "@coflyn/scrapr/lib/spotify/soundloaders";
import spotmateMod from "@coflyn/scrapr/lib/spotify/spotmate";
import spotisaverMod from "@coflyn/scrapr/lib/spotify/spotisaver";
import douyinDirectMod from "@coflyn/scrapr/lib/douyin/direct";
import fbSnapsaveMod from "@coflyn/scrapr/lib/facebook/snapsave";
import rednoteDirectMod from "@coflyn/scrapr/lib/rednote/direct";
import gdriveMod from "@coflyn/scrapr/lib/resolver/gdrive";

const snaptik = snaptikMod.scrape;
const ssstik = ssstikMod.scrape;
const tiktokio = tiktokioMod.scrape;
const tikdownloader = tikdownloaderMod.scrape;
const twitterDirect = twitterDirectMod.scrape;
const tweeload = tweeloadMod.scrape;
const tvd = tvdMod.scrape;
const savetwt = savetwtMod.scrape;
const igDirect = igDirectMod.scrape;
const indown = indownMod.scrape;
const igSnapsave = igSnapsaveMod.scrape;
const klickaud = klickaudMod.scrape;
const spotidown = spotidownMod.scrape;
const soundloaders = soundloadersMod.scrape;
const spotmate = spotmateMod.scrape;
const spotisaver = spotisaverMod.scrape;
const douyinDirect = douyinDirectMod.scrape;
const fbSnapsave = fbSnapsaveMod.scrape;
const rednoteDirect = rednoteDirectMod.scrape;
const gdriveResolve = gdriveMod.scrape;

interface Provider {
  name: string;
  fn: (url: string) => Promise<{ status?: boolean; result?: unknown; message?: string }>;
}

/** Chain provider scrapr per jalur endpoint. */
const SCRAPR_CHAINS: Record<string, Provider[]> = {
  "/api/d/tiktok": [
    { name: "snaptik", fn: snaptik },
    { name: "ssstik", fn: ssstik },
    { name: "tiktokio", fn: tiktokio },
    { name: "tikdownloader", fn: tikdownloader },
  ],
  "/api/d/twitter": [
    { name: "twitter-direct", fn: twitterDirect },
    { name: "tweeload", fn: tweeload },
    { name: "tvd", fn: tvd },
    { name: "savetwt", fn: savetwt },
  ],
  "/api/d/ssstwiter": [
    { name: "twitter-direct", fn: twitterDirect },
    { name: "tweeload", fn: tweeload },
    { name: "tvd", fn: tvd },
    { name: "savetwt", fn: savetwt },
  ],
  "/api/d/igram": [
    { name: "ig-direct", fn: igDirect },
    { name: "indown", fn: indown },
    { name: "snapsave", fn: igSnapsave },
  ],
  "/api/d/sssinstagram": [
    { name: "ig-direct", fn: igDirect },
    { name: "indown", fn: indown },
    { name: "snapsave", fn: igSnapsave },
  ],
  "/api/d/soundcloud": [{ name: "klickaud", fn: klickaud }],
  "/api/d/spotify": [
    { name: "spotidown", fn: spotidown },
    { name: "soundloaders", fn: soundloaders },
    { name: "spotmate", fn: spotmate },
    { name: "spotisaver", fn: spotisaver },
  ],
  "/api/d/spotifyv2": [
    { name: "spotidown", fn: spotidown },
    { name: "soundloaders", fn: soundloaders },
    { name: "spotmate", fn: spotmate },
    { name: "spotisaver", fn: spotisaver },
  ],
  "/api/d/douyin": [{ name: "douyin-direct", fn: douyinDirect }],
  "/api/d/facebook": [
    { name: "fb-snapsave", fn: fbSnapsave },
  ],
  "/api/d/rednote": [{ name: "rednote-direct", fn: rednoteDirect }],
  "/api/d/gdrive": [{ name: "gdrive-resolver", fn: gdriveResolve }],
};

export interface ScraprOutcome {
  ok: boolean;
  /** Nama provider yang berhasil (untuk transparansi di response). */
  provider?: string;
  data?: unknown;
  message?: string;
}

/** Batas waktu per provider — provider scrape pihak ketiga sering lambat. */
const PROVIDER_TIMEOUT_MS = 12000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`scrapr provider timeout (${ms}ms)`)), ms)),
  ]);
}

/**
 * Coba semua provider scrapr untuk jalur ini.
 * Return null bila jalur ini tidak punya chain scrapr / tidak ada parameter url.
 */
/**
 * Coba semua provider scrapr untuk jalur ini.
 * Return null bila jalur ini tidak punya chain scrapr / tidak ada parameter url.
 * `deadlineAt` (Date.now()) membatasi total waktu tahap scrape supaya
 * request tidak melebihi batas durasi fungsi serverless.
 */
export async function scrapeFallback(
  upstreamPath: string,
  values: Record<string, string>,
  deadlineAt?: number,
): Promise<ScraprOutcome | null> {
  const chain = SCRAPR_CHAINS[upstreamPath];
  const url = values.url ?? values.link;
  if (!chain || !url) return null;

  const remaining = () => (deadlineAt ? deadlineAt - Date.now() : PROVIDER_TIMEOUT_MS);

  for (const p of chain) {
    if (remaining() < 2500) break; // tidak ada waktu cukup untuk satu provider lagi
    try {
      const res = await withTimeout(p.fn(url), Math.min(PROVIDER_TIMEOUT_MS, remaining()));
      if (res && res.status && res.result) {
        return {
          ok: true,
          provider: p.name,
          data: { source: "scrapr", provider: p.name, ...(res.result as Record<string, unknown>) },
        };
      }
    } catch {
      // Provider gagal — lanjut ke provider berikutnya di chain.
    }
  }
  return { ok: false, message: "Semua provider scrape gagal." };
}
