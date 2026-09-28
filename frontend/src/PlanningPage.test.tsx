import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { PlanningPage } from "./PlanningPage";

const api = vi.hoisted(() => ({
  createSchedule: vi.fn(),
  listEvaluations: vi.fn(),
  listOrganizations: vi.fn(),
  listSchedules: vi.fn(),
  listTeams: vi.fn(),
}));

vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./evaluations", () => ({ listEvaluations: api.listEvaluations }));
vi.mock("./planning", () => ({
  createSchedule: api.createSchedule,
  listSchedules: api.listSchedules,
  scheduleLabels: {
    immediate: "Tout de suite",
    fixed: "À date fixe",
    monthly: "Tous les mois",
    quarterly: "Tous les trimestres",
  },
}));
vi.mock("./teams", () => ({ listTeams: api.listTeams }));

const organization = { id: 1, name: "North", users: [] };
const evaluation = { id: 2, name: "Maturité", organization_id: 1 };
const team = {
  id: 3,
  name: "Alpha",
  organization_id: 1,
  is_active: true,
  coaches: [],
};
const existing = {
  id: 4,
  organization_id: 1,
  team_id: 3,
  team_name: "Alpha",
  evaluation_id: 2,
  evaluation_name: "Maturité",
  mode: "quarterly" as const,
  first_due_date: "2026-10-05",
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listOrganizations.mockResolvedValue([organization]);
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listSchedules.mockResolvedValue([existing]);
  api.listTeams.mockResolvedValue([team]);
});

async function completeSelection() {
  fireEvent.change(await screen.findByLabelText("Équipe"), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText("Modèle d’évaluation"), {
    target: { value: "2" },
  });
}

it("preselects the admin organization and plans immediately", async () => {
  api.createSchedule.mockResolvedValue({
    ...existing,
    id: 5,
    mode: "immediate",
  });
  render(<PlanningPage />);

  expect(
    (await screen.findAllByText("Tous les trimestres")).at(-1),
  ).toBeVisible();
  expect(screen.getByText("Première date : 2026-10-05")).toBeVisible();
  await completeSelection();
  expect(screen.queryByLabelText("Première date")).not.toBeInTheDocument();
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Planifier l’évaluation" })
      .closest("form")!,
  );

  await waitFor(() =>
    expect(api.createSchedule).toHaveBeenCalledWith({
      organization_id: 1,
      team_id: 3,
      evaluation_id: 2,
      mode: "immediate",
    }),
  );
});

it("requires a first date for a monthly schedule", async () => {
  api.createSchedule.mockResolvedValue({ ...existing, id: 5, mode: "monthly" });
  render(<PlanningPage />);
  await completeSelection();
  fireEvent.change(screen.getByLabelText("Planifier"), {
    target: { value: "monthly" },
  });
  fireEvent.change(screen.getByLabelText("Première date"), {
    target: { value: "2026-11-01" },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Planifier l’évaluation" })
      .closest("form")!,
  );

  await waitFor(() =>
    expect(api.createSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "monthly",
        first_due_date: "2026-11-01",
      }),
    ),
  );
});

it("reports loading and save failures", async () => {
  api.listSchedules.mockRejectedValueOnce(new Error("offline"));
  const { unmount } = render(<PlanningPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger la planification.",
  );
  unmount();

  api.listSchedules.mockResolvedValue([]);
  api.createSchedule.mockRejectedValue(new Error("refused"));
  render(<PlanningPage />);
  await completeSelection();
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Planifier l’évaluation" })
      .closest("form")!,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "La planification de l’évaluation a été refusée.",
  );
});
