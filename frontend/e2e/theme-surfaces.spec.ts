import { expect, test, type Page } from "@playwright/test";

import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedSteeringContext } from "./steering-fixture";

async function neutralSurfaces(page: Page) {
  const colors = await page
    .locator(
      [
        ".product-sidebar",
        ".workspace > header",
        ".dashboard-card",
        ".palette-panel",
        ".steering-page",
        ".results-page",
        ".table-wrap",
        ".organization-dialog",
        "input:not([type=radio]):not([type=checkbox])",
        "select",
      ].join(", "),
    )
    .evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.className || element.tagName,
        color: getComputedStyle(element).backgroundColor,
      })),
    );
  expect(colors.length).toBeGreaterThan(2);
  for (const { name, color } of colors) {
    const channels = color.match(/[\d.]+/g)!.map(Number);
    expect(channels[0], `${name}: ${color}`).toBe(channels[1]);
    expect(channels[1], `${name}: ${color}`).toBe(channels[2]);
  }
}

async function capture(page: Page, name: string) {
  await neutralSurfaces(page);
  await page.screenshot({
    path: test.info().outputPath(`${name}.png`),
    fullPage: true,
  });
}

test("representative dashboard, forms, dialogs, Results and Steering stay neutral", async ({
  page,
}) => {
  seedSteeringContext();
  runDjangoShell([
    "from identities.models import User",
    "User.objects.filter(username='results-admin-e2e').update(interface_palette='green')",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  for (const [mode, label] of [
    ["day", "Orange"],
    ["night", "Violet"],
  ]) {
    if (mode === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    await page.getByText("Couleurs", { exact: true }).click();
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
    await capture(page, `dashboard-${mode}`);
    await page.getByText("Couleurs", { exact: true }).click();
    await page
      .getByRole("region", { name: "Raccourcis utiles" })
      .getByRole("link", { name: "Pilotage", exact: true })
      .click();
    await expect(
      page.getByRole("rowheader", { name: "Équipe A" }),
    ).toBeVisible();
    await capture(page, `steering-${mode}`);
    await page.getByRole("link", { name: "Résultats", exact: true }).click();
    await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
    await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
    await expect(
      page.getByRole("img", { name: /Radar des résultats/ }),
    ).toBeVisible();
    await capture(page, `results-${mode}`);
    await page.getByRole("link", { name: "Organisation", exact: true }).click();
    await page.getByRole("button", { name: "Renommer", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture(page, `dialog-${mode}`);
    await page.getByRole("button", { name: "Annuler", exact: true }).click();
    await page
      .getByRole("link", { name: "Tableau de bord", exact: true })
      .click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByText("Couleurs", { exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Turquoise", exact: true }),
  ).toBeVisible();
  await capture(page, "palette-mobile");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
