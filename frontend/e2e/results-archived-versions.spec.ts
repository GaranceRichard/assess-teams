import { expect, test } from "@playwright/test";

import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

// Real API and stored snapshots: v1 is archived, v2 current, v3 has no results.
test("selects archived results, their historical teams and criteria, then returns to v2", async ({
  page,
}) => {
  seedResultsContext(true);
  runDjangoShell([
    "from assessments.models import EvaluationRun",
    "EvaluationRun.objects.filter(organization__name='Results E2E', evaluation__version=2, team__name='Équipe B').delete()",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Voir les résultats" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  const version = page.getByRole("combobox", { name: "Version", exact: true });
  await expect(version.locator("option")).toHaveText([
    "Sélectionner une version",
    "v1 — Archivée",
    "v2 — Validée",
  ]);
  await expect(page.getByText("Version radar : v2")).toBeVisible();
  const currentId = await version.inputValue();
  await expect(page.getByRole("checkbox", { name: /^Équipe B/ })).toHaveCount(
    0,
  );
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await version.selectOption({ label: "v1 — Archivée" });
  const archivedId = await version.inputValue();
  await expect(page.getByText("Version radar : v1")).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /^Équipe A/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  const table = page.getByRole("table", {
    name: "Critères et scores des équipes sélectionnées",
  });
  await expect(
    table.getByRole("cell", { name: "8 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("button", { name: "1. Collaboration", exact: true }),
  ).toBeVisible();
  await table
    .getByRole("button", { name: "1. Collaboration", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: /Évolution de Collaboration/ }),
  ).toBeVisible();
  const forbidden = await page.request.get(
    `/api/results/families/999999/?evaluation_id=${archivedId}`,
  );
  expect(forbidden.status()).toBe(404);
  await version.selectOption(currentId);
  await expect(page.getByText("Version radar : v2")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /^Équipe B/ })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("checkbox", { name: /^Équipe A/ }),
  ).not.toBeChecked();
  await expect(page.getByLabel("Critère", { exact: true })).toHaveCount(0);
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(
    table.getByRole("cell", { name: "6 / 10", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("button", { name: "1. Collaboration v2" }),
  ).toBeVisible();
});

test("keeps a fully archived family readable without reactivating its model", async ({
  page,
}) => {
  seedResultsContext();
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Voir les résultats" }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await expect(
    page
      .getByRole("combobox", { name: "Version", exact: true })
      .locator("option"),
  ).toHaveText(["Sélectionner une version", "v1 — Archivée"]);
  await expect(page.getByText("Version radar : v1")).toBeVisible();
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toHaveAttribute("aria-label", /1 équipe/);
});
