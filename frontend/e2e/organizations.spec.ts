import { expect, test } from "@playwright/test";

import {
  e2eCredential,
  resetOrganization,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

test("an Admin creates an organization with several users", async ({
  page,
}) => {
  const organizationName = "Organization E2E";
  seedIdentity("organization-admin-e2e", "Admin");
  seedIdentity("organization-coach-e2e", "Coach");
  seedIdentity("organization-viewer-e2e", "Viewer");
  seedSuperadmin("organization-root-e2e", "unused-organization@example.com");
  resetOrganization(organizationName);
  resetOrganization(`${organizationName} renamed`);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("organization-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await page.getByRole("link", { name: "Organisation" }).click();
  await expect(
    page.getByRole("heading", { name: "Organisations", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Nom").fill(organizationName);
  await page.getByLabel(/organization-admin-e2e/).check();
  await page.getByLabel(/organization-coach-e2e/).check();
  await page.getByRole("button", { name: "Créer l’organisation" }).click();

  const organization = page.locator(".organization-list li").filter({
    hasText: organizationName,
  });
  await expect(organization).toContainText("organization-admin-e2e");
  await expect(organization).toContainText("organization-coach-e2e");

  await organization.getByRole("button", { name: "Gérer les membres" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/organization-coach-e2e/).uncheck();
  await dialog.getByLabel(/organization-viewer-e2e/).check();
  await dialog.getByRole("button", { name: "Enregistrer les membres" }).click();

  await expect(organization).toContainText("organization-admin-e2e");
  await expect(organization).toContainText("organization-viewer-e2e");
  await expect(organization).not.toContainText("organization-coach-e2e");

  await organization.getByRole("button", { name: "Renommer" }).click();
  const renameDialog = page.getByRole("dialog");
  await renameDialog.getByLabel("Nom").fill(`${organizationName} renamed`);
  await renameDialog
    .getByRole("button", { name: "Enregistrer le nom" })
    .click();
  await expect(
    page.locator(".organization-list li").filter({
      hasText: `${organizationName} renamed`,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Supprimer", exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("organization-root-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Organisation" }).click();

  const renamed = page.locator(".organization-list li").filter({
    hasText: `${organizationName} renamed`,
  });
  await renamed.getByRole("button", { name: "Supprimer", exact: true }).click();
  const deleteDialog = page.getByRole("dialog");
  await expect(deleteDialog).toContainText("conserveront leurs comptes");
  await deleteDialog
    .getByRole("button", { name: "Supprimer l’organisation" })
    .click();
  await expect(renamed).not.toBeVisible();
});
