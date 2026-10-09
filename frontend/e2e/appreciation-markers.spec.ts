import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { expectPassiveMarker } from "./appreciation-assertions";

test("Coach accesses lower-bound markers with passive indicators, keyboard and mobile while preserving slider saves", async ({
  page,
}) => {
  seedIdentity("markers-coach-e2e", "Coach");
  assignOrganization(["markers-coach-e2e"], "Markers E2E");
  runDjangoShell([
    "from django.utils import timezone",
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation, EvaluationSchedule, Question",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "organization = Organization.objects.get(name='Markers E2E')",
    "coach = User.objects.get(username='markers-coach-e2e')",
    "team = Team.objects.create(organization=organization, name='Markers team')",
    "evaluation = Evaluation.objects.create(organization=organization, name='Markers model', index=1, status='VALIDATED')",
    "Question.objects.create(evaluation=evaluation, name='Markers criterion', index=1, appreciation_markers=[{'score': 0, 'text': 'À construire'}, {'score': 8, 'text': 'Partagé'}, {'score': 10, 'text': 'Autonome'}])",
    "schedule = EvaluationSchedule.objects.create(team=team, evaluation=evaluation, assignee=coach, mode='immediate', first_due_date=timezone.localdate())",
    "ensure_expected_evaluation(schedule)",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("markers-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await page.getByRole("button", { name: "Passer l’évaluation" }).click();
  await expect(page.locator(".taking-content .marker-dot")).toHaveCount(3);
  await expectPassiveMarker(page, 8);
  for (const mode of ["day", "night"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, mode);
    for (const palette of ["green", "blue", "violet"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.palette = value;
      }, palette);
      await expectPassiveMarker(page, 0);
      await expectPassiveMarker(page, 10);
    }
  }
  const slider = page.getByRole("slider");
  await slider.focus();
  await slider.press("Home");
  await expect(page.locator(".selected-appreciation")).toContainText(
    "À construire",
  );
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    "0 sur 10 : À construire",
  );
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Reprendre l’évaluation" }).click();
  await expect(slider).toHaveValue("0");
  await expect(page.locator(".selected-appreciation")).toContainText(
    "À construire",
  );
  await page.setViewportSize({ width: 375, height: 667 });
  await expectPassiveMarker(page, 10);
  await slider.focus();
  await slider.press("End");
  await slider.press("ArrowLeft");
  await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("8");
  await expect(page.locator(".selected-appreciation")).toContainText("Partagé");
  await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("7");
  await expect(page.locator(".selected-appreciation")).toContainText(
    "À construire",
  );
  await page.getByRole("button", { name: "Valider l’évaluation" }).click();
  await page.getByRole("button", { name: "Consulter", exact: true }).click();
  await expect(slider).toBeDisabled();
  await expectPassiveMarker(page, 0);
  await expect(slider).toHaveValue("7");
});
