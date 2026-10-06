import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import { contrast } from "./palette-contrast";

const structural = [
  "background",
  "surface",
  "surface-raised",
  "border",
  "text",
  "text-muted",
  "input-border",
  "navigation-background",
  "navigation-text",
  "sidebar-control",
];

test("accents never change structural tokens in either appearance", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
  const themes: string[][] = [];
  for (const theme of ["day", "night"]) {
    const values = await page.evaluate(
      ({ theme, structural, palettes }) => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        return palettes.map(({ value }) => {
          root.dataset.palette = value;
          const style = getComputedStyle(root);
          const token = (name: string) =>
            style.getPropertyValue(`--${name}`).trim();
          // Resolve derived colors through a real CSS property.
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
            structural: structural.map(token),
            accent: token("accent"),
            contrast: token("accent-contrast"),
            hover: resolved("accent-hover"),
            surface: token("surface"),
            raised: token("surface-raised"),
            border: token("accent-border"),
            subtle: resolved("accent-subtle"),
          };
        });
      },
      { theme, structural, palettes },
    );
    themes.push(values[0].structural);
    for (const tokens of values) {
      expect(tokens.structural, `${theme}/${tokens.palette}`).toEqual(
        values[0].structural,
      );
      for (const token of tokens.structural) {
        expect(token).toMatch(/^#([0-9a-f]{2})\1\1$/i);
      }
      expect(tokens.border).not.toBe("");
      expect(contrast(tokens.accent, tokens.subtle)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.accent, tokens.contrast)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.hover, tokens.contrast)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.accent, tokens.surface)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(tokens.accent, tokens.raised)).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    expect(new Set(values.map((value) => value.accent)).size).toBe(10);
  }
  expect(themes[0]).not.toEqual(themes[1]);
});
