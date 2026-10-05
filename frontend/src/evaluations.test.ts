import { afterEach, expect, it, vi } from "vitest";

import {
  createEvaluation,
  archiveEvaluation,
  createQuestion,
  deleteEvaluation,
  deleteQuestion,
  listEvaluations,
  listQuestions,
  updateEvaluation,
  updateQuestion,
  validateEvaluation,
  orderQuestions,
} from "./evaluations";

const entity = { id: 4, name: "Référentiel" };
const evaluationInput = { name: "Référentiel", organization_id: 3 };
const nameInput = { name: "Question" };

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
  await updateEvaluation(4, nameInput);
  await deleteEvaluation(4);
  await listQuestions(4);
  await createQuestion(4, nameInput);
  await updateQuestion(7, nameInput);
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
      body: JSON.stringify(nameInput),
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

it("calls explicit lifecycle actions with CSRF and no status mutation body", async () => {
  document.cookie = "csrftoken=lifecycle-token";
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response(JSON.stringify({ ...entity, status: "VALIDATED" }), {
        status: 200,
      }),
  );
  await validateEvaluation(4);
  await archiveEvaluation(4);
  for (const [index, action] of ["validate", "archive"].entries()) {
    expect(fetchMock).toHaveBeenNthCalledWith(
      index + 1,
      `/api/admin/evaluations/4/${action}/`,
      expect.objectContaining({
        method: "POST",
        body: undefined,
        headers: expect.objectContaining({ "X-CSRFToken": "lifecycle-token" }),
      }),
    );
  }
});

it("orders questions by index then identity without changing input", () => {
  const items = [
    { id: 4, index: 2, name: "Later" },
    { id: 2, index: 1, name: "Second" },
    { id: 1, index: 1, name: "First" },
  ];
  expect(orderQuestions(items).map((item) => item.id)).toEqual([1, 2, 4]);
  expect(items[0].id).toBe(4);
});
