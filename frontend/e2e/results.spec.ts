import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("compares latest completed team runs on a persistent radar without navigation or requests", async ({
  page,
}) => {
  seedResultsContext();
  let resultsRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/results/")) resultsRequests += 1;
  });
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(
    page.getByText("Sélectionnez un modèle pour comparer les équipes."),
  ).toBeVisible();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  const radar = page.getByRole("img", { name: /Radar des résultats/ });
  await expect(radar).toHaveAttribute(
    "aria-label",
    /0 équipe\(s\), 3 axe\(s\), échelle 0 à 10/,
  );
  await expect(
    page.getByRole("rowheader", { name: "1. Collaboration" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: "2. Livraison" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /^Équipe A/ }),
  ).not.toBeChecked();
  const loadedRequests = resultsRequests;
  const emptyDrawing = await radar.evaluate((canvas: HTMLCanvasElement) =>
    canvas.toDataURL(),
  );
  const legend = page.getByRole("list", { name: "Légende des équipes" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(radar).toHaveAttribute("aria-label", /1 équipe/);
  await expect
    .poll(() =>
      radar.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
    )
    .not.toBe(emptyDrawing);
  await expect(legend.getByText("1. Équipe A", { exact: true })).toBeVisible();
  await expect(legend.locator("time")).toHaveAttribute(
    "datetime",
    "2026-10-02T08:00:00-04:00",
  );
  await expect(
    page.getByRole("cell", { name: "0 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "10 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "2 / 10", exact: true }),
  ).toHaveCount(0);

  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  await expect(radar).toHaveAttribute("aria-label", /2 équipe/);
  await expect(legend.getByRole("listitem")).toHaveCount(2);
  const seriesDrawing = await radar.evaluate((canvas: HTMLCanvasElement) =>
    canvas.toDataURL(),
  );
  const seriesColors = await legend
    .locator("line")
    .evaluateAll((lines) => lines.map((line) => line.getAttribute("stroke")));
  await page.getByText("Couleurs", { exact: true }).click();
  for (const label of ["Bleu", "Rose", "Rouge", "Vert"]) {
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
    expect(
      await radar.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
    ).toBe(seriesDrawing);
    expect(
      await legend
        .locator("line")
        .evaluateAll((lines) =>
          lines.map((line) => line.getAttribute("stroke")),
        ),
    ).toEqual(seriesColors);
  }
  await page.getByText("Couleurs", { exact: true }).click();
  await page.screenshot({
    path: test.info().outputPath("radar-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page.screenshot({
    path: test.info().outputPath("radar-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await expect(legend.getByText("2. Équipe B", { exact: true })).toBeVisible();
  await expect(legend.locator("line").nth(0)).toHaveAttribute(
    "stroke-dasharray",
    "",
  );
  await expect(legend.locator("line").nth(1)).toHaveAttribute(
    "stroke-dasharray",
    "4 3",
  );
  await page.getByRole("checkbox", { name: /^Équipe A/ }).uncheck();
  await expect(radar).toHaveAttribute("aria-label", /1 équipe/);
  await expect(legend.getByText("1. Équipe A", { exact: true })).toHaveCount(0);
  await expect(legend.getByText("2. Équipe B", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).uncheck();
  await expect(radar).toHaveAttribute("aria-label", /0 équipe\(s\), 3 axe/);
  await expect(legend.getByRole("listitem")).toHaveCount(0);
  await expect
    .poll(() =>
      radar.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
    )
    .toBe(emptyDrawing);
  await expect(
    page.getByRole("rowheader", { name: "3. Amélioration" }),
  ).toBeVisible();
  expect(resultsRequests).toBe(loadedRequests);
  await expect(page).toHaveURL(/\/results$/);
});
