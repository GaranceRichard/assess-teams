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
    .selectOption({ label: "Evaluation E2E v1" });
  await expect(page.getByLabel("Planifier").locator("option")).toHaveText([
    "Tout de suite",
    "À date fixe",
    "Tous les mois",
    "Tous les trimestres",
  ]);
  await page.getByLabel("Planifier").selectOption("monthly");
  const dateInput = page.getByLabel("Première date");
  await expect(dateInput).toHaveAttribute("placeholder", "JJ/MM/AAAA");
  await dateInput.fill("31/02/2099");
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
  expect(
    await dateInput.evaluate((input: HTMLInputElement) =>
      input.checkValidity(),
    ),
  ).toBe(false);
  await expect(page.getByText("Aucune évaluation planifiée.")).toBeVisible();
  await dateInput.fill("05/10/2099");
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();

  const planned = page.getByRole("region", { name: "Évaluations planifiées" });
  const row = planned.getByRole("button", {
    name: "Planning E2E - Evaluation E2E v1 - Team E2E - planning-admin-e2e",
  });
  await expect(row).toBeVisible();
  const backgroundBeforeHover = await row.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await row.hover();
  await expect
    .poll(() =>
      row.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(backgroundBeforeHover);

  await row.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Planifier")).toHaveValue("monthly");
  await expect(dialog.getByLabel("Première date")).toHaveValue("05/10/2099");
  await dialog
    .getByLabel("Responsable de l’évaluation")
    .selectOption({ label: "planning-coach-e2e — Coach" });
  await dialog.getByLabel("Planifier").selectOption("fixed");
  await dialog.getByLabel("Première date").fill("05/11/2099");
  await dialog
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  const updatedRow = planned.getByRole("button", {
    name: "Planning E2E - Evaluation E2E v1 - Team E2E - planning-coach-e2e",
  });
  await expect(updatedRow).toBeVisible();

  await updatedRow.click();
  await expect(page.getByRole("dialog").getByLabel("Planifier")).toHaveValue(
    "fixed",
  );
  await expect(
    page.getByRole("dialog").getByLabel("Première date"),
  ).toHaveValue("05/11/2099");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Supprimer" })
    .click();
  await page.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(planned).toContainText("Aucune évaluation planifiée.");
});
