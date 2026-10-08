import { beforeEach, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { DemoTemplates } from "./DemoTemplates";
import { resetDemo, state } from "./store";
beforeEach(resetDemo);
it("modifie, ajoute, annule, supprime et réordonne le brouillon", async () => {
  render(<DemoTemplates />);
  const list = screen.getByRole("list", { name: "Questions" });
  fireEvent.click(within(list).getAllByText("Modifier")[0]);
  fireEvent.change(screen.getByLabelText("Nom de la question"), {
    target: { value: "Objectifs partagés" },
  });
  fireEvent.click(screen.getByText("Enregistrer"));
  expect(
    await within(list).findByText("Objectifs partagés"),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText("Ajouter une question"));
  expect(screen.getByText("Enregistrer")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Nom de la question"), {
    target: { value: "Écoute" },
  });
  fireEvent.click(screen.getByText("Enregistrer"));
  expect(await within(list).findByText("Écoute")).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Réordonner le brouillon/));
  expect(screen.getByLabelText("Monter Objectifs partagés")).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Descendre Objectifs partagés"));
  expect(state.questions[1].name).toBe("Objectifs partagés");
  fireEvent.click(screen.getByText("Ajouter une question"));
  fireEvent.click(screen.getByText("Annuler"));
  fireEvent.click(within(list).getAllByText("Supprimer")[0]);
  fireEvent.click(screen.getByText("Annuler"));
  expect(state.questions).toHaveLength(6);
  fireEvent.click(within(list).getAllByText("Supprimer")[0]);
  fireEvent.click(screen.getByText("Confirmer la suppression"));
  expect(state.questions).toHaveLength(5);
  expect(state.runs[0].questions[0].text).toBe("Clarté des objectifs");
});
it("refuse un nom trop long envoyé au dialogue", async () => {
  render(<DemoTemplates />);
  fireEvent.click(screen.getByText("Ajouter une question"));
  fireEvent.change(screen.getByLabelText("Nom de la question"), {
    target: { value: "X".repeat(256) },
  });
  fireEvent.click(screen.getByText("Enregistrer"));
  expect(await screen.findByRole("alert")).toHaveTextContent("255");
  expect(state.questions).toHaveLength(5);
});

it("présente la v1 immuable et revient au brouillon éditable", () => {
  render(<DemoTemplates />);
  const catalog = screen.getByRole("list", { name: "Évaluations" });
  fireEvent.click(within(catalog).getAllByRole("button")[0]);
  expect(screen.getByText("Lecture seule")).toBeInTheDocument();
  expect(screen.queryByText("Ajouter une question")).not.toBeInTheDocument();
  expect(screen.queryByText("Valider")).not.toBeInTheDocument();
  fireEvent.click(within(catalog).getAllByRole("button")[1]);
  expect(screen.getByText("Ajouter une question")).toBeInTheDocument();
});
