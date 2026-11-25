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
    assert.equal(await dialog.getByRole("link", { name: "baybloom.studios@gmail.com" }).getAttribute("href"), "mailto:baybloom.studios@gmail.com");
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
    await page.setViewportSize({ width: 390, height: 420 });
    await name.evaluate(el => el.scrollIntoView({ block: "center" }));
    await page.waitForFunction(() => {
      const field = document.querySelector("#business-name").getBoundingClientRect();
      const card = document.querySelector(".bloom-spotlight-card").getBoundingClientRect();
      return card.top >= field.bottom || card.bottom <= field.top;
    });
    await name.click();
    await page.locator("iframe[data-business-preview]").evaluate(frame => {
      const preview = frame.contentWindow;
      const post = preview.postMessage.bind(preview);
      preview.postMessage = (message, ...args) => {
        if (message?.draft?.business?.name === "Harbor House") return;
        if (message?.draft?.business?.name === "Blue Bay Guesthouse") {
          window.setTimeout(() => post(message, ...args), 800);
          return;
        }
        post(message, ...args);
      };
    });
    await name.fill("Harbor House");
    await name.press("Enter");
    await page.getByRole("status").getByText("Updating your preview…").waitFor();
    assert.equal(await forward.isEnabled(), false);
    await page.getByRole("status").getByText(/preview is taking longer/).waitFor();
    assert.equal(await forward.isEnabled(), true);
    await name.fill("");
    await name.pressSequentially("Blue Bay Guesthouse");
    await page.setViewportSize({ width: 390, height: 844 });
    await name.press("Enter");
    await page.getByRole("status").getByText("Updating your preview…").waitFor();
    await page.getByRole("heading", { name: "Your name is live in the preview" }).waitFor();
    const ring = await page.locator(".bloom-spotlight-ring").boundingBox();
    assert.ok(ring && ring.width > 10 && ring.height > 10 && ring.y >= 0 && ring.y + ring.height <= 844);
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);
    await page.getByRole("button", { name: "Finish tour" }).click();
    await page.getByText(/Only your preview has changed/).waitFor();
    assert.equal(await name.inputValue(), "Blue Bay Guesthouse");
    assert.equal(await page.locator(".bloom-spotlight").count(), 0);
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);
  } finally {
    await browser.close();
  }
});

test("the tier comparison spotlight stays aligned as the viewport changes", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1325, height: 825 }, reducedMotion: "no-preference" });
    await page.goto(`${base}/designs/harbor-house?bloom=packages#tiers`);
    await page.getByRole("heading", { name: "Compare the packages" }).waitFor();
    for (const viewport of [{ width: 1325, height: 825 }, { width: 390, height: 724 }, { width: 1325, height: 825 }]) {
      await page.setViewportSize(viewport);
      await page.waitForFunction(({ width }) => {
        const desktop = width >= 1024;
        const target = document.querySelector(desktop ? '[data-bloom-target="tiers"]' : '[data-bloom-target="tiers-intro"]');
        const ring = document.querySelector(".bloom-spotlight-unlocked .bloom-spotlight-ring:not([hidden])");
        const card = document.querySelector(".bloom-spotlight-unlocked .bloom-spotlight-card");
        if (!target || !ring || !card) return false;
        const targetRect = target.getBoundingClientRect();
        const ringRect = ring.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const near = (a, b) => Math.abs(a - b) < 1;
        const aligned = near(ringRect.top, targetRect.top - 6) && near(ringRect.bottom, targetRect.bottom + 6)
          && near(ringRect.left, targetRect.left - 6) && near(ringRect.right, targetRect.right + 6);
        if (!aligned) return false;
        if (!desktop) return cardRect.bottom < ringRect.top;
        const tierHeadings = [...target.querySelectorAll("h3")];
        return near(cardRect.top, ringRect.top) && cardRect.left > ringRect.right && tierHeadings.length > 0
          && tierHeadings.every(heading => heading.getBoundingClientRect().bottom < ringRect.bottom);
      }, viewport);
    }
  } finally {
    await browser.close();
  }
});

