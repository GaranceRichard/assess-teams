import { expect, test } from "@playwright/test";

import { backendURL } from "./urls";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

test("an anonymous visitor signs in, sees Viewer menus, and signs out", async ({
  page,
}) => {
  seedIdentity("viewer-e2e", "Viewer");
  assignOrganization(["viewer-e2e"], "North E2E");
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
  await page.getByLabel("Identifiant").fill("viewer-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await expect(
    page.getByLabel("Mot de passe", { exact: true }),
  ).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Afficher le mot de passe" }).click();
  await expect(
    page.getByLabel("Mot de passe", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Masquer le mot de passe" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  await expect(page.getByText(/Organisation :/)).toContainText(
    "Organisation : North E2E",
  );
  await expect(page.getByRole("navigation").getByRole("link")).toHaveText([
    "Tableau de bord",
    "Résultats",
  ]);
  await page.getByRole("button", { name: "Replier le menu" }).click();
  await expect(page.locator(".product-sidebar")).toHaveClass(
    /product-sidebar--collapsed/,
  );
  const dashboardLink = page.getByRole("link", { name: "Tableau de bord" });
  await expect(dashboardLink.locator(".sidebar-label")).toBeHidden();
  await dashboardLink.hover();
  await expect
    .poll(() =>
      dashboardLink.evaluate((link) =>
        getComputedStyle(link, "::after").getPropertyValue("opacity"),
      ),
    )
    .toBe("1");
  await page.getByRole("button", { name: "Déplier le menu" }).click();
  await expect(dashboardLink.locator(".sidebar-label")).toBeVisible();
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(
    page.getByText("Aucune passation complétée accessible."),
  ).toBeVisible();

  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();

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
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Organisation :/)).toContainText(
    "Aucune organisation",
  );
  await expect(page.getByRole("link", { name: "Utilisateurs" })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Équipes", exact: true }),
  ).toHaveCount(0);
  for (const path of ["/users", "/teams"]) {
    await page.goto(path);
    await expect(page.getByRole("alert")).toContainText("Page non autorisée");
  }

  await page.goto("/organization");

  await expect(page.getByRole("alert")).toContainText("Page non autorisée");
  await expect(page.getByRole("link", { name: "Organisation" })).toHaveCount(0);
});

test("invalid credentials never open the product shell", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("missing-user");
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("invalid-password");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "Identifiant ou mot de passe invalide",
  );
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("the Playwright backend applies Django migrations before serving", async ({
  page,
}) => {
  await page.goto(`${backendURL}/admin/login/`);
  await page.locator('input[name="username"]').fill("missing-admin");
  await page.locator('input[name="password"]').fill("invalid-password");
  await page.locator('input[type="submit"]').click();

  await expect(page.locator(".errornote")).toBeVisible();
});

test("a Superadmin creates, updates, deactivates and reactivates an invited user", async ({
  page,
}) => {
  const managedEmail = "managed-e2e@example.com";
  seedSuperadmin("root-e2e", managedEmail);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("root-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
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
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Rechercher un utilisateur").fill("managed-");
  const managedRow = page.getByRole("row").filter({ hasText: managedEmail });
  await expect(managedRow.getByText("En attente")).toBeVisible();
  await managedRow.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Identifiant").fill("managed-updated");
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText("managed-updated")).toBeVisible();

  await managedRow.getByRole("button", { name: "Désactiver" }).click();
  await page
    .getByRole("button", { name: "Confirmer la désactivation" })
    .click();
  await expect(managedRow.getByText("Désactivé")).toBeVisible();
  await page.reload();
  await page.getByLabel("Rechercher un utilisateur").fill("managed-");
  await expect(managedRow.getByText("Désactivé")).toBeVisible();
  await managedRow.getByRole("button", { name: "Réactiver" }).click();
  await expect(managedRow.getByText("Actif", { exact: true })).toBeVisible();
});
