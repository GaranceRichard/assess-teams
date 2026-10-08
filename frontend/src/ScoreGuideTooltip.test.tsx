import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EvaluationScoreScale } from "./EvaluationScoreScale";
import { evaluationRunFixture } from "./test/evaluationRunFixture";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const question = {
  ...evaluationRunFixture.questions[0],
  score_guides: [
    { score: 0, text: "À construire" },
    { score: 10, text: "Partagé par tous" },
  ],
};
const level = (score: number) =>
  screen.getByRole("button", { name: new RegExp(`^${score} sur 10`) });

it("borne l’infobulle au viewport et la ferme au scroll et resize", () => {
  const rect = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({
      left: 950,
      top: 350,
      width: 300,
      height: 80,
      right: 1250,
      bottom: 430,
      x: 950,
      y: 350,
      toJSON: () => ({}),
    });
  render(
    <EvaluationScoreScale
      question={question}
      readonly
      disabled={false}
      onSelect={vi.fn()}
    />,
  );
  fireEvent.focus(level(0));
  expect(screen.getByRole("tooltip")).toHaveStyle({
    left: "716px",
    top: "260px",
  });
  fireEvent.scroll(window);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(level(0));
  fireEvent.resize(window);
  expect(screen.queryByRole("tooltip")).toBeNull();
  rect.mockRestore();
});

it("laisse lire et défiler l’infobulle survolée puis la ferme sans fermer la modale", () => {
  const key = vi.fn();
  render(
    <div onKeyDown={key}>
      <EvaluationScoreScale
        question={question}
        readonly
        disabled={false}
        onSelect={vi.fn()}
      />
    </div>,
  );
  fireEvent.mouseEnter(level(0));
  fireEvent.mouseLeave(level(0));
  fireEvent.mouseEnter(screen.getByRole("tooltip"));
  act(() => vi.advanceTimersByTime(120));
  fireEvent.scroll(screen.getByRole("tooltip"));
  expect(screen.getByRole("tooltip")).toBeVisible();
  fireEvent.keyDown(level(0), { key: "Escape" });
  expect(key).not.toHaveBeenCalled();
  fireEvent.mouseEnter(level(0));
  fireEvent.mouseLeave(screen.getByRole("tooltip"));
  act(() => vi.advanceTimersByTime(120));
  expect(screen.queryByRole("tooltip")).toBeNull();
});

it("un nouveau survol remplace l’infobulle du niveau encore focalisé", () => {
  render(
    <EvaluationScoreScale
      question={question}
      readonly
      disabled={false}
      onSelect={vi.fn()}
    />,
  );
  fireEvent.focus(level(0));
  fireEvent.mouseEnter(level(10));
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Partagé par tous");
  fireEvent.mouseLeave(level(0));
  act(() => vi.advanceTimersByTime(120));
  expect(screen.getByRole("tooltip")).toHaveTextContent("Partagé par tous");
});

it("Échap ferme le repère survolé même lorsque le focus est sur un autre contrôle", () => {
  const key = vi.fn();
  render(
    <div onKeyDown={key}>
      <EvaluationScoreScale
        question={question}
        readonly={false}
        disabled={false}
        onSelect={vi.fn()}
      />
    </div>,
  );
  fireEvent.focus(level(0));
  fireEvent.mouseEnter(level(10));
  fireEvent.keyDown(level(0), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(key).not.toHaveBeenCalled();
  fireEvent.mouseEnter(level(10));
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Escape" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(key).not.toHaveBeenCalled();
});
