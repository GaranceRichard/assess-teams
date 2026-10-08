import { expect, test } from "@playwright/test";

import {
  desktopSizes,
  expectChartFits,
  observeChartText,
} from "../e2e/results-chart-geometry";

test("static demo fits longitudinal and radar through resize and tabs without an API", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  await page.route("**/api/**", (route) => {
    apiCalls.push(route.request().url());
    return route.abort();
  });
  await observeChartText(page);
  await page.goto("./#/results");
  await page.getByText("Historique par critère", { exact: true }).click();
  await page.getByRole("button", { name: "1. Clarté des objectifs" }).click();
  for (const size of desktopSizes) {
    await page.setViewportSize(size);
    await expectChartFits(page, /Évolution de/);
    await page.getByRole("tab", { name: "Résultats détaillés" }).click();
    await page.getByRole("tab", { name: "Radar", exact: true }).click();
    await expectChartFits(page, /Évolution de/);
    await page.screenshot({
      path: test
        .info()
        .outputPath("demo-history-" + size.width + "-" + size.height + ".png"),
    });
  }
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await expectChartFits(page, /Évolution de/);
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await expectChartFits(page, /Évolution de/);
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
  await page.getByRole("button", { name: "Retour au radar" }).click();
  await expectChartFits(page, /Radar des résultats/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Historique par critère", { exact: true }).click();
  await page.getByRole("button", { name: "1. Clarté des objectifs" }).click();
  await expect(page.getByRole("img", { name: /Évolution de/ })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: test.info().outputPath("demo-history-mobile.png"),
    fullPage: true,
  });
  expect(apiCalls).toEqual([]);
});
