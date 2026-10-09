import { expect, it } from "vitest";
import { appreciationForScore } from "./appreciationForScore";

const markers = [
  { score: 7, text: "Autonome" },
  { score: 2, text: "Débutant" },
  { score: 5, text: "Accompagné" },
];

it.each([
  [2, "Débutant"],
  [4, "Débutant"],
  [5, "Accompagné"],
  [6, "Accompagné"],
  [7, "Autonome"],
  [10, "Autonome"],
])("uses the nearest configured lower bound for %s", (score, text) => {
  expect(appreciationForScore(markers, Number(score))?.text).toBe(text);
  expect(markers.map((marker) => marker.score)).toEqual([7, 2, 5]);
});

it("does not invent a description without a lower bound or a selected score", () => {
  expect(appreciationForScore(markers, 0)).toBeUndefined();
  expect(appreciationForScore(markers, null)).toBeUndefined();
  expect(appreciationForScore([], 6)).toBeUndefined();
  expect(appreciationForScore([{ score: 0, text: " " }], 6)).toBeUndefined();
});
