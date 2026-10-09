import { expect, test } from "@playwright/test";
import { expectMarkerTooltip } from "../e2e/appreciation-assertions";

test("repères fictifs éditables en v2, indépendants de v1 et accessibles sur mobile sans API", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  await page.route("**/api/**", (route) => {
    apiCalls.push(route.request().url());
    return route.abort();
  });
  await page.goto("./#/templates");
  const first = page
    .getByRole("list", { name: "Questions", exact: true })
    .locator(":scope > li")
    .first();
  await first.getByText(/Repères d’appréciation/).click();
  await first.getByRole("button", { name: "Modifier le repère 5" }).click();
  await page
    .getByLabel("Appréciation", { exact: true })
    .fill("Brouillon fictif distinct");
  const rowBounds = await first.locator(".question-row").boundingBox();
  const markerBounds = await first
    .locator(".question-appreciation")
    .boundingBox();
  expect(markerBounds!.y).toBeGreaterThanOrEqual(
    rowBounds!.y + rowBounds!.height,
  );
  await page.screenshot({ path: test.info().outputPath("markers-editor.png") });
  await page.getByRole("button", { name: "Enregistrer les repères" }).click();
  await expect(first).toContainText("Brouillon fictif distinct");
  await first.getByRole("button", { name: "Supprimer le repère 0" }).click();
  await expect(first.getByText("0 / 10", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Évaluations", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Aurore" })
    .getByRole("button", { name: "Passer l’évaluation" })
    .click();
  const original =
    "Les objectifs sont connus, leur compréhension reste à partager.";
  await expectMarkerTooltip(page, 5, original);
  await page.getByRole("button", { name: "5 sur 10 : " + original }).click();
  await expect(page.locator(".selected-appreciation")).toContainText(original);
  await expect(page.getByRole("dialog")).not.toContainText(
    "Brouillon fictif distinct",
  );
  await page.screenshot({ path: test.info().outputPath("markers-day.png") });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "night";
  });
  await page.setViewportSize({ width: 375, height: 667 });
  await expectMarkerTooltip(
    page,
    10,
    "Chaque membre relie ses décisions aux objectifs partagés.",
  );
  await page
    .getByRole("button", {
      name: "8 sur 10 : L’équipe partage des objectifs clairs et les ajuste ensemble.",
    })
    .click();
  await expect(page.locator(".selected-appreciation")).toContainText(
    "L’équipe partage",
  );
  const dialogBounds = await page.getByRole("dialog").boundingBox();
  expect(dialogBounds!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBounds!.y + dialogBounds!.height).toBeLessThanOrEqual(667);
  await page.screenshot({
    path: test.info().outputPath("markers-mobile-night.png"),
  });
  await page
    .getByRole("button", { name: "7 sur 10 : " + original, exact: true })
    .click();
  await expect(page.getByRole("slider")).toHaveValue("7");
  await expect(page.locator(".selected-appreciation")).toContainText(original);
  expect(apiCalls).toEqual([]);
});
