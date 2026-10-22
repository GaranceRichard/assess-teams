import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";
import { auditResults } from "./results-hierarchy-audit";

test("keeps authorized result context and provenance visible across restitutions", async ({
  page,
}) => {
  seedResultsContext(true);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(
    page.getByRole("region", { name: "Contexte des résultats" }),
  ).toContainText("Results E2E");
  await expect(
    page.getByRole("region", { name: "Contexte des résultats" }),
  ).toContainText("Radar E2E");
  await expect(
    page.getByRole("group", { name: "Équipes disponibles" }),
  ).toContainText(/Passation n°/);
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(page.locator("thead")).toContainText(/Passation n°/);
  await page.getByRole("button", { name: "1. Collaboration v2" }).click();
  await expect(page.getByRole("img", { name: /Évolution de/ })).toBeVisible();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(page.locator("tbody small").first()).toContainText(
    /v1 · Passation n°/,
  );
  await expect(page.getByRole("table")).toHaveCount(1);
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
});

test("audits result hierarchy in twenty appearances and four screen formats", async ({
  page,
}, info) => {
  test.setTimeout(240_000);
  seedResultsContext(true);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  await auditResults(page, info);
});
