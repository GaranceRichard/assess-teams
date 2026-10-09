import { expect, test, type Page } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

async function radarGeometry(page: Page) {
  return page.evaluate(async () => {
    const modulePath = "/node_modules/.vite/deps/chart__js.js";
    const { Chart } = await import(modulePath);
    const canvas = document.querySelector<HTMLCanvasElement>(
      ".results-radar canvas",
    )!;
    const chart = Chart.getChart(canvas);
    const rect = canvas.getBoundingClientRect();
    const parent = canvas.parentElement!.getBoundingClientRect();
    return {
      canvas: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      parent: { width: parent.width, height: parent.height },
      radius: chart.scales.r.drawingArea,
      labels: chart.data.labels.map((_: unknown, index: number) =>
        chart.scales.r.getPointLabelPosition(index),
      ),
      chart: { width: chart.width, height: chart.height },
      scroll: [
        document.documentElement,
        document.querySelector(".results-page")!,
        document.querySelector(".results-radar")!,
      ].map((element) => ({
        height: element.scrollHeight,
        available: element.clientHeight,
      })),
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
}

test("fits the entire radar, shares selections across accessible tabs and confines large tables to internal scroll", async ({
  page,
}) => {
  test.setTimeout(90_000);
  seedResultsContext(
    false,
    Array.from(
      { length: 12 },
      (_, index) =>
        "Critère " + (index + 1) + " de collaboration et amélioration continue",
    ),
  );
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  for (const size of [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 820, height: 600 },
    { width: 1280, height: 480 },
  ]) {
    await page.setViewportSize(size);
    await expect
      .poll(async () => {
        const geometry = await radarGeometry(page);
        return Math.abs(geometry.canvas.height - geometry.parent.height);
      })
      .toBeLessThanOrEqual(1);
    const geometry = await radarGeometry(page);
    await page.screenshot({
      path: test
        .info()
        .outputPath("radar-" + size.width + "-" + size.height + ".png"),
    });
    expect(geometry.canvas.y + geometry.canvas.height).toBeLessThanOrEqual(
      size.height,
    );
    expect(geometry.radius).toBeGreaterThan(0);
    for (const label of geometry.labels) {
      expect(label.left).toBeGreaterThanOrEqual(-1);
      expect(
        label.top,
        JSON.stringify({ size, geometry }),
      ).toBeGreaterThanOrEqual(-1);
      expect(label.right).toBeLessThanOrEqual(geometry.chart.width + 1);
      expect(
        label.bottom,
        JSON.stringify({ size, geometry }),
      ).toBeLessThanOrEqual(geometry.chart.height + 1);
    }
    for (const scroll of geometry.scroll)
      expect(scroll.height).toBeLessThanOrEqual(scroll.available + 1);
    await expect(page.getByRole("table")).toHaveCount(0);
  }
  const current = await radarGeometry(page);
  const label = current.labels[0];
  await page.mouse.click(
    current.canvas.x + (label.left + label.right) / 2,
    current.canvas.y + (label.top + label.bottom) / 2,
  );
  await expect(page.getByLabel("Analyse", { exact: true })).toHaveValue(
    "temporal",
  );
  await page.getByLabel("Analyse", { exact: true }).selectOption("radar");
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  const model = await page.getByLabel("Modèle").inputValue();
  const radarTab = page.getByRole("tab", { name: "Graphique", exact: true });
  const detailsTab = page.getByRole("tab", { name: "Données détaillées" });
  await radarTab.focus();
  await page.keyboard.press("ArrowRight");
  await detailsTab.hover();
  expect(
    await detailsTab.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).toBe("rgba(0, 0, 0, 0)");
  await expect(detailsTab).toBeFocused();
  await expect(detailsTab).toHaveAttribute("aria-selected", "true");
  const table = page.getByRole("region", { name: "Tableau des scores" });
  await expect(table.locator("thead time")).toHaveCount(2);
  await expect(table.getByRole("row")).toHaveCount(13);
  const overflow = await table.evaluate((element) => ({
    height: element.scrollHeight,
    available: element.clientHeight,
  }));
  expect(overflow.height).toBeGreaterThan(overflow.available);
  await table.focus();
  await page.keyboard.press("End");
  await expect
    .poll(() => table.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(
    await page
      .locator(".results-page")
      .evaluate((element) => element.scrollTop),
  ).toBe(0);
  await detailsTab.focus();
  await page.keyboard.press("Home");
  await expect(radarTab).toBeFocused();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toHaveAttribute("aria-label", /2 équipe/);
  await expect(page.getByLabel("Modèle")).toHaveValue(model);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await detailsTab.click();
  await expect(table).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await page.screenshot({
    path: test.info().outputPath("details-mobile.png"),
    fullPage: true,
  });
});
