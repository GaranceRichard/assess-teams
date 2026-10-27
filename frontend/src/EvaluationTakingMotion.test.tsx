import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import {
  completedRunFixture,
  evaluationRunFixture,
} from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({ saveEvaluationScore: vi.fn() }));
vi.mock("./evaluationRuns", () => api);
beforeEach(() => {
  api.saveEvaluationScore.mockReset();
});

it("moves only a committed question in its navigation direction, preserving question focus", () => {
  const { container } = render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision
      onClose={vi.fn()}
    />,
  );
  const question = () => container.querySelector(".taking-question")!;
  expect(question()).not.toHaveAttribute("data-direction");
  const title = screen.getByRole("heading", { level: 2 });
  const next = screen.getByRole("button", { name: "Suivant" });
  const save = screen.getByRole("button", { name: "Annuler la révision" });
  fireEvent.click(next);
  expect(question()).toHaveAttribute("data-direction", "next");
  expect(screen.getByRole("heading", { level: 3 })).toHaveFocus();
  expect(screen.getByRole("heading", { level: 2 })).toBe(title);
  expect(screen.getByRole("button", { name: "Annuler la révision" })).toBe(
    save,
  );
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(question()).toHaveAttribute("data-direction", "previous");
  expect(screen.getByRole("heading", { level: 3 })).toHaveFocus();
});

it("does not start question motion on absent answers, pending writes or refused persistence", async () => {
  let rejectSave!: (error: Error) => void;
  api.saveEvaluationScore.mockReturnValue(
    new Promise((_, reject) => {
      rejectSave = reject;
    }),
  );
  const { container } = render(
    <EvaluationTakingDialog
      run={evaluationRunFixture}
      revision={false}
      onClose={vi.fn()}
    />,
  );
  const initial = container.querySelector(".taking-question");
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(container.querySelector(".taking-question")).toBe(initial);
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
  await waitFor(() => expect(api.saveEvaluationScore).toHaveBeenCalled());
  expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  rejectSave(new Error("Refused"));
  await screen.findByRole("alert");
  expect(screen.getByRole("button", { name: "Fermer" })).toBeDisabled();
  expect(container.querySelector(".taking-question")).toBe(initial);
  expect(initial).not.toHaveAttribute("data-direction");
  expect(screen.getByRole("slider")).toHaveValue("0");
});
