import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chromium-headless-shell" });
// desktop: docs list 2 kolom + modal 2 kolom
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto("http://localhost:3100/docs", { waitUntil: "networkidle" });
const grid = await p.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find(d => d.className.includes && String(d.className).includes("lg:grid-cols-2"));
  return el ? getComputedStyle(el).gridTemplateColumns.split(" ").length : 0;
});
console.log("docs list kolom (1366):", grid);
await p.goto("http://localhost:3100/docs?endpoint=manga-mangadex-search", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const modal = await p.evaluate(() => {
  const m = document.querySelector('[role="dialog"] > div.animate-pop, div.animate-pop');
  const r = m.getBoundingClientRect();
  const cols = [...document.querySelectorAll("section .grid.lg\\:grid-cols-2")];
  const t = cols[cols.length-1];
  return { modalW: Math.round(r.width), tryCols: t ? getComputedStyle(t).gridTemplateColumns.split(" ").length : 0 };
});
console.log("modal:", JSON.stringify(modal));
await p.screenshot({ path: "desk-modal-fixed.png" });
// mobile regression check
const m2 = await b.newPage({ viewport: { width: 390, height: 844 } });
await m2.goto("http://localhost:3100/docs?endpoint=manga-mangadex-search", { waitUntil: "networkidle" });
await m2.waitForTimeout(600);
const mob = await m2.evaluate(() => {
  const t = [...document.querySelectorAll("section .grid")].pop();
  const m = document.querySelector("div.animate-pop");
  return { overflowX: document.documentElement.scrollWidth - innerWidth, modalW: m ? Math.round(m.getBoundingClientRect().width) : 0, tryCols: t ? getComputedStyle(t).gridTemplateColumns.split(" ").length : 0 };
});
console.log("mobile modal:", JSON.stringify(mob));
await m2.screenshot({ path: "mob-modal-fixed.png" });
await b.close();
