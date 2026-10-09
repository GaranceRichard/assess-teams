import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsViews } from "./ResultsViews";
import { resultFamilyComparison, resultHistory } from "./test/resultsFixture";

const history = vi.hoisted(() => vi.fn());
vi.mock("./results", () => ({ getCriterionHistory: history }));
vi.mock("react-chartjs-2", () => ({
  Radar: (props: { "aria-label": string }) => (
    <canvas role="img" aria-label={props["aria-label"]} />
  ),
  Line: (props: { "aria-label": string }) => (
    <canvas role="img" aria-label={props["aria-label"]} />
  ),
}));
beforeEach(() => {
  history.mockReset().mockResolvedValue(resultHistory);
});
function open(axes = resultFamilyComparison.axes) {
  render(
    <ResultsViews
      comparison={{ ...resultFamilyComparison, axes }}
      familyId={4}
      selected={[10, 20]}
      theme="night"
    />,
  );
}
it("controls analysis selection and keeps restitution independent", async () => {
  open();
  const analysis = screen.getByRole("combobox", { name: "Analyse" });
  analysis.focus();
  fireEvent.change(analysis, { target: { value: "temporal" } });
  expect(analysis).toHaveFocus();
  expect(analysis).toHaveValue("temporal");
  expect(screen.getByRole("tab", { name: "Graphique" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByText(/Sélectionnez un critère/)).toBeVisible();
  expect(history).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Critère"), {
    target: { value: "2" },
  });
  expect(await screen.findByRole("table")).toBeVisible();
  expect(history).toHaveBeenLastCalledWith(
    4,
    resultFamilyComparison.axes[1].lineage_id,
    [10, 20],
  );
  fireEvent.click(screen.getByRole("tab", { name: "Graphique" }));
  expect(screen.getByRole("img")).toHaveAccessibleName(
    /Évolution de Critère très long/,
  );
  expect(screen.getByLabelText("Critère")).toHaveValue("2");
  expect(history).toHaveBeenCalledTimes(1);
  fireEvent.change(analysis, { target: { value: "radar" } });
  expect(analysis).toHaveFocus();
  expect(screen.getByRole("img")).toHaveAccessibleName(/Radar/);
  fireEvent.change(analysis, { target: { value: "temporal" } });
  expect(analysis).toHaveFocus();
  await screen.findByRole("img", { name: /Évolution de Critère très long/ });
  expect(screen.getByLabelText("Critère")).toHaveValue("2");
  fireEvent.change(screen.getByLabelText("Critère"), {
    target: { value: "1" },
  });
  await screen.findByRole("img", { name: /Évolution de Collaboration/ });
  expect(history).toHaveBeenLastCalledWith(
    4,
    resultFamilyComparison.axes[0].lineage_id,
    [10, 20],
  );
  fireEvent.change(screen.getByLabelText("Critère"), { target: { value: "" } });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText(/Sélectionnez un critère/)).toBeVisible();
});
it("never offers longitudinal continuity for a criterion without an explicit lineage", () => {
  open([{ question_id: 99, index: 1, text: "Historique incompatible" }]);
  fireEvent.change(screen.getByLabelText("Analyse"), {
    target: { value: "temporal" },
  });
  expect(
    screen.getByRole("option", { name: /Historique incompatible/ }),
  ).toBeDisabled();
  expect(history).not.toHaveBeenCalled();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
it("keeps a refused history visible across restitutions without presenting stale data", async () => {
  history.mockRejectedValueOnce(new Error("403"));
  open();
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  fireEvent.click(screen.getByRole("button", { name: "1. Collaboration" }));
  expect(screen.getByLabelText("Analyse")).toHaveFocus();
  expect(screen.getByLabelText("Analyse")).toHaveValue("temporal");
  expect(screen.getByRole("tab", { name: "Graphique" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("tab", { name: "Données détaillées" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Impossible de charger");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(history).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText("Analyse"), {
    target: { value: "radar" },
  });
  await waitFor(() => expect(screen.getByRole("table")).toBeVisible());
});
