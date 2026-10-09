import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JournalFilters } from "./JournalFilters";

const empty = {
  date: "",
  organizationId: "",
  player: "",
  team: "",
};

it("edits and applies every journal filter", () => {
  const onChange = vi.fn();
  const onApply = vi.fn();
  render(
    <JournalFilters
      value={empty}
      organizations={[{ id: 7, name: "DEDN", users: [] }]}
      showOrganizations
      onChange={onChange}
      onApply={onApply}
      onClear={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText("Date"), {
    target: { value: "28/09/2026" },
  });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "7" },
  });
  fireEvent.change(screen.getByLabelText("Joueur"), {
    target: { value: "Marie" },
  });
  fireEvent.change(screen.getByLabelText("Équipe"), {
    target: { value: "Architecture" },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Filtrer" }));

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onApply).toHaveBeenCalledOnce();
});

describe("organization filter", () => {
  it("is hidden for an Admin and clears filters", () => {
    const onClear = vi.fn();
    render(
      <JournalFilters
        value={empty}
        organizations={[]}
        showOrganizations={false}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onClear={onClear}
      />,
    );

    expect(screen.queryByLabelText("Organisation")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "31/02/2026" },
    });
    expect(screen.getByLabelText("Date")).toBeInvalid();
    fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
    expect(screen.getByLabelText("Date")).toHaveValue("");
    expect(screen.getByLabelText("Date")).toBeValid();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
