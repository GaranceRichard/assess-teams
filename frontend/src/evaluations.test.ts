import { afterEach, expect, it, vi } from "vitest";

import {
  createEvaluation,
  createQuestion,
  deleteEvaluation,
  deleteQuestion,
  listEvaluations,
  listQuestions,
  updateEvaluation,
  updateQuestion,
} from "./evaluations";

const entity = { id: 4, name: "Référentiel" };
const evaluationInput = { name: "Référentiel" };
const questionInput = { name: "Question" };

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

it("calls every evaluation and question endpoint with CSRF", async () => {
  document.cookie = "csrftoken=evaluation-token";
  const fetchMock = vi.spyOn(globalThis, "fetch");
  for (const status of [200, 201, 200, 204, 200, 201, 200, 204]) {
    fetchMock.mockResolvedValueOnce(
      status === 204
        ? new Response(null, { status })
        : new Response(JSON.stringify(status === 200 ? [entity] : entity), {
            status,
          }),
    );
  }

  await listEvaluations();
  await createEvaluation(evaluationInput);
  await updateEvaluation(4, evaluationInput);
  await deleteEvaluation(4);
  await listQuestions(4);
  await createQuestion(4, questionInput);
  await updateQuestion(7, questionInput);
  await deleteQuestion(7);

  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    "/api/admin/evaluations/",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(evaluationInput),
      headers: expect.objectContaining({ "X-CSRFToken": "evaluation-token" }),
    }),
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    6,
    "/api/admin/evaluations/4/questions/",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(questionInput),
    }),
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    8,
    "/api/admin/questions/7/",
    expect.objectContaining({ method: "DELETE", body: undefined }),
  );
});

it("rejects an API error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 403 }),
  );

  await expect(listEvaluations()).rejects.toThrow("Evaluation request failed");
});
