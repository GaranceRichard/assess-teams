import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import { completedRunFixture } from "./test/evaluationRunFixture";

it("restores the explicit opener captured before an async load disabled and blurred it", async () => {
  const opener = document.createElement("button");
  opener.textContent = "Consulter";
  document.body.append(opener);
  opener.focus();
  opener.disabled = true;
  opener.blur();
  const { unmount } = render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision={false}
      returnFocus={opener}
      onClose={vi.fn()}
    />,
  );
  opener.disabled = false;
  expect(
    screen.getByRole("heading", { name: "Consulter l’évaluation" }),
  ).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  expect(screen.getByText("Question 2 / 2")).toBeVisible();
  await act(async () => unmount());
  expect(opener).toHaveFocus();
  opener.remove();
});
