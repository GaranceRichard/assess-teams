import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import { contrast } from "../e2e/palette-contrast";

test("day navigation keeps a distinct selected container in every palette and sidebar state", async ({
  page,
}) => {
  await page.goto("./");
  const sidebar = page.locator(".product-sidebar");
  const current = sidebar.locator('a[aria-current="page"]');
  const other = sidebar.getByRole("link", { name: "Résultats", exact: true });
  for (const theme of ["day", "night"]) {
    for (const { value } of palettes) {
      await page.evaluate(
        ({ theme, value }) => {
          document.documentElement.dataset.theme = theme;
          document.documentElement.dataset.palette = value;
        },
        { theme, value },
      );
      for (const collapsed of [false, true]) {
        await page.mouse.move(1000, 700);
        const colors = await current.evaluate((element) => {
          const color = (selector: string) =>
            getComputedStyle(document.querySelector(selector)!).backgroundColor;
          const style = getComputedStyle(element);
          const probe = document.createElement("span");
          const resolve = (background: string) => {
            probe.style.backgroundColor = background;
            document.body.append(probe);
            const resolved = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return resolved;
          };
          return {
            selected: style.backgroundColor,
            text: style.color,
            band: color(".product-sidebar"),
            header: color(".workspace > header"),
            background: color("html"),
            darkBand: resolve(
              "color-mix(in srgb, var(--accent-day) 24%, #262626)",
            ),
            darkSelected: resolve(
              "color-mix(in srgb, var(--accent-night) 12%, #262626)",
            ),
            darkText: resolve("var(--accent-night)"),
          };
        });
        expect(colors.header).toBe(colors.band);
        if (theme === "day") {
          expect(
            contrast(colors.selected, colors.band),
            value,
          ).toBeGreaterThanOrEqual(3);
          expect(
            contrast(colors.text, colors.selected),
            value,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrast(colors.band, colors.background),
            value,
          ).toBeGreaterThanOrEqual(1.15);
        } else {
          expect(colors.band).toBe(colors.darkBand);
          expect(colors.selected).toBe(colors.darkSelected);
          expect(colors.text).toBe(colors.darkText);
        }
        await other.hover();
        if (theme === "day") {
          const hover = await other.evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            text: getComputedStyle(element).color,
          }));
          expect(hover.background).not.toBe(colors.selected);
          expect(contrast(hover.text, hover.background)).toBeGreaterThanOrEqual(
            4.5,
          );
        }
        await current.hover();
        await expect(current).toHaveCSS("background-color", colors.selected);
        await expect(current).toHaveCSS("color", colors.text);
        const toggle = page.getByRole("button", {
          name: collapsed ? "Déplier le menu" : "Replier le menu",
        });
        await toggle.hover();
        if (theme === "day") {
          const control = await toggle.evaluate((element) => ({
            background: getComputedStyle(element).backgroundColor,
            text: getComputedStyle(element).color,
          }));
          expect(
            contrast(control.text, control.background),
          ).toBeGreaterThanOrEqual(4.5);
        }
        await toggle.click();
      }
    }
  }
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "day";
  });
  await other.click();
  await expect(other).toHaveAttribute("aria-current", "page");
  await expect(
    sidebar.getByRole("link", { name: "Tableau de bord", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: test.info().outputPath("navigation-day.png") });
});
