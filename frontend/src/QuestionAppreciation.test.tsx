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
it("selects one score, preserves other markers, edits and cancels without saving", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  render(<Harness save={save} />);
  fireEvent.click(screen.getByText(/Repères d’appréciation/));
  expect(screen.getByText("Aucun repère configuré.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Ajouter un repère" }));
  const submit = screen.getByRole("button", { name: /Enregistrer/ });
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "  Partagé  " },
  });
  expect(submit).toBeDisabled();
  fireEvent.submit(submit.closest("form")!);
  expect(save).not.toHaveBeenCalled();
  const eight = screen.getByLabelText("8", { exact: true });
  const nine = screen.getByLabelText("9", { exact: true });
  fireEvent.click(eight);
  expect(eight).toBeChecked();
  fireEvent.click(nine);
  expect(eight).not.toBeChecked();
  expect(nine).toBeChecked();
  fireEvent.click(nine);
  expect(nine).toBeChecked();
  expect(submit).toHaveTextContent("Enregistrer le repère");
  expect(nine).toHaveAttribute("type", "radio");
  fireEvent.click(submit);
  await waitFor(() =>
    expect(save).toHaveBeenLastCalledWith([{ score: 9, text: "Partagé" }]),
  );
  await screen.findByRole("button", { name: "Modifier le repère 9" });
  fireEvent.click(screen.getByRole("button", { name: "Ajouter un repère" }));
  expect(screen.getByRole("radio", { name: "9" })).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "0" }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Début" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Enregistrer le repère" }),
  );
  await screen.findByRole("button", { name: "Modifier le repère 0" });
  fireEvent.click(screen.getByRole("button", { name: "Modifier le repère 9" }));
  expect(screen.getByRole("radio", { name: "9" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "0" })).toBeDisabled();
  expect(screen.getByLabelText("Appréciation")).toHaveValue("Partagé");
  fireEvent.click(screen.getByRole("radio", { name: "8" }));
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(save).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Modifier le repère 9" }));
  expect(screen.getByRole("radio", { name: "9" })).toBeChecked();
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "   " },
  });
  const editSubmit = screen.getByRole("button", {
    name: "Enregistrer le repère",
  });
  expect(editSubmit).toBeDisabled();
  fireEvent.submit(editSubmit.closest("form")!);
  expect(save).toHaveBeenCalledTimes(2);
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Révisé" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "8" }));
  fireEvent.click(editSubmit);
  await waitFor(() =>
    expect(save).toHaveBeenLastCalledWith([
      { score: 0, text: "Début" },
      { score: 8, text: "Révisé" },
    ]),
  );
  await screen.findByRole("button", { name: "Modifier le repère 8" });
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
  expect(save).toHaveBeenCalledTimes(5);
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
    screen.getByRole("button", { name: "Enregistrer le repère" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("refusé");
  expect(screen.getByLabelText("Appréciation")).toHaveValue("Essai");
  expect(screen.getByLabelText("3", { exact: true })).toBeChecked();
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
