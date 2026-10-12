import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { NameDialog } from "./NameDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserDialog } from "./UserDialog";
import { ScheduleEditDialog } from "./ScheduleDialogs";
import { evaluation, existing, team } from "./test/planningFixture";

it("blocks Escape and cancel during saving, retains input and announces a refusal inside the modal", async () => {
  let finish!: () => void;
  const submit = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const cancel = vi.fn();
  const props = {
    kind: "question" as const,
    onCancel: cancel,
    onSubmit: submit,
  };
  const { rerender } = render(<NameDialog {...props} />);
  const field = screen.getByRole("textbox");
  fireEvent.change(field, { target: { value: "Saisie conservée" } });
  fireEvent.submit(field.closest("form")!);
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(cancel).not.toHaveBeenCalled();
  await act(async () => finish());
  rerender(<NameDialog {...props} error="Enregistrement refusé." />);
  expect(
    within(screen.getByRole("dialog")).getByRole("alert"),
  ).toHaveTextContent("Enregistrement refusé.");
  expect(field).toHaveValue("Saisie conservée");
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(cancel).toHaveBeenCalledOnce();
});

it("blocks backdrop and Escape while a deactivation is pending", async () => {
  let finish!: () => void;
  const cancel = vi.fn();
  const { container } = render(
    <ConfirmDialog
      name="Alice"
      onCancel={cancel}
      onConfirm={() =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
      }
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Confirmer la désactivation" }),
  );
  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(cancel).not.toHaveBeenCalled();
  await act(async () => finish());
  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  expect(cancel).toHaveBeenCalledOnce();
});

it("keeps user form values during save and ignores clicks inside its surface", async () => {
  let finish!: () => void;
  const cancel = vi.fn();
  const { container } = render(
    <UserDialog
      allowedRoles={["Coach"]}
      onCancel={cancel}
      onSubmit={() =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
      }
    />,
  );
  fireEvent.change(screen.getByLabelText("Identifiant"), {
    target: { value: "Alice" },
  });
  fireEvent.change(screen.getByLabelText("Adresse mail"), {
    target: { value: "alice@example.com" },
  });
  fireEvent.mouseDown(screen.getByLabelText("Identifiant"));
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
  fireEvent.mouseDown(container.querySelector(".dialog-backdrop")!);
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(cancel).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Identifiant")).toHaveValue("Alice");
  await act(async () => finish());
});

it("cannot dismiss or delete a schedule while its update is pending", async () => {
  let reject!: (error: Error) => void;
  const cancel = vi.fn();
  render(
    <ScheduleEditDialog
      schedule={existing}
      teams={[team]}
      evaluations={[evaluation]}
      assignees={[]}
      onCancel={cancel}
      onDelete={vi.fn()}
      onSubmit={() =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        })
      }
    />,
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.submit(dialog.querySelector("form")!);
  expect(screen.getByRole("button", { name: "Supprimer" })).toBeDisabled();
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(cancel).not.toHaveBeenCalled();
  await act(async () => reject(new Error("Refus métier")));
  expect(screen.getByLabelText("Équipe")).toHaveValue(String(team.id));
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(cancel).toHaveBeenCalledOnce();
});
