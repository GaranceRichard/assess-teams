import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedPlanningContext,
} from "./identity-fixture";

test("an Admin plans a monthly evaluation in its organization", async ({
  page,
}) => {
  seedIdentity("planning-admin-e2e", "Admin");
  assignOrganization(["planning-admin-e2e"], "Planning E2E");
  seedPlanningContext("Planning E2E", "Team E2E", "Evaluation E2E");

  await page.goto("/");
  await page.getByLabel("Identifiant").fill("planning-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Planification" }).click();

  await page.getByLabel("Équipe").selectOption({ label: "Team E2E" });
  await page
    .getByLabel("Modèle d’évaluation")
    .selectOption({ label: "Evaluation E2E" });
  await expect(page.getByLabel("Planifier").locator("option")).toHaveText([
    "Tout de suite",
    "À date fixe",
    "Tous les mois",
    "Tous les trimestres",
  ]);
  await page.getByLabel("Planifier").selectOption("monthly");
  await page.getByLabel("Première date").fill("2099-10-05");
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();

  const planned = page.getByRole("region", { name: "Évaluations planifiées" });
  await expect(planned).toContainText("Team E2E");
  await expect(planned).toContainText("Evaluation E2E");
  await expect(planned).toContainText("Tous les mois");
  await expect(planned).toContainText("2099-10-05");
});
