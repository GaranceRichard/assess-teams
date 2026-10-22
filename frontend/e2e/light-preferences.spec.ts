import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { palettes } from "../src/palette";
import { auditLightScreen } from "./light-contrast-audit";
import {
  e2eCredential,
  runDjangoShell,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

test("all ten personal palettes survive mode, navigation, reload and login; refusal restores the saved choice", async ({
  page,
}) => {
  test.setTimeout(90_000);
  seedIdentity("light-palette-e2e", "Viewer");
  runDjangoShell([
    "from identities.models import User",
    "User.objects.filter(username='light-palette-e2e').update(interface_palette='green')",
  ]);
  const login = async () => {
    await page.goto("/");
    await page.getByLabel("Identifiant").fill("light-palette-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
  };
  await login();
  const values = [];
  for (const { value, label } of palettes) {
    await page.getByText("Couleurs", { exact: true }).click();
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
    await page.getByRole("status").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: test.info().outputPath(`palette-saved-${value}.png`),
    });
    await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    await page.getByRole("link", { name: "Résultats", exact: true }).click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
    await expect(page.locator("html")).toHaveAttribute("data-palette", value);
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await login();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
    await expect(page.locator("html")).toHaveAttribute("data-palette", value);
    await page.getByRole("button", { name: "Activer le mode jour" }).click();
    values.push({
      palette: value,
      afterReload: value,
      afterLogin: value,
      mode: "day",
    });
  }
  writeFileSync(
    test.info().outputPath("preferences.json"),
    JSON.stringify(values),
  );
  await page.getByText("Couleurs", { exact: true }).click();
  await page.route("**/api/session/", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    await route.fulfill({ status: 500, json: {} });
  });
  await page.getByRole("radio", { name: "Bleu", exact: true }).check();
  await expect(page.getByRole("alert")).toContainText(
    "couleur précédente est rétablie",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "turquoise",
  );
  await auditLightScreen(page, "palette-error");
  await page.getByRole("alert").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("palette-refusal-visible.png"),
  });
  await page.unroute("**/api/session/");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-palette",
    "turquoise",
  );
});

test("light organization creation uses readable control boundaries for the global administrator", async ({
  page,
}) => {
  seedSuperadmin("light-global-e2e@example.com", "light-managed@example.com");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("light-global-e2e@example.com");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Organisation", exact: true }).click();
  await expect(page.locator(".organization-form > input")).toBeVisible();
  await auditLightScreen(page, "organization-create");
});
