import { expect, test } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import {
  chooseRating,
  expectRatingValues,
  recordIncompleteRatingRefusal,
} from "./rating-values";
import { verifyRatingRevision } from "./rating-revision";
import { frontendURL } from "./urls";
import { seedTakingContext } from "./taking-fixture";

for (const theme of ["day", "night"]) {
  for (const mobile of [false, true]) {
    for (const markers of [false, true]) {
      test(`explicit rating and revision (${theme}, ${mobile ? "touch" : "mouse"}, markers=${markers})`, async ({
        browser,
      }, testInfo) => {
        seedTakingContext();
        if (markers)
          runDjangoShell([
            "from assessments.models import Question",
            "Question.objects.filter(evaluation__name='Passation E2E').update(appreciation_markers=[{'score': 0, 'text': 'Début'}, {'score': 5, 'text': 'Accompagné'}, {'score': 7, 'text': 'Autonome'}, {'score': 10, 'text': 'Expert'}])",
          ]);
        const context = await browser.newContext({
          baseURL: frontendURL,
          ...(mobile
            ? {
                viewport: { width: 390, height: 844 },
                isMobile: true,
                hasTouch: true,
              }
            : {}),
        });
        await context.addInitScript((value) => {
          localStorage.setItem("assess-teams-theme", value);
        }, theme);
        const page = await context.newPage();
        try {
          await page.goto("/evaluations");
          await page.getByLabel("Identifiant").fill("taking-coach-e2e");
          await page
            .getByLabel("Mot de passe", { exact: true })
            .fill(e2eCredential);
          await page.getByRole("button", { name: "Se connecter" }).click();
          const row = page.getByRole("row").filter({
            has: page.getByText("Passation E2E v1", { exact: true }),
          });
          await row
            .getByRole("button", { name: "Passer l’évaluation" })
            .click();
          const dialog = page.getByRole("dialog");
          const slider = dialog.getByRole("slider");
          const question = dialog.locator(".transition-live");
          await expect(
            question.getByText("Aucune note sélectionnée"),
          ).toBeVisible();
          const runs = await (
            await page.request.get("/api/evaluations/")
          ).json();
          const runId = runs.find(
            (r: { evaluation_name: string }) =>
              r.evaluation_name === "Passation E2E",
          ).id;
          const scores = async () =>
            (
              await (
                await page.request.get(`/api/evaluations/${runId}/`)
              ).json()
            ).questions.map((q: { score: number | null }) => q.score);
          let writes = 0;
          page.on("request", (request) => {
            if (
              request.method() === "PUT" &&
              request.url().includes("/responses/")
            )
              writes++;
          });
          await expect(
            question.getByText("Échelle entière de 0 à 10"),
          ).toBeVisible();
          await expect(slider).toHaveAccessibleDescription(
            /Échelle entière de 0 à 10/,
          );
          await expect(slider).toHaveAttribute("data-unanswered", "true");
          await slider.focus();
          await slider.press("Enter");
          await expectRatingValues(dialog);
          await expect(question.locator(".marker-dot")).toHaveCount(
            markers ? 4 : 0,
          );
          await expect(question.getByText(/Entrée : 5/)).toHaveCount(0);
          await expect(slider).toHaveAttribute(
            "aria-valuetext",
            "Aucune note sélectionnée",
          );
          await dialog.screenshot({
            path: testInfo.outputPath("unanswered.png"),
          });
          await expect(
            dialog.getByRole("button", { name: "Suivant" }),
          ).toBeDisabled();
          await expect(question.getByText("Question 1 / 2")).toBeVisible();
          expect(await scores()).toEqual([null, null]);
          expect(writes).toBe(0);
          await dialog.getByRole("button", { name: "Fermer" }).click();
          await page.reload();
          await row
            .getByRole("button", { name: "Reprendre l’évaluation" })
            .click();
          await expect(question.getByText("Question 1 / 2")).toBeVisible();
          if (mobile) await slider.tap();
          else await slider.click();
          await expect(
            question.getByText("Note sélectionnée : 5 / 10"),
          ).toBeVisible();
          await expect(
            question.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
          await dialog.screenshot({ path: testInfo.outputPath("five.png") });
          expect(await scores()).toEqual([5, null]);
          expect(writes).toBe(1);
          await dialog.getByRole("button", { name: "Fermer" }).click();
          await page.reload();
          await row
            .getByRole("button", { name: "Reprendre l’évaluation" })
            .click();
          await expect(question.getByText("Question 2 / 2")).toBeVisible();
          await recordIncompleteRatingRefusal(page, runId, testInfo);
          expect(await scores()).toEqual([5, null]);
          const bounds = (await slider.boundingBox())!;
          if (mobile)
            await slider.tap({ position: { x: 1, y: bounds.height / 2 } });
          else await slider.press("Home");
          await expect(
            question.getByText("Note sélectionnée : 0 / 10"),
          ).toBeVisible();
          await expect(
            question.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
          expect(await scores()).toEqual([5, 0]);
          await dialog.screenshot({ path: testInfo.outputPath("zero.png") });
          await dialog.getByRole("button", { name: "Fermer" }).click();
          await page.reload();
          await row
            .getByRole("button", { name: "Reprendre l’évaluation" })
            .click();
          expect(await scores()).toEqual([5, 0]);
          await expect(slider).toHaveValue("5");
          await dialog.getByRole("button", { name: "Suivant" }).click();
          await expect(slider).toHaveValue("0");
          await dialog.screenshot({
            path: testInfo.outputPath("resumed-zero.png"),
          });
          await dialog.getByRole("button", { name: "Précédent" }).click();
          await expect(
            question.getByText("Note sélectionnée : 5 / 10"),
          ).toBeVisible();
          await chooseRating(dialog, 10, mobile);
          await expect(
            question.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
          expect(await scores()).toEqual([10, 0]);
          await dialog.screenshot({ path: testInfo.outputPath("ten.png") });
          for (let score = 0; score <= 10; score++) {
            await chooseRating(dialog, score, mobile);
            await expect(
              question.getByText("Note enregistrée", { exact: true }),
            ).toBeVisible();
            expect(await scores()).toEqual([score, 0]);
            if (score === 7)
              await dialog.screenshot({
                path: testInfo.outputPath("seven.png"),
              });
          }
          await dialog.getByRole("button", { name: "Suivant" }).click();
          await dialog
            .getByRole("button", { name: "Valider l’évaluation" })
            .click();
          await expect(row).toContainText("Complétée");
          await verifyRatingRevision(
            page,
            row,
            mobile,
            testInfo,
            scores,
            markers,
          );
        } finally {
          await context.close();
        }
      });
    }
  }
}
