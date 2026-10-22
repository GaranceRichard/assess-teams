import { writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { palettes } from "../src/palette";
import { radarOptions, seriesStyle } from "../src/resultRadarConfig";
import { historyOptions } from "../src/resultHistoryConfig";
import { contrast } from "./palette-contrast";

export async function auditLightScreen(page: Page, name: string) {
  await page.mouse.move(0, 0);
  for (const { value } of palettes) {
    await page
      .locator(":focus")
      .evaluateAll((elements) =>
        elements.forEach((element) => (element as HTMLElement).blur()),
      );
    await page.locator("html").evaluate((root, palette) => {
      (root as HTMLElement).dataset.palette = palette;
    }, value);
    const scope = (await page.getByRole("dialog").count())
      ? page.getByRole("dialog")
      : page.locator("body");
    const rows = await scope.locator("*").evaluateAll((elements) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const composite = (colors: string[]) => {
        context.clearRect(0, 0, 1, 1);
        for (const color of colors) {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
        }
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${r}, ${g}, ${b})`;
      };
      return elements.flatMap((element) => {
        if (
          !element.checkVisibility() ||
          element.closest(":disabled, svg, option")
        )
          return [];
        const style = getComputedStyle(element);
        const layers: string[] = [];
        for (
          let parent: Element | null = element;
          parent;
          parent = parent.parentElement
        )
          layers.unshift(getComputedStyle(parent).backgroundColor);
        const background = composite(["white", ...layers]);
        const label = `${element.tagName}.${element.className}: ${element.textContent?.trim().slice(0, 55)}`;
        const rows = [];
        if (
          [...element.childNodes].some(
            (node) =>
              node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          ) ||
          element.matches(
            "input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select",
          )
        ) {
          rows.push({
            label,
            kind: "text",
            foreground: composite([background, style.color]),
            background,
            threshold: 4.5,
          });
        }
        if (
          element.matches(
            "input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select",
          ) &&
          parseFloat(style.borderTopWidth) > 0
        ) {
          rows.push({
            label,
            kind: "control-boundary",
            foreground: composite([background, style.borderTopColor]),
            background,
            threshold: 3,
          });
        }
        return rows;
      });
    });
    if (["radar", "history"].includes(name)) {
      const background = await page
        .locator(".results-page")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      const radar = radarOptions("day").scales!.r!;
      const history = historyOptions("day").scales!.y!;
      for (const [label, foreground, threshold] of [
        ["radar-label", String(radar.pointLabels!.color), 4.5],
        ["history-tick", String(history.ticks!.color), 4.5],
        ["grid", String(radar.grid!.color), 3],
        ...Array.from({ length: 5 }, (_, index) => [
          `series-${index}`,
          seriesStyle(index).color,
          3,
        ]),
      ] as const)
        rows.push({ label, kind: "chart", foreground, background, threshold });
    }
    const measured = rows.map((row) => ({
      ...row,
      ratio: contrast(row.foreground, row.background),
    }));
    writeFileSync(
      test.info().outputPath(`${name}-${value}-contrast.json`),
      JSON.stringify(measured, null, 2),
    );
    await test.info().attach(`${name}-${value}-contrast.json`, {
      body: JSON.stringify(measured, null, 2),
      contentType: "application/json",
    });
    for (const row of measured) {
      expect
        .soft(row.ratio, `${name}/${value}/${row.kind}/${row.label}`)
        .toBeGreaterThanOrEqual(row.threshold);
    }
    const control = scope
      .locator(
        "input:not([type=range]):not([type=radio]):not([type=checkbox]), textarea, select",
      )
      .filter({ visible: true })
      .first();
    if (await control.count()) {
      await control.focus();
      const focus = await control.evaluate((element) => ({
        width: getComputedStyle(element).outlineWidth,
        color: getComputedStyle(element).outlineColor,
      }));
      expect
        .soft(parseFloat(focus.width), `${name}/${value}/focus`)
        .toBeGreaterThan(0);
      writeFileSync(
        test.info().outputPath(`${name}-${value}-focus.json`),
        JSON.stringify(focus),
      );
      if (name === "question-dialog")
        await page.screenshot({
          path: test.info().outputPath(`question-focus-${value}.png`),
        });
      await control.blur();
    }
    if (name === "question-dialog") {
      await page.locator("html").evaluate((root) => {
        (root as HTMLElement).dataset.theme = "night";
      });
      await page.screenshot({
        path: test.info().outputPath(`question-night-${value}.png`),
      });
      await page.locator("html").evaluate((root) => {
        (root as HTMLElement).dataset.theme = "day";
      });
    }
    await page.screenshot({
      path: test.info().outputPath(`${name}-${value}.png`),
      animations: "disabled",
    });
  }
}
