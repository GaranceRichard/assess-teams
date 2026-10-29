import { writeFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { seedTakingContext } from "./taking-fixture";
import { e2eCredential } from "./identity-fixture";
import { chooseRating } from "./rating-values";

async function login(page: Page, username: string) {
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

async function geometry(dialog: Locator) {
  await dialog.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
  const action = dialog.locator(".taking-content .taking-note-action");
  return {
    dialog: await dialog.boundingBox(),
    footer: await dialog.locator(".taking-footer").boundingBox(),
    noteActionOffset: (await action.count())
      ? await action.evaluate((element) => {
          const body = element.closest(".taking-content")!;
          return (
            element.getBoundingClientRect().top -
            body.getBoundingClientRect().top
          );
        })
      : null,
  };
}

for (const theme of ["day", "night"]) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    for (const revision of [false, true]) {
      test(`markerless ${theme}-${viewport.width}-${revision ? "revision" : "taking"} keeps refusal actions stable`, async ({
        page,
      }, info) => {
        seedTakingContext();
        await page.setViewportSize(viewport);
        await page.addInitScript((value) => {
          localStorage.setItem("assess-teams-theme", value);
        }, theme);
        await page.goto("/evaluations");
        await login(page, "taking-coach-e2e");
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        const row = page
          .getByRole("row")
          .filter({ hasText: "Passation E2E v1" });
        await row.getByRole("button", { name: "Passer l’évaluation" }).click();
        const dialog = page.getByRole("dialog");
        const question = dialog.locator(".transition-live");
        if (revision) {
          await chooseRating(dialog, 0, false);
          await dialog.getByRole("button", { name: "Suivant" }).click();
          await chooseRating(dialog, 10, false);
          await dialog
            .getByRole("button", { name: "Valider l’évaluation" })
            .click();
          await expect(row).toContainText("Complétée");
          await page.getByRole("button", { name: "Se déconnecter" }).click();
          await login(page, "taking-admin-e2e");
          await page
            .getByRole("link", { name: "Évaluations", exact: true })
            .click();
          await row.getByRole("button", { name: "Réviser les notes" }).click();
          await dialog.getByRole("button", { name: "Suivant" }).click();
          await chooseRating(dialog, 7, false);
        }
        await expect(dialog.locator(".taking-content .marker-dot")).toHaveCount(
          0,
        );
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await dialog.getByRole("slider").focus();
        const before = await geometry(dialog);
        await dialog.screenshot({ path: info.outputPath("before.png") });
        const endpoint = revision
          ? "**/api/evaluations/*/revision/"
          : "**/api/evaluations/*/responses/*/";
        await page.route(endpoint, (route) =>
          route.fulfill({ status: 400, json: { detail: "Refus de recette" } }),
        );
        if (revision)
          await dialog
            .getByRole("button", { name: "Valider la révision" })
            .click();
        else await dialog.getByRole("slider").press("Home");
        await expect(dialog.getByRole("alert")).toBeVisible();
        const refused = await geometry(dialog);
        writeFileSync(
          info.outputPath("geometry.json"),
          JSON.stringify(
            { viewport, theme, revision, before, refused },
            null,
            2,
          ),
        );
        await dialog.getByRole("alert").scrollIntoViewIfNeeded();
        await expect(dialog.getByRole("alert")).toBeInViewport();
        await dialog.screenshot({ path: info.outputPath("refused.png") });
        expect(refused).toEqual(before);
        await expect(dialog.getByRole("slider")).toHaveValue(
          revision ? "7" : "0",
        );
        await page.unroute(endpoint);
        if (revision) {
          await dialog
            .getByRole("button", { name: "Valider la révision" })
            .click();
          await expect(row).toContainText("Révisé par taking-admin-e2e");
        } else {
          await expect(
            dialog.getByRole("button", { name: "Fermer" }),
          ).toBeDisabled();
          await dialog
            .getByRole("button", { name: "Réessayer la sauvegarde" })
            .click();
          await expect(
            question.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
          expect(await geometry(dialog)).toEqual(before);
        }
      });
    }
  }
}
