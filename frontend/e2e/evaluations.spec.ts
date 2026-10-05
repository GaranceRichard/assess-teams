import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  resetEvaluations,
  seedIdentity,
} from "./identity-fixture";

test("an Admin manages an evaluation and its ordered questions", async ({
  page,
}) => {
  seedIdentity("evaluation-admin-e2e", "Admin");
  assignOrganization(["evaluation-admin-e2e"], "Evaluation E2E");
  resetEvaluations(["Référentiel E2E", "Référentiel E2E modifié"]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("evaluation-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
  await page
    .getByLabel("Organisation")
    .selectOption({ label: "Evaluation E2E" });

  await page.getByRole("button", { name: "Créer une évaluation" }).click();
  await expect(page.getByLabel("Index de l’évaluation")).toHaveCount(0);
  await page.getByLabel("Nom de l’évaluation").fill("Référentiel E2E");
  await page.getByRole("button", { name: "Enregistrer" }).click();

  const evaluation = page
    .getByRole("listitem")
    .filter({ hasText: "Référentiel E2E" });
  await expect(evaluation).toContainText("Brouillon");
  await evaluation.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Nom de l’évaluation").fill("Référentiel E2E modifié");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await evaluation
    .getByRole("button", { name: /Référentiel E2E modifié/ })
    .click();

  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await expect(page.getByLabel("Index de la question")).toHaveCount(0);
  await page.getByLabel("Nom de la question").fill("Question E2E");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  const question = page
    .getByRole("listitem")
    .filter({ hasText: "Question E2E" });
  await question.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Nom de la question").fill("Question E2E modifiée");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(question).toContainText("Question E2E modifiée");

  await question.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(
    page.getByText("Aucune question dans cette évaluation."),
  ).toBeVisible();
  await evaluation.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Confirmer la suppression" }).click();
  await expect(evaluation).toHaveCount(0);
});
