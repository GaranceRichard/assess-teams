import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

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
  Radar: ({ data, ...props }: { data: unknown }) => (
    <canvas {...props} data-chart={JSON.stringify(data)} />
  ),
  Line: () => <canvas role="img" aria-label="Historique" />,
}));
const archived = {
  evaluation_id: 1,
  version: 1,
  axes: [
    {
      question_id: 99,
      lineage_id: "old-lineage",
      index: 1,
      text: "Ancien critère",
    },
  ],
  teams: [
    {
      ...resultFamilyComparison.teams[0],
      team_id: 30,
      team_name: "Historique",
      scores: [0],
    },
  ],
};
beforeEach(() => {
  vi.clearAllMocks();
  api.listResultOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockImplementation((_family, version) =>
    Promise.resolve(version === 1 ? archived : resultFamilyComparison),
  );
  api.getCriterionHistory.mockResolvedValue({ ...resultHistory, teams: [] });
});
async function chooseFamily() {
  render(<ResultsPage actor={resultActor} theme="day" />);
  await screen.findByRole("option", { name: "Maturité" });
  fireEvent.change(screen.getByLabelText("Modèle"), { target: { value: "4" } });
  await screen.findByRole("img");
}
function selectVersion(value: string) {
  fireEvent.change(screen.getByLabelText("Version"), { target: { value } });
}
it("defaults to latest results, then shows archived snapshots and resets incompatible selections on return", async () => {
  await chooseFamily();
  expect(screen.getByLabelText("Version")).toHaveValue("2");
  expect(screen.getByRole("option", { name: "v1 — Archivée" })).toBeVisible();
  expect(screen.getByRole("option", { name: "v2 — Validée" })).toBeVisible();
  expect(screen.queryByRole("option", { name: /^v3/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  selectVersion("1");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  await screen.findByRole("img");
  expect(api.getFamilyComparison).toHaveBeenLastCalledWith(4, 1);
  expect(screen.getByText("Version radar : v1")).toBeVisible();
  expect(
    screen.queryByRole("checkbox", { name: /^Alpha/ }),
  ).not.toBeInTheDocument();
  const historical = screen.getByRole("checkbox", { name: /^Historique/ });
  expect(historical).not.toBeChecked();
  fireEvent.click(historical);
  expect(
    JSON.parse(screen.getByRole("img").getAttribute("data-chart")!).datasets[0]
      .data,
  ).toEqual([0]);
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.getByRole("cell", { name: "0 / 10" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "1. Ancien critère" }));
  await screen.findByText(
    "Aucune observation compatible pour les équipes sélectionnées.",
  );
  expect(api.getCriterionHistory).toHaveBeenLastCalledWith(
    4,
    "old-lineage",
    [30],
    1,
  );
  selectVersion("2");
  await screen.findByRole("img", { name: /Radar des résultats/ });
  expect(screen.getByText("Version radar : v2")).toBeVisible();
  expect(screen.queryByLabelText("Critère")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: /^Historique/ }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /^Alpha/ })).not.toBeChecked();
  expect(screen.getByLabelText("Organisation")).toHaveValue("1");
  expect(screen.getByLabelText("Modèle")).toHaveValue("4");
});
it("keeps a failed explicit archive selected without falling back to recent results", async () => {
  await chooseFamily();
  api.getFamilyComparison.mockRejectedValueOnce(new Error("404"));
  selectVersion("1");
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Version")).toHaveValue("1");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByText(/Version radar/)).not.toBeInTheDocument();
  expect(api.getFamilyComparison).toHaveBeenCalledTimes(2);
  selectVersion("2");
  await screen.findByRole("img");
});
it.each(["success", "error"])(
  "ignores an obsolete archived-version %s after selecting v2",
  async (outcome) => {
    await chooseFamily();
    let resolve!: (value: unknown) => void;
    let reject!: (reason: Error) => void;
    api.getFamilyComparison.mockReturnValueOnce(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    );
    selectVersion("1");
    selectVersion("2");
    await screen.findByRole("img");
    await act(async () => {
      if (outcome === "success") resolve(archived);
      else reject(new Error("obsolete"));
    });
    expect(screen.getByText("Version radar : v2")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: /^Historique/ }),
    ).not.toBeInTheDocument();
  },
);
