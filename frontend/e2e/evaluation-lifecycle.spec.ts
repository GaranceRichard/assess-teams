import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedPlanningContext,
} from "./identity-fixture";

test("draft validation, immutability, archive and planning history", async ({
  page,
}) => {
  seedIdentity("lifecycle-admin-e2e", "Admin");
  seedIdentity("lifecycle-coach-e2e", "Coach");
  assignOrganization(
    ["lifecycle-admin-e2e", "lifecycle-coach-e2e"],
    "Lifecycle E2E",
  );
  seedPlanningContext("Lifecycle E2E", "Lifecycle team", "Legacy ready");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("lifecycle-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
  await page
    .getByLabel("Organisation")
    .selectOption({ label: "Lifecycle E2E" });
  await page.getByRole("button", { name: "Créer une évaluation" }).click();
  await page.getByLabel("Nom de l’évaluation").fill("Lifecycle model");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  const model = page
    .getByRole("list", { name: "Évaluations", exact: true })
    .getByRole("listitem")
    .filter({ hasText: "Lifecycle model" });
  await expect(model).toContainText("Brouillon");
  await model.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: "Confirmer la validation" }).click();
  await expect(page.getByRole("alert")).toContainText("validation");
  await page.getByRole("button", { name: "Annuler" }).click();
  await model.getByRole("button", { name: /Lifecycle model/ }).click();
  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await page.getByLabel("Nom de la question").fill("Lifecycle criterion");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await model.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: "Confirmer la validation" }).click();
  await expect(model).toContainText("Validée");
  await expect(model.getByRole("button", { name: "Modifier" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ajouter une question" }),
  ).toHaveCount(0);

  const evaluation = (
    await (await page.request.get("/api/admin/evaluations/")).json()
  ).find((item: { name: string }) => item.name === "Lifecycle model");
  const csrf = (await page.context().cookies()).find(
    (cookie) => cookie.name === "csrftoken",
  )!.value;
  const headers = { "X-CSRFToken": csrf };
  const rejected = await page.request.put(
    `/api/admin/evaluations/${evaluation.id}/`,
    {
      headers,
      data: { name: "Forged" },
    },
  );
  expect(rejected.status()).toBe(400);
  await page.getByRole("link", { name: "Planification", exact: true }).click();
  await page.getByLabel("Équipe").selectOption({ label: "Lifecycle team" });
  await page
    .getByLabel("Responsable de l’évaluation")
    .selectOption({ label: "lifecycle-admin-e2e — Admin" });
  await page
    .getByLabel("Modèle d’évaluation")
    .selectOption({ label: "Lifecycle model" });
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
  const rowName =
    "Lifecycle E2E - Lifecycle model - Lifecycle team - lifecycle-admin-e2e";
  await expect(page.getByRole("button", { name: rowName })).toBeVisible();

  await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
  await page
    .getByLabel("Organisation")
    .selectOption({ label: "Lifecycle E2E" });
  await model.getByRole("button", { name: "Archiver" }).click();
  await page.getByRole("button", { name: "Confirmer l’archivage" }).click();
  await expect(model).toContainText("Archivée");
  await model.getByRole("button", { name: /Lifecycle model/ }).click();
  await expect(page.getByText("Lifecycle criterion")).toBeVisible();
  await expect(page.getByText("Lecture seule")).toBeVisible();
  await page.getByRole("link", { name: "Planification", exact: true }).click();
  await expect(
    page
      .getByLabel("Modèle d’évaluation")
      .getByRole("option", { name: "Lifecycle model" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: rowName }).click();
  await expect(
    page.getByRole("dialog").getByLabel("Modèle d’évaluation"),
  ).toHaveValue(String(evaluation.id));
  await expect(
    page
      .getByRole("dialog")
      .getByRole("option", { name: "Lifecycle model — Archivé (historique)" }),
  ).toHaveAttribute("disabled", "");
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.getByRole("link", { name: "Journal d’activité" }).click();
  await expect(
    page.getByText("Validation de l’évaluation Lifecycle model", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Archivage de l’évaluation Lifecycle model", {
      exact: true,
    }),
  ).toBeVisible();
});
