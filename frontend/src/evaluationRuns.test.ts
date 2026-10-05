import { afterEach, expect, it, vi } from "vitest";

import {
  completionDate,
  finalizeEvaluationRun,
  getEvaluationRun,
  listEvaluationRuns,
  reviseEvaluationRun,
  saveEvaluationScore,
  startEvaluationRun,
} from "./evaluationRuns";
import { evaluationRunFixture } from "./test/evaluationRunFixture";

afterEach(() => vi.restoreAllMocks());

it("uses the session API with CSRF and exact question-score contracts", async () => {
  document.cookie = "csrftoken=score-csrf";
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      async (_url, options) =>
        new Response(
          options?.method === "PUT" && String(_url).includes("responses/")
            ? null
            : JSON.stringify(evaluationRunFixture),
          { status: String(_url).includes("responses/") ? 204 : 200 },
        ),
    );
  await listEvaluationRuns();
  await getEvaluationRun(1);
  await startEvaluationRun(1);
  await saveEvaluationScore(1, 11, 0);
  await finalizeEvaluationRun(1);
  await reviseEvaluationRun(1, evaluationRunFixture.questions);
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    "/api/evaluations/",
    "/api/evaluations/1/",
    "/api/evaluations/1/",
    "/api/evaluations/1/responses/11/",
    "/api/evaluations/1/finalize/",
    "/api/evaluations/1/revision/",
  ]);
  expect(fetch.mock.calls[3][1]).toMatchObject({
    method: "PUT",
    credentials: "same-origin",
    headers: { "X-CSRFToken": "score-csrf" },
    body: JSON.stringify({ score: 0 }),
  });
  expect(JSON.parse(fetch.mock.calls[5][1]!.body as string)).toEqual({
    answers: [
      { question_id: 11, score: null },
      { question_id: 12, score: null },
    ],
  });
  expect(completionDate(null)).toBe("—");
  expect(completionDate("2026-10-05T12:00:00Z")).not.toBe("—");
});

it("rejects backend refusal and network failures", async () => {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(null, { status: 403 }))
    .mockRejectedValueOnce(new Error("offline"));
  await expect(startEvaluationRun(1)).rejects.toThrow("request failed");
  await expect(saveEvaluationScore(1, 11, 10)).rejects.toThrow("offline");
});
