import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { palettes } from "../src/palette";
import { contrast } from "./palette-contrast";
import { auditLightScreen } from "./light-contrast-audit";
import { e2eCredential } from "./identity-fixture";
import { seedTakingContext } from "./taking-fixture";

test("light rating track, unanswered state and saved/error states are legible", async ({
  page,
}) => {
  seedTakingContext();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Passation E2E v1" })
    .getByRole("button", { name: "Passer l’évaluation" })
    .click();
  const slider = page.getByRole("slider");
  await expect(slider).toHaveAttribute("data-unanswered", "true");
  for (const { value } of palettes) {
    await page.locator("html").evaluate((root, palette) => {
      (root as HTMLElement).dataset.palette = palette;
    }, value);
    const png = (await slider.screenshot()).toString("base64");
    const pixels = await page.evaluate(async (png) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const color = (y: number) => {
        const pixel = context.getImageData(
          Math.floor(canvas.width * 0.8),
          y,
          1,
          1,
        ).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      };
      return { track: color(Math.floor(canvas.height / 2)), surface: color(1) };
    }, png);
    writeFileSync(
      test.info().outputPath(`track-${value}.json`),
      JSON.stringify({
        ...pixels,
        ratio: contrast(pixels.track, pixels.surface),
        threshold: 3,
      }),
    );
    await test.info().attach(`track-${value}.json`, {
      body: JSON.stringify({
        ...pixels,
        ratio: contrast(pixels.track, pixels.surface),
        threshold: 3,
      }),
      contentType: "application/json",
    });
    expect
      .soft(contrast(pixels.track, pixels.surface), value)
      .toBeGreaterThanOrEqual(3);
  }
  await auditLightScreen(page, "taking-unanswered");
  await page.route("**/api/evaluations/*/responses/*/", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Sauvegarde refusée." }),
    });
  });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(slider).toHaveAttribute("data-unanswered", "false");
  await auditLightScreen(page, "taking-error");
  await page.unroute("**/api/evaluations/*/responses/*/");
  await page.getByRole("button", { name: "Réessayer la sauvegarde" }).click();
  await expect(
    page.getByText("Note enregistrée", { exact: true }),
  ).toBeVisible();
  await auditLightScreen(page, "taking-saved");
  await slider.focus();
  await page.screenshot({ path: test.info().outputPath("taking-focus.png") });
});
