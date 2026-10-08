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

it("persists marker level selection through the same API and keeps slider text and gaps exact", async () => {
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
  fireEvent.click(screen.getByRole("button", { name: "8 sur 10 : Partagé" }));
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
