import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { JournalEntries } from "./JournalEntries";
import { LogEntries } from "./LogEntries";
import { organizationLabel } from "./journals";
import { logEntries } from "./logsTestFixtures";

const trace = {
  id: 1,
  created_at: "2026-11-14T12:00:00Z",
  organization_id: null,
  organization_origin_id: 42,
  organization_name: "Same name",
  actor_name: "Superadmin",
  team_name: "",
  description: "Suppression de l’organisation",
};

it("distinguishes historical organizations with identical names", () => {
  render(
    <JournalEntries
      entries={[trace, { ...trace, id: 2, organization_origin_id: 43 }]}
      actionFor={(entry) => entry.description}
    />,
  );
  expect(screen.getByText("Same name (origine #42)")).toBeVisible();
  expect(screen.getByText("Same name (origine #43)")).toBeVisible();
});

it("shows the durable origin in Logs without inventing missing old origins", () => {
  render(<LogEntries entries={[{ ...logEntries[0], ...trace }]} />);
  expect(screen.getAllByText("Same name (origine #42)")[0]).toBeVisible();
  expect(organizationLabel({ ...trace, organization_origin_id: null })).toBe(
    "Same name (origine non renseignée)",
  );
  expect(organizationLabel({ ...trace, organization_id: 42 })).toBe(
    "Same name",
  );
  expect(organizationLabel({ ...trace, organization_name: "" })).toBe(
    "SYSTÈME",
  );
});
