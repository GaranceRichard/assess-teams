import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PlanningForm } from "./PlanningForm";
import { evaluation, existing, team } from "./test/planningFixture";

it.each(["success", "error"])(
  "protects pending planning submission and preserves inputs on %s",
  async (outcome) => {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const submit = vi.fn(
      () =>
        new Promise<void>((yes, no) => {
          resolve = yes;
          reject = no;
        }),
    );
    render(
      <PlanningForm
        organizationId={1}
        teams={[team]}
        evaluations={[evaluation]}
        assignees={[{ id: 10, identifier: "admin", user_type: "Admin" }]}
        schedule={existing}
        onSubmit={submit}
      />,
    );
    const form = screen
      .getByRole("button", { name: "Enregistrer les modifications" })
      .closest("form")!;
    fireEvent.submit(form);
    expect(
      screen.getByRole("button", { name: "Enregistrement…" }),
    ).toBeDisabled();
    fireEvent.submit(form);
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => {
      if (outcome === "success") resolve();
      else reject(new Error("refused"));
    });
    expect(screen.getByLabelText("Équipe")).toHaveValue(
      outcome === "success" ? "" : String(existing.team_id),
    );
    expect(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    ).toBeEnabled();
  },
);
