import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { SteeringPage } from "./SteeringPage";
import { resultActor, resultOrganizations } from "./test/resultsFixture";
import { steeringFixture } from "./test/steeringFixture";

const api = vi.hoisted(() => ({
  listSteeringOrganizations: vi.fn(),
  getSteering: vi.fn(),
}));
vi.mock("./steering", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./steering")>()),
  ...api,
}));

beforeEach(() => {
  vi.clearAllMocks();
  api.listSteeringOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.getSteering.mockResolvedValue(steeringFixture);
});

it("imposes Admin organization and shows definitions, states, absent data and Results link", async () => {
  const navigate = vi.fn();
  render(<SteeringPage actor={resultActor} onNavigate={navigate} />);
  expect(screen.getByRole("status")).toHaveTextContent("Chargement");
  const table = await screen.findByRole("table");
  expect(screen.getByRole("heading", { name: "Pilotage" })).toBeVisible();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(api.getSteering).toHaveBeenCalledWith(1);
  for (const label of [
    "Équipes actives",
    "Avec un résultat",
    "Sans résultat",
    "Évaluations en retard",
    "Dernière complétion",
  ])
    expect(
      within(screen.getByLabelText("Synthèse du dispositif")).getByText(label, {
        exact: true,
      }),
    ).toBeVisible();
  expect(screen.getByText(/strictement la date de référence/)).toBeVisible();
  expect(
    within(table)
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getByRole("rowheader").textContent),
  ).toEqual(["Alpha", "Gamma", "Beta"]);
  for (const label of [
    "En retard",
    "Jamais évaluée",
    "À jour",
    "Coach A, Coach B",
    "Aucun modèle évalué",
    "Non disponible",
    "Aucune échéance connue",
  ])
    expect(within(table).getByText(label, { exact: true })).toBeVisible();
  const link = screen.getByRole("link", {
    name: "Voir les résultats de Alpha",
  });
  expect(link).toHaveAttribute(
    "href",
    "/results?organization_id=1&family_id=4&team_id=10",
  );
  fireEvent.click(link, { ctrlKey: true });
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.click(link);
  expect(navigate).toHaveBeenCalledWith(
    "/results?organization_id=1&family_id=4&team_id=10",
  );
});

it("requires Superadmin selection, clears stale data and ignores obsolete responses", async () => {
  api.listSteeringOrganizations.mockResolvedValue(resultOrganizations);
  let resolveFirst!: (value: typeof steeringFixture) => void;
  api.getSteering.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveFirst = resolve;
    }),
  );
  api.getSteering.mockResolvedValueOnce({
    ...steeringFixture,
    organization: resultOrganizations[1],
    teams: [],
  });
  render(
    <SteeringPage
      actor={{ ...resultActor, is_superuser: true }}
      onNavigate={vi.fn()}
    />,
  );
  await screen.findByText(
    "Sélectionnez une organisation pour consulter son pilotage.",
  );
  expect(api.getSteering).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  expect(screen.getByRole("status")).toBeVisible();
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  await screen.findByText("Aucune équipe active dans cette organisation.");
  await act(async () => resolveFirst(steeringFixture));
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "" },
  });
  expect(
    screen.queryByText("Équipes actives", { exact: true }),
  ).not.toBeInTheDocument();
});

it("shows organization failure, no organization and missing completion explicitly", async () => {
  api.listSteeringOrganizations.mockRejectedValueOnce(new Error("403"));
  const view = render(
    <SteeringPage actor={resultActor} onNavigate={vi.fn()} />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les organisations",
  );
  view.unmount();
  api.listSteeringOrganizations.mockResolvedValueOnce([]);
  const empty = render(
    <SteeringPage actor={resultActor} onNavigate={vi.fn()} />,
  );
  await screen.findByText("Aucune organisation accessible.");
  empty.unmount();
  api.getSteering.mockResolvedValueOnce({
    ...steeringFixture,
    summary: { ...steeringFixture.summary, last_completed_at: null },
    teams: [steeringFixture.teams[1]],
  });
  render(<SteeringPage actor={resultActor} onNavigate={vi.fn()} />);
  await screen.findByRole("table");
  expect(screen.getAllByText("Aucune complétion")).toHaveLength(2);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("shows projection error then recovers when switching organization", async () => {
  api.listSteeringOrganizations.mockResolvedValue(resultOrganizations);
  api.getSteering.mockRejectedValueOnce(new Error("404"));
  render(
    <SteeringPage
      actor={{ ...resultActor, is_superuser: true }}
      onNavigate={vi.fn()}
    />,
  );
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger le pilotage",
  );
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  await screen.findByRole("table");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("ignores organization responses after unmount", async () => {
  let resolve!: (value: typeof resultOrganizations) => void;
  api.listSteeringOrganizations.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const view = render(
    <SteeringPage actor={resultActor} onNavigate={vi.fn()} />,
  );
  view.unmount();
  await act(async () => resolve(resultOrganizations));
  expect(api.getSteering).not.toHaveBeenCalled();
});
