import { expect, test } from "@playwright/test";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";
import { expectPassiveMarker } from "./appreciation-assertions";

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 375, height: 667 },
]) {
  test(`rating focus stays on its thumb at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    seedTakingContext();
    runDjangoShell([
      "from assessments.models import Question",
      "Question.objects.filter(evaluation__name='Passation E2E').update(appreciation_markers=[{'score': 0, 'text': 'Début'}, {'score': 5, 'text': 'Accompagné'}, {'score': 7, 'text': 'Autonome'}, {'score': 10, 'text': 'Expert'}])",
    ]);
    await page.setViewportSize(viewport);
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
    const slider = dialog.getByRole("slider");
    const geometry = async () => ({
      dialog: await dialog.boundingBox(),
      slider: await slider.boundingBox(),
      footer: await dialog.locator(".taking-footer").boundingBox(),
    });
    const initial = await geometry();
    for (const theme of ["day", "night"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await slider.evaluate((element) => (element as HTMLElement).blur());
      await expect(slider).not.toBeFocused();
      const normal = await slider.screenshot({
        path: testInfo.outputPath(`${theme}-normal-range.png`),
      });
      const normalBounds = await slider.boundingBox();
      await dialog.screenshot({
        path: testInfo.outputPath(`${theme}-normal.png`),
      });
      await slider.click();
      await expect(slider).toHaveValue("5");
      expect(
        await slider.evaluate((element) => element.matches(":focus")),
      ).toBe(true);
      expect(
        await slider.evaluate((element) => element.matches(":focus-visible")),
      ).toBe(false);
      await expect(slider).toHaveCSS("outline-width", "0px");
      await expect(slider).toHaveCSS("border-width", "0px");
      await expect(slider).toHaveCSS("box-shadow", "none");
      await slider.screenshot({
        path: testInfo.outputPath(`${theme}-mouse-range.png`),
      });
      expect(await slider.boundingBox()).toEqual(normalBounds);
      await dialog.screenshot({
        path: testInfo.outputPath(`${theme}-mouse-focus.png`),
      });
      await dialog.locator(".taking-content .taking-note-action").focus();
      await page.keyboard.press("Shift+Tab");
      await expect(slider).toBeFocused();
      expect(
        await slider.evaluate((element) => element.matches(":focus-visible")),
      ).toBe(true);
      await expect(slider).toHaveCSS("outline-width", "0px");
      await expect(slider).toHaveCSS("border-width", "0px");
      await expect(slider).toHaveCSS("box-shadow", "none");
      expect((await slider.screenshot()).equals(normal)).toBe(false);
      await dialog.screenshot({
        path: testInfo.outputPath(`${theme}-keyboard-focus.png`),
      });
      expect(await geometry()).toEqual(initial);
      const range = (await slider.boundingBox())!;
      for (const score of [0, 5, 7, 10]) {
        await expectPassiveMarker(page, score);
        const dot = (await dialog
          .locator(`.taking-content .marker-dot[data-score="${score}"]`)
          .boundingBox())!;
        expect(dot.y).toBeGreaterThan(range.y + range.height / 2 + 3);
      }
    }
  });
}
