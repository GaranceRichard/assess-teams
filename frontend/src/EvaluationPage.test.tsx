import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { EvaluationPage } from "./EvaluationPage";

const api = vi.hoisted(() => ({
  createEvaluation: vi.fn(),
  createQuestion: vi.fn(),
  deleteEvaluation: vi.fn(),
  deleteQuestion: vi.fn(),
  listEvaluations: vi.fn(),
  listQuestions: vi.fn(),
  updateEvaluation: vi.fn(),
  updateQuestion: vi.fn(),
}));

vi.mock("./evaluations", () => api);

const evaluation = { id: 1, index: 1, name: "Initial" };
const question = { id: 10, index: 1, name: "Question initiale" };

beforeEach(() => {
  vi.clearAllMocks();
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listQuestions.mockResolvedValue([question]);
});

it("creates and updates evaluations, then opens their questions", async () => {
  api.createEvaluation.mockResolvedValue({ id: 2, index: 2, name: "Second" });
  api.updateEvaluation.mockResolvedValue({ ...evaluation, name: "Renommée" });
  render(<EvaluationPage />);
  const initial = (await screen.findByText("Initial")).closest("li")!;

  fireEvent.click(screen.getByRole("button", { name: "Créer une évaluation" }));
  fireEvent.change(screen.getByLabelText("Index de l’évaluation"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("Nom de l’évaluation"), {
    target: { value: "Second" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
  expect(await screen.findByText("Second")).toBeVisible();

  fireEvent.click(within(initial).getByRole("button", { name: "Modifier" }));
  fireEvent.change(screen.getByLabelText("Nom de l’évaluation"), {
    target: { value: "Renommée" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
  const renamed = (await screen.findByText("Renommée")).closest("li")!;
  fireEvent.click(within(renamed).getByRole("button", { name: /Renommée/ }));

  expect(await screen.findByText("Question initiale")).toBeVisible();
  expect(api.updateEvaluation).toHaveBeenCalledWith(1, {
    index: 1,
    name: "Renommée",
  });
});

it("creates, updates and deletes questions after confirmation", async () => {
  api.createQuestion.mockResolvedValue({ id: 11, index: 2, name: "Nouvelle" });
  api.updateQuestion.mockResolvedValue({ ...question, name: "Modifiée" });
  api.deleteQuestion.mockResolvedValue(undefined);
  render(<EvaluationPage />);
  const initial = (await screen.findByText("Initial")).closest("li")!;
  fireEvent.click(within(initial).getByRole("button", { name: /Initial/ }));
  const current = (await screen.findByText("Question initiale")).closest("li")!;

  fireEvent.click(screen.getByRole("button", { name: "Ajouter une question" }));
  fireEvent.change(screen.getByLabelText("Index de la question"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("Nom de la question"), {
    target: { value: "Nouvelle" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
  expect(await screen.findByText("Nouvelle")).toBeVisible();

  fireEvent.click(within(current).getByRole("button", { name: "Modifier" }));
  fireEvent.change(screen.getByLabelText("Nom de la question"), {
    target: { value: "Modifiée" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
  const modified = (await screen.findByText("Modifiée")).closest("li")!;
  fireEvent.click(within(modified).getByRole("button", { name: "Supprimer" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la suppression" }),
  );

  await waitFor(() => expect(api.deleteQuestion).toHaveBeenCalledWith(10));
  expect(screen.queryByText("Modifiée")).toBeNull();
});

it("confirms evaluation deletion and reports loading failure", async () => {
  api.deleteEvaluation.mockResolvedValue(undefined);
  const { unmount } = render(<EvaluationPage />);
  const initial = (await screen.findByText("Initial")).closest("li")!;
  fireEvent.click(within(initial).getByRole("button", { name: "Supprimer" }));
  expect(screen.getByText(/avec toutes ses questions/)).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la suppression" }),
  );
  await waitFor(() => expect(api.deleteEvaluation).toHaveBeenCalledWith(1));
  unmount();

  api.listEvaluations.mockRejectedValue(new Error("offline"));
  render(<EvaluationPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les évaluations",
  );
});
