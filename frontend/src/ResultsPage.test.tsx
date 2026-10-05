import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { ChartData, ChartOptions } from "chart.js";

import { ResultsPage } from "./ResultsPage";
import { completionDate } from "./evaluationRuns";
import { resultComparison, resultVersions } from "./test/resultsFixture";

const api = vi.hoisted(() => ({
  listResultVersions: vi.fn(),
  getResultComparison: vi.fn(),
}));
vi.mock("./results", () => api);
vi.mock("react-chartjs-2", () => ({
  Radar: ({
    data,
    options,
    ...props
  }: {
    data: ChartData<"radar">;
    options: ChartOptions<"radar">;
  }) => (
    <canvas
      {...props}
      data-chart={JSON.stringify(data)}
      data-options={JSON.stringify(options)}
    />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.listResultVersions.mockResolvedValue(resultVersions);
  api.getResultComparison.mockResolvedValue(resultComparison);
});

function chartData(): ChartData<"radar"> {
  return JSON.parse(screen.getByRole("img").getAttribute("data-chart")!);
}

async function chooseVersion() {
  await screen.findByRole("option", { name: "Maturité — v1 · North" });
  fireEvent.change(screen.getByLabelText("Modèle / version"), {
    target: { value: "1" },
  });
  await screen.findByRole("img");
}

it("loads ordered axes immediately with a fixed empty scale, then overlays and removes teams locally", async () => {
  render(<ResultsPage theme="day" />);
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  await screen.findByText(
    "Sélectionnez un modèle et sa version pour comparer les équipes.",
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  await chooseVersion();
  expect(api.getResultComparison).toHaveBeenCalledWith(1);
  expect(chartData().labels).toEqual([
    "1. Collaboration",
    "2. Critère très long qui doit rest…",
    "3. Amélioration",
  ]);
  expect(chartData().datasets).toHaveLength(0);
  expect(
    screen
      .getAllByRole("checkbox")
      .every((item) => !(item as HTMLInputElement).checked),
  ).toBe(true);
  const options = JSON.parse(
    screen.getByRole("img").getAttribute("data-options")!,
  );
  expect(options.scales.r).toMatchObject({ min: 0, max: 10 });
  expect(
    screen.getByRole("rowheader", {
      name: `2. ${resultComparison.axes[1].text}`,
    }),
  ).toBeVisible();

  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  expect(chartData().datasets).toHaveLength(1);
  expect(chartData().datasets[0]).toMatchObject({
    label: "1. Alpha",
    data: [0, 10, 7],
    fill: true,
  });
  const legend = screen.getByRole("list", { name: "Légende des équipes" });
  expect(within(legend).getByText("1. Alpha")).toBeVisible();
  expect(
    within(legend).getByText(
      completionDate(resultComparison.teams[0].completed_at),
    ),
  ).toBeVisible();
  expect(screen.getByRole("cell", { name: "0 / 10" })).toBeVisible();
  expect(screen.getByRole("cell", { name: "10 / 10" })).toBeVisible();

  fireEvent.click(screen.getByRole("checkbox", { name: /^Beta/ }));
  const [first, second] = chartData().datasets;
  expect(chartData().datasets).toHaveLength(2);
  expect(second).toMatchObject({
    label: "2. Beta",
    data: [10, 0, 5],
    fill: true,
  });
  expect(first.borderDash).not.toEqual(second.borderDash);
  expect(first.pointStyle).not.toEqual(second.pointStyle);
  expect(within(legend).getAllByRole("listitem")).toHaveLength(2);

  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  expect(chartData().datasets.map((series) => series.label)).toEqual([
    "2. Beta",
  ]);
  expect(within(legend).queryByText("1. Alpha")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Beta/ }));
  expect(chartData().datasets).toHaveLength(0);
  expect(chartData().labels).toHaveLength(3);
  expect(within(legend).queryAllByRole("listitem")).toHaveLength(0);
  expect(api.getResultComparison).toHaveBeenCalledTimes(1);
});

it("resets selected teams on a version change and updates chart contrast with the theme", async () => {
  const { rerender } = render(<ResultsPage theme="day" />);
  await chooseVersion();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  rerender(<ResultsPage theme="night" />);
  const options = JSON.parse(
    screen.getByRole("img").getAttribute("data-options")!,
  );
  expect(options.scales.r.pointLabels.color).toBe("#e5efec");
  api.getResultComparison.mockResolvedValueOnce({
    axes: [{ question_id: 99, index: 1, text: "Nouvelle version" }],
    teams: [resultComparison.teams[1]],
  });
  fireEvent.change(screen.getByLabelText("Modèle / version"), {
    target: { value: "2" },
  });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  await screen.findByRole("img");
  expect(chartData().labels).toEqual(["1. Nouvelle version"]);
  expect(chartData().datasets).toHaveLength(0);
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  fireEvent.change(screen.getByLabelText("Modèle / version"), {
    target: { value: "" },
  });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
