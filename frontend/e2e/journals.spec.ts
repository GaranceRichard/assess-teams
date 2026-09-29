import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedJournalEntries,
} from "./identity-fixture";

test("an Admin consults the distinct activity journal and logs", async ({
  page,
}) => {
  seedIdentity("journal-admin-e2e", "Admin");
  assignOrganization(["journal-admin-e2e"], "Journals E2E");
  seedJournalEntries("journal-admin-e2e", "Journals E2E");

  await page.goto("/");
  await page.getByLabel("Identifiant").fill("journal-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await page.getByRole("link", { name: "Journal d’activité" }).click();
  await expect(
    page.getByRole("heading", { name: "Journal d’activité" }),
  ).toBeVisible();
  await expect(page.getByText("Création de l’équipe")).toBeVisible();
  await expect(page.getByText("Journals E2E")).toBeVisible();

  await page.getByRole("link", { name: "Logs" }).click();
  await expect(page.getByRole("heading", { name: "Logs" })).toBeVisible();
  const errorLevel = page.locator("strong.log-level", { hasText: "ERROR" });
  const errorRow = errorLevel.locator("xpath=ancestor::tr");
  await expect(
    errorRow.locator("td > span", { hasText: "Les données sont invalides." }),
  ).toBeVisible();
  await expect(errorRow).toHaveClass(/log-row--error/);
  await page.getByLabel("Niveau").selectOption("ERROR");
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(errorLevel).toBeVisible();
  await page.getByText("Détails", { exact: true }).click();
  await expect(page.getByText("ValidationError")).toBeVisible();
});
