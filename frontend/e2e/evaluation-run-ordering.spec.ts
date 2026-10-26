import { expect, test } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

test("prioritizes actionable runs and reorders a completed run without a browser reload", async ({
  page,
}) => {
  seedTakingContext();
  runDjangoShell([
    "from datetime import timedelta",
    "from django.utils import timezone",
    "from assessments.models import EvaluationRun",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "source = EvaluationRun.objects.get(evaluation_name='Passation E2E')",
    "now = timezone.now()",
    "EvaluationRun.objects.filter(pk=source.pk).update(created_at=now-timedelta(days=2))",
    "old = ensure_expected_evaluation(source.schedule, source.due_date-timedelta(days=3))",
    "recent = ensure_expected_evaluation(source.schedule, source.due_date-timedelta(days=4))",
    "EvaluationRun.objects.filter(pk=old.pk).update(evaluation_name='Historique ancien', state='completed', completed_at=now-timedelta(days=2), completed_by_name='coach')",
    "EvaluationRun.objects.filter(pk=recent.pk).update(evaluation_name='Historique récent', state='completed', completed_at=now-timedelta(days=1), completed_by_name='coach')",
  ]);
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // Snapshot names distinguish runs sharing the same historical model version.
  const states = page.locator("tbody tr td:nth-child(7)");
  await expect(states).toHaveText([
    "À passer",
    "À passer",
    "Complétée",
    "Complétée",
  ]);
  const response = await page.request.get("/api/evaluations/?page=1");
  const rows = (await response.json()).results;
  expect(
    rows.map((row: { evaluation_name: string }) => row.evaluation_name),
  ).toEqual([
    "Passation E2E",
    "Complétion Admin E2E",
    "Historique récent",
    "Historique ancien",
  ]);
  await page
    .getByRole("button", { name: "Passer l’évaluation" })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await dialog.getByRole("button", { name: "Suivant" }).click();
  await dialog.getByRole("slider").focus();
  await page.keyboard.press("End");
  await dialog.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(states).toHaveText([
    "À passer",
    "Complétée",
    "Complétée",
    "Complétée",
  ]);
  await expect(page.locator("tbody tr td:first-child").first()).toHaveText(
    "Complétion Admin E2E v1",
  );
  const after = (
    await (await page.request.get("/api/evaluations/?page=1")).json()
  ).results;
  expect(after.map((row: { id: number }) => row.id)).toEqual([
    rows[1].id,
    rows[0].id,
    rows[2].id,
    rows[3].id,
  ]);
});
