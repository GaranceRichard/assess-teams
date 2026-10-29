import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

test("an assignee resumes and completes; an Admin revises and completes on behalf with distinct provenance", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  await row.getByRole("button", { name: "Passer l’évaluation" }).click();
  const dialog = page.getByRole("dialog");
  const question = dialog.locator(".transition-live");
  await expect(question.getByText("Question 1 / 2")).toBeVisible();
  await expect(question.getByText("Premier critère E2E")).toBeVisible();
  await expect(question.getByText("Deuxième critère E2E")).toHaveCount(0);
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await expect(question.getByText("Note sélectionnée : 0 / 10")).toBeVisible();
  await expect(
    question.getByText("Note enregistrée", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await page.reload();
  await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
  await expect(question.getByText("Question 2 / 2")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Valider l’évaluation" }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Précédent" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("0");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("End");
  await expect(question.getByText("Note sélectionnée : 10 / 10")).toBeVisible();
  let failedRunURL = "";
  await page.route(
    "**/api/evaluations/*/finalize/",
    async (route) => {
      failedRunURL = route.request().url().replace("finalize/", "");
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "L’opération n’a pas pu être réalisée. Veuillez réessayer.",
        }),
      });
    },
    { times: 1 },
  );
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Vos notes restent disponibles ; réessayez.",
  );
  const retained = await (await page.request.get(failedRunURL)).json();
  expect(retained.state).toBe("in_progress");
  expect(retained.completed_at).toBeNull();
  expect(
    retained.questions.map((question: { score: number }) => question.score),
  ).toEqual([0, 10]);
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(row).toContainText("Complétée");
  const initialCompletion = await row.locator("td").nth(5).innerText();
  await row.getByRole("button", { name: "Consulter" }).click();
  await expect(dialog.getByRole("slider")).toBeDisabled();
  await expect(dialog.getByRole("button", { name: /Valider/ })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await row.getByRole("button", { name: "Réviser les notes" }).click();
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("slider")).toHaveValue("1");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await dialog.getByRole("button", { name: "Valider la révision" }).click();
  await expect(row).toContainText(/Révisé par taking-admin-e2e le/);
  await expect(row.locator("td").nth(4)).toHaveText("taking-coach-e2e");
  await expect(row.locator("td").nth(5)).toHaveText(initialCompletion);
  const proxyRow = page.getByRole("row").filter({
    has: page.getByText("Complétion Admin E2E v1", { exact: true }),
  });
  await proxyRow.getByRole("button", { name: "Passer l’évaluation" }).click();
  await dialog.getByRole("slider").click();
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(proxyRow.locator("td").nth(3)).toHaveText("taking-coach-e2e");
  await expect(proxyRow.locator("td").nth(4)).toHaveText("taking-admin-e2e");
  await expect(proxyRow.locator("td").nth(5)).not.toHaveText("—");
  await page.getByRole("link", { name: "Journal d’activité" }).click();
  await expect(
    page.getByText("Révision de l’évaluation Passation E2E"),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Complétion par un Admin de l’évaluation Complétion Admin E2E",
    ),
  ).toBeVisible();
});

test("a deliberate midpoint choice blocks navigation until backend persistence", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  await row.getByRole("button", { name: "Passer l’évaluation" }).click();
  const dialog = page.getByRole("dialog");
  const question = dialog.locator(".transition-live");
  let resumeSave!: () => void;
  const saveGate = new Promise<void>((resolve) => {
    resumeSave = resolve;
  });
  await page.route("**/api/evaluations/*/responses/*/", async (route) => {
    await saveGate;
    await route.continue();
  });
  try {
    await dialog.getByRole("slider").click();
    await expect(
      dialog.getByRole("button", { name: "Suivant" }),
    ).toBeDisabled();
    await expect(question.getByText("Question 1 / 2")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Fermer" })).toBeDisabled();
  } finally {
    resumeSave();
  }
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await expect(question.getByText("Question 2 / 2")).toBeVisible();
  await expect(dialog.getByRole("slider")).toBeEnabled();
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await page.reload();
  await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
  await expect(question.getByText("Question 2 / 2")).toBeVisible();
  await dialog.getByRole("button", { name: "Précédent" }).click();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
});
