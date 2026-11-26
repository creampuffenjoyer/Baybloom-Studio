// Builds each template's catalog cover from its captured screenshots: the desktop
// home page in a browser window and the mobile home in a phone, on a backdrop in
// the template's own colour. Writes public/images/designs/<slug>/cover.webp and
// puts it first in credits.json (role "cover"), so the seed uses it as heroImage.
//   node scripts/compose-covers.mjs [slug...]
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import studioCollection from "../src/lib/studio-collection.json" with { type: "json" };

/** Backdrop per template, picked from its palette so neighbouring cards differ. */
const BACKDROP = {
  "coral-cove": "#0b5e5b",
  "ember-and-salt": "#2a1015",
  "still-water-spa": "#5d7b6c",
  "bloomfield-gardens": "#f1d5d0",
  "isla-verde-boutique": "#1d3a2e",
  "harbor-house": "#f5d56e",
  "pine-ridge-lodge": "#c7802f",
  "lumen-lake-villas": "#dfe8ee",
  "roast-row": "#183c9b",
  "sunday-table": "#982e28",
  barkadas: "#294f3e",
  "the-atrium": "#594237",
  ...Object.fromEntries(studioCollection.map(({ slug, color }) => [slug, color])),
};

const W = 1600;
const H = 1200;
const only = process.argv.slice(2);

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

async function rounded(buffer, width, height, radius, corners = "all") {
  const r = radius;
  const pathD =
    corners === "top"
      ? `M0,${r} Q0,0 ${r},0 H${width - r} Q${width},0 ${width},${r} V${height} H0 Z`
      : `M0,${r} Q0,0 ${r},0 H${width - r} Q${width},0 ${width},${r} V${height - r} Q${width},${height} ${width - r},${height} H${r} Q0,${height} 0,${height - r} Z`;
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><path d="${pathD}" fill="#fff"/></svg>`);
  return sharp(buffer).resize(width, height).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

for (const [slug, bg] of Object.entries(BACKDROP)) {
  if (only.length && !only.includes(slug)) continue;
  const dir = path.join("public", "images", "designs", slug);
  const creditsPath = path.join(dir, "credits.json");
  const credits = JSON.parse(await readFile(creditsPath, "utf8")).filter((c) => c.role !== "cover");
  const desktop = credits.find((c) => c.kind === "SCREENSHOT");
  const mobile = credits.find((c) => c.kind === "MOCKUP");
  const read = (c) => readFile(path.join("public", c.file.replace(/^\//, "")));

  // Browser window: chrome bar + desktop screenshot, bleeding off the right edge.
  const winW = 1440;
  const shotH = Math.round((winW * desktop.height) / desktop.width);
  const chromeH = 46;
  const winH = chromeH + shotH;
  const chrome = Buffer.from(
    `<svg width="${winW}" height="${chromeH}"><rect width="100%" height="100%" fill="#efeeea"/>
      <circle cx="30" cy="23" r="7.5" fill="#ec6a5e"/><circle cx="56" cy="23" r="7.5" fill="#f4bf4f"/><circle cx="82" cy="23" r="7.5" fill="#61c554"/>
      <rect x="130" y="12" width="${winW - 260}" height="22" rx="11" fill="#fff"/></svg>`,
  );
  const shot = await sharp(await read(desktop)).resize(winW).png().toBuffer();
  const windowRaw = await sharp({ create: { width: winW, height: winH, channels: 4, background: "#fff" } })
    .composite([{ input: chrome, top: 0, left: 0 }, { input: shot, top: chromeH, left: 0 }])
    .png()
    .toBuffer();
  const window = await rounded(windowRaw, winW, winH, 20, "top");

  // Phone: mobile screenshot in a dark frame.
  const screenW = 300;
  const screenH = Math.round((screenW * mobile.height) / mobile.width);
  const bezel = 13;
  const phoneW = screenW + bezel * 2;
  const phoneH = screenH + bezel * 2;
  const screen = await rounded(await sharp(await read(mobile)).resize(screenW, screenH).png().toBuffer(), screenW, screenH, 34);
  const phone = await sharp({
    create: { width: phoneW, height: phoneH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: Buffer.from(`<svg width="${phoneW}" height="${phoneH}"><rect width="100%" height="100%" rx="46" fill="#151a1d"/></svg>`) },
      { input: screen, top: bezel, left: bezel },
    ])
    .png()
    .toBuffer();

  const winX = 230;
  const winY = 150;
  const phoneX = 90;
  const phoneY = H - phoneH - 70;
  const light = luminance(bg) > 0.5;
  const shadow = (x, y, w, h, r, opacity) =>
    `<rect x="${x}" y="${y + 24}" width="${w}" height="${h}" rx="${r}" fill="#000" opacity="${opacity}" filter="url(#b)"/>`;
  const backdrop = Buffer.from(
    `<svg width="${W}" height="${H}">
      <defs>
        <radialGradient id="g" cx="85%" cy="5%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity="${light ? 0.55 : 0.14}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="28"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="${bg}"/>
      <rect width="100%" height="100%" fill="url(#g)"/>
      ${shadow(winX, winY, winW, winH, 20, light ? 0.18 : 0.35)}
      ${shadow(phoneX, phoneY, phoneW, phoneH, 46, light ? 0.25 : 0.45)}
    </svg>`,
  );

  const out = await sharp(backdrop)
    .composite([
      { input: window, top: winY, left: winX },
      { input: phone, top: phoneY, left: phoneX },
    ])
    .webp({ quality: 82 })
    .toBuffer();
  // The window bleeds past the right edge; sharp clips composites to the canvas.
  await writeFile(path.join(dir, "cover.webp"), out);
  await sharp(out).resize(400, 300).webp({ quality: 74 }).toFile(path.join(dir, "thumbs", "cover.webp"));

  const title = desktop.alt.split(" template:")[0];
  credits.unshift({
    role: "cover",
    file: `/images/designs/${slug}/cover.webp`,
    thumb: `/images/designs/${slug}/thumbs/cover.webp`,
    alt: `${title} template shown on a laptop and a phone`,
    kind: "MOCKUP",
    width: W,
    height: H,
    author: "",
    source: `/demo/${slug}`,
    license: "",
    licenseUrl: null,
  });
  await writeFile(creditsPath, JSON.stringify(credits, null, 2) + "\n");
  console.log("cover", slug);
}
