import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedJournalEntries,
} from "./identity-fixture";

test("an Admin consults distinct activity and error journals", async ({
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

  await page.getByRole("link", { name: "Journal des erreurs" }).click();
  await expect(
    page.getByRole("heading", { name: "Journal des erreurs" }),
  ).toBeVisible();
  await expect(
    page.getByText("Échec de création de l’évaluation"),
  ).toBeVisible();
  await page.getByText("Détails").click();
  await expect(page.getByText("ValidationError")).toBeVisible();
  await expect(page.getByText("Les données sont invalides.")).toBeVisible();
});
