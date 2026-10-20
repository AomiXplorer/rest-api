import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chromium-headless-shell" });
for (const [w,h,name] of [[1366,768,"lap"],[1920,1080,"desk"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:3100/docs?endpoint=manga-mangadex-search", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const m = document.querySelector('[role="dialog"]');
    const inner = m && m.querySelector("div.animate-pop");
    const tryGrid = [...document.querySelectorAll('[role="dialog"] .grid')].find(g => String(g.className).includes("lg:grid-cols-2"));
    return {
      modalW: inner ? Math.round(inner.getBoundingClientRect().width) : 0,
      tryCols: tryGrid ? getComputedStyle(tryGrid).gridTemplateColumns.split(" ").length : 0,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  console.log(name, ":", JSON.stringify(r));
  await p.screenshot({ path: `${name}-modal-fixed.png` });
  await p.close();
}
const m2 = await b.newPage({ viewport: { width: 390, height: 844 } });
await m2.goto("http://localhost:3100/docs?endpoint=manga-mangadex-search", { waitUntil: "networkidle" });
await m2.waitForTimeout(1200);
const mob = await m2.evaluate(() => {
  const m = document.querySelector('[role="dialog"]');
  const inner = m && m.querySelector("div.animate-pop");
  const tryGrid = m && [...m.querySelectorAll(".grid")].find(g => String(g.className).includes("lg:grid-cols-2"));
  return { overflowX: document.documentElement.scrollWidth - innerWidth, modalW: inner ? Math.round(inner.getBoundingClientRect().width) : 0, tryCols: tryGrid ? getComputedStyle(tryGrid).gridTemplateColumns.split(" ").length : 0 };
});
console.log("mobile:", JSON.stringify(mob));
await m2.screenshot({ path: "mob-modal-fixed.png" });
await b.close();
