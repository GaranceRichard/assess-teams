import { expect, test } from "@playwright/test";

import {
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

test("an anonymous visitor signs in, sees Viewer menus, and signs out", async ({
  page,
}) => {
  seedIdentity("viewer-e2e", "Viewer");
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
  await page.getByLabel("Identifiant").fill("viewer-e2e");
  await page.getByLabel("Mot de passe").fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByText("Tableau de bord — fonctionnalité à venir"),
  ).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link")).toHaveText([
    "Tableau de bord",
    "Équipes",
    "Résultats",
  ]);

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
});

test("a Viewer cannot open an Admin route directly", async ({ page }) => {
  seedIdentity("restricted-viewer-e2e", "Viewer");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("restricted-viewer-e2e");
  await page.getByLabel("Mot de passe").fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/users");

  await expect(page.getByRole("alert")).toContainText("Page non autorisée");
  await expect(page.getByRole("link", { name: "Utilisateurs" })).toHaveCount(0);
});

test("invalid credentials never open the product shell", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("missing-user");
  await page.getByLabel("Mot de passe").fill("invalid-password");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Identifiant ou mot de passe invalide",
  );
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("the Playwright backend applies Django migrations before serving", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:8100/admin/login/");
  await page.locator('input[name="username"]').fill("missing-admin");
  await page.locator('input[name="password"]').fill("invalid-password");
  await page.locator('input[type="submit"]').click();

  await expect(page.locator(".errornote")).toBeVisible();
});

test("a Superadmin creates, updates and deletes an invited user", async ({
  page,
}) => {
  const managedEmail = "managed-e2e@example.com";
  seedSuperadmin("root-e2e", managedEmail);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("root-e2e");
  await page.getByLabel("Mot de passe").fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(
    page.getByText("Tableau de bord — fonctionnalité à venir"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await page.getByRole("link", { name: "Utilisateurs" }).click();
  await expect(
    page.getByRole("heading", { name: "Utilisateurs" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ajouter un utilisateur" }).click();
  await page.getByLabel("Identifiant").fill("managed-e2e");
  await page.getByLabel("Adresse mail").fill(managedEmail);
  await page.getByLabel("Type utilisateur").selectOption("Coach");
  await page.getByRole("button", { name: "Valider" }).click();
  const managedRow = page.getByRole("row").filter({ hasText: managedEmail });
  await expect(managedRow.getByText("En attente")).toBeVisible();
  await managedRow.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Identifiant").fill("managed-updated");
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText("managed-updated")).toBeVisible();

  await managedRow.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Valider la suppression" }).click();
  await expect(page.getByText("managed-updated")).toHaveCount(0);
});

test("Admin and Coach see only the user actions allowed to them", async ({
  page,
}) => {
  seedIdentity("permissions-admin-e2e", "Admin");
  seedIdentity("permissions-coach-e2e", "Coach");
  seedIdentity("permissions-viewer-e2e", "Viewer");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("permissions-admin-e2e");
  await page.getByLabel("Mot de passe").fill(e2eCredential);
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
  await page.getByRole("button", { name: "Ajouter un utilisateur" }).click();
  await expect(
    page.getByLabel("Type utilisateur").getByRole("option"),
  ).toHaveText(["Coach", "Viewer"]);
  await page.getByRole("button", { name: "Annuler" }).click();
  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await page.getByLabel("Identifiant").fill("permissions-coach-e2e");
  await page.getByLabel("Mot de passe").fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Utilisateurs" }).click();
  await expect(
    page.getByRole("button", { name: "Ajouter un utilisateur" }),
  ).toHaveCount(0);
  await expect(coachRow.getByRole("button")).toHaveCount(0);
  await expect(viewerRow.getByRole("button")).toHaveCount(2);
  await viewerRow.getByRole("button", { name: "Modifier" }).click();
  await expect(page.getByLabel("Type utilisateur")).toHaveCount(0);
});
