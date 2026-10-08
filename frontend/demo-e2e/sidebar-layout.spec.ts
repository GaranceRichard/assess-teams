import { expect, test } from "@playwright/test";
import { verifySidebar } from "../e2e/sidebar-assertions";

test("shared sidebar geometry in the Pages build without API calls", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("./");
  await verifySidebar(page, true);
  await page.getByRole("button", { name: "Replier le menu" }).click();
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Déplier le menu" }),
  ).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("sidebar-demo.png") });
});
