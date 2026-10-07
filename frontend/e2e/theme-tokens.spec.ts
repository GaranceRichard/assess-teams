import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import { contrast, luminance } from "./palette-contrast";

const stable = ["text", "text-muted", "border", "input-border"];
const surfaces = ["background", "surface", "surface-raised"];

test("light bands follow each accent while content stays neutral and dark stays unchanged", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
  const appearances: string[][][] = [];
  for (const theme of ["day", "night"]) {
    const values = await page.evaluate(
      ({ theme, stable, surfaces, palettes }) => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        return palettes.map(({ value }) => {
          root.dataset.palette = value;
          const style = getComputedStyle(root);
          const token = (name: string) =>
            style.getPropertyValue(`--${name}`).trim();
          const resolveColor = (color: string) => {
            const probe = document.createElement("span");
            probe.style.color = color;
            root.append(probe);
            const computed = getComputedStyle(probe).color;
            probe.remove();
            return computed;
          };
          const resolved = (name: string) => resolveColor(`var(--${name})`);
          return {
            palette: value,
            stable: stable.map(token),
            surfaces: surfaces.map(resolved),
            nightBaseline: ["#171717", "#262626", "#303030"].map((base) =>
              resolveColor(
                `color-mix(in srgb, var(--accent-day) 24%, ${base})`,
              ),
            ),
            band: resolved("navigation-background"),
            active: resolved("navigation-active"),
            expectedBand: resolveColor(
              "color-mix(in srgb, var(--accent-day) 6%, #f8f8fa)",
            ),
            expectedActive: resolveColor(
              "color-mix(in srgb, var(--accent-day) 14%, #ffffff)",
            ),
            text: resolved("text"),
            muted: resolved("text-muted"),
            accent: resolved("accent"),
            contrast: resolved("accent-contrast"),
            hover: resolved("accent-hover"),
            subtle: resolved("accent-subtle"),
          };
        });
      },
      { theme, stable, surfaces, palettes },
    );
    appearances.push(values.map((tokens) => tokens.surfaces));
    for (const tokens of values) {
      expect(tokens.stable, `${theme}/${tokens.palette}`).toEqual(
        values[0].stable,
      );
      for (const color of tokens.stable)
        expect(color).toMatch(/^#([0-9a-f]{2})\1\1$/i);
      if (theme === "day") {
        expect(tokens.surfaces).toEqual([
          "rgb(247, 247, 247)",
          "rgb(255, 255, 255)",
          "rgb(255, 255, 255)",
        ]);
        expect(tokens.band).toBe(tokens.expectedBand);
        expect(tokens.active).toBe(tokens.expectedActive);
        expect(luminance(tokens.band)).toBeGreaterThan(0.8);
        expect(luminance(tokens.active)).toBeLessThan(luminance(tokens.band));
      } else {
        expect(tokens.surfaces).toEqual(tokens.nightBaseline);
        expect(tokens.band).toBe(tokens.surfaces[1]);
        expect(tokens.active).toBe(tokens.subtle);
      }
      expect(contrast(tokens.text, tokens.band)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens.muted, tokens.band)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens.accent, tokens.active)).toBeGreaterThanOrEqual(
        4.5,
      );
      for (const surface of tokens.surfaces) {
        if (theme === "day") expect(luminance(surface)).toBeGreaterThan(0.65);
        else expect(luminance(surface)).toBeLessThan(0.15);
        expect(contrast(tokens.text, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tokens.muted, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tokens.accent, surface)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(tokens.accent, tokens.subtle)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.accent, tokens.contrast)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.hover, tokens.contrast)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    for (let index = 0; index < surfaces.length; index++) {
      expect(new Set(values.map((tokens) => tokens.surfaces[index])).size).toBe(
        theme === "day" ? 1 : 10,
      );
    }
    expect(new Set(values.map((tokens) => tokens.accent)).size).toBe(10);
    expect(new Set(values.map((tokens) => tokens.band)).size).toBe(10);
  }
  for (let index = 0; index < palettes.length; index++) {
    expect(appearances[0][index]).not.toEqual(appearances[1][index]);
  }
});
