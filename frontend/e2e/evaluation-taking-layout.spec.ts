import { expect, test, type Locator } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { expectPassiveMarker } from "./appreciation-assertions";

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
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
  { width: 568, height: 320 },
]) {
  test(`compact stable taking dialog at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    seedTakingContext();
    runDjangoShell([
      "from assessments.models import Question",
      "Question.objects.filter(evaluation__name='Passation E2E', index=1).update(appreciation_markers=[{'score': 5, 'text': 'Accompagné'}, {'score': 7, 'text': 'Autonome'}])",
      "Question.objects.filter(evaluation__name='Passation E2E', index=2).update(name='Comment votre équipe partage-t-elle ses objectifs et ses pratiques au quotidien ?', appreciation_markers=[{'score': 0, 'text': 'Les objectifs sont partagés avec toute l’équipe et les pratiques sont régulièrement discutées ensemble.'}])",
    ]);
    await page.setViewportSize(viewport);
    await page.goto("/evaluations");
    await page.getByLabel("Identifiant").fill("taking-coach-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    const row = page
      .getByRole("row")
      .filter({ has: page.getByText("Passation E2E v1", { exact: true }) });
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
    const content = dialog.locator(".taking-content");
    await expect(content.locator(".marker-dot")).toHaveCount(2);
    await expectPassiveMarker(page, 5);
    await expectPassiveMarker(page, 7);
    if (viewport.width >= 1366) {
      expect(initial.modal!.height).toBeLessThan(600);
      expect(
        await content.evaluate(
          (element) => element.scrollHeight <= element.clientHeight,
        ),
      ).toBe(true);
    }
    const slider = dialog.getByRole("slider");
    await page.route("**/api/evaluations/*/responses/*/", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Enregistrement refusé" }),
      }),
    );
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Fermer", exact: true }),
    ).toBeDisabled();
    await page.unroute("**/api/evaluations/*/responses/*/");
    await dialog
      .getByRole("button", { name: "Réessayer la sauvegarde" })
      .click();
    await expect(
      dialog.getByText("Note enregistrée", { exact: true }),
    ).toBeVisible();
    await expect(slider).toHaveValue("6");
    await expect(content.locator(".selected-appreciation")).toContainText(
      "Accompagné",
    );
    expect(await geometry(dialog)).toEqual(initial);
    await page.screenshot({
      path: testInfo.outputPath("taking-markers.png"),
    });
    await dialog.getByRole("button", { name: "Suivant" }).click();
    await expect(dialog.getByText("Question 2 / 2")).toBeVisible();
    expect(await geometry(dialog)).toEqual(initial);
    for (const theme of ["day", "night"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await page.screenshot({
        path: testInfo.outputPath(`taking-${theme}.png`),
      });
    }
    const overflowing = await dialog.evaluate((element) =>
      [
        ...element.querySelectorAll<HTMLElement>(
          "*:not(.taking-sizing):not(.taking-sizing *)",
        ),
      ]
        .filter(
          (item) =>
            getComputedStyle(item).overflowY === "auto" &&
            item.scrollHeight > item.clientHeight,
        )
        .map((item) => item.className),
    );
    expect(overflowing.every((name) => name === "taking-content")).toBe(true);
    expect(
      await dialog.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await dialog.getByRole("button", { name: "Précédent" }).click();
    await expect(slider).toHaveValue("6");
    expect(await geometry(dialog)).toEqual(initial);
    await dialog.getByRole("button", { name: "Fermer", exact: true }).click();
    await page.reload();
    await row.getByRole("button", { name: "Reprendre l’évaluation" }).click();
    await dialog.getByRole("button", { name: "Précédent" }).click();
    await expect(slider).toHaveValue("6");
  });
}

test("long question and description use only the body scroll and retain visible actions", async ({
  page,
}, testInfo) => {
  seedTakingContext();
  runDjangoShell([
    "from assessments.models import Question",
    "Question.objects.filter(evaluation__name='Passation E2E').update(name='Question longue ' * 100, appreciation_markers=[{'score': 0, 'text': 'Description longue avec plusieurs indications. ' * 100}])",
  ]);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page
    .getByRole("row")
    .filter({ has: page.getByText("Passation E2E v1", { exact: true }) })
    .getByRole("button", { name: "Passer l’évaluation" })
    .click();
  const dialog = page.getByRole("dialog");
  const initial = await geometry(dialog);
  const content = dialog.locator(".taking-content");
  expect(
    await content.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  for (const selector of ["#question-text", ".selected-appreciation"]) {
    expect(
      await dialog
        .locator(selector)
        .evaluate((element) => element.scrollHeight <= element.clientHeight),
    ).toBe(true);
  }
  await content.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(await geometry(dialog)).toEqual(initial);
  await expect(
    dialog.getByRole("button", { name: "Fermer", exact: true }),
  ).toBeInViewport();
  await expect(
    dialog.getByRole("button", { name: "Suivant" }),
  ).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("taking-long.png") });
});
