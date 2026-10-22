import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

import { palettes } from "../src/palette";
import { contrast } from "./palette-contrast";

export async function auditResults(page: Page, info: TestInfo) {
  const evidence = process.env.ASSESS_RESULTS_AUDIT;
  const directory = evidence
    ? resolve(import.meta.dirname, "../../docs/quality/mep-014", evidence)
    : info.outputPath("hierarchy");
  mkdirSync(directory, { recursive: true });
  const rows = [];
  for (const theme of ["day", "night"]) {
    const toggle = page.getByRole("button", {
      name: theme === "day" ? "Activer le mode jour" : "Activer le mode nuit",
    });
    if (await toggle.count()) await toggle.click();
    for (const palette of palettes) {
      await page.evaluate((value) => {
        document.documentElement.dataset.palette = value;
      }, palette.value);
      const sizes = [{ width: 1280, height: 720 }];
      if (palette.value === "green")
        sizes.push(
          { width: 1920, height: 1080 },
          { width: 1280, height: 480 },
          { width: 390, height: 844 },
        );
      for (const size of sizes) {
        await page.setViewportSize(size);
        for (const temporal of [false, true]) {
          const analysis = page.getByRole("switch", { name: "Analyse" });
          if (
            (await analysis.getAttribute("aria-checked")) !== String(temporal)
          )
            await analysis.click();
          if (temporal)
            await page
              .getByLabel("Critère", { exact: true })
              .selectOption({ index: 1 });
          for (const detailed of [false, true]) {
            await page
              .getByRole("tab", {
                name: detailed ? "Données détaillées" : "Graphique",
                exact: true,
              })
              .click();
            await expect(
              page.getByRole(detailed ? "table" : "img"),
            ).toBeVisible();
            await page.evaluate(() => new Promise(requestAnimationFrame));
            const name = `${theme}-${palette.value}-${size.width}-${size.height}-${temporal ? "history" : "radar"}-${detailed ? "details" : "chart"}`;
            const measures = await page.evaluate(() => {
              const root = document.documentElement;
              const elements = [
                ...document.querySelectorAll<HTMLElement>(
                  ".results-context, .results-context dt, .results-context dd, .results-teams label, .results-teams small, .results-view-selector > span, .results-table-scroll small",
                ),
              ];
              return {
                width: root.scrollWidth,
                available: root.clientWidth,
                canvasHeight: document
                  .querySelector("canvas")
                  ?.getBoundingClientRect().height,
                styles: elements.map((element) => {
                  const style = getComputedStyle(element);
                  let parent: HTMLElement | null = element;
                  while (
                    parent &&
                    getComputedStyle(parent).backgroundColor ===
                      "rgba(0, 0, 0, 0)"
                  )
                    parent = parent.parentElement;
                  return {
                    selector: element.tagName + "." + element.className,
                    text: element.textContent,
                    color: style.color,
                    background: parent
                      ? getComputedStyle(parent).backgroundColor
                      : "rgb(255,255,255)",
                    font: style.fontFamily,
                    size: style.fontSize,
                    weight: style.fontWeight,
                    lineHeight: style.lineHeight,
                    gap: style.gap,
                  };
                }),
              };
            });
            rows.push({
              name,
              theme,
              palette: palette.value,
              ...size,
              zoom: 100,
              ...measures,
            });
            expect(measures.width, name).toBeLessThanOrEqual(
              measures.available,
            );
            for (const style of measures.styles)
              expect(
                contrast(style.color, style.background),
                name + " " + style.selector,
              ).toBeGreaterThanOrEqual(4.5);
            if (evidence)
              await page.screenshot({
                path: resolve(directory, name + ".png"),
                fullPage: true,
              });
          }
        }
      }
    }
  }
  writeFileSync(
    resolve(directory, "measurements.jsonl"),
    rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
  );
}
