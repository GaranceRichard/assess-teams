import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { PlanningPage } from "./PlanningPage";
import { resultActor } from "./test/resultsFixture";
import { evaluation, team } from "./test/planningFixture";
const api = vi.hoisted(() => ({
  listOrganizations: vi.fn(),
  listEvaluations: vi.fn(),
  listTeams: vi.fn(),
  listSchedules: vi.fn(),
}));
vi.mock("./organizations", () => ({
  listOrganizations: api.listOrganizations,
}));
vi.mock("./evaluations", () => ({ listEvaluations: api.listEvaluations }));
vi.mock("./teams", () => ({ listTeams: api.listTeams }));
vi.mock("./planning", async (original) => ({
  ...(await original<typeof import("./planning")>()),
  listSchedules: api.listSchedules,
}));
beforeEach(() => {
  vi.resetAllMocks();
  api.listOrganizations.mockResolvedValue([
    { id: 1, name: "North", users: [] },
    { id: 2, name: "South", users: [] },
  ]);
  api.listEvaluations.mockResolvedValue([evaluation]);
  api.listSchedules.mockResolvedValue([]);
});
it("announces pending initial planning prerequisites", async () => {
  let finish!: (value: never[]) => void;
  api.listOrganizations.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(<PlanningPage actor={resultActor} />);
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  expect(screen.getByLabelText("Organisation")).toBeDisabled();
  await act(async () => finish([]));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it.each([
  ["success", "success"],
  ["error", "success"],
  ["success", "error"],
  ["error", "error"],
])("ignores obsolete teams %s after current %s", async (outcome, current) => {
  let resolve!: (value: (typeof team)[]) => void;
  let reject!: (error: Error) => void;
  api.listTeams
    .mockReturnValueOnce(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    )
    .mockImplementationOnce(() =>
      current === "error"
        ? Promise.reject(new Error("B failed"))
        : Promise.resolve([]),
    );
  render(<PlanningPage actor={{ ...resultActor, is_superuser: true }} />);
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  if (current === "error")
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de charger les équipes.",
    );
  if (current === "success") await screen.findByText("0 élément");
  await act(async () => {
    if (outcome === "success") resolve([team]);
    else reject(new Error("A failed"));
  });
  expect(screen.getByLabelText("Organisation")).toHaveValue("2");
  expect(
    screen.queryByRole("option", { name: "Alpha" }),
  ).not.toBeInTheDocument();
  if (current === "error")
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Impossible de charger les équipes.",
    );
  else expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("keeps settled teams when the selected organization is selected again", async () => {
  api.listTeams.mockResolvedValue([team]);
  render(<PlanningPage actor={resultActor} />);
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  await screen.findByRole("option", { name: "Alpha" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  expect(screen.getByRole("option", { name: "Alpha" })).toBeVisible();
  expect(screen.getByLabelText("Équipe")).toBeEnabled();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
