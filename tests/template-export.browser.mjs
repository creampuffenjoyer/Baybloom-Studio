import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright-core";

for (const scenario of [
  { template: "harbor-house", heading: "Harbor export proof", routes: [["/rooms/lighthouse-room", "Export Sea Room"], ["/breakfast", "Export breakfast"]], image: "breakfast" },
  { template: "bloomfield-gardens", heading: "Gardens export proof", routes: [["/spaces/the-lawn", "Export Lawn"], ["/weddings", "Export celebration"], ["/planning", "Export planning"]], image: "lawn" },
]) test(`${scenario.template} personalized production export runs without Baybloom`, { timeout: 120000 }, async () => {
  const project = path.resolve("storage/phase1/personalized", scenario.template);
  const socket = createServer(); await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: project, env: { ...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "", NEXT_PUBLIC_SITE_URL: base }, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = ""; for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { output = (output+chunk).slice(-5000); });
  let browser;
  try {
    const deadline = Date.now()+30000;
    while (true) {
      if (server.exitCode !== null) throw new Error(output);
      try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
      if (Date.now() > deadline) throw new Error(`Production server did not start: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; const privateRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (request.url().includes("/api/personalization/") || request.url().includes("/demo/")) privateRequests.push(request.url()); });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: scenario.heading, exact: true }).waitFor();
    await page.getByAltText("Your selected hero image").waitFor();
    await mkdir("storage/phase1/screenshots", { recursive: true });
    await page.screenshot({ path: `storage/phase1/screenshots/${scenario.template}-desktop.png`, fullPage: true });
    for (const [route, heading] of scenario.routes) {
      const response = await page.goto(base+route, { waitUntil: "networkidle" }); assert.equal(response.status(), 200);
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    }
    const image = await fetch(`${base}/personalized/photos/${scenario.image}.webp`);
    assert.equal(image.status, 200); assert.match(image.headers.get("content-type"), /image\/webp/);
    assert.ok((await image.arrayBuffer()).byteLength > 12);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `storage/phase1/screenshots/${scenario.template}-mobile.png`, fullPage: true });
    assert.deepEqual(privateRequests, []); assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    if (server.pid && server.exitCode === null) { if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); else server.kill("SIGTERM"); }
  }
});
