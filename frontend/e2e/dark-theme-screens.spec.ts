import { expect, test, type Page } from "@playwright/test";
import { palettes } from "../src/palette";
import { radarOptions, seriesStyle } from "../src/resultRadarConfig";
import { historyOptions } from "../src/resultHistoryConfig";
import { contrast } from "./palette-contrast";
import { e2eCredential, seedJournalEntries } from "./identity-fixture";
import { seedSteeringContext } from "./steering-fixture";
import { seedTakingContext } from "./taking-fixture";

async function auditScreen(page: Page, name: string) {
  for (const { value } of palettes) {
    await page.locator("html").evaluate((root, value) => {
      (root as HTMLElement).dataset.palette = value;
    }, value);
    const colors = await page
      .locator("h1, h2, p, small, td, th, button, nav a, summary")
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              element.checkVisibility() &&
              element.textContent?.trim() &&
              !element.matches(":disabled"),
          )
          .map((element) => {
            let parent: Element | null = element;
            while (
              parent &&
              ["rgba(0, 0, 0, 0)", "transparent"].includes(
                getComputedStyle(parent).backgroundColor,
              )
            )
              parent = parent.parentElement;
            return {
              text: element.textContent?.slice(0, 70),
              foreground: getComputedStyle(element).color,
              background: getComputedStyle(parent ?? document.documentElement)
                .backgroundColor,
            };
          }),
      );
    await test.info().attach(`${name}-${value}-contrast.json`, {
      body: JSON.stringify(
        colors.map((color) => ({
          ...color,
          ratio: contrast(color.foreground, color.background),
          threshold: 4.5,
        })),
      ),
      contentType: "application/json",
    });
    expect(colors.length).toBeGreaterThan(10);
    const chart = page.locator(".results-page");
    if (await chart.count()) {
      const background = await chart.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      for (let index = 0; index < 5; index++) {
        expect(
          contrast(seriesStyle(index).color, background),
          `${name}/${value}/series ${index}`,
        ).toBeGreaterThanOrEqual(3);
      }
      const radar = radarOptions("night").scales!.r!;
      const history = historyOptions("night").scales!.y!;
      for (const text of [radar.pointLabels!.color, history.ticks!.color]) {
        expect(contrast(String(text), background)).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        contrast(String(radar.grid!.color), background),
      ).toBeGreaterThanOrEqual(3);
    }
    for (const color of colors) {
      expect
        .soft(
          contrast(color.foreground, color.background),
          `${name}/${value}/${color.text}`,
        )
        .toBeGreaterThanOrEqual(4.5);
    }
    if (["blue", "violet", "green"].includes(value)) {
      await page.screenshot({
        path: test.info().outputPath(`${name}-${value}.png`),
        animations: "disabled",
      });
    }
  }
}

test("dark dashboard, navigation, tables, radar and history stay readable in all palettes", async ({
  page,
}) => {
  test.setTimeout(60_000);
  seedSteeringContext();
  seedJournalEntries("results-admin-e2e", "Results E2E");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await auditScreen(page, "dashboard");
  await page.getByRole("button", { name: "Replier le menu" }).click();
  await auditScreen(page, "navigation-collapsed");
  await page.getByRole("button", { name: "Déplier le menu" }).click();
  await page.getByRole("link", { name: "Utilisateurs", exact: true }).click();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await auditScreen(page, "users");
  await page.getByRole("link", { name: "Pilotage", exact: true }).click();
  await expect(page.getByRole("rowheader", { name: "Équipe A" })).toBeVisible();
  await auditScreen(page, "steering");
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await auditScreen(page, "radar");
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await auditScreen(page, "results-table");
  await page.getByRole("button", { name: "1. Collaboration" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await auditScreen(page, "history");
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await auditScreen(page, "history-table");
  for (const path of ["/activity-journal", "/logs"]) {
    await page.locator(`nav a[href="${path}"]`).click();
    await expect(
      page
        .locator(path === "/logs" ? ".log-table tbody tr" : ".journal-day")
        .first(),
    ).toBeVisible();
    await auditScreen(page, path.slice(1));
  }
});

test("dark rating track is visible in every palette and retains explicit unanswered state", async ({
  page,
}) => {
  seedTakingContext();
  await page.goto("/evaluations");
  await page.getByLabel("Identifiant").fill("taking-coach-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Passation E2E v1" })
    .getByRole("button", { name: "Passer l’évaluation" })
    .click();
  const slider = page.getByRole("slider");
  await expect(slider).toHaveAttribute("data-unanswered", "true");
  for (const { value } of palettes) {
    await page.locator("html").evaluate((root, value) => {
      (root as HTMLElement).dataset.palette = value;
    }, value);
    // Sample actual rendered pixels: Chromium does not expose range pseudo-element styles.
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
    expect
      .soft(contrast(pixels.track, pixels.surface), value)
      .toBeGreaterThanOrEqual(3);
  }
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("data-unanswered", "false");
  await expect(
    page.getByText("Note enregistrée", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("rating-night.png"),
    animations: "disabled",
  });
});
