import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { ChartData } from "chart.js";

import { ResultsPage } from "./ResultsPage";
import {
  resultActor,
  resultFamilies,
  resultFamilyComparison,
  resultHistory,
  resultOrganizations,
} from "./test/resultsFixture";

const api = vi.hoisted(() => ({
  listResultOrganizations: vi.fn(),
  listResultFamilies: vi.fn(),
  getFamilyComparison: vi.fn(),
  getCriterionHistory: vi.fn(),
}));
vi.mock("./results", () => api);
vi.mock("react-chartjs-2", () => ({
  Radar: ({
    data,
    options,
    ...props
  }: {
    data: ChartData;
    options: unknown;
  }) => (
    <canvas
      {...props}
      data-chart={JSON.stringify(data)}
      data-options={JSON.stringify(options)}
    />
  ),
  Line: ({
    data,
    options,
    ...props
  }: {
    data: ChartData;
    options: unknown;
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
  api.listResultOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockResolvedValue(resultFamilyComparison);
  api.getCriterionHistory.mockImplementation(
    (_family, _lineage, ids: number[]) =>
      Promise.resolve({
        ...resultHistory,
        teams: resultHistory.teams.filter((t) => ids.includes(t.team_id)),
      }),
  );
});
async function choose() {
  await screen.findByRole("option", { name: "Maturité" });
  fireEvent.change(screen.getByLabelText("Modèle"), { target: { value: "4" } });
  await screen.findByRole("img");
}
it("loads history only on criterion opening and returns with model and team selections intact", async () => {
  render(<ResultsPage actor={resultActor} theme="day" />);
  await choose();
  expect(screen.getByLabelText("Organisation")).toBeDisabled();
  expect(screen.getByText(/Version radar : v2/)).toBeVisible();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  fireEvent.click(screen.getByRole("checkbox", { name: /^Beta/ }));
  expect(api.getCriterionHistory).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
  const chart = await screen.findByRole("img", {
    name: /Évolution de Collaboration/,
  });
  const data = JSON.parse(chart.getAttribute("data-chart")!);
  expect(data.datasets).toHaveLength(2);
  expect(data.datasets[0].data.map((point: { y: number }) => point.y)).toEqual([
    2, 0,
  ]);
  expect(data.datasets[0].data[0].x).toBe(
    new Date("2026-09-01T12:00:00Z").getTime(),
  );
  expect(data.datasets[0]).toMatchObject({
    tension: 0,
    fill: false,
    spanGaps: false,
  });
  expect(api.getCriterionHistory).toHaveBeenCalledWith(
    4,
    resultHistory.lineage_id,
    [10, 20],
  );
  expect(
    screen.getByRole("table", {
      name: "Observations historiques du critère sélectionné",
    }),
  ).toBeVisible();
  expect(screen.getAllByRole("cell", { name: "v1" })).toHaveLength(2);
  expect(screen.getAllByRole("cell", { name: "v2" })).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Retour au radar" }));
  const radar = await screen.findByRole("img", { name: /Radar des résultats/ });
  expect(JSON.parse(radar.getAttribute("data-chart")!).datasets).toHaveLength(
    2,
  );
  expect(screen.getByLabelText("Modèle")).toHaveValue("4");
  expect(
    screen
      .getAllByRole("checkbox")
      .every((box) => (box as HTMLInputElement).checked),
  ).toBe(true);
  expect(api.getFamilyComparison).toHaveBeenCalledTimes(1);
});
it("shows zero selected teams without inventing any observation", async () => {
  render(<ResultsPage actor={resultActor} theme="day" />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
  expect(
    await screen.findByText(
      "Aucune observation compatible pour les équipes sélectionnées.",
    ),
  ).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(api.getCriterionHistory).toHaveBeenCalledWith(
    4,
    resultHistory.lineage_id,
    [],
  );
});
it("shows history failures and lets the user return to the radar", async () => {
  api.getCriterionHistory.mockRejectedValueOnce(new Error("404"));
  render(<ResultsPage actor={resultActor} theme="night" />);
  await choose();
  fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger l’historique",
  );
  fireEvent.click(screen.getByRole("button", { name: "Retour au radar" }));
  expect(await screen.findByRole("img")).toBeVisible();
});
it.each(["success", "error"])(
  "ignores obsolete history %s after changing team selection",
  async (outcome) => {
    let resolve!: (data: unknown) => void;
    let reject!: (error: Error) => void;
    api.getCriterionHistory.mockReturnValueOnce(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    );
    render(<ResultsPage actor={resultActor} theme="day" />);
    await choose();
    fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
    fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
    expect(screen.getByRole("status")).toHaveTextContent("historique");
    fireEvent.click(screen.getByRole("checkbox", { name: /^Beta/ }));
    await screen.findByRole("img");
    await act(async () => {
      if (outcome === "success") resolve({ ...resultHistory, teams: [] });
      else reject(new Error("old request"));
    });
    expect(screen.getByRole("img")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
