import { expect, test, type Page } from "@playwright/test";
import { seedDashboardContext } from "./dashboard-fixture";
import { e2eCredential, seedSuperadmin } from "./identity-fixture";

async function login(page: Page, username: string) {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
}

for (const role of ["Admin", "Coach", "Viewer"] as const) {
  test(`${role} sees only accessible evaluation activity and useful shortcuts`, async ({
    page,
  }) => {
    seedDashboardContext();
    await login(page, `dashboard-${role.toLowerCase()}-e2e`);
    const profile = page.getByRole("region", { name: "Mon profil" });
    await expect(profile).toContainText("Dashboard E2E");
    if (role === "Admin") await expect(profile).toContainText("Léa Martin");
    const events = page
      .getByRole("list", { name: "Dernières activités" })
      .getByRole("listitem");
    await expect(events).toHaveCount(2);
    await expect(events.nth(0)).toContainText("Évaluation révisée");
    await expect(events.nth(1)).toContainText("Évaluation terminée");
    await expect(events.nth(0)).toContainText(
      "Équipe Dashboard · Modèle Dashboard · v1",
    );
    const shortcuts = page.getByRole("region", { name: "Raccourcis utiles" });
    await expect(shortcuts.getByRole("link", { name: "Pilotage" })).toHaveCount(
      role === "Admin" ? 1 : 0,
    );
    await expect(
      shortcuts.getByRole("link", { name: "Mes évaluations" }),
    ).toHaveCount(role === "Viewer" ? 0 : 1);
    const response = await page.request.get(
      "/api/dashboard/?organization_id=999999",
    );
    const data = await response.json();
    expect(data.recent_activity).toHaveLength(2);
    expect(
      data.recent_activity.every(
        (e: { organization_name: string }) =>
          e.organization_name === "Dashboard E2E",
      ),
    ).toBe(true);
    if (role === "Viewer") {
      await expect(events.nth(0)).not.toContainText("Par ");
      expect(data.pending_assignments).toBeNull();
      expect((await page.request.get("/api/admin/users/")).status()).toBe(403);
      await page.goto("/evaluations");
      await expect(page.getByRole("alert")).toContainText("Page non autorisée");
    } else {
      await expect(shortcuts).toContainText(
        role === "Coach"
          ? "1 évaluation assignée"
          : "Aucune évaluation assignée",
      );
      await shortcuts.getByRole("link", { name: "Mes évaluations" }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/evaluations$/);
    }
  });
}

test("Superadmin sees explicitly global organization context without a personal organization", async ({
  page,
}) => {
  seedDashboardContext();
  seedSuperadmin("dashboard-root-e2e", "unused-dashboard@example.com");
  await login(page, "dashboard-root-e2e");
  const profile = page.getByRole("region", { name: "Mon profil" });
  await expect(profile).toContainText("Superadmin");
  await expect(profile).not.toContainText("Organisation");
  await expect(page.getByText(/Activité globale/)).toBeVisible();
  const events = page
    .getByRole("list", { name: "Dernières activités" })
    .getByRole("listitem");
  expect(await events.count()).toBeLessThanOrEqual(10);
  for (const event of await events.all())
    await expect(event).toContainText("Organisation :");
});

test("dashboard retries errors, supports mobile themes and keeps palette after navigation", async ({
  page,
}) => {
  seedDashboardContext();
  await page.route("**/api/dashboard/", (route) =>
    route.fulfill({ status: 500, body: "{}" }),
  );
  await login(page, "dashboard-coach-e2e");
  await expect(page.getByRole("alert")).toContainText("Impossible de charger");
  await page.unroute("**/api/dashboard/");
  await page.getByRole("button", { name: "Réessayer" }).click();
  await expect(
    page.getByRole("list", { name: "Dernières activités" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("radio", { name: "Rouge", exact: true }).check();
  await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
  for (const theme of ["day", "night"]) {
    if (theme === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await page.screenshot({
      path: test.info().outputPath(`dashboard-mobile-${theme}.png`),
      fullPage: true,
    });
  }
  await page.getByRole("link", { name: "Voir les résultats" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "red");
  await expect(page.getByText("Couleurs", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Tableau de bord" }).click();
  await page.getByText("Couleurs", { exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Rouge", exact: true }),
  ).toBeChecked();
});
