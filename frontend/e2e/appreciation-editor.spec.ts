import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

test("a marker has one score, persists after reload and preserves existing markers", async ({
  page,
}) => {
  seedIdentity("marker-editor-e2e", "Admin");
  assignOrganization(["marker-editor-e2e"], "Marker editor E2E");
  runDjangoShell([
    "from identities.models import Organization",
    "from assessments.models import Evaluation, Question",
    "organization = Organization.objects.get(name='Marker editor E2E')",
    "evaluation = Evaluation.objects.create(organization=organization, name='Single marker', index=1)",
    "Question.objects.create(evaluation=evaluation, name='Criterion', index=1, appreciation_markers=[{'score': 0, 'text': 'Historical shared text'}, {'score': 5, 'text': 'Historical shared text'}])",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("marker-editor-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  async function openEditor() {
    await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
    await page
      .getByRole("combobox", { name: "Organisation" })
      .selectOption({ label: "Marker editor E2E" });
    await page.getByRole("button", { name: /Single marker v1/ }).click();
    await page.getByText(/Repères d’appréciation/).click();
  }
  await openEditor();
  await page.getByRole("button", { name: "Ajouter un repère" }).click();
  const submit = page.getByRole("button", {
    name: "Enregistrer le repère",
    exact: true,
  });
  const eight = page.getByRole("radio", { name: "8", exact: true });
  const nine = page.getByRole("radio", { name: "9", exact: true });
  await page.getByLabel("Appréciation", { exact: true }).fill("New marker");
  await expect(submit).toBeDisabled();
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: "0", exact: true }),
  ).toBeDisabled();
  await eight.check();
  await nine.check();
  await expect(eight).not.toBeChecked();
  await expect(nine).toBeChecked();
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);
  await submit.click();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 9" }),
  ).toBeVisible();
  await page.reload();
  await openEditor();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 8" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Modifier le repère 9" }).click();
  await expect(nine).toBeChecked();
  await expect(page.getByLabel("Appréciation", { exact: true })).toHaveValue(
    "New marker",
  );
  await expect(
    page.getByRole("radio", { name: "5", exact: true }),
  ).toBeDisabled();
  await eight.check();
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page.getByRole("button", { name: "Modifier le repère 9" }).click();
  await expect(nine).toBeChecked();
  await nine.press("ArrowLeft");
  await expect(eight).toBeChecked();
  await expect(nine).not.toBeChecked();
  await page.getByLabel("Appréciation", { exact: true }).fill("Changed marker");
  await submit.click();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 8" }),
  ).toBeVisible();
  await page.reload();
  await openEditor();
  await expect(
    page.getByText("Historical shared text", { exact: false }),
  ).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Modifier le repère 0" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 5" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 9" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Modifier le repère 8" }).click();
  await expect(eight).toBeChecked();
  await expect(page.getByLabel("Appréciation", { exact: true })).toHaveValue(
    "Changed marker",
  );
});
