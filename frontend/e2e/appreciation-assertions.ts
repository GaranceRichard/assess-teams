import { expect, type Page } from "@playwright/test";

export async function expectMarkerTooltip(
  page: Page,
  level: number,
  text: string,
) {
  const button = page.getByRole("button", {
    name: level + " sur 10 : " + text,
    exact: true,
  });
  await button.focus();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText(text);
  const anchor = await button.boundingBox();
  const bounds = await tooltip.boundingBox();
  const viewport = page.viewportSize()!;
  expect(anchor).not.toBeNull();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(anchor!.y);
  expect(
    await tooltip.evaluate((element) => element.matches(":popover-open")),
  ).toBe(true);
  await button.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible();
}
