import { fireEvent, render, screen, within } from "@testing-library/react";
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
it("Superadmin explicitly chooses organization; changing it clears model, teams and longitudinal", async () => {
  api.listResultOrganizations.mockResolvedValueOnce(resultOrganizations);
  render(
    <ResultsPage actor={{ ...resultActor, is_superuser: true }} theme="day" />,
  );
  await screen.findByRole("option", { name: "North" });
  expect(screen.getByLabelText("Organisation")).toHaveValue("");
  expect(api.listResultFamilies).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  await choose();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
  await screen.findByRole("img", { name: /Évolution/ });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Retour au radar" }),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Modèle")).toHaveValue("");
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  await screen.findByRole("option", { name: "Maturité" });
  expect(api.listResultFamilies).toHaveBeenLastCalledWith(2);
  expect(
    within(screen.getByLabelText("Modèle")).getAllByRole("option"),
  ).toHaveLength(3);
});
