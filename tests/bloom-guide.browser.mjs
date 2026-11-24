import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local server");

test("a first-time visitor can choose a guesthouse and personalize its preview", { timeout: 180_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await page.goto(base);
    await page.getByRole("button", { name: "Need any help?" }).click();
    const dialog = page.getByRole("dialog", { name: "Bloom", exact: true });
    const bounds = await dialog.boundingBox();
    assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 844);
    assert.equal(await dialog.evaluate(el => getComputedStyle(el.parentElement).position), "fixed");
    await page.getByRole("button", { name: "I’ll explore" }).click();
    await page.reload();
    const launcher = page.getByRole("button", { name: /Ask Bloom/ });
    await launcher.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Help me find a design" }).click();
    await page.getByRole("button", { name: "A place to stay" }).click();
    await page.getByRole("button", { name: "Bed & breakfast" }).click();
    await page.getByRole("link", { name: "Open this design" }).click();
    await page.getByRole("link", { name: "Explore the sample site" }).click();
    await page.waitForURL("**/preview/harbor-house");
    await page.getByRole("link", { name: "Try my business name" }).click();
    const name = page.getByLabel("Business name", { exact: true });
    await page.waitForFunction(() => document.activeElement?.id === "business-name");
    await name.fill("Blue Bay Guesthouse");
    await page.frameLocator("iframe[data-business-preview]").getByText("Blue Bay Guesthouse", { exact: true }).first().waitFor();
    await page.getByRole("button", { name: "See my name in the preview" }).click();
    await page.getByText(/Only your preview has changed/).waitFor();
    await page.getByRole("button", { name: "Order with the owner" }).click();
    assert.equal(await page.getByRole("link", { name: /Call \+63/ }).getAttribute("href"), "tel:+639669221451");
    await page.getByText(/Email coming soon.*baybloom.studios@gmail.com/).waitFor();
    await page.getByRole("button", { name: "Back to guide" }).click();
    await page.getByRole("button", { name: "Start again" }).click();
    assert.equal(await name.inputValue(), "Blue Bay Guesthouse");
    await name.fill("Blue Bay Lodge");
    await page.frameLocator("iframe[data-business-preview]").getByText("Blue Bay Lodge", { exact: true }).first().waitFor();
    await page.getByRole("button", { name: "See my name in the preview" }).click();
    await page.getByRole("button", { name: "Explore order options" }).click();
    await page.getByText("Choose how to order").waitFor();
    const opened = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Compare packages in a new tab" }).click();
    const packages = await opened;
    await packages.getByRole("button", { name: "Show packages" }).click();
    assert.equal(new URL(packages.url()).hash, "#tiers");
    await packages.close();
    assert.equal(await name.inputValue(), "Blue Bay Lodge");
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog", { name: "Bloom" }).count(), 0);
  } finally {
    await browser.close();
  }
});

test("Bloom locks the name step until the live preview updates and restores the editor on exit", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await page.goto(`${base}/personalize/harbor-house#business-name`);
    const launcher = page.getByRole("button", { name: "Show me where" });
    await launcher.click();
    const name = page.locator("#business-name");
    const forward = page.getByRole("button", { name: "See my name in the preview" });
    await page.waitForFunction(() => document.activeElement?.id === "business-name");
    assert.equal(await forward.isEnabled(), false);
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), true);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.textContent.trim()), "Exit tour");
    await page.keyboard.press("Escape");
    await launcher.waitFor();
    await page.waitForFunction(() => document.activeElement?.textContent.trim() === "Show me where");
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);

    await launcher.click();
    const frame = page.frameLocator("iframe[data-business-preview]");
    await frame.locator("body").evaluate(() => {
      window.addEventListener("message", event => {
        if (event.data?.draft?.business?.name === "Harbor House") event.stopImmediatePropagation();
      }, true);
    });
    await name.fill("Harbor House");
    assert.equal(await forward.isEnabled(), false);
    await name.fill("Blue Bay Guesthouse");
    await frame.getByText("Blue Bay Guesthouse", { exact: true }).first().waitFor();
    await forward.click();
    await page.getByRole("heading", { name: "Your name is live in the preview" }).waitFor();
    const ring = await page.locator(".bloom-spotlight-ring").boundingBox();
    assert.ok(ring && ring.width > 10 && ring.height > 10 && ring.y >= 0 && ring.y + ring.height <= 844);
    await page.getByRole("button", { name: "Finish tour" }).click();
    await page.getByText(/Only your preview has changed/).waitFor();
    assert.equal(await name.inputValue(), "Blue Bay Guesthouse");
    assert.equal(await page.locator(".bloom-spotlight").count(), 0);
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);
  } finally {
    await browser.close();
  }
});
