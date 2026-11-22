import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { readFile, realpath, stat, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { selectedPhotoCases } from "../tests/helpers/photo-rollout.mjs";
import { unzipSync } from "fflate";

for (const config of selectedPhotoCases()) {
  const { template, primary, shared, secondary, hero } = config;
  const root = `storage/photo-selection/${template}`, project = path.resolve(`${root}/purchased/${template}`);
  const dependencies = path.resolve(`storage/${template === "bloomfield-gardens" ? "phase1" : "phase3"}/personalized/${template}/node_modules`);
  for (const target of [project, dependencies]) { const relative = path.relative(process.cwd(), target); if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw Error("Proof paths must stay within workspace"); }
  const pkg = JSON.parse(await readFile(path.join(project, "package.json"), "utf8")), lock = JSON.parse(await readFile(path.join(project, "package-lock.json"), "utf8"));
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) { const installed = JSON.parse(await readFile(path.join(dependencies, name, "package.json"), "utf8")); assert.equal(installed.version, lock.packages[`node_modules/${name}`].version, `Locked dependency mismatch: ${name}`); }
  const linked = path.join(project, "node_modules"); if (!await stat(linked).catch(() => null)) await symlink(dependencies, linked, process.platform === "win32" ? "junction" : "dir"); assert.equal((await realpath(linked)).toLowerCase(), (await realpath(dependencies)).toLowerCase());
  const env = { ...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", RESEND_API_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", NEXT_TELEMETRY_DISABLED: "1", RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2" };
  assert.equal(pkg.scripts.build, "next build --webpack");
  if (process.env.PHOTO_REUSE_BUILD === template) {
    // Resume browser verification of an already successful build only after
    // checking its downloaded source and assets are still unchanged.
    assert.ok(await stat(path.join(project, ".next/BUILD_ID")));
    const files = unzipSync(await readFile(`${root}/${template}-purchased.zip`));
    for (const [name, bytes] of Object.entries(files)) {
      assert.ok(name.startsWith(`${template}/`), "Unexpected archive root");
      if (name.endsWith("/") || name.endsWith("/next-env.d.ts")) continue;
      const relative = name.slice(template.length + 1), file = path.resolve(project, relative), checked = path.relative(project, file);
      assert.ok(checked && !checked.startsWith("..") && !path.isAbsolute(checked), "Unsafe archive path");
      assert.deepEqual(new Uint8Array(await readFile(file)), bytes, `Built project changed: ${relative}`);
    }
    console.log(`Reusing successful, unchanged ${template} build`);
  } else {
    console.log(`Building purchased ${template}`);
    const build = spawnSync(process.execPath, [path.join(linked, "next/dist/bin/next"), "build", "--webpack"], { cwd: project, env, stdio: "inherit", windowsHide: true }); if (build.error) throw build.error; if (build.status !== 0) throw Error(`${template} build failed (${build.status})`);
  }
  const socket = createServer(); await new Promise(r => socket.listen(0, "127.0.0.1", r)); const port = socket.address().port; await new Promise(r => socket.close(r)); const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(linked, "next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: project, env, stdio: "ignore", windowsHide: true }); let browser;
  try {
    const deadline = Date.now() + 30000; while (true) { try { if ((await fetch(base)).ok) break; } catch {} if (server.exitCode !== null || Date.now() > deadline) throw Error("Production proof did not start"); await new Promise(r => setTimeout(r, 250)); }
    browser = await chromium.launch({ channel: "chrome", headless: true }); const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }), errors = [], privateRequests = [];
    page.on("pageerror", e => errors.push(e.message)); page.on("request", request => { const url = new URL(request.url()); if (/^\/(api|demo|personalize)\//.test(url.pathname)) privateRequests.push(url.pathname); });
    await page.goto(base + (template === "pine-ridge-lodge" ? "/?season=winter" : ""), { waitUntil: "networkidle" });
    async function local(item) { const image = page.locator(`img[data-location-photo='${item.id}']`); await image.scrollIntoViewIfNeeded(); await image.evaluate(el => el.decode()); assert.ok((await image.evaluate(el => decodeURIComponent(el.currentSrc || el.src))).includes(`/personalized/placements/${item.id}.webp`)); }
    for (const item of [primary, secondary]) await local(item);
    // Pine's default public season can differ from the selected winter hero.
    if (template === "pine-ridge-lodge") { await page.goto(base + "/?season=winter", { waitUntil: "networkidle" }); }
    await local(hero); assert.equal(await page.getByRole("button", { name: /^Change photo:/ }).count(), 0);
    const mainPages = ["home", "rooms", "villas", "activities", "dining", "journal", "experiences", "tour", "book", "contact", "story", "events", "menu", "private-dining", "visit", "reserve", "gift-cards", "treatments", "packages", "about", "spaces", "weddings", "planning", "gallery", "inquire"];
    const section = { "pine-ridge-lodge": "rooms", "lumen-lake-villas": "villas", "isla-verde-boutique": "rooms", "still-water-spa": "treatments", "bloomfield-gardens": "spaces" }[template];
    const sharedPath = shared.page === "home" ? "/" : mainPages.includes(shared.page) ? `/${shared.page}` : `/${section}/${shared.page}`;
    await page.goto(base + sharedPath + (template === "pine-ridge-lodge" ? "?season=winter" : ""), { waitUntil: "networkidle" }); await local(shared);
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base, { waitUntil: "networkidle" }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${root}/screenshots/export-mobile.png`, fullPage: true }); assert.deepEqual(errors, []); assert.deepEqual(privateRequests, []);
    await writeFile(`${root}/export-verification.json`, JSON.stringify({ verifiedAt: new Date().toISOString(), template, node: process.version, build: "next build --webpack", dependencies: "Previously independently installed dependencies with matching direct lockfile versions", checks: ["local location assets", "explicit reuse on another page", "no editor controls or private requests", "mobile overflow", "browser exceptions"] }, null, 2)); console.log(`${template}: production build and standalone browser checks passed`);
  } finally { await browser?.close(); if (server.pid) spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); }
}
