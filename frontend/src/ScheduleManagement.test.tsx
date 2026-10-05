import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ScheduleEditDialog } from "./ScheduleDialogs";
import { ScheduleList } from "./ScheduleList";
import type { EvaluationSchedule } from "./planning";

const schedule: EvaluationSchedule = {
  id: 4,
  organization_id: 1,
  organization_name: "North",
  team_id: 2,
  team_name: "Alpha",
  evaluation_id: 3,
  evaluation_name: "Maturité",
  assignee_id: 5,
  assignee_identifier: "admin",
  assignee_role: "Admin",
  mode: "monthly",
  first_due_date: "2026-10-05",
};

it("shows one structured clickable line", () => {
  const onOpen = vi.fn();
  render(<ScheduleList onOpen={onOpen} schedules={[schedule]} />);

  const row = screen.getByRole("button", {
    name: "North - Maturité - Alpha - admin",
  });
  fireEvent.click(row);

  expect(row).toHaveClass("schedule-row");
  expect(onOpen).toHaveBeenCalledWith(schedule);
});

it("identifies a legacy planning without an assignee", () => {
  render(
    <ScheduleList
      onOpen={vi.fn()}
      schedules={[
        {
          ...schedule,
          assignee_id: null,
          assignee_identifier: null,
          assignee_role: null,
        },
      ]}
    />,
  );

  expect(
    screen.getByRole("button", {
      name: "North - Maturité - Alpha - Non attribué",
    }),
  ).toBeVisible();
});

it("edits and confirms deletion in the same dialog", async () => {
  const onCancel = vi.fn();
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <ScheduleEditDialog
      assignees={[{ id: 5, identifier: "admin", user_type: "Admin" }]}
      evaluations={[
        { id: 3, name: "Maturité", organization_id: 1, status: "VALIDATED" },
      ]}
      onCancel={onCancel}
      onDelete={onDelete}
      onSubmit={onSubmit}
      schedule={schedule}
      teams={[
        {
          id: 2,
          name: "Alpha",
          organization_id: 1,
          is_active: true,
          coaches: [],
        },
      ]}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Enregistrer les modifications" })
      .closest("form")!,
  );
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onSubmit).toHaveBeenCalledWith({
    organization_id: 1,
    team_id: 2,
    evaluation_id: 3,
    assignee_id: 5,
    mode: "monthly",
    first_due_date: "2026-10-05",
  });
  fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Supprimer définitivement Maturité pour Alpha ?",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la suppression" }),
  );
  expect(onDelete).toHaveBeenCalledOnce();
});
