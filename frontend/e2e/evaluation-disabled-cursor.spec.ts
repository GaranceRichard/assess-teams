import { expect, test, type Locator } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

async function expectUnavailable(button: Locator) {
  await expect(button).toBeDisabled();
  await button.hover();
  await expect(button).toHaveCSS("cursor", "default");
  await expect(button).toHaveCSS("opacity", "0.65");
  // A real pointer click must leave the native disabled control inert.
  await button.click({ force: true });
}

for (const theme of ["day", "night"]) {
  test(`unanswered taking actions keep a normal pointer (${theme})`, async ({
    page,
  }, testInfo) => {
    seedTakingContext();
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    await page
      .getByRole("row")
      .filter({ hasText: "Passation E2E v1" })
      .getByRole("button", { name: "Passer l’évaluation" })
      .click();
    const dialog = page.getByRole("dialog");
    const slider = dialog.getByRole("slider");
    const save = dialog.getByRole("button", { name: "Enregistrer la note" });
    const next = dialog.getByRole("button", { name: "Suivant" });
    const previous = dialog.getByRole("button", { name: "Précédent" });
    let writes = 0;
    page.on("request", (request) => {
      if (request.method() === "PUT" && request.url().includes("/responses/"))
        writes++;
    });

    for (const button of [save, next, previous])
      await expectUnavailable(button);
    await slider.focus();
    await slider.press("Enter");
    await slider.press("Space");
    await slider.press("Tab");
    await expect(dialog.getByRole("button", { name: "Fermer" })).toBeFocused();
    await expect(slider).toHaveAttribute("data-unanswered", "true");
    await expect(dialog.getByText("Question 1 / 2")).toBeVisible();
    expect(writes).toBe(0);

    await dialog
      .getByRole("button", { name: "Choisir la note 5 sur 10" })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    await expect(next).toBeEnabled();
    await next.hover();
    await expect(next).toHaveCSS("cursor", "pointer");
    await expect(next).toHaveCSS("opacity", "1");
    await next.focus();
    await next.press("Enter");
    await expect(dialog.getByText("Question 2 / 2")).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 3 })).toBeFocused();
    const finish = dialog.getByRole("button", { name: "Valider l’évaluation" });
    for (const button of [save, finish]) await expectUnavailable(button);
    await expect(slider).toHaveAttribute("data-unanswered", "true");
    expect(writes).toBe(1);
    await dialog.screenshot({
      path: testInfo.outputPath(`${theme}-unanswered.png`),
    });

    await slider.focus();
    await slider.press("Tab");
    await expect(previous).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(slider).toBeFocused();
    await slider.press("Home");
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    await expect(slider).toHaveValue("0");
    await expect(save).toBeEnabled();
    await expect(finish).toBeEnabled();
    expect(writes).toBe(2);
  });
}
