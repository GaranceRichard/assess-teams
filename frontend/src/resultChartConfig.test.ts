import type { ActiveElement, Chart, ChartEvent, TooltipItem } from "chart.js";
import { expect, it, vi } from "vitest";

import { historyData, historyOptions } from "./resultHistoryConfig";
import { radarOptions } from "./resultRadarConfig";
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
  const tick = options.scales!.x!.ticks!.callback!;
  expect(
    tick.call({} as never, new Date("2026-09-01T12:00:00Z").getTime(), 0, []),
  ).toBe("2026-09-01");
  expect(historyOptions("day").scales!.y!.ticks!.color).toBe("#18252c");
});
