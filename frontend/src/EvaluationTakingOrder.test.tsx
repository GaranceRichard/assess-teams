import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { EvaluationTakingPage } from "./EvaluationTakingPage";
import type { EvaluationRun } from "./evaluationRuns";
import { evaluationRunFixture } from "./test/evaluationRunFixture";
import { user } from "./demo/fixtures";

const api = vi.hoisted(() => ({
  listEvaluationRuns: vi.fn(),
  startEvaluationRun: vi.fn(),
}));
vi.mock("./evaluationRuns", async (original) => ({
  ...(await original<typeof import("./evaluationRuns")>()),
  ...api,
}));
vi.mock("./EvaluationTakingDialog", () => ({
  EvaluationTakingDialog: ({
    run,
    onClose,
  }: {
    run: EvaluationRun;
    onClose: (run: EvaluationRun) => void;
  }) => (
    <button
      onClick={() =>
        onClose({
          ...run,
          state: "completed",
          completed_at: "2026-10-26T12:00:00Z",
        })
      }
    >
      Compléter
    </button>
  ),
}));
beforeEach(() => vi.clearAllMocks());

it.each([3, 21])(
  "reloads the globally ordered page after completion among %s runs",
  async (count) => {
    const rows = Array.from({ length: count }, (_, i) => ({
      ...evaluationRunFixture,
      id: i + 1,
      family_name: `Modèle ${i + 1}`,
      evaluation_name: `Modèle ${i + 1}`,
    }));
    const first = rows.slice(0, 20);
    api.listEvaluationRuns.mockResolvedValue({
      count,
      results: first,
      next: null,
      previous: null,
    });
    api.startEvaluationRun.mockResolvedValue(rows[0]);
    render(<EvaluationTakingPage actor={user} />);
    await screen.findByText("Modèle 1 v1");
    fireEvent.click(
      screen.getAllByRole("button", { name: "Reprendre l’évaluation" })[0],
    );
    await screen.findByRole("button", { name: "Compléter" });
    const completed = {
      ...rows[0],
      state: "completed",
      completed_at: "2026-10-26T12:00:00Z",
    };
    const expected = [...rows.slice(1), completed].slice(0, 20);
    api.listEvaluationRuns.mockResolvedValue({
      count,
      results: expected,
      next: null,
      previous: null,
    });
    const loads = api.listEvaluationRuns.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Compléter" }));
    await waitFor(() =>
      expect(api.listEvaluationRuns.mock.calls.length).toBeGreaterThan(loads),
    );
    await screen.findByText(`Modèle ${count > 20 ? 21 : 1} v1`);
    expect(
      Array.from(document.querySelectorAll("tbody tr td:first-child")).map(
        (cell) => cell.textContent,
      ),
    ).toEqual(expected.map((row) => `${row.family_name} v1`));
    expect(api.listEvaluationRuns).toHaveBeenLastCalledWith(1);
  },
);
