import { expectMarkerTooltip } from "./appreciation-assertions";
import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

test("v1 stays attached to a run after v2 validation and new planning uses v2", async ({
  page,
}) => {
  seedIdentity("versions-admin-e2e", "Admin");
  assignOrganization(["versions-admin-e2e"], "Versions E2E");
  runDjangoShell([
    "from identities.models import Organization",
    "from teams.models import Team",
    "Team.objects.create(organization=Organization.objects.get(name='Versions E2E'), name='Versions team')",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("versions-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
  await page.getByLabel("Organisation").selectOption({ label: "Versions E2E" });
  await page.getByRole("button", { name: "Créer une évaluation" }).click();
  await page.getByLabel("Nom de l’évaluation").fill("Agile versions");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  const first = page
    .getByRole("list", { name: "Évaluations", exact: true })
    .getByRole("listitem")
    .filter({ hasText: "Agile versions v1" });
  await first.getByRole("button", { name: /Agile versions v1/ }).click();
  await page.getByRole("button", { name: "Ajouter une question" }).click();
  await page.getByLabel("Nom de la question").fill("Original criterion v1");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText(/Repères d’appréciation/).click();
  await page.getByRole("button", { name: "Ajouter un repère" }).click();
  await page.getByLabel("5", { exact: true }).check();
  await page.getByLabel("8", { exact: true }).check();
  await page
    .getByLabel("Appréciation", { exact: true })
    .fill("Original marker v1");
  await page.getByRole("button", { name: "Enregistrer les repères" }).click();
  await expect(
    page.getByRole("button", { name: "Modifier le repère 5" }),
  ).toBeVisible();
  await first.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: "Confirmer la validation" }).click();
  await expect(first).toContainText("Validée");
  const models = await (
    await page.request.get("/api/admin/evaluations/")
  ).json();
  const v1 = models.find(
    (item: { family_name: string }) => item.family_name === "Agile versions",
  );
  async function plan(version: number) {
    await page
      .getByRole("link", { name: "Planification", exact: true })
      .click();
    await page.getByLabel("Équipe").selectOption({ label: "Versions team" });
    await page
      .getByLabel("Responsable de l’évaluation")
      .selectOption({ label: "versions-admin-e2e — Admin" });
    await page
      .getByLabel("Modèle d’évaluation")
      .selectOption({ label: `Agile versions v${version}` });
    await page.getByRole("button", { name: "Planifier l’évaluation" }).click();
    await expect(
      page.getByRole("button", {
        name: `Versions E2E - Agile versions v${version} - Versions team - versions-admin-e2e`,
      }),
    ).toBeVisible();
  }
  await plan(1);
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  const oldRun = page
    .getByRole("row")
    .filter({ has: page.getByText("Agile versions v1", { exact: true }) });
  await oldRun.getByRole("button", { name: "Passer l’évaluation" }).click();
  await expect(page.getByRole("dialog")).toContainText("Original criterion v1");
  await expectMarkerTooltip(page, 5, "Original marker v1");
  await page.getByRole("button", { name: "Enregistrer la note" }).click();
  await expect(page.locator(".selected-appreciation")).toContainText(
    "Original marker v1",
  );
  await page.getByRole("button", { name: "Fermer" }).click();
  await page.getByRole("link", { name: "Modèles d’évaluation" }).click();
  await page.getByLabel("Organisation").selectOption({ label: "Versions E2E" });
  await first
    .getByRole("button", { name: "Créer une nouvelle version" })
    .click();
  const second = page
    .getByRole("list", { name: "Évaluations", exact: true })
    .getByRole("listitem")
    .filter({ hasText: "Agile versions v2" });
  await expect(second).toContainText("Brouillon");
  await second.getByRole("button", { name: /Agile versions v2/ }).click();
  const criterion = page
    .getByRole("list", { name: "Questions", exact: true })
    .getByRole("listitem");
  await expect(criterion).toContainText("Original criterion v1");
  await criterion
    .getByRole("button", { name: "Modifier", exact: true })
    .click();
  await page.getByLabel("Nom de la question").fill("Changed criterion v2");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByText(/Repères d’appréciation/).click();
  await page.getByRole("button", { name: "Modifier le repère 5" }).click();
  await page
    .getByLabel("Appréciation", { exact: true })
    .fill("Changed marker v2");
  await page.getByRole("button", { name: "Enregistrer les repères" }).click();
  await expect(page.getByText(/Changed marker v2/)).toBeVisible();
  await second.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("button", { name: "Confirmer la validation" }).click();
  await expect(first).toContainText("Archivée");
  await expect(second).toContainText("Version active pour la planification");
  await plan(2);
  await expect(
    page
      .getByLabel("Modèle d’évaluation")
      .getByRole("option", { name: "Agile versions v1" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await oldRun.getByRole("button", { name: "Reprendre l’évaluation" }).click();
  await expect(page.getByRole("dialog")).toContainText("Agile versions v1");
  await expect(page.getByRole("dialog")).toContainText("Original criterion v1");
  await expect(page.getByRole("dialog")).not.toContainText(
    "Changed criterion v2",
  );
  await expect(page.locator(".selected-appreciation")).toContainText(
    "Original marker v1",
  );
  await page.getByRole("button", { name: "Valider l’évaluation" }).click();
  await expect(oldRun).toContainText("Complétée");
  const runs = await (await page.request.get("/api/evaluations/")).json();
  const historical = runs.find(
    (item: { evaluation_id: number }) => item.evaluation_id === v1.id,
  );
  const current = runs.find(
    (item: { evaluation_version: number }) => item.evaluation_version === 2,
  );
  expect(historical.evaluation_version).toBe(1);
  expect(historical.state).toBe("completed");
  expect(current.family_id).toBe(v1.family_id);
  expect(current.evaluation_id).not.toBe(v1.id);
  await page
    .getByRole("row")
    .filter({ has: page.getByText("Agile versions v2", { exact: true }) })
    .getByRole("button", { name: "Passer l’évaluation" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Changed criterion v2");
  await expectMarkerTooltip(page, 5, "Changed marker v2");
});
