import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { DemoTemplates } from "./DemoTemplates";
import { criteria } from "./fixtures";
import { resetDemo, saveMarkers, state } from "./store";
beforeEach(resetDemo);

it("edits draft markers without changing v1 runs and restores fixtures", async () => {
  render(<DemoTemplates />);
  const first = within(
    screen.getByRole("list", { name: "Questions" }),
  ).getAllByText(/Repères d’appréciation/)[0];
  fireEvent.click(first);
  fireEvent.click(screen.getByRole("button", { name: "Modifier le repère 5" }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Brouillon fictif" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer les repères" }),
  );
  await waitFor(() =>
    expect(
      state.questions[0].appreciation_markers?.find((m) => m.score === 5)?.text,
    ).toBe("Brouillon fictif"),
  );
  expect(state.runs[0].questions[0].appreciation_markers).toEqual(
    criteria[0].appreciation_markers,
  );
  resetDemo();
  expect(state.questions[0].appreciation_markers).toEqual(
    criteria[0].appreciation_markers,
  );
});
it("refuses duplicate, unknown, empty and out of bounds demo markers", () => {
  for (const markers of [
    [{ score: 11, text: "Non" }],
    [{ score: 1.5, text: "Non" }],
    [{ score: 1, text: " " }],
    [
      { score: 2, text: "A" },
      { score: 2, text: "B" },
    ],
  ]) {
    expect(() => saveMarkers(1, markers)).toThrow("Repères invalides");
  }
  expect(() => saveMarkers(999, [])).toThrow("Repères invalides");
});
