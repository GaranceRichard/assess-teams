import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";
import { seedSteeringContext } from "./steering-fixture";

async function login(page: Page, username: string) {
  await page.goto("/steering");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test("Admin reads coverage, overdue and sources with palette, keyboard and mobile support", async ({
  page,
}) => {
  seedSteeringContext();
  await login(page, "results-admin-e2e");
  await expect(page.getByRole("heading", { name: "Pilotage" })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const summary = page.getByLabel("Synthèse du dispositif");
  await expect(summary.getByText("3", { exact: true })).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByText("En retard", { exact: true })).toBeVisible();
  await expect(
    table.getByText("Jamais évaluée", { exact: true }),
  ).toBeVisible();
  await expect(table.getByText("À jour", { exact: true })).toBeVisible();
  await expect(table.getByText("Archivée E2E")).toHaveCount(0);
  const background = await page
    .locator(".steering-page")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await expect
    .poll(() =>
      page
        .locator(".steering-page")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .not.toBe(background);
  await page.getByText("Couleurs", { exact: true }).click();
  for (const color of ["Bleu", "Rose", "Rouge", "Vert"]) {
    await page.getByRole("radio", { name: color, exact: true }).check();
    await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
    await expect(table.getByText("En retard", { exact: true })).toBeVisible();
  }
  await page.getByText("Couleurs", { exact: true }).click();
  await page.screenshot({
    path: test.info().outputPath("steering-dark.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Activer le mode jour" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("region", { name: "Équipes suivies" }).focus();
  await expect(
    page.getByRole("region", { name: "Équipes suivies" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.screenshot({
    path: test.info().outputPath("steering-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  const link = page.getByRole("link", {
    name: "Voir les résultats de Équipe A",
  });
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(
    /\/results\?organization_id=\d+&family_id=\d+&team_id=\d+$/,
  );
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await expect(page.getByLabel("Modèle")).toHaveValue(/\d+/);
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
});

test("Superadmin chooses one organization and switches with no data leak", async ({
  page,
}) => {
  seedSteeringContext();
  seedSuperadmin(
    "steering-root-e2e@example.com",
    "unused-steering@example.com",
  );
  await login(page, "steering-root-e2e@example.com");
  await expect(
    page.getByText(
      "Sélectionnez une organisation pour consulter son pilotage.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Organisation", exact: true })
    .selectOption({ label: "Results E2E" });
  await expect(page.getByRole("rowheader", { name: "Équipe A" })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Organisation", exact: true })
    .selectOption({ label: "Steering Other E2E" });
  await expect(
    page.getByRole("rowheader", { name: "Autre équipe E2E" }),
  ).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Équipe A" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: /Voir les résultats/ }),
  ).toHaveCount(0);
});

for (const role of ["Coach", "Viewer"] as const) {
  test(`${role} cannot open Steering or read its API`, async ({ page }) => {
    const username = `steering-${role.toLowerCase()}-denied-e2e`;
    seedIdentity(username, role);
    assignOrganization([username], `Steering ${role} denied E2E`);
    await login(page, username);
    await expect(
      page.getByRole("heading", { name: "Tableau de bord" }),
    ).toBeVisible();
    await page.goto("/steering");
    await expect(page.getByRole("alert")).toHaveText(/Page non autorisée/);
    expect((await page.request.get("/api/steering/")).status()).toBe(403);
    expect(
      (await page.request.get("/api/steering/organizations/")).status(),
    ).toBe(403);
  });
}
