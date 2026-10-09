import type {
  ActiveElement,
  Chart,
  ChartEvent,
  TooltipItem,
  LinearScaleOptions,
  Scale,
} from "chart.js";
import { expect, it, vi } from "vitest";

import { historyData, historyOptions } from "./resultHistoryConfig";
import { radarOptions, wrapRadarLabel } from "./resultRadarConfig";
import { resultComparison, resultHistory } from "./test/resultsFixture";

it("selects a radar criterion by its label without datasets or by a plotted point", () => {
  const click = vi.fn();
  const options = radarOptions("day", click);
  const chart = {
    data: { labels: ["A", "B"] },
    scales: {
      r: {
        getPointLabelPosition: (index: number) => ({
          left: index * 20,
          right: index * 20 + 10,
          top: 0,
          bottom: 10,
        }),
      },
    },
  } as unknown as Chart;
  const event = { x: 25, y: 5 } as ChartEvent;
  options.onClick!(event, [], chart);
  expect(click).toHaveBeenCalledWith(1);
  options.onClick!(
    { x: 200, y: 200 } as ChartEvent,
    [{ index: 0 }] as ActiveElement[],
    chart,
  );
  expect(click).toHaveBeenLastCalledWith(0);
  click.mockClear();
  options.onClick!({ x: null, y: 5 } as ChartEvent, [], chart);
  options.onClick!({ x: 5, y: null } as ChartEvent, [], chart);
  options.onClick!({ x: 200, y: 200 } as ChartEvent, [], chart);
  radarOptions("day").onClick!(event, [], chart);
  expect(click).not.toHaveBeenCalled();
  chart.data.labels = undefined;
  options.onClick!(event, [], chart);
  expect(click).not.toHaveBeenCalled();
});
it("uses actual completion timestamps, point metadata and fixed scales without calculated data", () => {
  const data = historyData(resultHistory, resultComparison.teams);
  expect(data.datasets[0].data.map((point) => point.y)).toEqual([2, 0]);
  expect(data.datasets[0].borderDash).not.toEqual(data.datasets[1].borderDash);
  const options = historyOptions("night");
  expect(options.scales!.y).toMatchObject({ min: 0, max: 10 });
  expect(options.scales!.x).toMatchObject({ type: "linear", bounds: "data" });
  const callback = options.plugins!.tooltip!.callbacks!.label!;
  const tooltip = callback.call(
    {} as never,
    { raw: data.datasets[0].data[0] } as TooltipItem<"line">,
  );
  expect(tooltip).toContain("Alpha");
  expect(tooltip).toContain("2 / 10 · v1");
  expect(tooltip).toMatch(/\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2} ·/);
  expect(tooltip).not.toMatch(/\d{2}:\d{2}:\d{2}/);
  const tick = options.scales!.x!.ticks!.callback!;
  expect(
    tick.call({} as never, new Date("2026-09-01T12:00:00Z").getTime(), 0, []),
  ).toBe("01/09/2026");
  expect(historyOptions("day").scales!.y!.ticks!.color).toBe("#171717");
});

it("wraps complete radar labels for the available width, including long unbroken words", () => {
  const label =
    "1. Collaboration et amélioration continue de toutes les équipes";
  expect(wrapRadarLabel(label, 400).join(" ")).toBe(label);
  expect(wrapRadarLabel(label, 400).length).toBeGreaterThan(
    wrapRadarLabel(label, 1600).length,
  );
  expect(
    wrapRadarLabel("supercalifragilisticexpialidocious", 200).join(""),
  ).toBe("supercalifragilisticexpialidocious");
  expect(wrapRadarLabel("", 0)).toEqual([]);
  const callback = radarOptions("day").scales!.r!.pointLabels!.callback!;
  expect(callback.call({ chart: { width: 400 } } as never, label, 0)).toEqual(
    wrapRadarLabel(label, 400),
  );
});

it.each([100, 500])(
  "keeps radar label fonts readable at height %s",
  (height) => {
    const font = radarOptions("day").scales!.r!.pointLabels!.font;
    const resolve = font as (context: { chart: { height: number } }) => {
      size: number;
      lineHeight: number;
    };
    expect(resolve({ chart: { height } })).toEqual({
      size: height < 180 ? 10 : 12,
      lineHeight: 1,
    });
  },
);

it.each([
  { width: 220, height: 90, ticks: 2, font: 10 },
  { width: 600, height: 110, ticks: 4, font: 11 },
  { width: 1000, height: 500, ticks: 6, font: 12 },
])("sizes longitudinal dates and title for $width × $height", (size) => {
  const options = historyOptions("day");
  const axis = {
    chart: { width: size.width },
    ticks: Array.from({ length: 8 }, (_, value) => ({ value })),
  } as unknown as Scale;
  options.scales!.x!.afterBuildTicks!(axis);
  expect(axis.ticks).toHaveLength(size.ticks);
  expect(axis.ticks[0].value).toBe(0);
  expect(axis.ticks.at(-1)!.value).toBe(7);
  axis.ticks = [{ value: 1 }];
  options.scales!.x!.afterBuildTicks!(axis);
  expect(axis.ticks).toEqual([{ value: 1 }]);
  const title = (options.scales!.y as LinearScaleOptions).title;
  const font = title.font as (context: unknown) => { size: number };
  expect(font({ chart: { height: size.height } })).toEqual({ size: size.font });
  expect(options.scales!.x!.ticks).toMatchObject({
    maxTicksLimit: 6,
    maxRotation: 0,
    autoSkip: false,
  });
  expect(options.scales!.y).toMatchObject({ min: 0, max: 10 });
  expect(options).toMatchObject({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
  });
});

it("formats the historical tooltip title instead of Chart.js' default numeric epoch", () => {
  const title = historyOptions("day").plugins!.tooltip!.callbacks!.title!;
  const point = historyData(resultHistory, resultComparison.teams).datasets[0]
    .data[0];
  const timestamp = "2026-09-01T09:05:47.123";
  const item = {
    raw: {
      ...point,
      observation: { ...point.observation, completed_at: timestamp },
    },
    label: String(new Date(timestamp).getTime()),
  } as TooltipItem<"line">;
  expect(title.call({} as never, [item])).toBe("01/09/2026 - 09:05");
  expect(title.call({} as never, [])).toBe("");
  expect(item.raw).toMatchObject({ observation: { completed_at: timestamp } });
});
