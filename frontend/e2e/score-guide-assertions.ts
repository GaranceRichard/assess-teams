import { expect, type Page } from "@playwright/test";

export async function verifyScoreGuides(page: Page, text: string) {
  const configured = page.getByRole("button", {
    name: "5 sur 10, repère disponible",
    exact: true,
  });
  const tooltip = page.getByRole("tooltip");
  const slider = page.getByRole("slider");
  // The proposed default is still unanswered: no persistent appreciation yet.
  await expect(page.locator("#selected-score-guide")).toHaveCount(0);
  for (const score of [0, 10]) {
    const edge = page.getByRole("button", {
      name: `${score} sur 10, repère disponible`,
      exact: true,
    });
    await edge.hover();
    await expect(tooltip).toHaveCount(1);
    const bounds = (await tooltip.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  }
  await configured.hover();
  await expect(tooltip).toHaveCount(1);
  await expect(tooltip).toHaveText(text);
  const anchor = (await configured.boundingBox())!;
  const box = (await tooltip.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(anchor.y);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(
    await tooltip.evaluate((element) => element.matches(":popover-open")),
  ).toBe(true);
  await slider.focus();
  await configured.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await configured.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#selected-score-guide")).toHaveText(text);
  await expect(page.locator("#score-status")).toHaveText("Note enregistrée");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("6");
  await page.getByRole("button", { name: "6 sur 10", exact: true }).hover();
  await expect(page.locator("#selected-score-guide")).toHaveCount(0);
  await expect(tooltip).toHaveCount(0);
  // A narrow viewport uses the same scale, with a tap and a persistent text.
  await page.setViewportSize({ width: 375, height: 667 });
  await configured.click();
  await expect(slider).toHaveValue("5");
  await expect(page.locator("#selected-score-guide")).toHaveText(text);
  await expect(page.locator("#score-status")).toHaveText("Note enregistrée");
  await slider.focus();
  await configured.focus();
  await expect(tooltip).toBeVisible();
  const mobile = (await tooltip.boundingBox())!;
  expect(mobile.x).toBeGreaterThanOrEqual(0);
  expect(mobile.x + mobile.width).toBeLessThanOrEqual(375);
  await page.setViewportSize({ width: 1280, height: 720 });
}
