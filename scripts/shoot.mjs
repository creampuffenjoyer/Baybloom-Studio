// Screenshots of pages on a running dev/prod server, using the installed Chrome.
// Usage: node scripts/shoot.mjs <outDir> <path> [path...] [--mobile] [--full] [--base=http://localhost:3000]
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [outDir, ...paths] = args.filter((a) => !a.startsWith("--"));
const base = [...flags].find((f) => f.startsWith("--base="))?.slice(7) ?? "http://localhost:3000";
const mobile = flags.has("--mobile");
const full = flags.has("--full");

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext(
  mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
);
const page = await context.newPage();
// Hide the Baybloom demo bar and Next dev indicator in captures.
await page.addInitScript(() => {
  const style = document.createElement("style");
  style.textContent = "[aria-label='Baybloom template demo'],nextjs-portal{display:none!important}";
  document.addEventListener("DOMContentLoaded", () => document.head.append(style));
});

for (const p of paths) {
  await page.goto(base + p, { waitUntil: "networkidle" });
  if (full) {
    // Scroll through once so lazy images load.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(1200);
  }
  const name = (p.replace(/^\/|\/$/g, "").replace(/[/?=&]+/g, "_") || "home") + (mobile ? "-m" : "") + ".png";
  await page.screenshot({ path: path.join(outDir, name), fullPage: full });
  console.log(name);
}
await browser.close();
