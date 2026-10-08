import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { QuestionGuides } from "./QuestionGuides";
import { saveQuestionGuides } from "./saveQuestionGuides";
import type { Question } from "./evaluations";

const base: Question = { id: 11, index: 1, name: "Critère", score_guides: [] };
function Editor() {
  const [questions, setQuestions] = useState([base]);
  return (
    <QuestionGuides
      question={questions[0]}
      editable
      onSave={saveQuestionGuides(setQuestions)}
    />
  );
}
function open() {
  fireEvent.click(screen.getByText(/Repères d’appréciation/));
}
const button = (name: string) => screen.getByRole("button", { name });
afterEach(() => vi.unstubAllGlobals());

it("associe un texte à plusieurs niveaux, modifie et supprime via l’API sans perdre le nom", async () => {
  const fetcher = vi.fn(async (_url: string, init: RequestInit) => ({
    ok: true,
    status: 200,
    json: async () => ({ ...base, ...JSON.parse(init.body as string) }),
  }));
  vi.stubGlobal("fetch", fetcher);
  render(<Editor />);
  open();
  expect(screen.getByText("Aucun repère configuré.")).toBeVisible();
  expect(button("Ajouter les repères")).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox", { name: "0" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "10" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "7" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "7" }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Texte partagé" },
  });
  fireEvent.click(button("Ajouter les repères"));
  await waitFor(() =>
    expect(button("Modifier le repère du niveau 0")).toBeEnabled(),
  );
  expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({
    name: "Critère",
    score_guides: [
      { score: 0, text: "Texte partagé" },
      { score: 10, text: "Texte partagé" },
    ],
  });
  expect(fetcher.mock.calls[0][0]).toBe("/api/admin/questions/11/");
  expect(screen.getByRole("checkbox", { name: "0" })).toBeDisabled();
  fireEvent.click(button("Modifier le repère du niveau 0"));
  expect(screen.getByLabelText("Appréciation")).toHaveValue("Texte partagé");
  fireEvent.click(button("Annuler"));
  expect(screen.getByLabelText("Appréciation")).toHaveValue("");
  fireEvent.click(button("Modifier le repère du niveau 0"));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "Modifié" },
  });
  fireEvent.click(button("Enregistrer le repère"));
  await waitFor(() =>
    expect(screen.getByLabelText("Appréciation")).toHaveValue(""),
  );
  expect(fetcher).toHaveBeenCalledTimes(2);
  fireEvent.click(button("Supprimer le repère du niveau 10"));
  await waitFor(() =>
    expect(
      screen.queryByRole("button", {
        name: "Supprimer le repère du niveau 10",
      }),
    ).toBeNull(),
  );
  expect(
    JSON.parse(fetcher.mock.calls[2][1].body as string).score_guides,
  ).toEqual([{ score: 0, text: "Modifié" }]);
});

it("conserve les repères et l’édition lors du refus backend", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  render(<Editor />);
  open();
  fireEvent.click(screen.getByRole("checkbox", { name: "3" }));
  fireEvent.change(screen.getByLabelText("Appréciation"), {
    target: { value: "En attente" },
  });
  fireEvent.click(button("Ajouter les repères"));
  expect(await screen.findByRole("alert")).toHaveTextContent("refusé");
  expect(screen.getByLabelText("Appréciation")).toHaveValue("En attente");
  expect(screen.getByText("Aucun repère configuré.")).toBeVisible();
});

it("les versions immuables restent consultables sans formulaire ni action de mutation", () => {
  const onSave = vi.fn();
  render(
    <QuestionGuides
      question={{ ...base, score_guides: [{ score: 4, text: "Historique" }] }}
      editable={false}
      onSave={onSave}
    />,
  );
  open();
  expect(screen.getByText(/Historique/)).toBeVisible();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
  expect(onSave).not.toHaveBeenCalled();
});

it("une question sans adaptateur reste consultable", () => {
  render(<QuestionGuides question={base} editable />);
  open();
  expect(screen.queryByRole("textbox")).toBeNull();
});
