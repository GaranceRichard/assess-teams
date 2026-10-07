import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import { contrast, luminance } from "./palette-contrast";

const stable = ["text", "text-muted", "border", "input-border"];
const surfaces = ["background", "surface", "surface-raised"];

test("each palette tints light and dark surfaces without changing readable text", async ({
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
          const resolved = (name: string) => {
            const probe = document.createElement("span");
            probe.style.color = `var(--${name})`;
            root.append(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          };
          return {
            palette: value,
            stable: stable.map(token),
            surfaces: surfaces.map(resolved),
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
        10,
      );
    }
    expect(new Set(values.map((tokens) => tokens.accent)).size).toBe(10);
  }
  for (let index = 0; index < palettes.length; index++) {
    expect(appearances[0][index]).not.toEqual(appearances[1][index]);
  }
});
