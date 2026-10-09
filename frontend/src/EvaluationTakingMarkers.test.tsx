import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import { evaluationRunFixture } from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({
  saveEvaluationScore: vi.fn(),
  finalizeEvaluationRun: vi.fn(),
  reviseEvaluationRun: vi.fn(),
}));
vi.mock("./evaluationRuns", () => api);
beforeEach(() => {
  vi.clearAllMocks();
  api.saveEvaluationScore.mockResolvedValue(undefined);
});

it("persists slider selection through the same API and preserves the fallback below all bounds", async () => {
  const run = {
    ...evaluationRunFixture,
    questions: evaluationRunFixture.questions.map((q) => ({
      ...q,
      appreciation_markers: [{ score: 8, text: "Partagé" }],
    })),
  };
  render(
    <EvaluationTakingDialog run={run} revision={false} onClose={vi.fn()} />,
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "8" } });
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, 8),
  );
  expect(screen.getByRole("slider")).toHaveValue("8");
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "8 sur 10 : Partagé",
  );
  expect(screen.getByText(/Repère pour 8/).parentElement).toHaveTextContent(
    "Partagé",
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "7" } });
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, 7),
  );
  expect(screen.queryByText(/Repère pour/)).toBeNull();
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "7 sur 10",
  );
});

it("saves 6 while displaying the description for 5 in every score indication", async () => {
  const run = {
    ...evaluationRunFixture,
    questions: evaluationRunFixture.questions.map((q) => ({
      ...q,
      appreciation_markers: [
        { score: 7, text: "Autonome" },
        { score: 5, text: "Accompagné" },
      ],
    })),
  };
  render(
    <EvaluationTakingDialog run={run} revision={false} onClose={vi.fn()} />,
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "6" } });
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, 6),
  );
  expect(screen.getByRole("slider")).toHaveValue("6");
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "6 sur 10 : Accompagné",
  );
  expect(screen.getByText("Note sélectionnée : 6 / 10")).toBeVisible();
  expect(screen.getByText(/Repère pour 6/).parentElement).toHaveTextContent(
    "Accompagné",
  );
  expect(screen.queryByRole("tooltip", { hidden: true })).toBeNull();
});

it("preserves all eleven integer scores through the same saving API", async () => {
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  for (let score = 0; score <= 10; score++) {
    fireEvent.change(screen.getByRole("slider"), {
      target: { value: String(score) },
    });
    await waitFor(() =>
      expect(api.saveEvaluationScore).toHaveBeenLastCalledWith(1, 11, score),
    );
    expect(screen.getByRole("slider")).toHaveValue(String(score));
  }
});
