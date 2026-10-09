import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsHistory } from "./ResultsHistory";
import { ResultsViews } from "./ResultsViews";
import { resultFamilyComparison, resultHistory } from "./test/resultsFixture";

const history = vi.hoisted(() => vi.fn());
vi.mock("./results", () => ({ getCriterionHistory: history }));
vi.mock("react-chartjs-2", () => ({
  Radar: (props: { "aria-label": string }) => <canvas role="img" {...props} />,
  Line: (props: { "aria-label": string }) => <canvas role="img" {...props} />,
}));

beforeEach(() => history.mockReset().mockResolvedValue(resultHistory));

it("changes the displayed analysis through a controlled, labelled selector in all four combinations", async () => {
  render(
    <ResultsViews
      comparison={resultFamilyComparison}
      familyId={4}
      selected={[10, 20]}
      theme="day"
    />,
  );
  const analysis = screen.getByRole("combobox", { name: "Analyse" });
  expect(analysis).toHaveAttribute(
    "aria-controls",
    screen.getByRole("tabpanel").id,
  );
  expect(analysis).toHaveValue("radar");
  expect(screen.getByRole("img")).toHaveAccessibleName(/Radar/);
  fireEvent.change(analysis, { target: { value: "temporal" } });
  expect(analysis).toHaveValue("temporal");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Critère")).toBeVisible();
  expect(history).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Critère"), {
    target: { value: "1" },
  });
  await screen.findByRole("img", { name: /Évolution de Collaboration/ });
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByRole("table")).toHaveAccessibleName(
    /Observations historiques/,
  );
  fireEvent.change(analysis, { target: { value: "radar" } });
  expect(screen.getByRole("table")).toHaveAccessibleName(/Critères et scores/);
  fireEvent.click(screen.getByRole("tab", { name: "Graphique" }));
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("img")).toHaveAccessibleName(/Radar/);
  fireEvent.change(analysis, { target: { value: "temporal" } });
  expect(screen.getByLabelText("Critère")).toHaveValue("1");
  await screen.findByRole("img", { name: /Évolution de Collaboration/ });
});

it("renders chronological, independent team columns with blank missing cells and real zero scores", async () => {
  const point = resultHistory.teams[0].points[0];
  const points = [
    { ...point, run_id: 6, score: 0, completed_at: "2026-09-05T13:00:00" },
    { ...point, run_id: 4, score: 3, completed_at: "2026-08-04T03:00:00" },
    { ...point, run_id: 5, score: 4, completed_at: "2026-09-05T13:00:00" },
  ];
  history.mockResolvedValue({
    ...resultHistory,
    teams: [
      { team_id: 10, team_name: "Aurore", points },
      {
        team_id: 20,
        team_name: "Boréal",
        points: [{ ...point, score: 8, completed_at: "2026-07-01T09:15:00" }],
      },
      { team_id: 30, team_name: "Canopée", points: [] },
    ],
  });
  render(
    <ResultsHistory
      familyId={4}
      criterion={resultFamilyComparison.axes[0]}
      teams={resultFamilyComparison.teams}
      selected={[10, 20, 30]}
      theme="day"
      detailed
    />,
  );
  const table = await screen.findByRole("table");
  expect(
    within(table)
      .getAllByRole("columnheader")
      .map((cell) => cell.textContent),
  ).toEqual(["Aurore", "Boréal", "Canopée"]);
  const rows = within(table).getAllByRole("row").slice(1);
  expect(
    rows.map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ),
  ).toEqual([
    ["3/10 (04/08/2026 - 03:00)", "8/10 (01/07/2026 - 09:15)", ""],
    ["4/10 (05/09/2026 - 13:00)", "", ""],
    ["0/10 (05/09/2026 - 13:00)", "", ""],
  ]);
  expect(rows[0].querySelector("time")).toHaveAttribute(
    "datetime",
    points[1].completed_at,
  );
  expect(points.map((item) => item.run_id)).toEqual([6, 4, 5]);
});

it("keeps empty historical series empty without inventing a zero observation", async () => {
  history.mockResolvedValue({
    ...resultHistory,
    teams: [{ team_id: 10, team_name: "Aurore", points: [] }],
  });
  render(
    <ResultsHistory
      familyId={4}
      criterion={resultFamilyComparison.axes[0]}
      teams={resultFamilyComparison.teams}
      selected={[10]}
      theme="night"
      detailed
    />,
  );
  const table = await screen.findByRole("table");
  expect(
    within(table).getByRole("columnheader", { name: "Aurore" }),
  ).toBeVisible();
  expect(within(table).queryAllByRole("cell")).toHaveLength(0);
  expect(screen.getByText(/Aucune observation compatible/)).toBeVisible();
});
