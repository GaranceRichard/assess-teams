import { expect, test } from "@playwright/test";
import { e2eCredential } from "./identity-fixture";
import { frontendURL } from "./urls";
import { seedTakingContext } from "./taking-fixture";

for (const mobile of [false, true]) {
  test(`unanswered, five and zero remain distinct (${mobile ? "touch" : "mouse"})`, async ({
    browser,
  }, testInfo) => {
    seedTakingContext();
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
    const page = await context.newPage();
    try {
      await page.goto("/evaluations");
      await page.getByLabel("Identifiant").fill("taking-coach-e2e");
      await page
        .getByLabel("Mot de passe", { exact: true })
        .fill(e2eCredential);
      await page.getByRole("button", { name: "Se connecter" }).click();
      const row = page
        .getByRole("row")
        .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
      await row.getByRole("button", { name: "Passer l’évaluation" }).click();
      const dialog = page.getByRole("dialog");
      const slider = dialog.getByRole("slider");
      await expect(dialog.getByText("Aucune note sélectionnée")).toBeVisible();
      const runs = await (await page.request.get("/api/evaluations/")).json();
      const runId = runs.find(
        (r: { evaluation_name: string }) =>
          r.evaluation_name === "Passation E2E",
      ).id;
      const scores = async () =>
        (
          await (await page.request.get(`/api/evaluations/${runId}/`)).json()
        ).questions.map((q: { score: number | null }) => q.score);
      let writes = 0;
      page.on("request", (request) => {
        if (request.method() === "PUT" && request.url().includes("/responses/"))
          writes++;
      });
      await expect(slider).toHaveAttribute("data-unanswered", "true");
      await slider.focus();
      await expect(slider).toHaveAttribute(
        "aria-valuetext",
        "Aucune note sélectionnée",
      );
      await dialog.screenshot({ path: testInfo.outputPath("unanswered.png") });
      await dialog.getByRole("button", { name: "Suivant" }).click();
      await expect(
        dialog.getByRole("button", { name: "Valider l’évaluation" }),
      ).toBeDisabled();
      expect(await scores()).toEqual([null, null]);
      expect(writes).toBe(0);
      await dialog.getByRole("button", { name: "Fermer" }).click();
      await page.reload();
      await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
      await expect(dialog.getByText("Question 1 / 2")).toBeVisible();
      if (mobile) await slider.tap();
      else await slider.click();
      await expect(
        dialog.getByText("Note sélectionnée : 5 / 10"),
      ).toBeVisible();
      await expect(
        dialog.getByText("Note enregistrée", { exact: true }),
      ).toBeVisible();
      expect(await scores()).toEqual([5, null]);
      expect(writes).toBe(1);
      await dialog.getByRole("button", { name: "Fermer" }).click();
      await page.reload();
      await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
      await expect(dialog.getByText("Question 2 / 2")).toBeVisible();
      const csrf = (await context.cookies()).find(
        (c) => c.name === "csrftoken",
      )!.value;
      const refused = await page.request.post(
        `/api/evaluations/${runId}/finalize/`,
        { data: {}, headers: { "X-CSRFToken": csrf } },
      );
      expect(refused.status()).toBe(400);
      expect(await scores()).toEqual([5, null]);
      const bounds = (await slider.boundingBox())!;
      if (mobile)
        await slider.tap({ position: { x: 1, y: bounds.height / 2 } });
      else await slider.press("Home");
      await expect(
        dialog.getByText("Note sélectionnée : 0 / 10"),
      ).toBeVisible();
      await expect(
        dialog.getByText("Note enregistrée", { exact: true }),
      ).toBeVisible();
      expect(await scores()).toEqual([5, 0]);
      await dialog.getByRole("button", { name: "Précédent" }).click();
      await expect(
        dialog.getByText("Note sélectionnée : 5 / 10"),
      ).toBeVisible();
      await slider.press("End");
      await expect(
        dialog.getByText("Note enregistrée", { exact: true }),
      ).toBeVisible();
      expect(await scores()).toEqual([10, 0]);
      await dialog.getByRole("button", { name: "Suivant" }).click();
      await dialog
        .getByRole("button", { name: "Valider l’évaluation" })
        .click();
      await expect(row).toContainText("Complétée");
    } finally {
      await context.close();
    }
  });
}
