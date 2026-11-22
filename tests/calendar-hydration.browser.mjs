import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Browser checks must target a local server");

test("Bloomfield calendar hydrates without date-format mismatches", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`${base}/demo/bloomfield-gardens`, { waitUntil: "domcontentloaded" });
    const grid = page.getByRole("grid").first();
    await grid.waitFor();
    const day = grid.getByRole("gridcell").first();
    await day.waitFor();
    await page.waitForFunction(() => {
      const label = document.querySelector('[role="gridcell"]')?.getAttribute("aria-label");
      return label && !/^\d{4}-\d{2}-\d{2}$/.test(label);
    });
    assert.ok(!errors.some((message) => /hydrat|server rendered html/i.test(message)), errors.join("\n"));
  } finally { await browser.close(); }
});
