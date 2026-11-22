import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { readFile, realpath, stat, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const workspace = process.cwd();
const project = path.resolve("storage/photo-selection/harbor-house/purchased/harbor-house");
const dependencies = path.resolve("storage/phase1/personalized/harbor-house/node_modules");
for (const target of [project, dependencies]) {
  const relative = path.relative(workspace, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw Error("Verification paths must stay inside the workspace");
}
const lock = JSON.parse(await readFile(path.join(project, "package-lock.json"), "utf8"));
const pkg = JSON.parse(await readFile(path.join(project, "package.json"), "utf8"));
// Reuse the previously independently installed template dependencies, avoiding
// another install and thousands of antivirus-scanned copies on the shared PC.
for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const installed = JSON.parse(await readFile(path.join(dependencies, name, "package.json"), "utf8"));
  assert.equal(installed.version, lock.packages[`node_modules/${name}`].version, `Locked dependency mismatch: ${name}`);
}
const linked = path.join(project, "node_modules");
if (!await stat(linked).catch(() => null)) await symlink(dependencies, linked, process.platform === "win32" ? "junction" : "dir");
assert.equal((await realpath(linked)).toLowerCase(), (await realpath(dependencies)).toLowerCase());
const env = { ...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "", RESEND_API_KEY: "", S3_ENDPOINT: "", S3_BUCKET: "", S3_ACCESS_KEY: "", S3_SECRET_KEY: "", NEXT_TELEMETRY_DISABLED: "1", RAYON_NUM_THREADS: "2", UV_THREADPOOL_SIZE: "2" };
assert.equal(pkg.scripts.build, "next build --webpack");
const build = spawnSync(process.execPath, [path.join(linked, "next/dist/bin/next"), "build", "--webpack"], { cwd: project, env, stdio: "inherit", windowsHide: true });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const socket = createServer(); await new Promise(r => socket.listen(0, "127.0.0.1", r)); const port = socket.address().port; await new Promise(r => socket.close(r));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.join(linked, "next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: project, env, windowsHide: true, stdio: "ignore" });
let browser;
try {
  const deadline = Date.now() + 30000;
  while (true) { try { if ((await fetch(base)).ok) break; } catch {} if (server.exitCode !== null || Date.now() > deadline) throw Error("Export production server did not start"); await new Promise(r => setTimeout(r, 250)); }
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }); const errors = [], privateRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { const url = new URL(request.url()); if (/^\/(api|demo|personalize)\//.test(url.pathname)) privateRequests.push(url.pathname); });
  await page.goto(base, { waitUntil: "networkidle" });
  async function visible(id, file) {
    const image = page.locator(`img[data-harbor-photo='${id}']`); await image.scrollIntoViewIfNeeded(); await image.evaluate(el => el.decode());
    assert.ok((await image.evaluate(el => decodeURIComponent(el.currentSrc || el.src))).includes(file));
  }
  await visible("home.hero", "/personalized/placements/home.hero.webp");
  await visible("home.breakfast", "/personalized/placements/home.breakfast.webp");
  assert.equal(await page.getByAltText("Our private breakfast photo", { exact: true }).count(), 1);
  await visible("home.guide", "/personalized/placements/home.guide.webp");
  assert.equal(await page.getByRole("button", { name: /^Change photo:/ }).count(), 0);
  await page.goto(base + "/rooms/lighthouse-room", { waitUntil: "networkidle" });
  await visible("room.lighthouse-room.photo.2", "/personalized/placements/room.lighthouse-room.photo.2.webp");
  await page.goto(base + "/breakfast", { waitUntil: "networkidle" });
  await visible("breakfast.breakfast", "/personalized/photos/breakfast.webp");
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: "storage/photo-selection/harbor-house/screenshots/export-mobile.png", fullPage: true });
  assert.deepEqual(errors, []); assert.deepEqual(privateRequests, []);
  await writeFile("storage/photo-selection/harbor-house/export-verification.json", JSON.stringify({ verifiedAt: new Date().toISOString(), node: process.version, build: "next build --webpack", dependencies: "Previously independently installed Harbor dependencies, matching every direct lockfile version", checks: ["local hero/breakfast/guide assets", "explicit reuse in a room gallery", "unmodified shared breakfast fallback", "no editor controls", "no private requests", "mobile overflow", "no browser exceptions"] }, null, 2));
  console.log("Purchased Harbor project passed production build and standalone browser checks without Baybloom credentials.");
} finally {
  await browser?.close(); if (server.pid) spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
}
