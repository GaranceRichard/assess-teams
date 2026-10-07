import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import { e2eCredential, seedIdentity } from "./identity-fixture";
import { contrast } from "./palette-contrast";

test.use({ deviceScaleFactor: 2 });

test("the official vector mark keeps its layout and contrast in both sidebar states", async ({
  page,
}) => {
  seedIdentity("brand-viewer-e2e", "Viewer");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("brand-viewer-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const brand = page.getByRole("link", { name: "Assess teams", exact: true });
  const mark = brand.locator(".product-mark");
  const label = brand.locator(".brand-label");
  await expect(brand).toBeVisible();
  await expect(mark).toHaveAttribute("aria-hidden", "true");

  const asset = await mark.evaluate(async (element) => {
    const mask = getComputedStyle(element).maskImage;
    const url = mask.match(/^url\("?(.*?)"?\)$/)?.[1];
    if (!url) throw new Error("The brand must load its vector asset");
    const response = await fetch(url);
    const svg = new DOMParser().parseFromString(
      await response.text(),
      "image/svg+xml",
    );
    return {
      ok: response.ok,
      type: response.headers.get("content-type"),
      viewBox: svg.documentElement.getAttribute("viewBox"),
      stroke: svg.querySelector("g")?.getAttribute("stroke"),
      paths: svg.querySelectorAll("path").length,
      rasterImages: svg.querySelectorAll("image").length,
      errors: svg.querySelectorAll("parsererror").length,
    };
  });
  expect(asset.ok).toBe(true);
  expect(asset.type).toContain("image/svg+xml");
  expect(asset.viewBox).toBe("0 0 512 320");
  expect(asset.stroke).toBe("currentColor");
  expect(asset.paths).toBe(3);
  expect(asset.rasterImages).toBe(0);
  expect(asset.errors).toBe(0);

  await page.goto("/users");
  await expect(page.getByRole("alert")).toContainText("Page non autorisée");
  await expect(brand).toBeVisible();
  await brand.click();
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const collapsed of [false, true]) {
      if (collapsed)
        await page.getByRole("button", { name: "Replier le menu" }).click();
      if (collapsed) await expect(label).toBeHidden();
      else await expect(label).toBeVisible();
      await expect(mark).toBeVisible();
      // Wait for the existing sidebar transition before measuring its bounds.
      await expect(page.locator(".product-sidebar")).toHaveCSS(
        "width",
        width === 390 ? "390px" : collapsed ? "80px" : "272px",
      );

      for (const theme of ["day", "night"]) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, theme);
        for (const { value } of palettes) {
          await page.evaluate((palette) => {
            document.documentElement.dataset.palette = palette;
          }, value);
          const geometry = await mark.evaluate((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const brand = element.closest(".brand")!;
            const label = brand.querySelector(".brand-label")!;
            const labelRect = label.getBoundingClientRect();
            const sidebar = element.closest(".product-sidebar")!;
            const bounds = sidebar.getBoundingClientRect();
            return {
              color: style.backgroundColor,
              text: getComputedStyle(brand).color,
              background: getComputedStyle(sidebar).backgroundColor,
              size: style.maskSize,
              repeat: style.maskRepeat,
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              bounds: {
                left: bounds.left,
                right: bounds.right,
                top: bounds.top,
                bottom: bounds.bottom,
              },
              gap: labelRect.left - rect.right,
              centerOffset: Math.abs(
                rect.top +
                  rect.height / 2 -
                  labelRect.top -
                  labelRect.height / 2,
              ),
              documentOverflow:
                document.documentElement.scrollWidth > window.innerWidth,
            };
          });
          expect(geometry.color).toBe(geometry.text);
          expect(
            contrast(geometry.color, geometry.background),
          ).toBeGreaterThanOrEqual(4.5);
          expect(geometry.size).toBe("contain");
          expect(geometry.repeat).toBe("no-repeat");
          expect(geometry.width).toBeCloseTo(28.8, 1);
          expect(geometry.height).toBeCloseTo(28.8, 1);
          expect(geometry.left).toBeGreaterThanOrEqual(geometry.bounds.left);
          expect(geometry.right).toBeLessThanOrEqual(geometry.bounds.right);
          expect(geometry.top).toBeGreaterThanOrEqual(geometry.bounds.top);
          expect(geometry.bottom).toBeLessThanOrEqual(geometry.bounds.bottom);
          expect(geometry.documentOverflow).toBe(false);
          if (!collapsed) {
            expect(geometry.gap).toBeCloseTo(10.4, 1);
            expect(geometry.centerOffset).toBeLessThan(1);
          }
        }
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `brand-${theme}-${width}-${collapsed ? "collapsed" : "open"}.png`,
            ),
        });
      }
      // The accessible brand still navigates when its visual name is hidden.
      await page.getByRole("link", { name: "Résultats", exact: true }).click();
      await brand.click();
      await expect(page).toHaveURL(/\/dashboard$/);
      if (collapsed)
        await page.getByRole("button", { name: "Déplier le menu" }).click();
    }
  }
});
