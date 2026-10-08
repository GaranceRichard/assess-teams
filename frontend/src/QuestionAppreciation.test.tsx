import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { QuestionAppreciation } from "./QuestionAppreciation";
import type { AppreciationMarker, Question } from "./evaluations";

const question: Question = { id: 1, index: 1, name: "Objectifs" };
function Harness({
  save,
}: {
  save: (markers: AppreciationMarker[]) => Promise<void>;
}) {
  const [current, setCurrent] = useState(question);
  return (
    <QuestionAppreciation
      question={current}
      onSave={async (markers) => {
        await save(markers);
        setCurrent({ ...current, appreciation_markers: markers });
      }}
    />
  );
}
it("adds a shared text to free levels, edits and removes with no required marker", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  render(<Harness save={save} />);
  fireEvent.click(screen.getByText(/Repères d’appréciation/));
  expect(screen.getByText("Aucun repère configuré.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Ajouter un repère" }));
  expect(
    screen.getByRole("button", { name: "Enregistrer les repères" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByLabelText("0", { exact: true }));
  fireEvent.click(screen.getByLabelText("10", { exact: true }));
  fireEvent.click(screen.getByLabelText("10", { exact: true }));
  fireEvent.click(screen.getByLabelText("8", { exact: true }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "  Partagé  " },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer les repères" }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith([
      { score: 0, text: "Partagé" },
      { score: 8, text: "Partagé" },
    ]),
  );
  await screen.findByRole("button", { name: "Modifier le repère 0" });
  fireEvent.click(screen.getByRole("button", { name: "Modifier le repère 0" }));
  expect(screen.getByLabelText("8", { exact: true })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Début" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer les repères" }),
  );
  await screen.findByText(/Début/);
  fireEvent.click(
    screen.getByRole("button", { name: "Supprimer le repère 0" }),
  );
  await waitFor(() => expect(screen.queryByText(/Début/)).toBeNull());
  fireEvent.click(
    screen.getByRole("button", { name: "Supprimer le repère 8" }),
  );
  expect(await screen.findByText("Aucun repère configuré.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Ajouter un repère" }));
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(screen.queryByLabelText("Appréciation")).toBeNull();
});

it("retains the editor after backend refusal and respects immutability and all occupied levels", async () => {
  render(<Harness save={vi.fn().mockRejectedValue(new Error("immutable"))} />);
  fireEvent.click(screen.getByText(/Repères d’appréciation/));
  fireEvent.click(screen.getByRole("button", { name: "Ajouter un repère" }));
  fireEvent.click(screen.getByLabelText("3", { exact: true }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Essai" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer les repères" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("refusé");
  expect(screen.getByLabelText("Appréciation")).toHaveValue("Essai");
});
it("offers consultation only when no save is allowed and prevents duplicate occupied levels", () => {
  const full = {
    ...question,
    appreciation_markers: Array.from({ length: 11 }, (_, score) => ({
      score,
      text: "Niveau",
    })),
  };
  const { rerender } = render(<QuestionAppreciation question={full} />);
  fireEvent.click(screen.getByText(/Repères d’appréciation/));
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<QuestionAppreciation question={full} onSave={vi.fn()} />);
  expect(
    screen.getByRole("button", { name: "Ajouter un repère" }),
  ).toBeDisabled();
});
