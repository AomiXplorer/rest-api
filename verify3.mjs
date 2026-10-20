import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chromium-headless-shell" });
for (const [w,h,name] of [[1366,768,"lap"],[390,844,"mob"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:3100/docs", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.click('button.press.w-full >> nth=0');
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const m = document.querySelector('[role="dialog"]');
    const inner = m && m.querySelector("div.animate-pop");
    const tryGrid = m && [...m.querySelectorAll(".grid")].find(g => String(g.className).includes("lg:grid-cols-2"));
    return { overflowX: document.documentElement.scrollWidth - innerWidth, modalW: inner ? Math.round(inner.getBoundingClientRect().width) : 0, tryCols: tryGrid ? getComputedStyle(tryGrid).gridTemplateColumns.split(" ").length : 0 };
  });
  console.log(name, JSON.stringify(r));
  await p.screenshot({ path: `${name}-modal-fixed.png` });
  await p.close();
}
await b.close();
