import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  video: "on",
});

test("browser Back cannot discard a refused score", async ({ page }) => {
  seedTakingContext();
  await page.goto("/dashboard");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).tap();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Évaluations", exact: true })
    .tap();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Résultats", exact: true })
    .tap();
  await page.goBack();
  await expect(page).toHaveURL(/\/evaluations$/);
  await page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) })
    .getByRole("button", { name: /Passer|Reprendre/ })
    .tap();
  const dialog = page.getByRole("dialog");
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/evaluations/*/responses/*/", async (route) => {
    await pending;
    await route.fulfill({
      status: 400,
      json: { detail: "Sauvegarde refusée." },
    });
  });
  const request = page.waitForRequest("**/api/evaluations/*/responses/*/");
  await dialog.getByRole("button", { name: "Choisir la note 5 sur 10" }).tap();
  await request;
  await page.goBack();
  await expect(page).toHaveURL(/\/evaluations$/);
  await expect(dialog).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/evaluations$/);
  await expect(dialog).toBeVisible();
  release();
  await expect(dialog.getByRole("alert")).toContainText(
    "n’a pas été enregistrée",
  );
  await page.goBack();
  await expect(page).toHaveURL(/\/evaluations$/);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  const confirmation = page.waitForEvent("dialog");
  // A dismissed reload has no new load event for Playwright to await.
  const reload = page.reload({ timeout: 2000 }).catch((error: Error) => {
    expect(error.message).toMatch(/ERR_ABORTED|Timeout/);
  });
  const prompt = await confirmation;
  expect(prompt.type()).toBe("beforeunload");
  await prompt.dismiss();
  await reload;
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
  await page.screenshot({
    path: test.info().outputPath("history-protected.png"),
  });
  await page.unroute("**/api/evaluations/*/responses/*/");
  await dialog.getByRole("button", { name: "Réessayer la sauvegarde" }).tap();
  await expect(dialog.getByRole("button", { name: "Fermer" })).toBeEnabled();
  await dialog.getByRole("button", { name: "Fermer" }).tap();
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/evaluations$/);
  await page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) })
    .getByRole("button", { name: /Passer|Reprendre/ })
    .tap();
  await expect(dialog.getByRole("slider")).toHaveValue("5");
});
