import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PlanningPage } from "./PlanningPage";

vi.mock("./organizations", () => ({
  listOrganizations: () =>
    Promise.resolve([{ id: 1, name: "North", users: [] }]),
}));
vi.mock("./evaluations", () => ({
  listEvaluations: () =>
    Promise.resolve([
      {
        id: 1,
        organization_id: 1,
        family_id: 1,
        family_name: "Ready",
        version: 1,
        name: "Ready",
        status: "VALIDATED",
      },
      {
        id: 2,
        organization_id: 1,
        family_id: 2,
        family_name: "Draft",
        version: 1,
        name: "Draft",
        status: "DRAFT",
      },
      {
        id: 3,
        organization_id: 1,
        family_id: 3,
        family_name: "Legacy",
        version: 1,
        name: "Legacy",
        status: "ARCHIVED",
      },
      {
        id: 4,
        organization_id: 2,
        family_id: 4,
        family_name: "Other",
        version: 1,
        name: "Other",
        status: "VALIDATED",
      },
    ]),
}));
vi.mock("./teams", () => ({
  listTeams: () =>
    Promise.resolve([
      { id: 8, name: "Alpha", organization_id: 1, coaches: [] },
    ]),
}));
vi.mock("./planning", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./planning")>()),
  listSchedules: () =>
    Promise.resolve([
      {
        id: 9,
        organization_id: 1,
        organization_name: "North",
        team_id: 8,
        team_name: "Alpha",
        evaluation_id: 3,
        family_id: 1,
        family_name: "Legacy",
        evaluation_version: 1,
        evaluation_name: "Legacy",
        assignee_id: null,
        assignee_identifier: null,
        mode: "immediate",
        first_due_date: "2026-10-05",
      },
    ]),
}));
it("offers only validated models for new planning while preserving archived history", async () => {
  render(
    <PlanningPage
      actor={{
        username: "admin",
        role: "Admin",
        is_superuser: false,
        organization_name: "North",
        team_names: [],
        interface_palette: "green" as const,
      }}
    />,
  );
  await screen.findByRole("option", { name: "Ready v1" });
  const select = screen.getByLabelText("Modèle d’évaluation");
  expect(within(select).queryByRole("option", { name: "Draft" })).toBeNull();
  expect(within(select).queryByRole("option", { name: /Legacy/ })).toBeNull();
  expect(within(select).queryByRole("option", { name: "Other" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", {
      name: "North - Legacy v1 - Alpha - Non attribué",
    }),
  );
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByLabelText("Modèle d’évaluation")).toHaveValue("3");
  expect(
    within(dialog).getByRole("option", {
      name: "Legacy v1 — Archivé (historique)",
    }),
  ).toBeDisabled();
  expect(
    within(dialog).getByRole("option", { name: "Ready v1" }),
  ).toBeEnabled();
  expect(
    within(dialog).getByRole("button", {
      name: "Enregistrer les modifications",
    }),
  ).toBeDisabled();
  fireEvent.change(within(dialog).getByLabelText("Modèle d’évaluation"), {
    target: { value: "1" },
  });
  expect(
    within(dialog).getByRole("button", {
      name: "Enregistrer les modifications",
    }),
  ).toBeEnabled();
});
