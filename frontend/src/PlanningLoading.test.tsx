import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PlanningPage } from "./PlanningPage";
import type { SessionUser } from "./auth";
import type { EvaluationSchedule } from "./planning";
import { evaluation, existing, team } from "./test/planningFixture";

const api = vi.hoisted(() => ({
  listOrganizations: vi.fn(),
  listEvaluations: vi.fn(),
  listSchedules: vi.fn(),
  listTeams: vi.fn(),
  createSchedule: vi.fn(),
}));
vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./evaluations", () => ({ listEvaluations: api.listEvaluations }));
vi.mock("./teams", () => ({ listTeams: api.listTeams }));
vi.mock("./planning", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./planning")>()),
  listSchedules: api.listSchedules,
  createSchedule: api.createSchedule,
}));

const actor: SessionUser = {
  id: 10,
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: null,
  team_names: [],
  interface_palette: "green",
};

it("keeps a created schedule when StrictMode's obsolete initial read finishes late", async () => {
  let finishOldRead!: (value: EvaluationSchedule[]) => void;
  api.listSchedules
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOldRead = resolve;
        }),
    )
    .mockResolvedValueOnce([]);
  api.listOrganizations.mockResolvedValue([
    {
      id: 1,
      name: "North",
      users: [{ id: 10, identifier: "admin", user_type: "Admin" }],
    },
  ]);
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listTeams.mockResolvedValue([team]);
  api.createSchedule.mockResolvedValue(existing);
  render(
    <StrictMode>
      <PlanningPage actor={actor} />
    </StrictMode>,
  );
  await screen.findByRole("option", { name: "Alpha" });
  fireEvent.change(screen.getByLabelText("Équipe"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("Responsable de l’évaluation"), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByLabelText("Modèle d’évaluation"), {
    target: { value: "2" },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Planifier l’évaluation" })
      .closest("form")!,
  );
  const saved = await screen.findByRole("button", {
    name: "North - Maturité v1 - Alpha - coach",
  });
  expect(saved).toBeVisible();
  await act(async () => finishOldRead([]));
  expect(
    screen.getByRole("button", { name: "North - Maturité v1 - Alpha - coach" }),
  ).toBeVisible();
});
