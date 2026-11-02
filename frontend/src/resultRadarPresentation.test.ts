import type { TooltipItem } from "chart.js";
import { expect, it } from "vitest";

import { radarData, radarOptions } from "./resultRadarConfig";
import { resultFamilyComparison } from "./test/resultsFixture";

it("keeps stable numeric radar references and complete tooltip text", () => {
  const { axes, teams } = resultFamilyComparison;
  expect(radarData(axes, teams, []).labels).toEqual(["1", "2", "3"]);
  const title = radarOptions("day", undefined, axes).plugins!.tooltip!
    .callbacks!.title!;
  const item = {
    dataIndex: 1,
    chart: { width: 600 },
    label: "2",
  } as TooltipItem<"radar">;
  const lines = title.call({} as never, [item]) as string[];
  expect(lines.join(" ")).toBe(axes[1].text);
  expect(title.call({} as never, [])).toEqual([]);
  expect(
    radarOptions("day").plugins!.tooltip!.callbacks!.title!.call({} as never, [
      item,
    ]),
  ).toEqual(["2"]);
});
