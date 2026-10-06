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
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
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
  const criterion = page.getByRole("button", { name: "1. Collaboration v2" });
  await criterion.focus();
  await page.keyboard.press("Enter");
  await expect(radar).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Évolution de Collaboration v2/ }),
  ).toBeVisible();
  expect(historyRequests).toBeGreaterThan(0);
  const loadedHistoryRequests = historyRequests;
  const table = page.getByRole("table", {
    name: "Observations historiques du critère sélectionné",
  });
  await expect(table.getByRole("row")).toHaveCount(6);
  await expect(
    table.getByRole("cell", { name: "v1", exact: true }),
  ).toHaveCount(3);
  await expect(
    table.getByRole("cell", { name: "v2", exact: true }),
  ).toHaveCount(2);
  await expect(
    table.getByRole("cell", { name: "2 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "6 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "7 / 10", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("longitudinal-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page.screenshot({
    path: test.info().outputPath("longitudinal-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Retour au radar" }).click();
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
  await expect(page).toHaveURL(/\/results$/);
});
