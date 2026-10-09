import { expect, type Page } from "@playwright/test";

export async function expectPassiveMarker(page: Page, level: number) {
  const dialog = page.getByRole("dialog");
  const point = dialog.locator(
    `.taking-content .marker-dot[data-score="${level}"]`,
  );
  await expect(point).toHaveCount(1);
  await point.hover({ force: true });
  await expect(dialog.getByRole("tooltip")).toHaveCount(0);
  await expect(point).not.toHaveAttribute("title");
  await expect(point).not.toHaveAttribute("tabindex");
  const slider = dialog.getByRole("slider");
  const track = (await slider.boundingBox())!;
  const dot = (await point.boundingBox())!;
  const thumb = await slider.evaluate(
    (element) =>
      parseFloat(
        getComputedStyle(element).getPropertyValue("--rating-thumb-size"),
      ) * parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  expect(dot.x + dot.width / 2).toBeCloseTo(
    track.x + thumb / 2 + ((track.width - thumb) * level) / 10,
    0,
  );
}
