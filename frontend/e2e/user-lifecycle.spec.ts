import { expect, test, type Page } from "@playwright/test";

import { frontendURL } from "./urls";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

async function login(page: Page, username: string) {
  await page.goto(frontendURL);
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

test("last Admin refusal and Coach lifecycle preserve identity while blocking an existing session", async ({
  page,
  browser,
}) => {
  seedSuperadmin("lifecycle-root", "unused-lifecycle@example.com");
  seedIdentity("lifecycle-admin", "Admin");
  seedIdentity("lifecycle-coach", "Coach");
  assignOrganization(["lifecycle-admin", "lifecycle-coach"], "Lifecycle E2E");
  const coachContext = await browser.newContext();
  try {
    const coachPage = await coachContext.newPage();
    await login(coachPage, "lifecycle-coach");
    await login(page, "lifecycle-root");
    await page.getByRole("link", { name: "Utilisateurs" }).click();
    const adminRow = page
      .getByRole("row")
      .filter({ hasText: "lifecycle-admin@example.com" });
    await adminRow.getByRole("button", { name: "Désactiver" }).click();
    await page
      .getByRole("button", { name: "Confirmer la désactivation" })
      .click();
    await expect(page.getByRole("alert")).toContainText("un autre Admin");
    await expect(adminRow.getByText("Actif", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Annuler" }).click();
    const coachRow = page
      .getByRole("row")
      .filter({ hasText: "lifecycle-coach@example.com" });
    await coachRow.getByRole("button", { name: "Désactiver" }).click();
    await page
      .getByRole("button", { name: "Confirmer la désactivation" })
      .click();
    await expect(coachRow.getByText("Désactivé")).toBeVisible();
    const refused = await coachPage.request.get(
      `${frontendURL}/api/evaluations/`,
    );
    expect(refused.status()).toBe(403);
    await coachPage.reload();
    await coachPage.getByLabel("Identifiant").fill("lifecycle-coach");
    await coachPage
      .getByLabel("Mot de passe", { exact: true })
      .fill(e2eCredential);
    await coachPage.getByRole("button", { name: "Se connecter" }).click();
    await expect(coachPage.getByRole("alert")).toContainText(
      "Identifiant ou mot de passe invalide",
    );
    await coachRow.getByRole("button", { name: "Réactiver" }).click();
    await expect(coachRow.getByText("Actif", { exact: true })).toBeVisible();
    await coachPage.getByRole("button", { name: "Se connecter" }).click();
    await expect(coachPage.getByRole("navigation")).toBeVisible();
  } finally {
    await coachContext.close();
  }
});
