import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("automatic latest-version radar opens explicit-lineage observations and returns without losing selection", async ({
  page,
}) => {
  seedResultsContext(true);
  let historyRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/criteria/")) historyRequests += 1;
  });
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("radio", { name: "Bleu", exact: true }).check();
  await page.getByRole("link", { name: "Voir les résultats" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "blue");
  await expect(page.locator("header").getByText("Couleurs")).toHaveCount(0);
  await expect(page.getByLabel("Organisation")).toBeDisabled();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await expect(page.getByText(/Version radar : v2/)).toBeVisible();
  const radar = page.getByRole("img", { name: /Radar des résultats/ });
  await expect(radar).toHaveAttribute("aria-label", /0 équipe/);
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  expect(historyRequests).toBe(0);
  await expect(radar).toHaveAttribute("aria-label", /2 équipe/);
  const beforeHistory = await radar.evaluate((canvas: HTMLCanvasElement) =>
    canvas.toDataURL(),
  );
  const analysis = page.getByRole("switch", { name: "Analyse", exact: true });
  await analysis.focus();
  await page.keyboard.press("Space");
  await expect(analysis).toHaveAttribute("aria-checked", "true");
  await expect(radar).toHaveCount(0);
  await expect(page.getByLabel("Critère", { exact: true })).toBeVisible();
  expect(historyRequests).toBe(0);
  await analysis.click();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  const criterion = page.getByRole("button", { name: "1. Collaboration v2" });
  await criterion.focus();
  await page.keyboard.press("Enter");
  await expect(radar).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Évolution de Collaboration v2/ }),
  ).toBeVisible();
  expect(historyRequests).toBeGreaterThan(0);
  const loadedHistoryRequests = historyRequests;
  const selectedCriterion = await page
    .getByLabel("Critère", { exact: true })
    .inputValue();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(page.getByRole("img")).toHaveCount(0);
  const table = page.getByRole("table", {
    name: "Observations historiques du critère sélectionné",
  });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Équipe A",
    "Équipe B",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table.locator('[title*="· v1 ·"]')).toHaveCount(3);
  await expect(table.locator('[title*="· v2 ·"]')).toHaveCount(2);
  await expect(
    table.getByRole("cell", { name: /^2\/10 \(01\/09\/2026 - \d{2}:\d{2}\)$/ }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: /^6\/10 \(05\/10\/2026 - \d{2}:\d{2}\)$/ }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: /^7\/10 \(06\/10\/2026 - \d{2}:\d{2}\)$/ }),
  ).toBeVisible();
  await expect(table.locator("tbody tr").nth(0).getByRole("cell")).toHaveText([
    /^2\/10 \(01\/09\/2026 - \d{2}:\d{2}\)$/,
    /^8\/10 \(03\/10\/2026 - \d{2}:\d{2}\)$/,
  ]);
  await expect(table.locator("tbody tr").nth(1).getByRole("cell")).toHaveText([
    /^0\/10 \(02\/10\/2026 - \d{2}:\d{2}\)$/,
    /^7\/10 \(06\/10\/2026 - \d{2}:\d{2}\)$/,
  ]);
  await expect(table.locator("tbody tr").nth(2).getByRole("cell")).toHaveText([
    /^6\/10 \(05\/10\/2026 - \d{2}:\d{2}\)$/,
    "",
  ]);
  await page.screenshot({
    path: test.info().outputPath("longitudinal-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page.screenshot({
    path: test.info().outputPath("longitudinal-dark.png"),
    fullPage: true,
  });
  await analysis.click();
  await expect(page.getByRole("table")).toHaveAccessibleName(
    "Critères et scores des équipes sélectionnées",
  );
  await page.getByRole("tab", { name: "Graphique" }).click();
  await expect(radar).toHaveAttribute("aria-label", /2 équipe/);
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /^Équipe B/ })).toBeChecked();
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await expect
    .poll(() =>
      radar.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
    )
    .toBe(beforeHistory);
  const forbidden = await page.request.get(
    "/api/results/families/?organization_id=999999",
  );
  expect(forbidden.status()).toBe(404);
  expect(historyRequests).toBe(loadedHistoryRequests);
  await analysis.click();
  await expect(page.getByLabel("Critère", { exact: true })).toHaveValue(
    selectedCriterion,
  );
  await expect(
    page.getByRole("img", { name: /Évolution de Collaboration v2/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/results$/);
});
