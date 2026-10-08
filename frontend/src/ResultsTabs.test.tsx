import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsPage } from "./ResultsPage";
import {
  resultActor,
  resultFamilies,
  resultFamilyComparison,
  resultOrganizations,
} from "./test/resultsFixture";

const api = vi.hoisted(() => ({
  listResultOrganizations: vi.fn(),
  listResultFamilies: vi.fn(),
  getFamilyComparison: vi.fn(),
}));
vi.mock("./results", () => api);
vi.mock("react-chartjs-2", () => ({
  Radar: (props: { "aria-label": string }) => (
    <canvas role="img" aria-label={props["aria-label"]} />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.listResultOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockResolvedValue(resultFamilyComparison);
});

async function open() {
  render(<ResultsPage actor={resultActor} theme="day" />);
  await screen.findByRole("option", { name: "Maturité" });
  fireEvent.change(screen.getByLabelText("Modèle"), { target: { value: "4" } });
  await screen.findByRole("img");
}

it("separates radar from scores and preserves shared selections when switching views", async () => {
  await open();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /^Alpha/ }));
  fireEvent.click(screen.getByRole("tab", { name: "Résultats détaillés" }));
  expect(
    screen.getByRole("tabpanel", { name: "Résultats détaillés" }),
  ).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  const table = screen.getByRole("table");
  expect(
    within(table)
      .getByRole("columnheader", { name: /Alpha/ })
      .querySelector("time"),
  ).toHaveAttribute("datetime", resultFamilyComparison.teams[0].completed_at);
  expect(within(table).getByRole("cell", { name: "0 / 10" })).toBeVisible();
  expect(
    within(table).queryByRole("columnheader", { name: /Beta/ }),
  ).not.toBeInTheDocument();
  expect(
    within(table).getByRole("rowheader", { name: /Critère très long/ }),
  ).toHaveTextContent(resultFamilyComparison.axes[1].text);
  fireEvent.click(screen.getByRole("checkbox", { name: /^Beta/ }));
  expect(
    within(table).getByRole("columnheader", { name: /Beta/ }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("tab", { name: "Radar" }));
  expect(screen.getByRole("img")).toHaveAccessibleName(/2 équipe/);
  expect(screen.getByLabelText("Modèle")).toHaveValue("4");
  expect(screen.getByLabelText("Organisation")).toHaveValue("1");
  expect(api.getFamilyComparison).toHaveBeenCalledTimes(1);
});

it("supports arrow, Home and End keys with roving focus and does not invent scores with no team selected", async () => {
  await open();
  const radar = screen.getByRole("tab", { name: "Radar" });
  const details = screen.getByRole("tab", { name: "Résultats détaillés" });
  radar.focus();
  fireEvent.keyDown(radar, { key: "ArrowRight" });
  expect(details).toHaveFocus();
  expect(details).toHaveAttribute("aria-selected", "true");
  expect(radar).toHaveAttribute("tabindex", "-1");
  expect(screen.getByRole("table")).toBeVisible();
  expect(screen.queryAllByRole("cell")).toHaveLength(0);
  expect(
    screen.getByText(
      "Sélectionnez une ou plusieurs équipes pour les comparer.",
    ),
  ).toBeVisible();
  fireEvent.keyDown(details, { key: "ArrowLeft" });
  expect(radar).toHaveFocus();
  fireEvent.keyDown(radar, { key: "End" });
  expect(details).toHaveFocus();
  fireEvent.keyDown(details, { key: "Home" });
  expect(radar).toHaveFocus();
  fireEvent.keyDown(radar, { key: "Tab" });
  expect(radar).toHaveAttribute("aria-selected", "true");
});

it("never offers tabs or stale scores when the comparison is refused", async () => {
  api.getFamilyComparison.mockRejectedValue(new Error("403"));
  render(<ResultsPage actor={resultActor} theme="day" />);
  await screen.findByRole("option", { name: "Maturité" });
  fireEvent.change(screen.getByLabelText("Modèle"), { target: { value: "4" } });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les résultats",
  );
  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
