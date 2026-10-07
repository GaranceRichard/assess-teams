import { expect, test, type Page } from "@playwright/test";

import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { luminance } from "./palette-contrast";
import { seedSteeringContext } from "./steering-fixture";

async function themedSurfaces(page: Page) {
  const selectors = {
    background: "html",
    "navigation-background": ".product-sidebar, .workspace > header",
    surface: [
      ".dashboard-card",
      ".steering-page",
      ".results-page",
      ".table-wrap",
      "input:not([type=radio]):not([type=checkbox])",
      "select",
    ].join(", "),
    "surface-raised": ".organization-dialog",
    "surface-secondary": ".dashboard .palette-panel",
  };
  const colors = await page.evaluate((selectors) => {
    return Object.entries(selectors).flatMap(([token, selector]) => {
      const probe = document.createElement("span");
      const role =
        token === "surface-secondary" &&
        document.documentElement.dataset.theme === "night"
          ? "surface-raised"
          : token;
      probe.style.backgroundColor = `var(--${role})`;
      document.body.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [...document.querySelectorAll(selector)].map((element) => ({
        name: element.className || element.tagName,
        color: getComputedStyle(element).backgroundColor,
        expected,
        band: token === "navigation-background",
        night: document.documentElement.dataset.theme === "night",
      }));
    });
  }, selectors);
  expect(colors.length).toBeGreaterThan(2);
  for (const { name, color, expected, band, night } of colors) {
    expect(color, name).toBe(expected);
    if (night) expect(luminance(color), name).toBeLessThan(0.15);
    else expect(luminance(color), name).toBeGreaterThan(band ? 0.8 : 0.88);
  }
}

async function capture(page: Page, name: string) {
  await themedSurfaces(page);
  await page
    .locator(".dashboard-card, .dashboard-feed")
    .evaluateAll((elements) => {
      elements.forEach((element) => element.scrollTo(0, 0));
    });
  await page.screenshot({
    animations: "disabled",
    path: test.info().outputPath(`${name}.png`),
    fullPage: true,
  });
}

test("representative screens use accent light bands, neutral content and preserved dark surfaces", async ({
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
    ["day", "Bleu"],
    ["night", "Violet"],
  ]) {
    if (mode === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    await page.getByText("Couleurs", { exact: true }).click();
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
    await capture(page, `dashboard-${mode}`);
    await page.getByText("Couleurs", { exact: true }).click();
    if (mode === "day") {
      for (const palette of ["Violet", "Vert", "Bleu"]) {
        await page.getByText("Couleurs", { exact: true }).click();
        await page.getByRole("radio", { name: palette, exact: true }).check();
        await expect(page.getByRole("status")).toHaveText(
          "Couleur enregistrée.",
        );
        await page.getByText("Couleurs", { exact: true }).click();
        await capture(page, `dashboard-day-${palette}`);
      }
      expect(
        await page
          .getByRole("region", { name: "Raccourcis utiles" })
          .evaluate((element) => element.getBoundingClientRect().bottom),
      ).toBeLessThanOrEqual(720);
    }
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
  // Wide font metrics reproduce the overflow reported by the Linux CI runner.
  await page.addStyleTag({
    content:
      ".palette-options label { font-family: monospace; font-size: 1rem; }",
  });
  await page.getByText("Couleurs", { exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Turquoise", exact: true }),
  ).toBeVisible();
  await capture(page, "palette-mobile");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
