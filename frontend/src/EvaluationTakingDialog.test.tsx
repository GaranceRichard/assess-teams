import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import {
  completedRunFixture,
  evaluationRunFixture,
} from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({
  saveEvaluationScore: vi.fn(),
  finalizeEvaluationRun: vi.fn(),
  reviseEvaluationRun: vi.fn(),
}));
vi.mock("./evaluationRuns", () => api);

beforeEach(() => {
  vi.clearAllMocks();
  api.saveEvaluationScore.mockResolvedValue(undefined);
  api.finalizeEvaluationRun.mockResolvedValue(completedRunFixture);
  api.reviseEvaluationRun.mockResolvedValue(completedRunFixture);
});

it("shows one ordered question, persists both inclusive bounds, and finalizes only complete answers", async () => {
  const onClose = vi.fn();
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={onClose}
    />,
  );
  expect(screen.getByText("Question 1 / 2")).toBeVisible();
  expect(screen.queryByText("Deuxième question")).toBeNull();
  const slider = screen.getByRole("slider");
  expect(slider).toHaveAttribute("min", "0");
  expect(slider).toHaveAttribute("max", "10");
  expect(slider).toHaveAttribute("step", "1");
  expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  fireEvent.change(slider, { target: { value: "0" } });
  await waitFor(() =>
    expect(api.saveEvaluationScore).toHaveBeenCalledWith(1, 11, 0),
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Suivant" })).toBeEnabled(),
  );
  expect(screen.getByText("Note sélectionnée : 0 / 10")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.getByText("Question 2 / 2")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Valider l’évaluation" }),
  ).toBeDisabled();
  fireEvent.change(screen.getByRole("slider"), { target: { value: "10" } });
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Valider l’évaluation" }),
    ).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(screen.getByRole("slider")).toHaveValue("0");
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  fireEvent.click(screen.getByRole("button", { name: "Valider l’évaluation" }));
  await waitFor(() =>
    expect(onClose).toHaveBeenCalledWith(completedRunFixture),
  );
  expect(api.finalizeEvaluationRun).toHaveBeenCalledWith(1);
});

it("resumes at the unanswered question and reports save failure with a working retry", async () => {
  api.saveEvaluationScore.mockRejectedValueOnce(new Error("offline"));
  const onClose = vi.fn();
  const run = {
    ...evaluationRunFixture,
    questions: evaluationRunFixture.questions.map((q, i) => ({
      ...q,
      score: i === 0 ? 0 : null,
    })),
  };
  render(
    <EvaluationTakingDialog run={run} revision={false} onClose={onClose} />,
  );
  expect(screen.getByText("Question 2 / 2")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer la note" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "n’a pas été enregistrée",
  );
  expect(screen.getByRole("button", { name: "Fermer" })).toBeDisabled();
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Réessayer la sauvegarde" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Fermer" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
  expect(onClose.mock.calls[0][0].questions[1].score).toBe(5);
});

it("serializes rapid slider changes and blocks closing until the last save completes", async () => {
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
  fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
  fireEvent.change(screen.getByRole("slider"), { target: { value: "9" } });
  expect(screen.getByText("Note sélectionnée : 9 / 10")).toBeVisible();
  expect(screen.getByRole("button", { name: "Fermer" })).toBeDisabled();
  await waitFor(() => expect(api.saveEvaluationScore).toHaveBeenCalledTimes(1));
  await act(async () => resolveSave());
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Fermer" })).toBeEnabled(),
  );
  expect(api.saveEvaluationScore.mock.calls).toEqual([
    [1, 11, 1],
    [1, 11, 9],
  ]);
});

it("provides completed consultation without writes and allows native dialog cancellation", () => {
  const onClose = vi.fn();
  render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision={false}
      onClose={onClose}
    />,
  );
  expect(screen.getByRole("slider")).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.queryByRole("button", { name: /Valider/ })).toBeNull();
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(onClose).toHaveBeenCalledWith(completedRunFixture);
  expect(api.saveEvaluationScore).not.toHaveBeenCalled();
});

it("stages Admin revisions, validates atomically, and surfaces finalization refusals", async () => {
  api.reviseEvaluationRun.mockRejectedValueOnce(new Error("refused"));
  const onClose = vi.fn();
  render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision
      onClose={onClose}
    />,
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "10" } });
  expect(api.saveEvaluationScore).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  fireEvent.click(screen.getByRole("button", { name: "Valider la révision" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "validation a été refusée",
  );
  fireEvent.click(screen.getByRole("button", { name: "Valider la révision" }));
  await waitFor(() =>
    expect(onClose).toHaveBeenCalledWith(completedRunFixture),
  );
  expect(api.reviseEvaluationRun.mock.calls[0][1][0].score).toBe(10);
});

it("saves the proposed score when advancing and remains on the question after a save refusal", async () => {
  api.saveEvaluationScore.mockRejectedValueOnce(new Error("offline"));
  render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  await screen.findByRole("alert");
  expect(screen.getByText("Question 1 / 2")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(await screen.findByText("Question 2 / 2")).toBeVisible();
});
