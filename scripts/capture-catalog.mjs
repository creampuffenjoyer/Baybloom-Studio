// Captures catalog screenshots of every template demo into public/images/designs/<slug>/
// and writes the credits.json the seed reads. Run with the app running:
//   npm run dev   (or npm start)   then   node scripts/capture-catalog.mjs [slug...]
// Uses the installed Chrome via playwright-core.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";

/** Pages to capture per template; the first is the hero image. */
const PAGES = {
  "coral-cove": [["", "Home page"], ["/villas/overwater-villa", "Villa page"], ["/experiences", "Experiences page"], ["/book", "Booking flow"]],
  "ember-and-salt": [["", "Home page"], ["/menu", "Menu page"], ["/reserve", "Table reservations"], ["/private-dining", "Private dining page"]],
  "still-water-spa": [["", "Home page"], ["/treatments", "Treatments page"], ["/book?treatment=hot-stone", "Booking flow"], ["/packages", "Packages and memberships"]],
  "bloomfield-gardens": [["", "Home page"], ["/spaces", "Spaces page"], ["/inquire", "Date check and inquiry"], ["/weddings", "Wedding packages"]],
  "isla-verde-boutique": [["", "Home page"], ["/rooms", "Rooms page"], ["/journal/a-morning-on-calle-crisologo", "Journal article"], ["/book", "Booking flow"]],
  "harbor-house": [["", "Home page"], ["/rooms", "Rooms as postcards"], ["/guide", "Local guide"], ["/book", "Booking flow"]],
  "pine-ridge-lodge": [["", "Home page"], ["/rooms/ridge-chalet", "Room page"], ["/activities", "Seasonal activities"], ["/book", "Booking flow"]],
  "lumen-lake-villas": [["", "Home page"], ["/villas", "Villa comparison"], ["/tour", "Virtual tour"], ["/experiences", "Experiences page"]],
};

const only = process.argv.slice(2);
const titles = {
  "coral-cove": "Coral Cove", "ember-and-salt": "Ember & Salt", "still-water-spa": "Still Water",
  "bloomfield-gardens": "Bloomfield Gardens", "isla-verde-boutique": "Isla Verde", "harbor-house": "Harbor House",
  "pine-ridge-lodge": "Pine Ridge Lodge", "lumen-lake-villas": "Lumen Lake Villas",
};

const hideChrome = () => {
  const style = document.createElement("style");
  style.textContent = "[aria-label='Baybloom template demo'],nextjs-portal{display:none!important}";
  document.addEventListener("DOMContentLoaded", () => document.head.append(style));
};

async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < Math.min(document.body.scrollHeight, 2400); y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch({ channel: "chrome" });
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await desktop.addInitScript(hideChrome);
await mobile.addInitScript(hideChrome);
const dPage = await desktop.newPage();
const mPage = await mobile.newPage();

for (const [slug, pages] of Object.entries(PAGES)) {
  if (only.length && !only.includes(slug)) continue;
  const dir = path.join("public", "images", "designs", slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(path.join(dir, "thumbs"), { recursive: true });
  const credits = [];

  const save = async (png, base, alt, kind, demoPath) => {
    const main = await sharp(png).resize({ width: kind === "MOCKUP" ? 780 : 1440 }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    await writeFile(path.join(dir, `${base}.webp`), main.data);
    await sharp(png).resize({ width: 400, height: 300, fit: "cover", position: "top" }).webp({ quality: 72 }).toFile(path.join(dir, "thumbs", `${base}.webp`));
    credits.push({
      file: `/images/designs/${slug}/${base}.webp`,
      thumb: `/images/designs/${slug}/thumbs/${base}.webp`,
      alt,
      kind,
      width: main.info.width,
      height: main.info.height,
      author: "",
      source: `/demo/${slug}${demoPath}`,
      license: "",
      licenseUrl: null,
    });
  };

  for (const [i, [p, label]] of pages.entries()) {
    await dPage.goto(`${BASE}/demo/${slug}${p}`, { waitUntil: "networkidle" });
    await settle(dPage);
    const png = await dPage.screenshot();
    await save(png, `${String(i).padStart(2, "0")}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, `${titles[slug]} template: ${label.toLowerCase()} on desktop`, "SCREENSHOT", p);
  }
  await mPage.goto(`${BASE}/demo/${slug}`, { waitUntil: "networkidle" });
  await settle(mPage);
  await save(await mPage.screenshot(), "90-mobile-home", `${titles[slug]} template: home page on a phone`, "MOCKUP", "");

  await writeFile(path.join(dir, "credits.json"), JSON.stringify(credits, null, 2) + "\n");
  console.log("captured", slug, credits.length);
}
await browser.close();
