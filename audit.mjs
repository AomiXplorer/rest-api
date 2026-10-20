import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chromium-headless-shell" });
const views = [[390,844,"mob"],[768,1024,"tab"],[1366,768,"lap"],[1920,1080,"desk"]];
for (const [w,h,name] of views) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const [path,tag] of [["/","home"],["/docs","docs"]]) {
    await p.goto("http://localhost:3100"+path, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const m = await p.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - window.innerWidth, bodyW: document.body.scrollWidth }));
    await p.screenshot({ path: `/tmp/shots/${name}-${tag}.png` });
    console.log(`${name} ${tag}: overflowX=${m.overflowX}px bodyW=${m.bodyW}`);
  }
  await p.close();
}
// modal endpoint detail di desktop
const p2 = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p2.goto("http://localhost:3100/docs?endpoint=manga-mangadex-search", { waitUntil: "networkidle" });
await p2.waitForTimeout(800);
await p2.screenshot({ path: "/tmp/shots/lap-modal.png", fullPage: false });
await p2.close();
await b.close();
