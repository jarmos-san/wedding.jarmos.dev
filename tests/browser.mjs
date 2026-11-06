import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { chromium } = await import(
  pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
);
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
});
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4387";
let passed = 0;
const check = async (name, run) => {
  await run();
  passed += 1;
  console.log(`PASS ${name}`);
};
try {
  for (const width of [320, 390, 768, 1440]) {
    await check(`Layout and local assets at ${width}px`, async () => {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.url().startsWith(base) && response.status() >= 400)
          errors.push(response.url());
      });
      await page.goto(base);
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page
        .locator(".invite-photo img")
        .evaluate((image) => image.decode());
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator(".is-pending").count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    });
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(base);
  await check(
    "Mobile menu opens, closes on Escape and follows section links",
    async () => {
      await page.getByRole("button", { name: "Open menu" }).click();
      assert.equal(
        await page.locator("#menuToggle").getAttribute("aria-expanded"),
        "true",
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("#menuToggle").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page
          .locator("#menuToggle")
          .evaluate((node) => node === document.activeElement),
        true,
      );
      await page.locator("#menuToggle").click();
      await page
        .getByRole("link", { name: "Guest guide", exact: true })
        .click();
      assert.equal(new URL(page.url()).hash, "#travel");
      assert.equal(
        await page.locator("#menuToggle").getAttribute("aria-expanded"),
        "false",
      );
    },
  );
  await check("Guide disclosures are keyboard operable", async () => {
    const summary = page
      .locator("summary")
      .filter({ hasText: "Travelling by train" });
    await summary.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await summary.evaluate((node) => node.parentElement.open),
      true,
    );
  });
  await check(
    "Invitation dialog traps focus, closes on Escape and restores focus",
    async () => {
      await page.locator("#previewInvite").click();
      assert.equal(
        await page.locator("dialog").evaluate((node) => node.open),
        true,
      );
      assert.equal(
        await page
          .locator("body")
          .evaluate((node) => node.classList.contains("modal-open")),
        true,
      );
      for (let i = 0; i < 5; i += 1) {
        await page.keyboard.press("Tab");
        // Chromium may put focus on body between the end and beginning of the modal cycle.
        assert.equal(
          await page.evaluate(
            () =>
              document.activeElement === document.body ||
              !!document.activeElement.closest("dialog"),
          ),
          true,
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("dialog").evaluate((node) => node.open),
        false,
      );
      assert.equal(
        await page
          .locator("#previewInvite")
          .evaluate((node) => node === document.activeElement),
        true,
      );
      await page.locator("#previewInvite").click();
      await page.getByRole("button", { name: "Close invitation" }).click();
      assert.equal(
        await page.locator("dialog").evaluate((node) => node.open),
        false,
      );
    },
  );
  await check("Original invitation PNG downloads successfully", async () => {
    const waiting = page.waitForEvent("download");
    await page.locator(".invite-actions a[download]").click();
    const download = await waiting;
    assert.equal(await download.failure(), null);
    const data = await readFile(await download.path());
    assert.equal(data.subarray(1, 4).toString(), "PNG");
  });
  await check(
    "Both calendar downloads contain correct all-day dates and no invented times",
    async () => {
      for (const [name, start, end] of [
        ["wedding", "13", "14"],
        ["reception", "17", "18"],
      ]) {
        const waiting = page.waitForEvent("download");
        await page.locator(`a[href="assets/${name}.ics"]`).click();
        const download = await waiting;
        assert.equal(await download.failure(), null);
        const text = await readFile(await download.path(), "utf8");
        assert.ok(text.includes(`DTSTART;VALUE=DATE:202612${start}\r\n`));
        assert.ok(text.includes(`DTEND;VALUE=DATE:202612${end}\r\n`));
        assert.ok(text.includes("Exact venue and timing to be confirmed."));
        assert.ok(!text.includes("DTSTART;TZID"));
      }
    },
  );
  await check(
    "All section targets resolve and map destinations match the towns",
    async () => {
      const missing = await page
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links
            .filter((link) => !document.getElementById(link.hash.slice(1)))
            .map((link) => link.hash),
        );
      assert.deepEqual(missing, []);
      for (const town of ["Kumarghat", "Agartala"]) {
        const href = await page
          .getByRole("link", { name: `Directions to ${town}` })
          .getAttribute("href");
        assert.equal(
          new URL(href).searchParams.get("destination"),
          `${town}, Tripura`,
        );
      }
    },
  );
  await check(
    "Countdown uses IST even for a visitor in Los Angeles, and handles completion",
    async () => {
      const context = await browser.newContext({
        timezoneId: "America/Los_Angeles",
      });
      const clockPage = await context.newPage();
      await clockPage.clock.install({
        time: new Date("2026-12-12T18:29:59Z"),
      });
      await clockPage.clock.pauseAt(new Date("2026-12-12T18:29:59Z"));
      await clockPage.goto(base);
      assert.equal(await clockPage.locator("#seconds").textContent(), "01");
      await clockPage.clock.runFor(1000);
      assert.equal(await clockPage.locator("#seconds").textContent(), "00");
      assert.equal(
        await clockPage.locator("#countdownTitle").textContent(),
        "Our wedding day has arrived",
      );
      await context.close();
    },
  );
  await check(
    "Navigation, guide and downloads remain available without JavaScript",
    async () => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      const fallback = await context.newPage();
      await fallback.goto(base);
      assert.equal(
        await fallback
          .getByRole("link", { name: "Guest guide", exact: true })
          .isVisible(),
        true,
      );
      assert.equal(
        await fallback.locator("#previewInvite").getAttribute("href"),
        "assets/wedding-invitation.png",
      );
      assert.equal(await fallback.locator("a[download]").count(), 4);
      await context.close();
    },
  );
  await check(
    "Scroll reveal completes when content enters the viewport",
    async () => {
      const animated = await browser.newPage({
        reducedMotion: "no-preference",
      });
      await animated.goto(base);
      await animated.locator(".closing").scrollIntoViewIfNeeded();
      await animated.waitForFunction(
        () =>
          !document.querySelector(".closing").classList.contains("is-pending"),
      );
      await animated.close();
    },
  );
  console.log(`${passed} browser checks passed.`);
} finally {
  await browser.close();
}
