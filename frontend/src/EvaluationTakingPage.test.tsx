import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import type { SessionUser } from "./auth";
import { EvaluationTakingPage } from "./EvaluationTakingPage";
import {
  completedRunFixture,
  evaluationRunFixture,
} from "./test/evaluationRunFixture";

const api = vi.hoisted(() => ({
  listEvaluationRuns: vi.fn(),
  getEvaluationRun: vi.fn(),
  startEvaluationRun: vi.fn(),
}));
vi.mock("./evaluationRuns", async (original) => ({
  ...(await original<typeof import("./evaluationRuns")>()),
  ...api,
}));
vi.mock("./EvaluationTakingDialog", () => ({
  EvaluationTakingDialog: ({
    run,
    revision,
    onClose,
  }: {
    run: typeof evaluationRunFixture;
    revision: boolean;
    onClose: (run: typeof evaluationRunFixture) => void;
  }) => (
    <div role="dialog">
      <p>{revision ? "Révision active" : "Passation active"}</p>
      <button
        onClick={() =>
          onClose({
            ...run,
            ...completedRunFixture,
            revised_by: revision ? "Admin Alice" : "",
            revised_at: revision ? "2026-10-05T13:00:00Z" : null,
          })
        }
      >
        Terminer la modale
      </button>
    </div>
  ),
}));

const actor: SessionUser = {
  username: "coach",
  role: "Coach",
  is_superuser: false,
  organization_name: "North",
  team_names: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  api.listEvaluationRuns.mockResolvedValue([
    { ...evaluationRunFixture, state: "not_started" },
  ]);
  api.startEvaluationRun.mockResolvedValue(evaluationRunFixture);
  api.getEvaluationRun.mockResolvedValue(completedRunFixture);
});

it("shows assigned pending work and the summary table, then updates it after completion", async () => {
  render(<EvaluationTakingPage actor={actor} />);
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  expect(
    await screen.findByRole("heading", { name: "Évaluations à passer" }),
  ).toBeVisible();
  for (const name of [
    "Modèle",
    "Équipe",
    "Assigné à",
    "Rempli par",
    "Date de complétion",
    "État",
  ]) {
    expect(screen.getByRole("columnheader", { name })).toBeVisible();
  }
  fireEvent.click(screen.getByRole("button", { name: "Passer l’évaluation" }));
  await screen.findByRole("dialog");
  expect(api.startEvaluationRun).toHaveBeenCalledWith(1);
  expect(
    screen.getByRole("button", { name: "Reprendre l’évaluation" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Terminer la modale" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText("Complétée")).toBeVisible();
  expect(screen.getByText("Aucune évaluation à passer.")).toBeVisible();
});

it("gives Admin access to expected work, consultation and visibly attributed revisions", async () => {
  api.listEvaluationRuns.mockResolvedValue([completedRunFixture]);
  render(<EvaluationTakingPage actor={{ ...actor, role: "Admin" }} />);
  expect(
    await screen.findByRole("heading", { name: "Évaluations attendues" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Consulter" }));
  await screen.findByRole("dialog");
  expect(api.getEvaluationRun).toHaveBeenCalledWith(1);
  expect(api.startEvaluationRun).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Terminer la modale" }));
  fireEvent.click(screen.getByRole("button", { name: "Réviser les notes" }));
  expect(await screen.findByText("Révision active")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Terminer la modale" }));
  expect(screen.getByText(/Révisé par Admin Alice le/)).toHaveTextContent(
    "2026",
  );
  const row = screen.getByText("Coopération v1").closest("tr")!;
  expect(within(row).getByText("coach")).toBeVisible();
  expect(within(row).getByText("admin")).toBeVisible();
});

it("hides Admin revision from completed assignee consultation", async () => {
  api.listEvaluationRuns.mockResolvedValue([
    { ...completedRunFixture, can_revise: false },
  ]);
  render(<EvaluationTakingPage actor={actor} />);
  await screen.findByRole("button", { name: "Consulter" });
  expect(
    screen.queryByRole("button", { name: "Réviser les notes" }),
  ).toBeNull();
});

it("shows empty and loading-failure states", async () => {
  api.listEvaluationRuns.mockResolvedValueOnce([]);
  const { unmount } = render(<EvaluationTakingPage actor={actor} />);
  await screen.findByText("Aucune évaluation à passer.");
  expect(screen.queryByRole("table")).toBeNull();
  unmount();
  api.listEvaluationRuns.mockRejectedValueOnce(new Error("offline"));
  render(<EvaluationTakingPage actor={actor} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger",
  );
});

it("retains the table and reports a backend refusal to start or resume", async () => {
  api.startEvaluationRun.mockRejectedValueOnce(new Error("refused"));
  render(<EvaluationTakingPage actor={actor} />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Passer l’évaluation" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible d’ouvrir",
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Passer l’évaluation" }),
    ).toBeEnabled(),
  );
});
