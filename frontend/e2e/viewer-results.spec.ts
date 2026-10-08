import { expect, test } from "@playwright/test";

import {
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("Viewer consults its organization radar and longitudinal without administration", async ({
  page,
}) => {
  seedResultsContext(true);
  seedIdentity("results-viewer-e2e", "Viewer");
  runDjangoShell([
    "from identities.models import Organization, User",
    "Organization.objects.get(name='Results E2E').users.add(User.objects.get(username='results-viewer-e2e'))",
    "Organization.objects.get_or_create(name='Foreign Viewer Results E2E')",
  ]);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-viewer-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation").getByRole("link")).toHaveText([
    "Tableau de bord",
    "Résultats",
  ]);
  const organization = page.getByLabel("Organisation");
  await expect(organization).toBeDisabled();
  await expect(organization.getByRole("option")).toHaveText([
    "Sélectionner une organisation",
    "Results E2E",
  ]);
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await expect(page.getByText(/Version radar : v2/)).toBeVisible();
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toHaveAttribute("aria-label", /1 équipe/);
  await page.getByRole("tab", { name: "Résultats détaillés" }).click();
  await expect(
    page.getByRole("cell", { name: "6 / 10", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "1. Collaboration v2" }).click();
  await expect(
    page.getByRole("img", { name: /Évolution de Collaboration v2/ }),
  ).toBeVisible();
  const table = page.getByRole("table", {
    name: "Observations historiques du critère sélectionné",
  });
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(
    table.getByRole("cell", { name: "v1", exact: true }),
  ).toHaveCount(2);
  await expect(
    table.getByRole("cell", { name: "v2", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Retour au radar" }).click();
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await expect(
    page.getByRole("button", { name: /Modifier|Supprimer|Créer|Valider/ }),
  ).toHaveCount(0);
  for (const path of ["/users", "/teams", "/organization", "/evaluations"]) {
    await page.goto(path);
    await expect(page.getByRole("alert")).toContainText("Page non autorisée");
  }
  expect((await page.request.get("/api/admin/users/")).status()).toBe(403);
  expect((await page.request.get("/api/admin/organizations/")).status()).toBe(
    403,
  );
  expect(
    (
      await page.request.get("/api/results/families/?organization_id=999999")
    ).status(),
  ).toBe(404);
});
