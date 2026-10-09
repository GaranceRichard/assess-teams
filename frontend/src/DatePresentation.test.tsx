import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DashboardActivity } from "./DashboardActivity";
import { EvaluationRunsTable } from "./EvaluationRunsTable";
import { JournalEntries } from "./JournalEntries";
import { LogEntries } from "./LogEntries";
import { SteeringSummary } from "./SteeringSummary";
import { SteeringTeams } from "./SteeringTeams";
import { ResultsHistoryTable } from "./ResultsHistoryTable";
import { ResultsDetails } from "./ResultsDetails";
import { ResultTeamSelection } from "./ResultTeamSelection";
import { dashboardFixture } from "./test/dashboardFixture";
import { completedRunFixture } from "./test/evaluationRunFixture";
import { logEntries } from "./logsTestFixtures";
import { steeringFixture } from "./test/steeringFixture";
import { resultComparison, resultHistory } from "./test/resultsFixture";

const timestamp = "2026-10-06T09:05:47.123";
const label = "06/10/2026 - 09:05";

it("formats dashboard activity while retaining the full machine timestamp", () => {
  const event = {
    ...dashboardFixture.recent_activity[0],
    occurred_at: timestamp,
  };
  render(<DashboardActivity events={[event]} global />);
  expect(screen.getByText(label)).toHaveAttribute("datetime", timestamp);
});

it("formats original completions and revisions without mutating them", () => {
  const run = {
    ...completedRunFixture,
    completed_at: timestamp,
    revised_at: timestamp,
  };
  render(<EvaluationRunsTable rows={[run]} busy={false} onOpen={vi.fn()} />);
  expect(screen.getAllByText(label, { exact: false })).toHaveLength(2);
  expect(run.completed_at).toBe(timestamp);
  expect(run.revised_at).toBe(timestamp);
});

it("formats journal day headings and times, including midnight on the next day", () => {
  render(
    <JournalEntries
      entries={[
        { ...logEntries[0], created_at: timestamp },
        { ...logEntries[1], created_at: "2026-10-07T00:00:59" },
      ]}
      actionFor={() => "Activité"}
    />,
  );
  expect(screen.getByRole("heading", { name: "06/10/2026" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "07/10/2026" })).toBeVisible();
  expect(screen.getByText("09:05")).toHaveAttribute("datetime", timestamp);
  expect(screen.getByText("00:00")).toBeVisible();
});

it("removes seconds from both log rows and expanded details", () => {
  render(
    <LogEntries
      entries={[{ ...logEntries[0], level: "INFO", created_at: timestamp }]}
    />,
  );
  fireEvent.click(screen.getByText("Détails"));
  expect(screen.getAllByText(label)).toHaveLength(2);
  expect(screen.getAllByText(label)[0]).toHaveAttribute("datetime", timestamp);
  expect(screen.queryByText(/09:05:47/)).not.toBeInTheDocument();
});

it("keeps steering reference dates and deadlines date-only", () => {
  const data = {
    ...steeringFixture,
    summary: { ...steeringFixture.summary, last_completed_at: timestamp },
  };
  render(
    <>
      <SteeringSummary data={data} />
      <SteeringTeams data={data} onNavigate={vi.fn()} />
    </>,
  );
  expect(screen.getAllByText("06/10/2026")).toHaveLength(2);
  expect(screen.getByText("01/10/2026")).toHaveAttribute(
    "datetime",
    "2026-10-01",
  );
  expect(screen.getByText(label)).toBeVisible();
});

it("formats result selection labels and detail columns consistently", () => {
  const comparison = {
    ...resultComparison,
    teams: [{ ...resultComparison.teams[0], completed_at: timestamp }],
  };
  render(
    <>
      <ResultTeamSelection
        teams={comparison.teams}
        selected={[10]}
        onToggle={vi.fn()}
      />
      <ResultsDetails {...comparison} selected={[10]} onCriterion={vi.fn()} />
    </>,
  );
  expect(screen.getAllByText(label)).toHaveLength(2);
  for (const time of screen.getAllByText(label))
    expect(time).toHaveAttribute("datetime", timestamp);
});

it("shares the formatter with the independently ordered team history table", () => {
  const team = resultHistory.teams[0];
  const history = {
    ...resultHistory,
    teams: [
      { ...team, points: [{ ...team.points[0], completed_at: timestamp }] },
    ],
  };
  render(<ResultsHistoryTable history={history} />);
  expect(screen.getByText(label)).toHaveAttribute("datetime", timestamp);
  expect(history.teams[0].points[0].completed_at).toBe(timestamp);
});
