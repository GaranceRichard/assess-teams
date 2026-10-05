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
  createEvaluationVersion: vi.fn(),
  validateEvaluation: vi.fn(),
}));
vi.mock("./evaluations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./evaluations")>()),
  ...api,
}));
vi.mock("./organizations", () => ({
  listOrganizations: () =>
    Promise.resolve([{ id: 7, name: "North", users: [] }]),
}));
const first = {
  id: 1,
  organization_id: 7,
  family_id: 10,
  family_name: "Agile",
  version: 1,
  name: "Agile",
  status: "VALIDATED",
};
const second = { ...first, id: 2, version: 2, status: "DRAFT" };
beforeEach(() => {
  vi.clearAllMocks();
  api.listEvaluations.mockResolvedValue([first]);
  api.listQuestions.mockResolvedValue([{ id: 3, index: 1, name: "Criterion" }]);
});
async function openFamily() {
  render(<EvaluationPage />);
  fireEvent.change(await screen.findByLabelText("Organisation"), {
    target: { value: "7" },
  });
  return (await screen.findByText("Agile v1")).closest("li")!;
}
it("creates a draft version then shows its validation and automatic archival of v1", async () => {
  api.createEvaluationVersion.mockResolvedValue(second);
  api.validateEvaluation.mockResolvedValue({ ...second, status: "VALIDATED" });
  const firstRow = await openFamily();
  expect(
    within(firstRow).getByText("Version active pour la planification"),
  ).toBeVisible();
  expect(
    within(firstRow).queryByRole("button", { name: "Modifier" }),
  ).toBeNull();
  fireEvent.click(
    within(firstRow).getByRole("button", {
      name: "Créer une nouvelle version",
    }),
  );
  const secondRow = (await screen.findByText("Agile v2")).closest("li")!;
  expect(api.createEvaluationVersion).toHaveBeenCalledWith(1);
  expect(within(secondRow).getByText("Brouillon")).toBeVisible();
  expect(
    within(secondRow).getByRole("button", { name: "Modifier" }),
  ).toBeEnabled();
  fireEvent.click(within(secondRow).getByRole("button", { name: /Agile v2/ }));
  expect(await screen.findByText("Criterion")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Ajouter une question" }),
  ).toBeEnabled();
  fireEvent.click(within(secondRow).getByRole("button", { name: "Valider" }));
  expect(screen.getByRole("dialog")).toHaveTextContent(
    "automatiquement archivée",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la validation" }),
  );
  await waitFor(() =>
    expect(within(firstRow).getByText("Archivée")).toBeVisible(),
  );
  expect(
    within(firstRow).queryByRole("button", { name: "Archiver" }),
  ).toBeNull();
  expect(
    within(firstRow).getByRole("button", {
      name: "Créer une nouvelle version",
    }),
  ).toBeEnabled();
  expect(
    within(secondRow).getByText("Version active pour la planification"),
  ).toBeVisible();
  expect(screen.getByText("Lecture seule")).toBeVisible();
});
it("keeps the source and reports a rejected copy", async () => {
  api.createEvaluationVersion.mockRejectedValue(new Error("forbidden"));
  const row = await openFamily();
  fireEvent.click(
    within(row).getByRole("button", { name: "Créer une nouvelle version" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "nouvelle version a été refusée",
  );
  expect(within(row).getByText("Validée")).toBeVisible();
  expect(screen.queryByText("Agile v2")).toBeNull();
});
it("disables duplicate requests while copying", async () => {
  let finish!: (value: typeof second) => void;
  api.createEvaluationVersion.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const row = await openFamily();
  fireEvent.click(
    within(row).getByRole("button", { name: "Créer une nouvelle version" }),
  );
  expect(within(row).getByRole("button", { name: "Création…" })).toBeDisabled();
  finish(second);
  await screen.findByText("Agile v2");
});
