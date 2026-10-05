import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import { evaluationRunFixture } from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({
  saveEvaluationScore: vi.fn(),
  finalizeEvaluationRun: vi.fn(),
  reviseEvaluationRun: vi.fn(),
}));
vi.mock("./evaluationRuns", () => api);

beforeEach(() => vi.clearAllMocks());

it("freezes the proposed score while Next saves it, then permits the next question", async () => {
  let resolveSave!: () => void;
  api.saveEvaluationScore.mockReturnValueOnce(
    new Promise<void>((resolve) => {
      resolveSave = resolve;
    }),
  );
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, 5),
  );
  expect(screen.getByRole("slider")).toBeDisabled();
  expect(screen.getByText("Question 1 / 2")).toBeVisible();
  expect(screen.getByRole("button", { name: "Fermer" })).toBeDisabled();
  await act(async () => resolveSave());
  expect(await screen.findByText("Question 2 / 2")).toBeVisible();
  expect(screen.getByRole("slider")).toBeEnabled();
});

it("keeps the same question and restores editing after Next fails to save", async () => {
  api.saveEvaluationScore.mockRejectedValueOnce(new Error("offline"));
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "La note n’a pas été enregistrée",
  );
  expect(screen.getByText("Question 1 / 2")).toBeVisible();
  expect(screen.getByRole("slider")).toBeEnabled();
  expect(screen.getByRole("button", { name: "Fermer" })).toBeDisabled();
  expect(api.finalizeEvaluationRun).not.toHaveBeenCalled();
});
