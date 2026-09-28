import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
} from "./identity-fixture";

test("Admin, Coach and Viewer see only allowed organization users", async ({
  page,
}) => {
  seedIdentity("permissions-admin-e2e", "Admin");
  seedIdentity("permissions-coach-e2e", "Coach");
  seedIdentity("permissions-viewer-e2e", "Viewer");
  assignOrganization(
    [
      "permissions-admin-e2e",
      "permissions-coach-e2e",
      "permissions-viewer-e2e",
    ],
    "Permissions E2E",
  );
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("permissions-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Utilisateurs" }).click();

  const adminRow = page
    .getByRole("row")
    .filter({ hasText: "permissions-admin-e2e" });
  const coachRow = page
    .getByRole("row")
    .filter({ hasText: "permissions-coach-e2e" });
  const viewerRow = page
    .getByRole("row")
    .filter({ hasText: "permissions-viewer-e2e" });
  await expect(adminRow.getByRole("button")).toHaveCount(0);
  await expect(coachRow.getByRole("button")).toHaveCount(2);
  await expect(viewerRow.getByRole("button")).toHaveCount(2);
  await expect(coachRow).toContainText("Permissions E2E");
  await page.getByRole("button", { name: "Ajouter un utilisateur" }).click();
  await expect(
    page.getByLabel("Type utilisateur").getByRole("option"),
  ).toHaveText(["Coach", "Viewer"]);
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("permissions-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Utilisateurs" }).click();
  await expect(
    page.getByRole("button", { name: "Ajouter un utilisateur" }),
  ).toHaveCount(0);
  await expect(coachRow.getByRole("button")).toHaveCount(0);
  await expect(viewerRow.getByRole("button")).toHaveCount(2);
  await viewerRow.getByRole("button", { name: "Modifier" }).click();
  await expect(page.getByLabel("Type utilisateur")).toHaveCount(0);
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await page.getByLabel("Identifiant").fill("permissions-viewer-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Utilisateurs" }).click();
  await expect(coachRow).toBeVisible();
  await expect(viewerRow).toBeVisible();
  await expect(adminRow).toBeVisible();
  await expect(adminRow.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Modifier" })).toHaveCount(0);
});
