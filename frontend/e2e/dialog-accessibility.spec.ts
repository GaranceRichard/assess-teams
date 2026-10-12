import { expect, test } from "@playwright/test";

import {
  assertFocusContained,
  cancelByKeyboard,
  openByKeyboard,
} from "./dialog-assertions";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
} from "./identity-fixture";

async function seedAndLogin(page: import("@playwright/test").Page) {
  seedIdentity("modal-admin-e2e", "Admin");
  seedIdentity("modal-coach-e2e", "Coach");
  assignOrganization(["modal-admin-e2e", "modal-coach-e2e"], "Modal E2E");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("modal-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

test("identity dialogs contain keyboard and assistive access, preserve refused input and restore focus", async ({
  page,
}) => {
  await seedAndLogin(page);
  await page.goto("/users");
  const add = page.getByRole("button", { name: "Ajouter un utilisateur" });
  let dialog = await openByKeyboard(page, add);
  await expect(dialog.getByLabel("Identifiant")).toBeFocused();
  await assertFocusContained(page, dialog);
  await cancelByKeyboard(page, add);
  dialog = await openByKeyboard(page, add);
  await dialog.getByLabel("Identifiant").fill("modal-input-e2e");
  await dialog.getByLabel("Adresse mail").fill("modal-input@example.com");
  await page.route("**/api/admin/users/", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 400, json: { detail: "Invitation refusée." } })
      : route.continue(),
  );
  await dialog.getByRole("button", { name: "Valider" }).click();
  await expect(dialog.getByRole("alert")).toContainText("refusée");
  await expect(dialog.getByLabel("Identifiant")).toHaveValue("modal-input-e2e");
  await page.mouse.click(5, 5);
  await expect(dialog).toHaveCount(0);
  await expect(add).toBeFocused();
  const row = page.getByRole("row").filter({ hasText: "modal-coach-e2e" });
  const deactivate = row.getByRole("button", { name: "Désactiver" });
  dialog = await openByKeyboard(page, deactivate);
  await expect(dialog.getByRole("button", { name: "Annuler" })).toBeFocused();
  await expect(dialog).toHaveAccessibleDescription(/modal-coach-e2e/);
  await dialog.getByRole("button", { name: "Annuler" }).click();
  await expect(deactivate).toBeFocused();
});

test("organization and team dialogs return focus after cancellation and after their opener disappears", async ({
  page,
}) => {
  await seedAndLogin(page);
  await page.goto("/organization");
  const rename = page.getByRole("button", { name: "Renommer" });
  let dialog = await openByKeyboard(page, rename);
  await expect(dialog.getByLabel("Nom", { exact: true })).toBeFocused();
  await assertFocusContained(page, dialog);
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await cancelByKeyboard(page, rename);
  const members = page.getByRole("button", { name: "Gérer les membres" });
  dialog = await openByKeyboard(page, members);
  await expect(dialog.getByLabel("modal-coach-e2e")).toBeFocused();
  await expect(dialog).toHaveAccessibleDescription(
    "Conservez au moins un Admin actif.",
  );
  await cancelByKeyboard(page, members);
  await page.goto("/teams");
  await page.getByLabel("Organisation").selectOption({ label: "Modal E2E" });
  const create = page.getByRole("button", { name: "Créer une équipe" });
  dialog = await openByKeyboard(page, create);
  await dialog.getByLabel("Nom de l’équipe").fill("Équipe modal");
  await dialog.getByRole("button", { name: "Enregistrer" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(create).toBeFocused();
  const remove = page
    .getByRole("listitem")
    .filter({ hasText: "Équipe modal" })
    .getByRole("button", { name: "Supprimer" });
  dialog = await openByKeyboard(page, remove);
  await expect(dialog.getByRole("button", { name: "Annuler" })).toBeFocused();
  await expect(dialog).toHaveAccessibleDescription(/Équipe modal/);
  await dialog.getByRole("button", { name: "Valider la suppression" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 1, name: "Équipes" }),
  ).toBeFocused();
});
