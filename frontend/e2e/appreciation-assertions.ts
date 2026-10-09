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
  const slider = page.getByRole("slider");
  if (await slider.isEnabled()) await slider.focus();
  await button.hover();
  await tooltip.hover();
  await tooltip.evaluate((element) =>
    element.dispatchEvent(new Event("scroll", { bubbles: true })),
  );
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible();
}
