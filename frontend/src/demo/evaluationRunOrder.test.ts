import { beforeEach, expect, it } from "vitest";
import { listEvaluationRuns } from "./evaluationRuns";
import { resetDemo, state } from "./store";

beforeEach(resetDemo);
it("orders pending fictional creations before newest completions without mutating stored rows", async () => {
  state.runs[0].state = "completed";
  state.runs[0].completed_at = "2026-10-01T12:00:00Z";
  state.runs[2].state = "completed";
  state.runs[2].completed_at = "2026-10-02T12:00:00Z";
  expect((await listEvaluationRuns()).map((run) => run.id)).toEqual([2, 3, 1]);
  expect(state.runs.map((run) => run.id)).toEqual([1, 2, 3]);
  state.runs[0].completed_at = state.runs[2].completed_at;
  expect((await listEvaluationRuns()).map((run) => run.id)).toEqual([2, 1, 3]);
  state.runs[0].completed_at = null;
  expect((await listEvaluationRuns()).map((run) => run.id)).toEqual([2, 3, 1]);
  state.runs[2].completed_at = null;
  expect((await listEvaluationRuns()).map((run) => run.id)).toEqual([2, 1, 3]);
  state.runs[0].state = "in_progress";
  expect((await listEvaluationRuns()).map((run) => run.id)).toEqual([1, 2, 3]);
});
