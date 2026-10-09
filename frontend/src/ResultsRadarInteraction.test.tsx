import { render, screen } from "@testing-library/react";
import type { Chart, ChartEvent, ChartOptions } from "chart.js";
import { expect, it, vi } from "vitest";

import { ResultsRadar } from "./ResultsRadar";
import { resultFamilyComparison } from "./test/resultsFixture";

const radar = vi.hoisted(() => vi.fn());
vi.mock("react-chartjs-2", () => ({ Radar: radar }));

it("opens the explicit criterion through the chart label and ignores axes without lineage", () => {
  radar.mockImplementation(() => <canvas />);
  const select = vi.fn();
  const view = render(
    <ResultsRadar
      {...resultFamilyComparison}
      selected={[]}
      theme="day"
      onCriterion={select}
    />,
  );
  expect(screen.queryByText("Historique par critère")).not.toBeInTheDocument();
  expect(view.container.querySelector("details")).toBeNull();
  const chart = {
    data: { labels: ["First criterion"] },
    scales: {
      r: {
        getPointLabelPosition: () => ({
          left: 0,
          right: 20,
          top: 0,
          bottom: 20,
        }),
      },
    },
  } as unknown as Chart;
  function clickLabel() {
    const options = radar.mock.lastCall![0].options as ChartOptions<"radar">;
    options.onClick!({ x: 10, y: 10 } as ChartEvent, [], chart);
  }
  clickLabel();
  expect(select).toHaveBeenCalledWith(resultFamilyComparison.axes[0]);
  select.mockClear();
  view.rerender(
    <ResultsRadar
      axes={[{ question_id: 1, index: 1, text: "Legacy" }]}
      teams={[]}
      selected={[]}
      theme="day"
      onCriterion={select}
    />,
  );
  clickLabel();
  expect(select).not.toHaveBeenCalled();
});
