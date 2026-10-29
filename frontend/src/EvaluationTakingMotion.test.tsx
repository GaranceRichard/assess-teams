import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import {
  completedRunFixture,
  evaluationRunFixture,
} from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({ saveEvaluationScore: vi.fn() }));
vi.mock("./evaluationRuns", () => api);
beforeEach(() => {
  api.saveEvaluationScore.mockReset();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());

it("moves only a committed question in its navigation direction, preserving question focus", async () => {
  const { container } = render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision
      onClose={vi.fn()}
    />,
  );
  const surface = container.querySelector('[data-axis="question"]')!;
  expect(surface).not.toHaveAttribute("data-direction");
  const title = screen.getByRole("heading", { level: 2 });
  const next = screen.getByRole("button", { name: "Suivant" });
  const save = screen.getByRole("button", { name: "Annuler la révision" });
  fireEvent.click(next);
  expect(surface).toHaveAttribute("data-direction", "next");
  const outgoing = container.querySelector(".transition-outgoing")!;
  expect(outgoing).toHaveTextContent(completedRunFixture.questions[0].text);
  expect(outgoing).toHaveAttribute("aria-hidden", "true");
  expect(outgoing.querySelector("[id]")).toBeNull();
  expect(screen.getAllByRole("slider")).toHaveLength(1);
  const live = surface.firstElementChild!;
  expect(screen.getByRole("heading", { level: 3 })).toHaveFocus();
  expect(screen.getByRole("heading", { level: 2 })).toBe(title);
  expect(screen.getByRole("button", { name: "Annuler la révision" })).toBe(
    save,
  );
  await waitFor(() =>
    expect(surface.querySelector(".transition-outgoing")).toBeNull(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  expect(surface).toHaveAttribute("data-direction", "previous");
  expect(surface.querySelectorAll(".transition-outgoing")).toHaveLength(1);
  expect(surface.firstElementChild).toBe(live);
  await waitFor(() =>
    expect(surface.querySelector(".transition-outgoing")).toBeNull(),
  );
  expect(surface).not.toHaveAttribute("data-moving");
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
