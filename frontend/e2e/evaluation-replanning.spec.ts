import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

test("an Admin replans a completed team evaluation with the same model and keeps its history", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const rows = page.getByRole("row").filter({
    has: page.getByText("Passation E2E v1", { exact: true }),
  });
  await rows.getByRole("button", { name: "Passer l’évaluation" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("End");
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(rows).toContainText("Complétée");
  const initialCompletion = await rows.locator("td").nth(5).innerText();

  await page.getByRole("link", { name: "Planification" }).click();
  async function selectPlanning() {
    await page
      .getByLabel("Équipe")
      .selectOption({ label: "Équipe passation E2E" });
    await page.getByLabel("Responsable de l’évaluation").selectOption({
      label: "taking-coach-e2e — Coach",
    });
    await page.getByLabel("Modèle d’évaluation").selectOption({
      label: "Passation E2E v1",
    });
    await page.getByLabel("Planifier").selectOption("immediate");
  }
  await selectPlanning();
  const planned = page.getByRole("region", { name: "Évaluations planifiées" });
  const planningRows = planned.getByRole("button", {
    name: "Taking E2E - Passation E2E v1 - Équipe passation E2E - taking-coach-e2e",
  });
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
  await expect(planningRows).toHaveCount(2);
  await selectPlanning();
  await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "La planification de l’évaluation a été refusée.",
  );
  await expect(planningRows).toHaveCount(2);

  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await expect(rows).toHaveCount(2);
  const completed = rows.filter({ hasText: "Complétée" });
  const pending = rows.filter({ hasText: "À passer" });
  await expect(completed.locator("td").nth(5)).toHaveText(initialCompletion);
  await pending.getByRole("button", { name: "Passer l’évaluation" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await dialog.getByRole("button", { name: "Enregistrer la note" }).click();
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(rows.filter({ hasText: "Complétée" })).toHaveCount(2);
  await page.reload();
  await expect(rows).toHaveCount(2);
  const original = rows.first();
  await expect(original.locator("td").nth(5)).toHaveText(initialCompletion);
  await original
    .getByRole("button", { name: "Consulter", exact: true })
    .click();
  await expect(dialog.getByRole("slider")).toHaveValue("0");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("10");
});
