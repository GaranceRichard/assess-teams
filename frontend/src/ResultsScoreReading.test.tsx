import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ResultsViews } from "./ResultsViews";
import { resultFamilyComparison, resultHistory } from "./test/resultsFixture";

const history = vi.hoisted(() => vi.fn());
vi.mock("./results", () => ({ getCriterionHistory: history }));
vi.mock("react-chartjs-2", () => ({
  Radar: (props: { "aria-label": string }) => <canvas role="img" {...props} />,
  Line: (props: { "aria-label": string }) => <canvas role="img" {...props} />,
}));

it("explains scores, real zero, missing observations and business recency in every restitution", async () => {
  history.mockResolvedValue({
    ...resultHistory,
    teams: resultHistory.teams.map((team, index) => ({
      ...team,
      points: index === 0 ? team.points : team.points.slice(0, 1),
    })),
  });
  render(
    <ResultsViews
      comparison={resultFamilyComparison}
      familyId={4}
      selected={[10, 20]}
      theme="day"
    />,
  );
  const help = screen.getByRole("button", {
    name: "Scores 0–10 : mode d’emploi",
  });
  for (const temporal of [false, true]) {
    if (temporal) {
      fireEvent.click(screen.getByRole("switch", { name: "Analyse" }));
      fireEvent.change(screen.getByLabelText("Critère"), {
        target: { value: "1" },
      });
      await screen.findByRole("table");
    }
    for (const detailed of [false, true]) {
      fireEvent.click(
        screen.getByRole("tab", {
          name: detailed ? "Données détaillées" : "Graphique",
        }),
      );
      fireEvent.click(help);
      const dialog = screen.getByRole("dialog", {
        name: "Comprendre les résultats",
      });
      expect(dialog).toHaveTextContent(/0 est le minimum, 10 le maximum/);
      expect(dialog).toHaveTextContent(/0\/10 est une note réellement mesurée/);
      expect(dialog).toHaveTextContent(
        /cellule vide.*aucune observation à ce rang/,
      );
      expect(dialog).toHaveTextContent(/date de complétion initiale/);
      expect(dialog).toHaveTextContent(
        /un lien ne garantit pas un sens identique des notes/,
      );
      expect(dialog).toHaveTextContent(/révision.*ne déplace pas cette date/);
      expect(dialog).toHaveTextContent(
        /ne prouvent pas une progression continue/,
      );
      expect(dialog).toHaveTextContent(
        /anciennes versions sans lien démontré restent séparées/,
      );
      fireEvent.click(within(dialog).getByRole("button", { name: "Fermer" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  }
  const cells = within(screen.getByRole("table")).getAllByRole("cell");
  expect(cells.at(-1)).toBeEmptyDOMElement();
  expect(cells.some((cell) => cell.textContent?.includes("0/10"))).toBe(true);
});
