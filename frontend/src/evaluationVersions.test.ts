import { afterEach, expect, it, vi } from "vitest";
import {
  createEvaluationVersion,
  mergeEvaluation,
  type Evaluation,
} from "./evaluations";
import { referenceLabel } from "./evaluationVersionLabel";

const first: Evaluation = {
  id: 1,
  name: "Agile",
  organization_id: 1,
  family_id: 1,
  family_name: "Agile",
  version: 1,
  status: "VALIDATED",
};
afterEach(() => vi.restoreAllMocks());
it("calls version creation with CSRF and no writable family or version", async () => {
  document.cookie = "csrftoken=version-token";
  const second = { ...first, id: 2, version: 2, status: "DRAFT" };
  const request = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(second), { status: 201 }));
  expect(await createEvaluationVersion(1)).toEqual(second);
  expect(request).toHaveBeenCalledWith(
    "/api/admin/evaluations/1/versions/",
    expect.objectContaining({
      method: "POST",
      body: undefined,
      headers: expect.objectContaining({ "X-CSRFToken": "version-token" }),
    }),
  );
  document.cookie = "csrftoken=; Max-Age=0";
});
it("refuses an API error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 404 }),
  );
  await expect(createEvaluationVersion(1)).rejects.toThrow(
    "Evaluation request failed",
  );
});
it("archives only the sibling active version while merging the saved version", () => {
  const second: Evaluation = { ...first, id: 2, version: 2, status: "DRAFT" };
  const other: Evaluation = { ...first, id: 3, family_id: 2 };
  const state = [first, second, other];
  const updated = mergeEvaluation(state, { ...second, status: "VALIDATED" });
  expect(updated.map((item) => item.status)).toEqual([
    "ARCHIVED",
    "VALIDATED",
    "VALIDATED",
  ]);
  expect(state[0].status).toBe("VALIDATED");
  expect(mergeEvaluation([first], second)).toEqual([first, second]);
});
it("identifies historical references by their exact version", () => {
  expect(
    referenceLabel({
      family_name: "Agile",
      evaluation_name: "Agile",
      evaluation_version: 1,
    }),
  ).toBe("Agile v1");
});

it("keeps a historical name snapshot readable alongside the family and version", () => {
  expect(
    referenceLabel({
      family_name: "Agile",
      evaluation_name: "Historic name",
      evaluation_version: 1,
    }),
  ).toBe("Historic name · Agile v1");
});
