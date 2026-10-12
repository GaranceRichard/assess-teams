import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";
import { EvaluationDeleteDialog } from "./EvaluationDeleteDialog";
import { EvaluationLifecycleDialog } from "./EvaluationLifecycleDialog";
import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import { NameDialog } from "./NameDialog";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";
import { OrganizationMembersDialog } from "./OrganizationMembersDialog";
import { OrganizationRenameDialog } from "./OrganizationRenameDialog";
import { ScheduleEditDialog } from "./ScheduleDialogs";
import { TeamDeleteDialog } from "./TeamDeleteDialog";
import { TeamDialog } from "./TeamDialog";
import { UserDialog } from "./UserDialog";
import { completedRunFixture } from "./test/evaluationRunFixture";
import { evaluation, existing, team } from "./test/planningFixture";

const organization = { id: 1, name: "North", users: [] };
const cancel = vi.fn();
const actions = { onCancel: cancel, onSubmit: vi.fn(), onConfirm: vi.fn() };
const cases: [string, ReactElement, string, boolean][] = [
  [
    "identity form",
    <UserDialog {...actions} allowedRoles={["Coach"]} />,
    "Identifiant",
    false,
  ],
  [
    "deactivation",
    <ConfirmDialog {...actions} name="Alice" />,
    "Annuler",
    true,
  ],
  [
    "name form",
    <NameDialog {...actions} kind="question" />,
    "Nom de la question",
    false,
  ],
  [
    "model deletion",
    <EvaluationDeleteDialog
      {...actions}
      kind="évaluation"
      value={evaluation}
    />,
    "Annuler",
    true,
  ],
  [
    "model lifecycle",
    <EvaluationLifecycleDialog
      {...actions}
      action="validate"
      evaluation={evaluation}
    />,
    "Annuler",
    true,
  ],
  [
    "organization deletion",
    <OrganizationDeleteDialog {...actions} organization={organization} />,
    "Annuler",
    true,
  ],
  [
    "organization members",
    <OrganizationMembersDialog
      {...actions}
      organization={organization}
      users={[]}
      unavailableUserIds={new Set()}
      canManageAdmins
    />,
    "Annuler",
    true,
  ],
  [
    "organization name",
    <OrganizationRenameDialog {...actions} organization={organization} />,
    "Nom",
    false,
  ],
  [
    "team form",
    <TeamDialog {...actions} coaches={[]} />,
    "Nom de l’équipe",
    false,
  ],
  [
    "team deletion",
    <TeamDeleteDialog {...actions} team={team} />,
    "Annuler",
    true,
  ],
  [
    "planning form",
    <ScheduleEditDialog
      {...actions}
      onDelete={vi.fn()}
      schedule={existing}
      teams={[team]}
      evaluations={[evaluation]}
      assignees={[]}
    />,
    "Équipe",
    false,
  ],
];

it.each(cases)(
  "%s opens natively, has a name, contains focus and supports Escape",
  (_name, content, initial, description) => {
    cancel.mockClear();
    render(content);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInstanceOf(HTMLDialogElement);
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName();
    if (description) expect(dialog).toHaveAccessibleDescription();
    const first =
      initial === "Annuler"
        ? within(dialog).getByRole("button", { name: initial })
        : within(dialog).getByLabelText(initial);
    expect(first).toHaveFocus();
    const buttons = within(dialog)
      .getAllByRole("button")
      .filter((button) => !button.hasAttribute("disabled"));
    const last = buttons.at(-1)!;
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(cancel).toHaveBeenCalledOnce();
  },
);

it("consultation initially focuses its title and routes cancellation through the current run", () => {
  const onClose = vi.fn();
  render(
    <EvaluationTakingDialog
      run={completedRunFixture}
      revision={false}
      onClose={onClose}
    />,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveAccessibleName("Consulter l’évaluation");
  expect(
    screen.getByRole("heading", { name: "Consulter l’évaluation" }),
  ).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "Tab" });
  expect(screen.getByRole("button", { name: "Suivant" })).toHaveFocus();
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(onClose).toHaveBeenCalledWith(completedRunFixture);
});
