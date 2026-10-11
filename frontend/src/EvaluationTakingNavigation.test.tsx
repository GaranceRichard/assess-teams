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

it("leaves unanswered questions null when focusing, navigating and closing", () => {
  const onClose = vi.fn();
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={onClose}
    />,
  );
  expect(screen.getByText("Aucune note sélectionnée")).toBeVisible();
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "Aucune note sélectionnée",
  );
  fireEvent.focus(screen.getByRole("slider"));
  expect(
    screen.getByRole("button", { name: "Enregistrer la note" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.getByText("Question 2 / 2")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Valider l’évaluation" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(screen.getByText("Aucune note sélectionnée")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
  expect(onClose).toHaveBeenCalledWith(evaluationRunFixture);
  expect(api.saveEvaluationScore).not.toHaveBeenCalled();
  expect(api.finalizeEvaluationRun).not.toHaveBeenCalled();
});

it.each([
  ["Enter", 5],
  [" ", 5],
  ["Home", 0],
  ["End", 10],
  ["ArrowRight", 6],
  ["ArrowLeft", 4],
])("selects %s deliberately on an unanswered question", async (key, score) => {
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  fireEvent.keyDown(screen.getByRole("slider"), { key });
  expect(screen.getByText(`Note sélectionnée : ${score} / 10`)).toBeVisible();
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, score),
  );
});

it("does not infer an answer from unrelated keys or cancelled pointer gestures", () => {
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  const slider = screen.getByRole("slider");
  fireEvent.keyDown(slider, { key: "Tab" });
  fireEvent.pointerUp(slider, { button: 0 });
  fireEvent.pointerDown(slider, { button: 2 });
  fireEvent.pointerUp(slider, { button: 2 });
  fireEvent.pointerDown(slider, { button: 0 });
  fireEvent.pointerCancel(slider);
  fireEvent.pointerUp(slider, { button: 0 });
  expect(api.saveEvaluationScore).not.toHaveBeenCalled();
  expect(screen.getByText("Aucune note sélectionnée")).toBeVisible();
});

it("preserves resumed zero and five scores, skips a gap, and requires that gap for completion", async () => {
  const onClose = vi.fn();
  const run = {
    ...evaluationRunFixture,
    questions: [
      { ...evaluationRunFixture.questions[0], score: 0 },
      evaluationRunFixture.questions[1],
      {
        ...evaluationRunFixture.questions[0],
        question_id: 13,
        index: 3,
        score: 5,
      },
    ],
  };
  render(
    <EvaluationTakingDialog run={run} revision={false} onClose={onClose} />,
  );
  expect(screen.getByText("Question 2 / 3")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.getByText("Note sélectionnée : 5 / 10")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Valider l’évaluation" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(screen.getByText("Note sélectionnée : 0 / 10")).toBeVisible();
  expect(api.saveEvaluationScore).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("slider"), { target: { value: "5" } });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Fermer" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
  expect(
    onClose.mock.calls[0][0].questions.map(
      (q: { score: number | null }) => q.score,
    ),
  ).toEqual([5, null, 5]);
});
