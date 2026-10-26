import { writeFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";
import { palettes } from "../src/palette";
import { contrast } from "./palette-contrast";
import { e2eCredential, runDjangoShell } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

async function ratingColors(dialog: Locator) {
  return dialog
    .locator(
      ".taking-scale, .taking-output, .selected-appreciation, .taking-score-value",
    )
    .evaluateAll((elements) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const composite = (colors: string[]) => {
        context.clearRect(0, 0, 1, 1);
        for (const color of colors) {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
        }
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${r}, ${g}, ${b})`;
      };
      return elements
        .filter((element) => element.checkVisibility())
        .map((element) => {
          const layers = [];
          for (
            let parent: Element | null = element;
            parent;
            parent = parent.parentElement
          )
            layers.unshift(getComputedStyle(parent).backgroundColor);
          const background = composite(["white", ...layers]);
          return {
            element: element.className,
            text: element.textContent,
            foreground: composite([
              background,
              getComputedStyle(element).color,
            ]),
            background,
          };
        });
    });
}

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`rating scale and snapshot labels stay readable at ${viewport.width}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
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
      .filter({ hasText: "Passation E2E v1" })
      .getByRole("button", { name: "Passer l’évaluation" })
      .click();
    const dialog = page.getByRole("dialog");
    const slider = dialog.getByRole("slider");
    if (viewport.width >= 1280) {
      const label = (await dialog
        .locator(".taking-content .taking-label")
        .boundingBox())!;
      const scale = (await dialog.locator("#score-scale").boundingBox())!;
      expect(scale.y).toBeLessThan(label.y + label.height);
    }
    const measurements = [];
    for (const theme of ["day", "night"]) {
      await page.locator("html").evaluate((root, value) => {
        (root as HTMLElement).dataset.theme = value;
      }, theme);
      // The second question is still unanswered when auditing the second theme.
      for (const [key, score, marker] of [
        [null, null, null],
        ["5", 5, 5],
        ["Home", 0, 0],
        ["End", 10, 10],
        ["ArrowLeft", 9, 7],
      ] as const) {
        await slider.focus();
        if (key === "5")
          await dialog
            .getByRole("button", { name: "Choisir la note 5 sur 10" })
            .click();
        else if (key) await slider.press(key);
        await expect(slider).toHaveAttribute("min", "0");
        await expect(slider).toHaveAttribute("max", "10");
        await expect(slider).toHaveAttribute("step", "1");
        await expect(slider).toHaveAccessibleDescription(
          /Échelle entière de 0 à 10/,
        );
        await expect(dialog.locator("output")).toHaveText(
          score === null
            ? "Aucune note sélectionnée"
            : `Note sélectionnée : ${score} / 10`,
        );
        if (score === null) {
          await expect(slider).toHaveAttribute("data-unanswered", "true");
          await expect(slider).toHaveAttribute(
            "aria-valuetext",
            "Aucune note sélectionnée",
          );
          await expect(dialog.locator(".selected-appreciation")).toHaveCount(0);
        } else {
          await expect(
            dialog.locator(".selected-appreciation strong"),
          ).toHaveText(`Repère ${marker} / 10 :`);
          await expect(
            dialog.getByText("Note enregistrée", { exact: true }),
          ).toBeVisible();
        }
        await dialog.locator("output").scrollIntoViewIfNeeded();
        const noteVisible = await dialog
          .locator("output")
          .evaluate((element) => {
            const text = document.createRange();
            text.selectNodeContents(element);
            const note = text.getBoundingClientRect();
            const body = element
              .closest(".taking-content")!
              .getBoundingClientRect();
            return note.top >= body.top && note.bottom <= body.bottom;
          });
        expect(noteVisible).toBe(true);
        for (const { value: palette } of palettes) {
          await page.locator("html").evaluate((root, value) => {
            (root as HTMLElement).dataset.palette = value;
          }, palette);
          for (const colors of await ratingColors(
            dialog.locator(".taking-content"),
          )) {
            const ratio = contrast(colors.foreground, colors.background);
            expect(
              ratio,
              `${theme}/${palette}/${score}/${colors.element}`,
            ).toBeGreaterThanOrEqual(4.5);
            measurements.push({
              theme,
              palette,
              score,
              ...colors,
              ratio,
              threshold: 4.5,
            });
          }
          if (palette === "green") {
            await dialog.screenshot({
              path: testInfo.outputPath(
                `${theme}-${score ?? "unanswered"}.png`,
              ),
            });
          }
        }
        expect(
          await dialog.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        ).toBe(true);
        expect(
          await page
            .locator("html")
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
        ).toBe(true);
      }
      if (theme === "day")
        await dialog.getByRole("button", { name: "Suivant" }).click();
    }
    writeFileSync(
      testInfo.outputPath("rating-contrast.json"),
      JSON.stringify(measurements, null, 2),
    );
    await testInfo.attach("rating-contrast.json", {
      body: JSON.stringify(measurements),
      contentType: "application/json",
    });
  });
}
