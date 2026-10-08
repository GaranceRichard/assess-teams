import { expect, type Page } from "@playwright/test";

export async function verifySidebar(page: Page, manyMenus: boolean) {
  const sidebar = page.locator(".product-sidebar");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  for (const height of [900, 480]) {
    await page.setViewportSize({ width: 1280, height });
    for (const collapsed of [false, true]) {
      if (collapsed)
        await page.getByRole("button", { name: "Replier le menu" }).click();
      await expect(sidebar).toHaveCSS("width", collapsed ? "80px" : "272px");
      const toggle = sidebar.getByRole("button");
      const geometry = await sidebar.evaluate((element) => {
        const nav = element.querySelector("nav")!;
        const button = element.querySelector("button")!;
        const bounds = element.getBoundingClientRect();
        const control = button.getBoundingClientRect();
        return {
          height: bounds.height,
          top: bounds.top,
          bottomGap: window.innerHeight - control.bottom,
          paddingBottom: parseFloat(getComputedStyle(element).paddingBottom),
          horizontalOverflow: nav.scrollWidth - nav.clientWidth,
          verticalOverflow: nav.scrollHeight > nav.clientHeight,
          sidebarOverflow: element.scrollWidth - element.clientWidth,
        };
      });
      expect(geometry.top).toBe(0);
      expect(geometry.height).toBe(height);
      expect(geometry.bottomGap).toBeCloseTo(geometry.paddingBottom, 0);
      expect(geometry.horizontalOverflow).toBe(0);
      expect(geometry.sidebarOverflow).toBe(0);
      expect(geometry.verticalOverflow).toBe(manyMenus && height === 480);
      await expect(toggle).toBeInViewport();
      await expect(toggle.locator("path")).toHaveAttribute(
        "d",
        collapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6",
      );
      if (collapsed) {
        const link = nav.getByRole("link").first();
        await link.focus();
        await expect(page.getByRole("tooltip")).toBeVisible();
        expect(await nav.evaluate((n) => n.scrollWidth - n.clientWidth)).toBe(
          0,
        );
        const offset = await link.evaluate((a) => {
          const icon = a.querySelector("svg")!.getBoundingClientRect();
          const bounds = a.getBoundingClientRect();
          return Math.abs(
            icon.left + icon.width / 2 - bounds.left - bounds.width / 2,
          );
        });
        expect(offset).toBeLessThan(1);
        if (manyMenus && height === 480) {
          await nav.getByRole("link", { name: "Logs", exact: true }).focus();
          await expect(
            nav.getByRole("link", { name: "Logs", exact: true }),
          ).toBeInViewport();
          await expect(toggle).toBeInViewport();
        }
        await toggle.click();
      }
    }
  }
}
