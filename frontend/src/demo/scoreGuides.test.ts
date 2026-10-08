import { beforeEach, expect, it } from "vitest";
import { criteria } from "./fixtures";
import { copy, resetDemo, saveDemoGuides, state } from "./store";

beforeEach(resetDemo);
it("le brouillon fictif conserve ses repères sans modifier les passations v1", async () => {
  const before = copy(state.runs);
  await saveDemoGuides(state.questions[0], [
    { score: 3, text: "Exemple libre" },
  ]);
  expect(state.questions[0].score_guides).toEqual([
    { score: 3, text: "Exemple libre" },
  ]);
  expect(state.runs).toEqual(before);
  expect(criteria[0].score_guides).toHaveLength(3);
  resetDemo();
  expect(state.questions[0].score_guides).toEqual(criteria[0].score_guides);
});
it("refuse une question inconnue ou une collection invalide sans modifier le brouillon", async () => {
  const before = copy(state.questions);
  await expect(
    saveDemoGuides({ id: 99, index: 1, name: "Inconnue" }, []),
  ).rejects.toThrow();
  await expect(
    saveDemoGuides(state.questions[0], [{ score: 12, text: "Invalide" }]),
  ).rejects.toThrow();
  expect(state.questions).toEqual(before);
});
