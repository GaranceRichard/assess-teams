import { expect, test } from "@playwright/test";
import { e2eCredential, seedIdentity } from "./identity-fixture";
import { verifySidebar } from "./sidebar-assertions";

for (const role of ["Admin", "Viewer"] as const) {
  test(
    "sidebar geometry and retained collapse for " + role,
    async ({ page }) => {
      const username = "sidebar-" + role.toLowerCase() + "-e2e";
      seedIdentity(username, role);
      await page.goto("/");
      await page.getByLabel("Identifiant").fill(username);
      await page
        .getByLabel("Mot de passe", { exact: true })
        .fill(e2eCredential);
      await page.getByRole("button", { name: "Se connecter" }).click();
      await expect(page.locator(".product-sidebar")).toBeVisible();
      await verifySidebar(page, role === "Admin");
      await page.getByRole("button", { name: "Replier le menu" }).click();
      await page.getByRole("link", { name: "Résultats", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Déplier le menu" }),
      ).toBeVisible();
      await page.screenshot({
        path: test.info().outputPath("sidebar-" + role + ".png"),
      });
    },
  );
}
