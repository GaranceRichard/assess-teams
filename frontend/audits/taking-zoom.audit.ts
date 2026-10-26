import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, test } from "@playwright/test";
import { e2eCredential } from "../e2e/identity-fixture";
import { seedTakingContext } from "../e2e/taking-fixture";
import { frontendURL } from "../e2e/urls";
import { expectRatingValues } from "../e2e/rating-values";

test("taking actions and focus remain reachable at native zoom 200%", async ({
  baseURL,
}, info) => {
  test.setTimeout(90_000);
  seedTakingContext();
  const extension = info.outputPath("zoom-extension");
  mkdirSync(extension, { recursive: true });
  writeFileSync(
    resolve(extension, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "Taking zoom probe",
      version: "1.0",
      permissions: ["tabs"],
      background: { service_worker: "worker.js" },
    }),
  );
  writeFileSync(
    resolve(extension, "worker.js"),
    "chrome.runtime.onInstalled.addListener(() => {});",
  );
  const context = await chromium.launchPersistentContext(
    info.outputPath("profile"),
    {
      channel: "chromium",
      headless: false,
      viewport: null,
      deviceScaleFactor: undefined,
      args: [
        "--window-size=1280,720",
        "--window-position=-1800,0",
        `--disable-extensions-except=${extension}`,
        `--load-extension=${extension}`,
      ],
    },
  );
  try {
    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker"));
    const page = context.pages()[0];
    await page.goto((baseURL ?? frontendURL) + "/evaluations");
    const cdp = await context.newCDPSession(page);
    const { windowId, bounds } = await cdp.send("Browser.getWindowForTarget");
    const initial = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
    }));
    await cdp.send("Browser.setWindowBounds", {
      windowId,
      bounds: {
        width: bounds.width + 1280 - initial.width,
        height: bounds.height + 720 - initial.height,
      },
    });
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page
      .getByRole("row")
      .filter({ hasText: "Passation E2E v1" })
      .getByRole("button", { name: "Passer l’évaluation" })
      .click();
    const dialog = page.getByRole("dialog");
    const slider = dialog.getByRole("slider");
    await dialog
      .getByRole("button", { name: "Choisir la note 5 sur 10" })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    let writes = 0;
    page.on("request", (request) => {
      if (request.method() === "PUT" && request.url().includes("/responses/"))
        writes++;
    });
    const directory = process.env.ASSESS_TAKING_AUDIT
      ? resolve(import.meta.dirname, "../../docs/quality/mep-013/zoom")
      : info.outputPath("zoom");
    mkdirSync(directory, { recursive: true });
    const rows = [];
    for (const theme of ["day", "night"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const zoom of [1, 2, 1]) {
        const actual = await worker.evaluate(`(async () => {
          const [tab] = await chrome.tabs.query({url: '${frontendURL}/*'});
          await chrome.tabs.setZoom(tab.id, ${zoom});
          return chrome.tabs.getZoom(tab.id);
        })()`);
        expect(actual).toBe(zoom);
        await expect
          .poll(() => page.evaluate(() => innerWidth))
          .toBe(1280 / zoom);
        await expect
          .poll(() => page.evaluate(() => innerHeight))
          .toBe(720 / zoom);
        await expectRatingValues(dialog);
        for (const name of ["Enregistrer la note", "Suivant", "Fermer"]) {
          const action = dialog.getByRole("button", { name, exact: true });
          await action.scrollIntoViewIfNeeded();
          await action.focus();
          await expect(action).toBeFocused();
          const measures = await action.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return {
              width: innerWidth,
              height: innerHeight,
              dpr: devicePixelRatio,
              scroll: document.documentElement.scrollWidth,
              available: document.documentElement.clientWidth,
              top: rect.top,
              bottom: rect.bottom,
            };
          });
          expect(measures.scroll).toBeLessThanOrEqual(measures.available);
          expect(measures.top).toBeGreaterThanOrEqual(0);
          expect(measures.bottom).toBeLessThanOrEqual(measures.height);
          rows.push({ theme, zoom: actual, action: name, ...measures });
        }
        await dialog.getByRole("button", { name: "Suivant" }).press("Enter");
        await expect(dialog.getByRole("heading", { level: 3 })).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(slider).toBeFocused();
        await expect(slider).toHaveAttribute("data-unanswered", "true");
        await expect(
          dialog.getByRole("button", { name: "Valider l’évaluation" }),
        ).toBeDisabled();
        await dialog.getByRole("button", { name: "Précédent" }).press("Enter");
        await expect(dialog.getByRole("heading", { level: 3 })).toBeFocused();
        await expect(slider).toHaveValue("5");
        expect(writes).toBe(0);
        const capture = await cdp.send("Page.captureScreenshot", {
          format: "png",
          fromSurface: true,
          captureBeyondViewport: false,
        });
        writeFileSync(
          resolve(directory, `${theme}-${zoom}.png`),
          Buffer.from(capture.data, "base64"),
        );
      }
    }
    writeFileSync(
      resolve(directory, "measurements.jsonl"),
      rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
    );
  } finally {
    await context.close();
  }
});
