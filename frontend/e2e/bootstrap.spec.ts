import { expect, test } from "@playwright/test";

import { e2eCredential, seedIdentity } from "./identity-fixture";

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
