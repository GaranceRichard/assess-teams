import { fireEvent, render, screen, within } from "@testing-library/react";
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

it("exposes complete numbered axes and opens the selected criterion", () => {
  radar.mockImplementation(() => <canvas />);
  const select = vi.fn();
  render(
    <ResultsRadar
      {...resultFamilyComparison}
      selected={[10]}
      theme="day"
      onCriterion={select}
    />,
  );
  const axes = screen.getByRole("region", { name: "Axes du radar" });
  resultFamilyComparison.axes.forEach((axis, index) => {
    expect(
      within(axes).getByRole("button", { name: `${index + 1}. ${axis.text}` }),
    ).toBeEnabled();
  });
  fireEvent.click(within(axes).getAllByRole("button")[0]);
  expect(select).toHaveBeenCalledWith(resultFamilyComparison.axes[0]);
});

it("does not open an axis without an explicit lineage", () => {
  radar.mockImplementation(() => <canvas />);
  const select = vi.fn();
  render(
    <ResultsRadar
      axes={[{ question_id: 1, index: 1, text: "Archive sans lignée" }]}
      teams={[]}
      selected={[]}
      theme="day"
      onCriterion={select}
    />,
  );
  const button = screen.getByRole("button", { name: "1. Archive sans lignée" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(select).not.toHaveBeenCalled();
});
