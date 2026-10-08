import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EvaluationScoreScale } from "./EvaluationScoreScale";
import { evaluationRunFixture } from "./test/evaluationRunFixture";
import { validScoreGuides } from "./scoreGuides";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const question = {
  ...evaluationRunFixture.questions[0],
  score_guides: [
    { score: 0, text: "À construire" },
    { score: 5, text: "Partagé en partie" },
    { score: 10, text: "Partagé par tous" },
  ],
};
const level = (score: number) =>
  screen.getByRole("button", { name: new RegExp(`^${score} sur 10`) });

it("affiche les textes exacts au survol/focus et persiste seulement le score sélectionné", () => {
  const select = vi.fn();
  const { rerender } = render(
    <EvaluationScoreScale
      question={question}
      readonly={false}
      disabled={false}
      onSelect={select}
    />,
  );
  expect(screen.queryByText("Partagé en partie")).toBeNull();
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "5 sur 10 : Partagé en partie",
  );
  fireEvent.mouseEnter(level(0));
  expect(screen.getByRole("tooltip")).toHaveTextContent("À construire");
  expect(level(0)).toHaveAttribute(
    "aria-describedby",
    screen.getByRole("tooltip").id,
  );
  fireEvent.mouseLeave(level(0));
  act(() => vi.advanceTimersByTime(120));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(level(10));
  expect(screen.getByRole("tooltip")).toHaveTextContent("Partagé par tous");
  fireEvent.keyDown(level(10), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(level(10));
  fireEvent.blur(level(10));
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.click(level(5));
  expect(select).toHaveBeenLastCalledWith(5);
  fireEvent.blur(level(5));
  rerender(
    <EvaluationScoreScale
      question={{ ...question, score: 5 }}
      readonly={false}
      disabled={false}
      onSelect={select}
    />,
  );
  expect(screen.getByText("Partagé en partie")).toBeVisible();
  expect(level(5)).toHaveAttribute("aria-pressed", "true");
  fireEvent.change(screen.getByRole("slider"), { target: { value: "7" } });
  expect(select).toHaveBeenLastCalledWith(7);
  rerender(
    <EvaluationScoreScale
      question={{ ...question, score: 7 }}
      readonly={false}
      disabled={false}
      onSelect={select}
    />,
  );
  expect(screen.queryByText("Partagé en partie")).toBeNull();
  fireEvent.focus(level(7));
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(screen.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "7 sur 10",
  );
});

it("permet la lecture immuable sur mobile sans changer la notation", () => {
  const select = vi.fn();
  const { rerender } = render(
    <EvaluationScoreScale
      question={{ ...question, score: 0 }}
      readonly
      disabled={false}
      onSelect={select}
    />,
  );
  expect(screen.getByRole("slider")).toBeDisabled();
  fireEvent.click(level(10));
  expect(screen.getByRole("tooltip")).toHaveTextContent("Partagé par tous");
  expect(select).not.toHaveBeenCalled();
  expect(screen.getByText("À construire")).toBeVisible();
  rerender(
    <EvaluationScoreScale
      question={evaluationRunFixture.questions[0]}
      readonly={false}
      disabled
      onSelect={select}
    />,
  );
  expect(level(10)).toBeDisabled();
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("valide les collections sans repères prédéfinis et refuse les invariants violés", () => {
  expect(validScoreGuides([])).toBe(true);
  expect(validScoreGuides([{ score: 3, text: "Texte libre" }])).toBe(true);
  for (const score of [-1, 11, 3.5])
    expect(validScoreGuides([{ score, text: "Texte" }])).toBe(false);
  expect(validScoreGuides([{ score: 1, text: " " }])).toBe(false);
  expect(
    validScoreGuides([question.score_guides[0], question.score_guides[0]]),
  ).toBe(false);
});
