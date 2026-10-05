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
  listEvaluations: vi.fn(),
  listQuestions: vi.fn(),
  validateEvaluation: vi.fn(),
  archiveEvaluation: vi.fn(),
}));
vi.mock("./evaluations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./evaluations")>()),
  ...api,
}));
vi.mock("./organizations", () => ({
  listOrganizations: () =>
    Promise.resolve([{ id: 7, name: "North", users: [] }]),
}));
const evaluation = {
  id: 1,
  organization_id: 7,
  family_id: 1,
  family_name: "Model",
  version: 1,
  name: "Model",
  status: "DRAFT",
};
beforeEach(() => {
  vi.clearAllMocks();
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listQuestions.mockResolvedValue([{ id: 3, index: 1, name: "Criterion" }]);
});
async function openModel() {
  render(<EvaluationPage />);
  fireEvent.change(await screen.findByLabelText("Organisation"), {
    target: { value: "7" },
  });
  const row = (await screen.findByText("Model")).closest("li")!;
  fireEvent.click(within(row).getByRole("button", { name: /Model/ }));
  await screen.findByText("Criterion");
  return row;
}
it("confirms validation then archive and keeps immutable questions visible", async () => {
  api.validateEvaluation.mockResolvedValue({
    ...evaluation,
    status: "VALIDATED",
  });
  api.archiveEvaluation.mockResolvedValue({
    ...evaluation,
    status: "ARCHIVED",
  });
  const row = await openModel();
  expect(within(row).getByText("Brouillon")).toBeVisible();
  fireEvent.click(within(row).getByRole("button", { name: "Valider" }));
  expect(api.validateEvaluation).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(api.validateEvaluation).not.toHaveBeenCalled();
  fireEvent.click(within(row).getByRole("button", { name: "Valider" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la validation" }),
  );
  await screen.findByText("Validée");
  expect(api.validateEvaluation).toHaveBeenCalledWith(1);
  expect(screen.queryByRole("button", { name: "Modifier" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Supprimer" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Ajouter une question" }),
  ).toBeNull();
  expect(screen.getByText("Lecture seule")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Archiver" }));
  expect(api.archiveEvaluation).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer l’archivage" }),
  );
  await screen.findByText("Archivée");
  expect(api.archiveEvaluation).toHaveBeenCalledWith(1);
  expect(screen.getByText("Criterion")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Archiver" })).toBeNull();
});
it("reports rejected validation and retains the draft", async () => {
  api.validateEvaluation.mockRejectedValue(new Error("no questions"));
  await openModel();
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la validation" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "validation de l’évaluation a été refusée",
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Confirmer la validation" }),
    ).toBeEnabled(),
  );
  expect(screen.getByText("Brouillon")).toBeVisible();
});
it("reports rejected archive and retains the validated model", async () => {
  api.listEvaluations.mockResolvedValue([
    { ...evaluation, status: "VALIDATED" },
  ]);
  api.archiveEvaluation.mockRejectedValue(new Error("stale"));
  await openModel();
  fireEvent.click(screen.getByRole("button", { name: "Archiver" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer l’archivage" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("mise en archive");
  expect(screen.getByText("Validée")).toBeVisible();
});
