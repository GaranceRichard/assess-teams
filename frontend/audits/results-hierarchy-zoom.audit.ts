import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, test } from "@playwright/test";

import { e2eCredential } from "../e2e/identity-fixture";
import { seedResultsContext } from "../e2e/results-fixture";
import { frontendURL } from "../e2e/urls";

test("keeps result context and actions reachable at native browser zoom 200%", async ({
  baseURL,
}, info) => {
  test.setTimeout(90_000);
  seedResultsContext(true);
  const extension = info.outputPath("zoom-extension");
  mkdirSync(extension, { recursive: true });
  writeFileSync(
    resolve(extension, "manifest.json"),
    JSON.stringify({
      manifest_version: 3,
      name: "Results zoom probe",
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
    await page.goto((baseURL ?? frontendURL) + "/results");
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
    await page.getByLabel("Identifiant").fill("results-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
    await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
    const evidence = process.env.ASSESS_RESULTS_AUDIT;
    const directory = evidence
      ? resolve(
          import.meta.dirname,
          "../../docs/quality/mep-014",
          evidence,
          "zoom",
        )
      : info.outputPath("zoom");
    mkdirSync(directory, { recursive: true });
    const rows = [];
    for (const theme of ["day", "night"]) {
      const toggle = page.getByRole("button", {
        name: theme === "day" ? "Activer le mode jour" : "Activer le mode nuit",
      });
      if (await toggle.count()) await toggle.click();
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
        for (const temporal of [false, true]) {
          const analysis = page.getByRole("switch", { name: "Analyse" });
          if (
            (await analysis.getAttribute("aria-checked")) !== String(temporal)
          )
            await analysis.click();
          if (temporal)
            await page
              .getByLabel("Critère", { exact: true })
              .selectOption({ index: 1 });
          for (const detailed of [false, true]) {
            const action = page.getByRole("tab", {
              name: detailed ? "Données détaillées" : "Graphique",
              exact: true,
            });
            await action.click();
            await expect(
              page.getByRole(detailed ? "table" : "img"),
            ).toBeVisible();
            await action.focus();
            await action.scrollIntoViewIfNeeded();
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
            await expect(
              page.getByRole("checkbox", { name: /^Équipe A/ }),
            ).toBeChecked();
            const name = `${theme}-${zoom}-${temporal ? "history" : "radar"}-${detailed ? "details" : "chart"}`;
            rows.push({ name, zoom: actual, ...measures });
            if (evidence) {
              const capture = await cdp.send("Page.captureScreenshot", {
                format: "png",
                fromSurface: true,
                captureBeyondViewport: false,
              });
              writeFileSync(
                resolve(directory, name + ".png"),
                Buffer.from(capture.data, "base64"),
              );
            }
          }
        }
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
