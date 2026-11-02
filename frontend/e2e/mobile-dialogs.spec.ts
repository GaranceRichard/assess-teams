import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { assertFocusContained } from "./dialog-assertions";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  video: "on",
});

test("mobile form refuses submission without losing input and blocks background navigation", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/planning");
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).tap();
  const trigger = page.getByRole("button", {
    name: /Taking E2E - Passation E2E/,
  });
  await trigger.tap();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("combobox", { name: "Équipe", exact: true }),
  ).toBeFocused();
  await dialog
    .getByRole("combobox", { name: "Planifier", exact: true })
    .selectOption("fixed");
  const date = dialog.getByLabel("Première date");
  await date.tap();
  await date.fill("05/11/2099");
  await assertFocusContained(page, dialog);
  await page.touchscreen.tap(5, 5);
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/planning$/);
  await expect(date).toHaveValue("05/11/2099");
  await page.route("**/api/admin/planning/*/", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 400,
          json: { detail: "Modification refusée." },
        })
      : route.continue(),
  );
  await dialog
    .getByRole("button", { name: "Enregistrer les modifications" })
    .tap();
  await expect(
    dialog.getByRole("alert").filter({ hasText: "modification" }),
  ).toBeVisible();
  await expect(date).toHaveValue("05/11/2099");
  await page.screenshot({
    path: test.info().outputPath("planning-refused.png"),
  });
  await page.unroute("**/api/admin/planning/*/");
  await dialog
    .getByRole("button", { name: "Enregistrer les modifications" })
    .tap();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.tap();
  await expect(date).toHaveValue("05/11/2099");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("mobile protected score survives navigation attempts and refused save until retry", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).tap();
  const trigger = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) })
    .getByRole("button", { name: /Passer|Reprendre/ });
  await trigger.tap();
  const dialog = page.getByRole("dialog");
  await page.route("**/api/evaluations/*/responses/*/", (route) =>
    route.fulfill({
      status: 400,
      json: { detail: "Sauvegarde refusée." },
    }),
  );
  await dialog.getByRole("button", { name: "Choisir la note 5 sur 10" }).tap();
  await expect(dialog.getByRole("alert")).toContainText(
    "n’a pas été enregistrée",
  );
  await page.touchscreen.tap(5, 5);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/evaluations$/);
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeDisabled();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  await page.screenshot({
    path: test.info().outputPath("score-protected.png"),
  });
  await page.unroute("**/api/evaluations/*/responses/*/");
  await dialog.getByRole("button", { name: "Réessayer la sauvegarde" }).tap();
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeEnabled();
  await dialog.getByRole("button", { name: "Fermer" }).tap();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.tap();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
});
