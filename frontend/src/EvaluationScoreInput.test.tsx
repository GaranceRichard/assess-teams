import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { EvaluationScoreInput } from "./EvaluationScoreInput";
import { evaluationRunFixture } from "./test/evaluationRunFixture";

it.each([false, true])(
  "shows eleven explicit choices with markers=%s",
  (withMarkers) => {
    const onSelect = vi.fn();
    const question = {
      ...evaluationRunFixture.questions[0],
      appreciation_markers: withMarkers ? [{ score: 7, text: "Autonome" }] : [],
    };
    const { rerender } = render(
      <EvaluationScoreInput
        question={question}
        disabled={false}
        onSelect={onSelect}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(11);
    expect(screen.getByText("Aucune note sélectionnée")).toBeVisible();
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
    for (const score of [0, 5, 7, 10]) {
      fireEvent.click(
        screen.getByRole("button", { name: `Choisir la note ${score} sur 10` }),
      );
      expect(onSelect).toHaveBeenLastCalledWith(score);
      expect(screen.getByRole("slider")).toHaveFocus();
      rerender(
        <EvaluationScoreInput
          question={{ ...question, score }}
          disabled={false}
          onSelect={onSelect}
        />,
      );
      expect(screen.getByRole("button", { pressed: true })).toHaveTextContent(
        String(score),
      );
      expect(screen.getByRole("slider")).toHaveValue(String(score));
    }
  },
);

it("keeps displayed values inert during consultation", () => {
  const onSelect = vi.fn();
  render(
    <EvaluationScoreInput
      question={{ ...evaluationRunFixture.questions[0], score: 0 }}
      disabled
      onSelect={onSelect}
    />,
  );
  for (const choice of screen.getAllByRole("button")) {
    expect(choice).toBeDisabled();
    fireEvent.click(choice);
  }
  expect(screen.getByRole("button", { pressed: true })).toHaveTextContent("0");
  expect(onSelect).not.toHaveBeenCalled();
});
