import { expect, test } from "@playwright/test";

import {
  assertFocusContained,
  cancelByKeyboard,
  openByKeyboard,
} from "./dialog-assertions";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

async function login(page: import("@playwright/test").Page) {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

test("taking protects pending and refused scores from Escape, retries and restores focus on repeated openings", async ({
  page,
}) => {
  await login(page);
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
  const trigger = row.getByRole("button", { name: /Passer|Reprendre/ });
  let dialog = await openByKeyboard(page, trigger);
  await expect(
    dialog.getByRole("heading", { name: "Passer l’évaluation" }),
  ).toBeFocused();
  await assertFocusContained(page, dialog);
  let failSave!: () => void;
  const gate = new Promise<void>((resolve) => {
    failSave = resolve;
  });
  await page.route("**/api/evaluations/*/responses/*/", async (route) => {
    await gate;
    await route.fulfill({
      status: 400,
      json: { detail: "Sauvegarde refusée." },
    });
  });
  const request = page.waitForRequest("**/api/evaluations/*/responses/*/");
  await dialog.getByRole("button", { name: "Enregistrer la note" }).click();
  await request;
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeDisabled();
  failSave();
  await expect(dialog.getByRole("alert")).toContainText(
    "n’a pas été enregistrée",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  await page.unroute("**/api/evaluations/*/responses/*/");
  await dialog.getByRole("button", { name: "Réessayer la sauvegarde" }).click();
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeEnabled();
  await cancelByKeyboard(page, trigger);
  dialog = await openByKeyboard(page, trigger);
  await dialog.getByRole("button", { name: "Fermer" }).click();
  await expect(trigger).toBeFocused();
});

test("planning scopes labels to the active modal and retains values during confirmation and refusals", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("taking-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.goto("/planning");
  const trigger = page.getByRole("button", {
    name: /Taking E2E - Passation E2E/,
  });
  const dialog = await openByKeyboard(page, trigger);
  await expect(
    dialog.getByRole("combobox", { name: "Équipe", exact: true }),
  ).toBeFocused();
  await assertFocusContained(page, dialog);
  await dialog
    .getByRole("combobox", { name: "Planifier", exact: true })
    .selectOption("fixed");
  await dialog.getByLabel("Première date").fill("05/11/2099");
  await dialog.getByRole("button", { name: "Supprimer", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Supprimer définitivement",
  );
  await expect(dialog.getByLabel("Première date")).toHaveValue("05/11/2099");
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
    .click();
  await expect(
    dialog.getByRole("alert").filter({ hasText: "modification" }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Première date")).toHaveValue("05/11/2099");
  await cancelByKeyboard(page, trigger);
});
