import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium, expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { frontendURL } from "./urls";
import { attachMotion, moving, observeMotion } from "./motion-evidence";

test("native browser zoom 200% retains motion, focus and reachable actions", async ({
  browserName,
}, info) => {
  expect(browserName).toBe("chromium");
  seedTakingContext();
  const profile = await mkdtemp(join(tmpdir(), "at-z-"));
  await mkdir(join(profile, "Default"), { recursive: true });
  // Chromium's native default zoom, not CSS zoom, device emulation or pinch scale.
  await writeFile(
    join(profile, "Default/Preferences"),
    JSON.stringify({
      partition: { default_zoom_level: { x: Math.log(2) / Math.log(1.2) } },
    }),
  );
  // CI installs only Headless Shell; its image already supplies full Chrome.
  // Keep local cached proofs tied to the Playwright browser they fingerprint.
  const channel =
    process.env.CI && !existsSync(chromium.executablePath())
      ? "chrome"
      : "chromium";
  const context = await chromium.launchPersistentContext(profile, {
    channel,
    headless: true,
    viewport: null,
    deviceScaleFactor: undefined,
    args: ["--window-size=1440,1000"],
    recordVideo: {
      dir: info.outputPath("video"),
      size: { width: 1440, height: 1000 },
    },
  });
  const page = context.pages()[0];
  try {
    const protocol = await context.newCDPSession(page);
    const version = await protocol.send("Browser.getVersion");
    await protocol.detach();
    await page.goto(`${frontendURL}/evaluations`);
    const metrics = await page.evaluate(() => ({
      dpr: devicePixelRatio,
      width: innerWidth,
      height: innerHeight,
      pinchScale: visualViewport!.scale,
      cssZoom: getComputedStyle(document.documentElement).zoom,
    }));
    expect(metrics.dpr).toBe(2);
    expect(metrics.width).toBeLessThanOrEqual(720);
    expect(metrics.pinchScale).toBe(1);
    expect(metrics.cssZoom).toBe("1");
    await page.getByLabel("Identifiant").fill("taking-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    const row = page
      .getByRole("row")
      .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
    await expect(row).toBeVisible();
    await observeMotion(page);
    const motions = [];
    for (const theme of ["day", "night"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      motions.push(
        await moving(page, "dialog-enter", () =>
          row.getByRole("button", { name: /Passer|Reprendre/ }).click(),
        ),
      );
      const dialog = page.getByRole("dialog");
      if (await dialog.getByText("Question 2 / 2").count())
        await moving(page, "question-enter", () =>
          dialog.getByRole("button", { name: "Précédent" }).click(),
        );
      await dialog.getByRole("slider").press("Home");
      await expect(
        dialog.getByText("Note enregistrée", { exact: true }),
      ).toBeVisible();
      motions.push(
        await moving(page, "question-enter", () =>
          dialog.getByRole("button", { name: "Suivant" }).click(),
        ),
      );
      await expect(dialog.locator("#question-text")).toBeFocused();
      for (const name of ["Précédent", "Fermer"]) {
        const button = dialog.getByRole("button", { name, exact: true });
        await expect(button).toBeInViewport();
        await button.focus();
        await expect(button).toBeFocused();
      }
      const box = await dialog.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(metrics.height);
      await page.screenshot({ path: info.outputPath(`zoom-200-${theme}.png`) });
      await page.keyboard.press("Escape");
      motions.push(
        await moving(page, "page-enter", () =>
          page
            .getByRole("link", { name: "Tableau de bord", exact: true })
            .click(),
        ),
      );
      motions.push(await moving(page, "page-enter", () => page.goBack()));
      await expect(row).toBeVisible();
    }
    await attachMotion(info, "native-zoom-and-motion", {
      browser: { channel, product: version.product },
      metrics,
      motions,
    });
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
    await info.attach("native-zoom-video", {
      path: await page.video()!.path(),
      contentType: "video/webm",
    });
  }
});
