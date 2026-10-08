import { expect, type Page } from "@playwright/test";

type ChartText = { text: string; bounds: number[] };
type ChartWindow = { chartText: WeakMap<HTMLCanvasElement, ChartText[]> };

export const desktopSizes = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 820, height: 600 },
  { width: 1280, height: 480 },
];

export async function observeChartText(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as ChartWindow;
    state.chartText = new WeakMap();
    const prototype = CanvasRenderingContext2D.prototype;
    const clear = prototype.clearRect;
    prototype.clearRect = function (...args) {
      state.chartText.set(this.canvas, []);
      return clear.apply(this, args);
    };
    const fill = prototype.fillText;
    prototype.fillText = function (text, x, y, maxWidth) {
      const metrics = this.measureText(text);
      const transform = this.getTransform();
      const corners = [
        [
          x - metrics.actualBoundingBoxLeft,
          y - metrics.actualBoundingBoxAscent,
        ],
        [
          x + metrics.actualBoundingBoxRight,
          y + metrics.actualBoundingBoxDescent,
        ],
        [
          x - metrics.actualBoundingBoxLeft,
          y + metrics.actualBoundingBoxDescent,
        ],
        [
          x + metrics.actualBoundingBoxRight,
          y - metrics.actualBoundingBoxAscent,
        ],
      ].map(([px, py]) => new DOMPoint(px, py).matrixTransform(transform));
      const records = state.chartText.get(this.canvas) ?? [];
      records.push({
        text,
        bounds: [
          Math.min(...corners.map((point) => point.x)),
          Math.min(...corners.map((point) => point.y)),
          Math.max(...corners.map((point) => point.x)),
          Math.max(...corners.map((point) => point.y)),
        ],
      });
      state.chartText.set(this.canvas, records);
      if (maxWidth === undefined) fill.call(this, text, x, y);
      else fill.call(this, text, x, y, maxWidth);
    };
  });
}

export async function expectChartFits(page: Page, name: RegExp) {
  const canvas = page.getByRole("img", { name });
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return Math.abs(rect.height - element.parentElement!.clientHeight);
      }),
    )
    .toBeLessThanOrEqual(1);
  const geometry = await canvas.evaluate((element: HTMLCanvasElement) => {
    const panel = element.closest(".results-tab-panel")!;
    const bounds = panel.getBoundingClientRect();
    const chart = element.getBoundingClientRect();
    const region = element.closest("section")!;
    return {
      width: element.width,
      height: element.height,
      text: (window as unknown as ChartWindow).chartText.get(element) ?? [],
      canvas: { top: chart.top, bottom: chart.bottom, height: chart.height },
      panel: { top: bounds.top, bottom: bounds.bottom },
      children: [...region.children].map((child) => {
        const rect = child.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      }),
      scroll: [
        document.documentElement,
        panel,
        region,
        document.querySelector(".results-page")!,
      ].map((node) => ({
        height: node.scrollHeight,
        available: node.clientHeight,
      })),
    };
  });
  expect(geometry.canvas.height).toBeGreaterThan(70);
  expect(geometry.canvas.top).toBeGreaterThanOrEqual(geometry.panel.top - 1);
  expect(geometry.canvas.bottom).toBeLessThanOrEqual(geometry.panel.bottom + 1);
  for (const child of geometry.children) {
    expect(child.top).toBeGreaterThanOrEqual(geometry.panel.top - 1);
    expect(child.bottom).toBeLessThanOrEqual(geometry.panel.bottom + 1);
  }
  for (const scroll of geometry.scroll)
    expect(scroll.height).toBeLessThanOrEqual(scroll.available + 1);
  expect(geometry.text.length).toBeGreaterThan(0);
  for (const { text, bounds } of geometry.text) {
    expect(bounds[0], text).toBeGreaterThanOrEqual(-1);
    expect(bounds[1], text).toBeGreaterThanOrEqual(-1);
    expect(bounds[2], text).toBeLessThanOrEqual(geometry.width + 1);
    expect(bounds[3], text).toBeLessThanOrEqual(geometry.height + 1);
  }
  if (name.source.includes("Évolution")) {
    expect(
      geometry.text.some((item) => item.text === "Date de complétion"),
    ).toBe(true);
    expect(geometry.text.some((item) => item.text === "Score 0–10")).toBe(true);
    expect(
      geometry.text.some((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.text)),
    ).toBe(true);
    const dates = geometry.text
      .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.text))
      .sort((a, b) => a.bounds[0] - b.bounds[0]);
    for (let index = 1; index < dates.length; index++)
      expect(dates[index - 1].bounds[2]).toBeLessThanOrEqual(
        dates[index].bounds[0] + 1,
      );
  }
}
