import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { LogEntries } from "./LogEntries";
import type { LogEntry } from "./journals";
import { logEntries } from "./logsTestFixtures";

it("keeps historical logs readable without HTTP or deleted relations", () => {
  const historical = {
    ...logEntries[0],
    method: "",
    status_code: null,
    organization_name: "",
    actor_name: "",
    team_name: "",
    evaluation_name: "",
    operation: "",
  } as LogEntry;
  render(<LogEntries entries={[historical]} />);
  expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(7);
  expect(
    screen.getByRole("columnheader", { name: "Opération/message" }),
  ).toBeVisible();
});
