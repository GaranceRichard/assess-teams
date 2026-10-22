import { render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ResultsContext } from "./ResultsContext";
import { ResultsDetails } from "./ResultsDetails";
import { ResultsHistoryTable } from "./ResultsHistoryTable";
import { resultComparison, resultHistory } from "./test/resultsFixture";

it("keeps the authorized source beside the selected team's completion in detailed radar", () => {
  render(
    <ResultsDetails
      {...resultComparison}
      selected={[10]}
      onCriterion={vi.fn()}
    />,
  );
  const header = screen.getByRole("columnheader", { name: /^Alpha/ });
  expect(within(header).getByText("Passation n°101")).toBeVisible();
  expect(header.querySelector("time")).toHaveAttribute(
    "datetime",
    resultComparison.teams[0].completed_at,
  );
  expect(screen.queryByText("Passation n°102")).not.toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "0 / 10" })).toBeVisible();
});

it("makes each historical version and source readable without hovering", () => {
  render(<ResultsHistoryTable history={resultHistory} />);
  const cell = screen.getAllByRole("cell")[0];
  expect(within(cell).getByText("v1 · Passation n°91")).toBeVisible();
  expect(cell.querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-09-01T12:00:00Z",
  );
  expect(cell.querySelector("span")).toHaveAttribute(
    "title",
    "Alpha · v1 · Ancienne collaboration",
  );
});

it("never substitutes a version when no usable result was returned", () => {
  const { rerender } = render(
    <ResultsContext version={2}>Contexte autorisé</ResultsContext>,
  );
  expect(screen.getByText("Version radar : v2")).toBeVisible();
  rerender(<ResultsContext>Contexte autorisé</ResultsContext>);
  expect(screen.queryByText(/Version radar/)).not.toBeInTheDocument();
});
