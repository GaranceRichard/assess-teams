import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { e2eCredential } from "../e2e/identity-fixture";
import { seedResultsContext } from "../e2e/results-fixture";
import {
  reachable,
  responsiveGeometry,
  setResponsiveTheme,
} from "../e2e/responsive-geometry";
import { nativeZoom } from "./native-zoom";

// MEP-015 changed the radar key after MEP-014's zoom evidence.
test("UX-05 current charts and long criteria survive native zoom 100–200–100", async ({
  browserName,
}, info) => {
  expect(browserName).toBe("chromium");
  test.setTimeout(120_000);
  seedResultsContext(
    false,
    Array.from(
      { length: 12 },
      (_, i) => `Critère ${i + 1} de collaboration et amélioration continue`,
    ),
  );
  const probe = await nativeZoom(info);
  const { page, context } = probe;
  page.setDefaultTimeout(10_000);
  const measurements = [];
  try {
    await page.getByLabel("Identifiant").fill("results-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
    await page.goto("/results");
    await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
    await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
    await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
    for (const theme of ["day", "night"]) {
      await setResponsiveTheme(page, theme);
      for (const [step, zoom] of [1, 2, 1].entries()) {
        const metrics = await probe.zoom(zoom);
        for (const temporal of [false, true]) {
          const analysis = page.getByRole("switch", {
            name: "Analyse",
            exact: true,
          });
          if (
            (await analysis.getAttribute("aria-checked")) !== String(temporal)
          )
            await analysis.click();
          if (temporal)
            await page
              .getByLabel("Critère", { exact: true })
              .selectOption({ index: 1 });
          for (const detailed of [false, true]) {
            const tab = page.getByRole("tab", {
              name: detailed ? "Données détaillées" : "Graphique",
              exact: true,
            });
            await tab.click();
            await reachable(tab);
            let content;
            if (detailed) {
              const region = page.getByRole("region", {
                name: temporal
                  ? "Observations historiques"
                  : "Tableau des scores",
              });
              await expect(page.getByRole("table")).toBeVisible();
              content = await page.getByRole("table").innerText();
              // The full text is kept, with horizontal scrolling confined to its region.
              expect(content).toContain(temporal ? "0/10" : "12. Critère 12");
              await region.focus();
              await page.keyboard.press("End");
            } else {
              const canvas = page.locator("canvas");
              await expect(canvas).toBeVisible();
              const dimensions = await canvas.evaluate((element) => ({
                width: element.clientWidth,
                height: element.clientHeight,
              }));
              expect(dimensions.width).toBeGreaterThan(0);
              expect(dimensions.height).toBeGreaterThan(0);
              content = dimensions;
              await canvas.scrollIntoViewIfNeeded();
            }
            await expect(
              page.getByRole("checkbox", { name: /^Équipe A/ }),
            ).toBeChecked();
            await expect(
              page.getByRole("checkbox", { name: /^Équipe B/ }),
            ).toBeChecked();
            const name = `${theme}-${step}-${zoom}-${temporal ? "history" : "radar"}-${detailed ? "details" : "chart"}`;
            measurements.push({
              name,
              metrics,
              content,
              regions: await responsiveGeometry(page),
            });
            await probe.capture(name);
          }
        }
      }
    }
  } finally {
    writeFileSync(
      info.outputPath("measurements.jsonl"),
      measurements.map((row) => JSON.stringify(row)).join("\n") + "\n",
    );
    await context.close();
  }
});
