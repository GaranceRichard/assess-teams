import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
} from "./identity-fixture";

for (const role of ["Admin", "Coach"] as const) {
  test(`${role} user form hides a technical failure and preserves input for retry`, async ({
    page,
  }) => {
    const actor = `error-invite-${role.toLowerCase()}`;
    seedIdentity(actor, role);
    const identifier = `error-invited-${role.toLowerCase()}`;
    if (role === "Coach") seedIdentity(identifier, "Viewer");
    assignOrganization(
      role === "Coach" ? [actor, identifier] : [actor],
      `Invitation ${role}`,
    );
    const method = role === "Admin" ? "POST" : "PUT";
    await page.goto("/");
    await page.getByLabel("Identifiant").fill(actor);
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
    await page.goto("/users");
    if (role === "Admin") {
      await page
        .getByRole("button", { name: "Ajouter un utilisateur" })
        .click();
    } else {
      await page
        .getByRole("row")
        .filter({ hasText: identifier })
        .getByRole("button", { name: "Modifier" })
        .click();
    }
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Identifiant").fill(identifier);
    await dialog.getByLabel("Adresse mail").fill(`${identifier}@example.com`);
    await page.route("**/api/admin/users/**", (route) =>
      route.request().method() === method
        ? route.fulfill({
            status: 500,
            json: { detail: "DIAGNOSTIC_CONFIDENTIEL_FICTIF" },
          })
        : route.continue(),
    );
    await dialog.getByRole("button", { name: "Valider" }).click();
    await expect(dialog.getByRole("alert")).toHaveText(
      "Le service est indisponible. Votre saisie est conservée ; réessayez plus tard.",
    );
    await expect(dialog).not.toContainText("DIAGNOSTIC_CONFIDENTIEL_FICTIF");
    await expect(dialog.getByLabel("Identifiant")).toHaveValue(identifier);
    await expect(dialog.getByLabel("Adresse mail")).toHaveValue(
      `${identifier}@example.com`,
    );
    await expect(dialog.getByRole("button", { name: "Valider" })).toBeEnabled();
    await page.screenshot({
      path: test.info().outputPath("invitation-refused.png"),
      fullPage: true,
    });
    await page.unroute("**/api/admin/users/**");
    const result = page.waitForResponse(
      (r) =>
        r.request().method() === method &&
        r.url().includes("/api/admin/users/"),
    );
    await dialog.getByRole("button", { name: "Valider" }).click();
    expect((await result).status()).toBe(role === "Admin" ? 201 : 200);
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("row").filter({ hasText: identifier }),
    ).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
    // The invitation is recorded; the UI never claims SMTP delivery was confirmed.
    await expect(
      page.getByText(/courriel envoyé|e-mail envoyé|notification envoyée/i),
    ).toHaveCount(0);
  });
}
