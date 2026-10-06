import { afterEach, expect, it } from "vitest";

import { applyPalette, normalizePalette, palettes } from "./palette";
import { applyTheme } from "./theme";

afterEach(() => {
  delete document.documentElement.dataset.palette;
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

it("accepts ten accents, including the four historical persisted values", () => {
  expect(new Set(palettes.map(({ value }) => value)).size).toBe(10);
  for (const { value } of palettes) expect(normalizePalette(value)).toBe(value);
  for (const value of ["green", "blue", "pink", "red"])
    expect(normalizePalette(value)).toBe(value);
});

it("changes either dimension without changing the other or storing an accent locally", () => {
  applyTheme("night");
  applyPalette("turquoise");
  expect(document.documentElement.dataset.theme).toBe("night");
  applyTheme("day");
  expect(document.documentElement.dataset.palette).toBe("turquoise");
  expect(localStorage.getItem("assess-teams-theme")).toBe("day");
  expect(localStorage.getItem("assess-teams-palette")).toBeNull();
});

it.each(["unknown", "#00ff00", null, undefined, {}, 7])(
  "falls back safely for an invalid server preference %s",
  (value) => {
    applyTheme("night");
    applyPalette(value);
    expect(document.documentElement.dataset.palette).toBe("green");
    expect(document.documentElement.dataset.theme).toBe("night");
  },
);