test("the tutorial follows real controls through package comparison and preserves the editor", { timeout: 180_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      const hint = page.locator(".bloom-spotlight-unlocked");
      await page.goto(base);
      await page.getByRole("button", { name: "Need any help?" }).click();
      await page.getByRole("button", { name: "Start tutorial" }).click();
      await page.getByRole("button", { name: "A place to stay" }).click();
      await page.getByRole("button", { name: "Bed & breakfast" }).click();
      await page.reload();
      await page.getByRole("link", { name: "Open this design" }).click();
      await hint.getByText("See what your guests will see").waitFor();
      assert.equal(await page.locator("article[inert]").count(), 0);
      await page.getByRole("link", { name: "Try the live demo" }).click();
      await hint.getByText("Explore a guest page").waitFor();
      await page.getByRole("combobox", { name: "Preview page" }).selectOption("/rooms");
      await hint.getByText("Try the design with your name").waitFor();
      await page.reload();
      await hint.getByText("Try the design with your name").waitFor();
      await page.goBack();
      await hint.getByText("See what your guests will see").waitFor();
      await page.getByRole("link", { name: "Try the live demo" }).click();
      await hint.getByText("Try the design with your name").waitFor();
      await page.getByRole("link", { name: "Try my business name", exact: true }).click();
      await hint.getByRole("button", { name: "Start name exercise" }).click();
      const input = page.getByLabel("Business name", { exact: true });
      await input.fill("Lantern Bay Guesthouse");
      await page.getByRole("button", { name: "See my name in the preview" }).click();
      await page.getByRole("button", { name: "Keep designing", exact: true }).click();
      await hint.getByText("Try your brand color").waitFor();
      assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);
      await hint.getByRole("button", { name: "Skip step" }).click();
      await hint.getByText("See where photos can change").waitFor();
      await hint.getByRole("button", { name: "Continue" }).click();
      await hint.getByText("Keep your edits for checkout").waitFor();
      await hint.getByRole("button", { name: "Continue" }).click();
      await hint.getByRole("heading", { name: "Review your website preview" }).waitFor();
      await page.frameLocator("iframe[data-business-preview]").getByText("Lantern Bay Guesthouse", { exact: true }).first().waitFor();
      await hint.getByRole("button", { name: "How to order" }).click();
      await hint.getByText("Pay securely", { exact: true }).waitFor();
      await hint.getByRole("button", { name: "Order with the owner" }).click();
      assert.equal(await hint.getByRole("link", { name: /Call/ }).getAttribute("href"), "tel:+639669221451");
      assert.equal(await hint.getByRole("link", { name: "baybloom.studios@gmail.com" }).getAttribute("href"), "mailto:baybloom.studios@gmail.com");
      const opened = page.waitForEvent("popup");
      await hint.getByRole("link", { name: "Compare packages in a new tab" }).click();
      const packages = await opened;
      const packageHint = packages.locator(".bloom-spotlight-unlocked");
      await packageHint.getByText("Compare the packages").waitFor();
      assert.equal(await input.inputValue(), "Lantern Bay Guesthouse");
      await hint.filter({ visible: true }).waitFor({ state: "hidden" });
      await packageHint.getByRole("button", { name: "Show buying options" }).click();
      await packages.getByRole("link", { name: "Log in to see prices" }).waitFor();
      await packageHint.getByRole("button", { name: "Order with the owner" }).click();
      assert.equal(await packageHint.getByRole("link", { name: /Call/ }).getAttribute("href"), "tel:+639669221451");
      assert.equal(await packageHint.getByRole("link", { name: "baybloom.studios@gmail.com" }).getAttribute("href"), "mailto:baybloom.studios@gmail.com");
      await packageHint.getByRole("button", { name: "Finish tour" }).click();
      await packages.getByRole("button", { name: "Ask Bloom" }).waitFor();
      await packages.reload();
      await packages.getByRole("button", { name: "Ask Bloom" }).waitFor();
      await packageHint.filter({ visible: true }).waitFor({ state: "hidden" });
      await context.close();
    }
  } finally {
    await browser.close();
  }
});

test("visitors can start directly in the editor, skip a locked step, and exit with Escape", { timeout: 90_000 }, async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await page.goto(`${base}/personalize/harbor-house`);
    await page.getByRole("button", { name: "Ask Bloom" }).click();
    await page.getByRole("button", { name: "Start tutorial" }).click();
    await page.getByRole("button", { name: "Start name exercise" }).click();
    const input = page.getByLabel("Business name", { exact: true });
    await input.fill("Unfinished Guesthouse");
    await page.getByRole("button", { name: "Skip step", exact: true }).click();
    await page.getByRole("heading", { name: "Try your brand color" }).waitFor();
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.activeElement?.textContent.trim() === "Ask Bloom");
    assert.equal(await input.inputValue(), "Unfinished Guesthouse");
    assert.equal(await page.locator(".bloom-spotlight").count(), 0);
    assert.equal(await page.getByLabel("Tagline", { exact: true }).evaluate(el => !!el.closest("[inert]")), false);
  } finally {
    await browser.close();
  }
});
