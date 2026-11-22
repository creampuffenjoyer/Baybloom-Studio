import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright-core";
import { phase3Exports } from "./helpers/phase3-exports.mjs";

for (const scenario of phase3Exports) test(`${scenario.template}: standalone production export preserves saved content and local images`, { timeout: 180_000 }, async () => {
  const project = path.resolve("storage/phase3/personalized", scenario.template);
  const socket = createServer(); await new Promise(resolve => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: project, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, DATABASE_URL: "", DIRECT_URL: "", AUTH_SECRET: "", NEXT_PUBLIC_SITE_URL: base },
  });
  let output = "";
  for (const stream of [server.stdout, server.stderr]) stream.on("data", chunk => { output = (output + chunk).slice(-4000); });
  let browser;
  try {
    const deadline = Date.now() + 30_000;
    while (true) {
      if (server.exitCode !== null) throw new Error(output);
      try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
      if (Date.now() > deadline) throw new Error(`Standalone server did not start: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; const privateRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      const url = new URL(request.url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/demo/") || url.pathname.startsWith("/personalize/")) privateRequests.push(url.pathname);
    });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: scenario.heading, exact: true }).waitFor();
    await page.getByAltText("Your selected hero image").waitFor();
    await page.getByText(scenario.draft.business.name, { exact: true }).first().waitFor();
    assert.equal(await page.locator("[data-template]").evaluate(element => getComputedStyle(element).getPropertyValue("--t-accent").trim()), "#145678");
    await mkdir("storage/phase3/screenshots", { recursive: true });
    await page.screenshot({ path: `storage/phase3/screenshots/${scenario.template}-desktop.png`, fullPage: true });
    let renderedPhoto = false;
    async function photoVisible() {
      const target = `/personalized/photos/${scenario.photo}.webp`;
      const images = page.locator("img");
      const index = await images.evaluateAll((items, target) => items.findIndex(image => decodeURIComponent(image.currentSrc || image.src).includes(target)), target);
      if (index < 0) return false;
      await images.nth(index).scrollIntoViewIfNeeded();
      await page.waitForFunction(target => [...document.images].some(image => decodeURIComponent(image.currentSrc || image.src).includes(target) && image.naturalWidth > 0), target);
      return true;
    }
    for (const [route, heading] of scenario.routes) {
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      if (scenario.template === "ember-and-salt" && route === "/menu") {
        const dish = page.getByRole("tabpanel").filter({ hasText: heading }).getByRole("listitem").filter({ hasText: heading });
        await dish.getByText(heading, { exact: true }).waitFor();
        assert.equal(await dish.locator("abbr[title='Vegan']").count(), 1);
        assert.equal(await dish.locator("abbr[title='Gluten-free']").count(), 1);
      } else await page.getByRole("heading", { name: heading, exact: true }).waitFor();
      renderedPhoto ||= await photoVisible();
    }
    if (scenario.photoRoute) {
      assert.equal((await page.goto(base + scenario.photoRoute, { waitUntil: "networkidle" })).status(), 200);
      renderedPhoto ||= await photoVisible();
    }
    assert.equal(renderedPhoto, true, "The uploaded library photo must render on a real exported page");
    const image = await fetch(`${base}/personalized/photos/${scenario.photo}.webp`);
    assert.equal(image.status, 200); assert.match(image.headers.get("content-type"), /image\/webp/);
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), await readFile(path.join(project, "public/personalized/photos", `${scenario.photo}.webp`)));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `storage/phase3/screenshots/${scenario.template}-mobile.png`, fullPage: true });
    assert.deepEqual(privateRequests, []); assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    if (server.pid && server.exitCode === null) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      else server.kill("SIGTERM");
    }
  }
});
