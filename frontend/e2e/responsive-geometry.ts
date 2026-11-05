import { expect, type Locator, type Page } from "@playwright/test";

export async function reachable(action: Locator) {
  await action.focus();
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeFocused();
  const bounds = await action.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      width: innerWidth,
      height: innerHeight,
      hit: element.contains(
        document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        ),
      ),
    };
  });
  expect.soft(bounds.left).toBeGreaterThanOrEqual(0);
  expect.soft(bounds.right).toBeLessThanOrEqual(bounds.width);
  expect.soft(bounds.top).toBeGreaterThanOrEqual(0);
  expect.soft(bounds.bottom).toBeLessThanOrEqual(bounds.height);
  expect.soft(bounds.hit).toBe(true);
  return bounds;
}

export async function responsiveGeometry(page: Page) {
  const geometry = await page.evaluate(() => {
    const elements = [
      document.documentElement,
      ...document.querySelectorAll(
        ".product-page, .collection-scroll, .pagination, .modal-layer [role=dialog], .results-table-scroll",
      ),
    ];
    return elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        component: element.className || element.tagName,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
        height: element.clientHeight,
        scrollHeight: element.scrollHeight,
        x: rect.x,
        y: rect.y,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
      };
    });
  });
  expect.soft(geometry[0].scrollWidth).toBeLessThanOrEqual(geometry[0].width);
  return geometry;
}

export async function setResponsiveTheme(page: Page, theme: string) {
  if ((await page.locator("html").getAttribute("data-theme")) !== theme)
    await page
      .getByRole("button", {
        name: theme === "day" ? "Activer le mode jour" : "Activer le mode nuit",
      })
      .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}
