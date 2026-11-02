import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("radar labels, non-color series and detailed scores agree at UX viewports", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const criteria = Array.from(
    { length: 12 },
    (_, i) => `Critère ${i + 1} de collaboration et amélioration continue`,
  );
  seedResultsContext(false, criteria);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page
    .getByRole("link", { name: "Tableau de bord", exact: true })
    .click();
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("radio", { name: "Vert", exact: true }).check();
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "green");
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  const measurements = [];
  const defects: string[] = [];
  for (const theme of ["day", "night"]) {
    const toggle = page.getByRole("button", {
      name: theme === "day" ? "Activer le mode jour" : "Activer le mode nuit",
    });
    if (await toggle.count()) await toggle.click();
    for (const size of [
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      await page.getByRole("tab", { name: "Graphique", exact: true }).click();
      await expect
        .poll(() =>
          page
            .locator(".results-radar canvas")
            .evaluate((canvas) => canvas.clientWidth),
        )
        .toBeGreaterThan(0);
      await page.waitForTimeout(350);
      const geometry = await page.evaluate(async () => {
        const modulePath = "/node_modules/.vite/deps/chart__js.js";
        const { Chart } = await import(modulePath);
        const canvas = document.querySelector<HTMLCanvasElement>(
          ".results-radar canvas",
        )!;
        const chart = Chart.getChart(canvas);
        return {
          width: chart.width,
          height: chart.height,
          radius: chart.scales.r.drawingArea,
          labels: chart.data.labels,
          boxes: chart.data.labels.map((_: unknown, i: number) =>
            chart.scales.r.getPointLabelPosition(i),
          ),
          datasets: chart.data.datasets.map(
            (dataset: {
              label: string;
              data: number[];
              borderDash: number[];
            }) => ({
              label: dataset.label,
              scores: dataset.data,
              dash: dataset.borderDash,
            }),
          ),
          overflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        };
      });
      const axes = page.getByRole("region", { name: "Axes du radar" });
      await expect(axes.getByRole("button")).toHaveText(
        criteria.map((criterion, i) => `${i + 1}. ${criterion}`),
      );
      await axes.getByRole("button").last().scrollIntoViewIfNeeded();
      await expect(axes.getByRole("button").last()).toBeInViewport();
      await axes.getByRole("button").first().scrollIntoViewIfNeeded();
      expect(geometry.labels).toEqual(criteria.map((_, i) => String(i + 1)));
      const name = `${theme}-${size.width}-${size.height}`;
      measurements.push({ name, ...geometry });
      await page.screenshot({
        path: test.info().outputPath(`${name}-radar.png`),
        fullPage: true,
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.radius).toBeGreaterThan(0);
      for (const [i, box] of geometry.boxes.entries()) {
        if (
          box.left < -1 ||
          box.top < -1 ||
          box.right > geometry.width + 1 ||
          box.bottom > geometry.height + 1
        )
          defects.push(`${name}: label ${i + 1} clipped`);
        for (const [j, other] of geometry.boxes.entries()) {
          if (
            j > i &&
            Math.min(box.right, other.right) - Math.max(box.left, other.left) >
              1 &&
            Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) >
              1
          )
            defects.push(`${name}: labels ${i + 1}/${j + 1} overlap`);
        }
      }
      const legend = page.getByRole("list", { name: "Légende des équipes" });
      if (size.width < 761) {
        const keyBox = (await axes.boundingBox())!;
        const legendBox = (await legend.boundingBox())!;
        if (legendBox.y + legendBox.height > keyBox.y)
          defects.push(`${name}: legend separated from radar`);
      }
      await expect(legend).toContainText("1. Équipe A");
      await expect(legend).toContainText("2. Équipe B");
      expect(
        geometry.datasets.map((series: { label: string }) => series.label),
      ).toEqual(["1. Équipe A", "2. Équipe B"]);
      expect(geometry.datasets[0].dash).not.toEqual(geometry.datasets[1].dash);
      expect(
        await legend
          .locator("line")
          .evaluateAll((lines) =>
            lines.map((line) => line.getAttribute("stroke-dasharray")),
          ),
      ).toEqual(
        geometry.datasets.map((series: { dash: number[] }) =>
          series.dash.join(" "),
        ),
      );
      const graph = page.getByRole("tab", { name: "Graphique", exact: true });
      await graph.focus();
      await page.keyboard.press("ArrowRight");
      await expect(
        page.getByRole("tab", { name: "Données détaillées" }),
      ).toBeFocused();
      const table = page.getByRole("table");
      await expect(table.getByRole("row")).toHaveCount(13);
      for (const [i, criterion] of criteria.entries()) {
        const row = table.getByRole("row").nth(i + 1);
        await expect(row.getByRole("button")).toHaveText(
          `${i + 1}. ${criterion}`,
        );
        await expect(row.locator("td")).toHaveText(
          geometry.datasets.map(
            (series: { scores: number[] }) => `${series.scores[i]} / 10`,
          ),
        );
      }
      await page.screenshot({
        path: test.info().outputPath(`${name}-details.png`),
        fullPage: true,
      });
    }
  }
  writeFileSync(
    test.info().outputPath("measurements.json"),
    JSON.stringify({ measurements, defects }, null, 2),
  );
  expect(defects).toEqual([]);
  await page.getByRole("checkbox", { name: /^Équipe A/ }).uncheck();
  await expect(page.getByRole("table").locator("thead th")).toHaveCount(2);
  await page.getByRole("tab", { name: "Graphique", exact: true }).click();
  await expect(
    page.getByRole("list", { name: "Légende des équipes" }),
  ).not.toContainText("Équipe A");
  await expect(
    page.getByRole("list", { name: "Légende des équipes" }),
  ).toContainText("2. Équipe B");
  const criterion = page
    .getByRole("region", { name: "Axes du radar" })
    .getByRole("button")
    .first();
  await criterion.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Analyse", { exact: true })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByLabel("Critère", { exact: true })).toHaveValue(/\d+/);
});
