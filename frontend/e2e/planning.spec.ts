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
  seedIdentity("planning-coach-e2e", "Coach");
  assignOrganization(
    ["planning-admin-e2e", "planning-coach-e2e"],
    "Planning E2E",
  );
  seedPlanningContext(
    "Planning E2E",
    "Team E2E",
    "Evaluation E2E",
    "planning-coach-e2e",
  );

  await page.goto("/");
  await page.getByLabel("Identifiant").fill("planning-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Planification" }).click();

  await page.getByLabel("Équipe").selectOption({ label: "Team E2E" });
  await page
    .getByLabel("Responsable de l’évaluation")
    .selectOption({ label: "planning-admin-e2e — Admin" });
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
  await expect(planned).toContainText("planning-admin-e2e — Admin");
  await expect(planned).toContainText("Planning E2E");
  await expect(planned).toContainText("Tous les mois");
  await expect(planned).toContainText("2099-10-05");

  await planned.getByRole("button", { name: "Modifier" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Responsable de l’évaluation")
    .selectOption({ label: "planning-coach-e2e — Coach" });
  await dialog.getByLabel("Planifier").selectOption("fixed");
  await dialog.getByLabel("Première date").fill("2099-11-05");
  await dialog
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await expect(planned).toContainText("planning-coach-e2e — Coach");
  await expect(planned).toContainText("À date fixe");
  await expect(planned).toContainText("2099-11-05");

  await planned.getByRole("button", { name: "Supprimer" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmer la suppression" })
    .click();
  await expect(planned).toContainText("Aucune évaluation planifiée.");
});
