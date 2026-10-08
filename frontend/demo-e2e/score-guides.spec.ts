import { expect, test } from "@playwright/test";
import { contrast } from "../e2e/palette-contrast";
import { palettes } from "../src/palette";
import { verifyScoreGuides } from "../e2e/score-guide-assertions";

test("les repères fictifs restent versionnés et accessibles dans le build Pages", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("/assess-teams/");
  await page
    .getByRole("link", { name: "Modèles d’évaluation", exact: true })
    .click();
  const question = page
    .getByRole("list", { name: "Questions", exact: true })
    .locator(":scope > li")
    .first();
  await question.getByText(/Repères d’appréciation/).click();
  await question.getByLabel("Modifier le repère du niveau 5").click();
  await question
    .getByLabel("Appréciation")
    .fill("Repère fictif du brouillon v2");
  await question.getByRole("button", { name: "Enregistrer le repère" }).click();
  await expect(question).toContainText("Repère fictif du brouillon v2");
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await page
    .getByRole("button", { name: "Passer l’évaluation" })
    .first()
    .click();
  await verifyScoreGuides(
    page,
    "Les objectifs sont connus, mais leur priorisation reste à clarifier.",
  );
  await expect(page.getByRole("dialog")).not.toContainText(
    "Repère fictif du brouillon v2",
  );
});

test("infobulles aux extrémités dans les palettes, modes et viewports courts", async ({
  page,
}) => {
  await page.goto("/assess-teams/#/evaluations");
  await page
    .getByRole("button", { name: "Passer l’évaluation" })
    .first()
    .click();
  for (const theme of ["day", "night"]) {
    for (const palette of palettes) {
      await page.evaluate(
        ({ theme, palette }) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.dataset.palette = palette;
        },
        { theme, palette: palette.value },
      );
      const level = page.getByRole("button", {
        name: "10 sur 10, repère disponible",
        exact: true,
      });
      await level.hover();
      const tooltip = page.getByRole("tooltip");
      await expect(tooltip).toHaveCount(1);
      const colors = await tooltip.evaluate((el) => {
        const style = getComputedStyle(el);
        return [style.color, style.backgroundColor];
      });
      expect(contrast(colors[0], colors[1])).toBeGreaterThanOrEqual(4.5);
      await page.getByRole("slider").hover();
    }
    for (const viewport of [
      { width: 1280, height: 480 },
      { width: 375, height: 667 },
      { width: 375, height: 360 },
    ]) {
      await page.setViewportSize(viewport);
      for (const score of [0, 10]) {
        const level = page.getByRole("button", {
          name: `${score} sur 10, repère disponible`,
          exact: true,
        });
        await level.focus();
        await level.hover();
        const tooltip = page.getByRole("tooltip");
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toBeVisible();
        const box = (await tooltip.boundingBox())!;
        const anchor = (await level.boundingBox())!;
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(anchor.y);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `guide-${theme}-${viewport.width}-${viewport.height}-${score}.png`,
            ),
        });
        await page.getByRole("slider").hover();
      }
    }
  }
});
