import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
vi.mock("../ResultsRadar", () => ({
  ResultsRadar: (p: {
    selected: number[];
    onCriterion: (c: object) => void;
  }) => (
    <button
      onClick={() => p.onCriterion({ text: "Communication", lineage_id: "2" })}
    >
      Radar {p.selected.length}
    </button>
  ),
}));
vi.mock("../ResultsHistory", () => ({
  ResultsHistory: (p: { detailed: boolean }) => (
    <p>{p.detailed ? "Historique détaillé" : "Courbe historique"}</p>
  ),
}));
import { DemoResults } from "./DemoResults";
it("sélectionne, désélectionne et ouvre la trajectoire puis revient", () => {
  window.location.hash = "#/results";
  render(<DemoResults theme="day" />);
  expect(screen.getByText("Radar 3")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  expect(screen.getByText("Radar 2")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  expect(screen.getAllByRole("checkbox")[0]).not.toBeChecked();
  fireEvent.click(screen.getByRole("tab", { name: "Graphique" }));
  expect(screen.getByText("Radar 2")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(screen.getByText("Radar 3"));
  expect(screen.getByText("Courbe historique")).toBeVisible();
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.getByText("Historique détaillé")).toBeVisible();
  fireEvent.click(screen.getByRole("tab", { name: "Graphique" }));
  fireEvent.change(screen.getByLabelText("Analyse"), {
    target: { value: "radar" },
  });
  expect(screen.getByText("Radar 3")).toBeInTheDocument();
  expect(screen.getByText(/observations « simulation »/)).toBeInTheDocument();
});
it("respecte le drill-down Pilotage par identifiant dans le fragment", () => {
  window.location.hash = "#/results?team_id=2";
  render(<DemoResults theme="night" />);
  expect(screen.getByText("Radar 1")).toBeInTheDocument();
});

it("ignore un identifiant de drill-down inaccessible", () => {
  window.location.hash = "#/results?team_id=999";
  render(<DemoResults theme="day" />);
  expect(screen.getByText("Radar 3")).toBeInTheDocument();
});
