import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import {
  desktopSizes,
  expectChartFits,
  observeChartText,
} from "./results-chart-geometry";
import { seedResultsContext } from "./results-fixture";

test("longitudinal fits its panel with readable axes after resize, tab changes and return", async ({
  page,
}) => {
  seedResultsContext(true);
  await observeChartText(page);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  await page.getByText("Historique par critère", { exact: true }).click();
  await page.getByRole("button", { name: "1. Collaboration v2" }).click();
  for (const size of desktopSizes) {
    await page.setViewportSize(size);
    await expectChartFits(page, /Évolution de/);
    await page.getByRole("tab", { name: "Données détaillées" }).click();
    await expect(page.getByRole("img")).toHaveCount(0);
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("tab", { name: "Graphique" }).click();
    await expectChartFits(page, /Évolution de/);
    await page.screenshot({
      path: test
        .info()
        .outputPath("history-" + size.width + "-" + size.height + ".png"),
    });
  }
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await expectChartFits(page, /Évolution de/);
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await expectChartFits(page, /Évolution de/);
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  const observations = page.getByRole("region", {
    name: "Observations historiques",
    exact: true,
  });
  await observations.focus();
  await page.keyboard.press("End");
  await expect
    .poll(() => observations.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(
    await page
      .getByRole("region", { name: "Évolution temporelle du critère" })
      .evaluate((element) => element.scrollTop),
  ).toBe(0);
  await page.getByRole("tab", { name: "Radar", exact: true }).click();
  await expect(page.getByRole("table")).toHaveAccessibleName(
    "Critères et scores des équipes sélectionnées",
  );
  await page.getByRole("tab", { name: "Graphique" }).click();
  await expectChartFits(page, /Radar des résultats/);
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Historique par critère", { exact: true }).click();
  await page.getByRole("button", { name: "1. Collaboration v2" }).click();
  await expect(page.getByRole("img", { name: /Évolution de/ })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: test.info().outputPath("history-mobile.png"),
    fullPage: true,
  });
});
