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
  ResultsHistory: (p: { onBack: () => void }) => (
    <button onClick={p.onBack}>Retour au radar</button>
  ),
}));
import { DemoResults } from "./DemoResults";
it("sélectionne, désélectionne et ouvre la trajectoire puis revient", () => {
  window.location.hash = "#/results";
  render(<DemoResults theme="day" />);
  expect(screen.getByText("Radar 3")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  expect(screen.getByText("Radar 2")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  fireEvent.click(screen.getByText("Radar 3"));
  fireEvent.click(screen.getByText("Retour au radar"));
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
