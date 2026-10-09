import { expect, test, type Locator } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

async function geometry(dialog: Locator) {
  return {
    modal: await dialog.boundingBox(),
    navigation: await dialog
      .locator(".evaluation-dialog-actions")
      .boundingBox(),
    close: await dialog
      .getByRole("button", { name: "Fermer", exact: true })
      .boundingBox(),
  };
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 1280, height: 480 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
  { width: 568, height: 320 },
]) {
  test(`taking keeps its dimensions and navigation at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    seedTakingContext();
    runDjangoShell([
      "from assessments.models import Question",
      "Question.objects.filter(evaluation__name='Passation E2E', index=1).update(appreciation_markers=[{'score': 5, 'text': 'Accompagné'}, {'score': 7, 'text': 'Autonome'}])",
      "Question.objects.filter(evaluation__name='Passation E2E', index=2).update(name='Question longue ' * 100, appreciation_markers=[{'score': 0, 'text': 'Description longue avec plusieurs indications. ' * 100}])",
    ]);
    await page.setViewportSize(viewport);
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    const row = page.getByRole("row").filter({
      has: page.getByText("Passation E2E v1", { exact: true }),
    });
    await row.getByRole("button", { name: "Passer l’évaluation" }).click();
    const dialog = page.getByRole("dialog");
    const initial = await geometry(dialog);
    expect(initial.modal!.x).toBeGreaterThanOrEqual(0);
    expect(initial.modal!.y).toBeGreaterThanOrEqual(0);
    expect(initial.modal!.x + initial.modal!.width).toBeLessThanOrEqual(
      viewport.width,
    );
    expect(initial.modal!.y + initial.modal!.height).toBeLessThanOrEqual(
      viewport.height,
    );
    const points = dialog
      .getByRole("group", { name: "Niveaux de notation de 0 à 10" })
      .getByRole("button");
    await expect(points).toHaveCount(11);
    const centers: number[] = [];
    for (const point of await points.all()) {
      const bounds = (await point.boundingBox())!;
      expect(bounds.width).toBeGreaterThanOrEqual(24);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(await point.innerText()).toBe("");
      centers.push(bounds.x + bounds.width / 2);
    }
    for (let index = 2; index < centers.length; index++) {
      expect(centers[index] - centers[index - 1]).toBeCloseTo(
        centers[1] - centers[0],
        1,
      );
    }
    const point = dialog.getByRole("button", {
      name: "6 sur 10 : Accompagné",
      exact: true,
    });
    await point.focus();
    await expect(page.getByRole("tooltip")).toContainText(
      "6 / 10 · Accompagné",
    );
    await point.press("Escape");
    await page.route("**/api/evaluations/*/responses/*/", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Enregistrement refusé" }),
      }),
    );
    await point.press("Enter");
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Fermer", exact: true }),
    ).toBeDisabled();
    expect(await geometry(dialog)).toEqual(initial);
    await page.unroute("**/api/evaluations/*/responses/*/");
    await dialog
      .getByRole("button", { name: "Réessayer la sauvegarde" })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    await expect(dialog.getByRole("slider")).toHaveValue("6");
    await expect(dialog.locator(".selected-appreciation")).toContainText(
      "Accompagné",
    );
    expect(await geometry(dialog)).toEqual(initial);
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByText("Question 2 / 2")).toBeVisible();
    const slider = dialog.getByRole("slider");
    await slider.focus();
    await slider.press("Home");
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    const description = dialog.locator(".selected-appreciation");
    expect(
      await description.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    await description.focus();
    await description.press("ArrowDown");
    await expect
      .poll(() => description.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    const title = dialog.locator("#question-text");
    expect(
      await title.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    expect(await geometry(dialog)).toEqual(initial);
    const content = dialog.locator(".taking-content");
    await content.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    expect(await geometry(dialog)).toEqual(initial);
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("taking-long-content.png"),
    });
    await dialog.getByRole("button", { name: "Précédent" }).click();
    await expect(slider).toHaveValue("6");
    expect(await geometry(dialog)).toEqual(initial);
    await dialog.getByRole("button", { name: "Fermer", exact: true }).click();
    await page.reload();
    await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
    await expect(slider).toHaveValue("6");
  });
}
