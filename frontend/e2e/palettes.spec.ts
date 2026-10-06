import { expect, test, type Page } from "@playwright/test";

import {
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

async function login(page: Page, username: string) {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

test("persists a personal palette across reload, login and a fresh browser context", async ({
  page,
  browser,
}) => {
  seedIdentity("palette-viewer-e2e", "Viewer");
  seedIdentity("palette-other-e2e", "Viewer");
  runDjangoShell([
    "from identities.models import User",
    "User.objects.filter(username__in=['palette-viewer-e2e', 'palette-other-e2e']).update(interface_palette='green')",
  ]);
  await login(page, "palette-viewer-e2e");
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-palette", "green");
  await page.getByText("Couleurs", { exact: true }).click();

  await expect(page.getByRole("radio")).toHaveCount(10);
  await page.getByRole("radio", { name: "Turquoise", exact: true }).check();
  await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
  for (const [name, theme] of [
    ["Activer le mode nuit", "night"],
    ["Activer le mode jour", "day"],
  ]) {
    await page.getByRole("button", { name }).click();
    await expect(root).toHaveAttribute("data-theme", theme);
    await expect(root).toHaveAttribute("data-palette", "turquoise");
    await page.screenshot({
      path: test.info().outputPath(`palette-${theme}.png`),
      fullPage: true,
    });
  }

  await page.getByRole("radio", { name: "Violet", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "Rose", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("Couleur enregistrée.");
  await page.reload();
  await expect(root).toHaveAttribute("data-palette", "pink");
  await page.getByText("Couleurs", { exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Rose", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(root).toHaveAttribute("data-palette", "green");
  await login(page, "palette-other-e2e");
  await expect(root).toHaveAttribute("data-palette", "green");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await login(page, "palette-viewer-e2e");
  await expect(root).toHaveAttribute("data-palette", "pink");

  const fresh = await browser.newContext();
  try {
    const device = await fresh.newPage();
    await login(device, "palette-viewer-e2e");
    await expect(device.locator("html")).toHaveAttribute(
      "data-palette",
      "pink",
    );
    expect(
      await device.evaluate(() => localStorage.getItem("assess-teams-palette")),
    ).toBeNull();
  } finally {
    await fresh.close();
  }
});

test("applies immediately and restores the previous color when saving fails", async ({
  page,
}) => {
  seedIdentity("palette-failure-e2e", "Viewer");
  runDjangoShell([
    "from identities.models import User",
    "User.objects.filter(username='palette-failure-e2e').update(interface_palette='green')",
  ]);
  await login(page, "palette-failure-e2e");
  await page.getByText("Couleurs", { exact: true }).click();
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route("**/api/session/", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    await gate;
    await route.fulfill({ status: 500, body: "{}" });
  });
  await page.getByRole("radio", { name: "Bleu", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "blue");
  await expect(
    page.getByRole("radio", { name: "Rouge", exact: true }),
  ).toBeDisabled();
  finish();
  await expect(page.getByRole("alert")).toContainText(
    "couleur précédente est rétablie",
  );
  await expect(page.locator("html")).toHaveAttribute("data-palette", "green");
  await page.unroute("**/api/session/");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "green");
});
