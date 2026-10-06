import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";
import { getDashboard, type DashboardData } from "./dashboard";
import { dashboardFixture as fixture } from "./test/dashboardFixture";

vi.mock("./dashboard", () => ({ getDashboard: vi.fn() }));
const preference = {
  palette: "blue" as const,
  saving: false,
  error: false,
  message: "",
  choose: vi.fn(),
};
const props = { user: fixture.profile, onNavigate: vi.fn(), preference };
afterEach(() => vi.resetAllMocks());

it("shows profile names, snapshots, distinct dates and useful role shortcuts", async () => {
  vi.mocked(getDashboard).mockResolvedValue(fixture);
  render(<DashboardPage {...props} />);
  expect(await screen.findByText("Léa Martin")).toBeVisible();
  expect(screen.getByRole("region", { name: "Mon profil" })).toHaveTextContent(
    "North",
  );
  const list = screen.getByRole("list", { name: "Dernières activités" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(list).toHaveTextContent("Évaluation révisée");
  expect(list).toHaveTextContent("Évaluation terminée");
  expect(list).toHaveTextContent("Coopération · v2");
  expect(list).toHaveTextContent("Par admin");
  expect(list.querySelectorAll("time")[0]).toHaveAttribute(
    "datetime",
    fixture.recent_activity[0].occurred_at,
  );
  expect(screen.getByText(/2 évaluations/)).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: "Mes évaluations" }));
  expect(props.onNavigate).toHaveBeenCalledWith("/evaluations");
  fireEvent.click(screen.getByRole("link", { name: "Pilotage" }));
  expect(props.onNavigate).toHaveBeenCalledWith("/steering");
  fireEvent.click(screen.getByRole("link", { name: "Voir les résultats" }), {
    ctrlKey: true,
  });
  expect(props.onNavigate).toHaveBeenCalledTimes(2);
});

it.each(["Coach", "Viewer"] as const)(
  "limits %s shortcuts and hides absent authors",
  async (role) => {
    const data: DashboardData = {
      ...fixture,
      profile: {
        ...fixture.profile,
        role,
        first_name: "",
        last_name: "",
        team_names: role === "Coach" ? ["Équipe B"] : [],
      },
      pending_assignments: null,
      recent_activity: fixture.recent_activity.map((e) => ({
        ...e,
        author_name: null,
      })),
    };
    vi.mocked(getDashboard).mockResolvedValue(data);
    render(<DashboardPage {...props} user={data.profile} />);
    await screen.findByRole("list", { name: "Dernières activités" });
    expect(screen.getByText("member")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Pilotage" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/assignée/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Par /)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Mes évaluations" }) !== null,
    ).toBe(role === "Coach");
    if (role === "Coach")
      expect(screen.getByText(/^Équipes :/)).toHaveTextContent("Équipe B");
  },
);

it("labels global activity with each organization and shows Superadmin without an invented organization", async () => {
  const data: DashboardData = {
    ...fixture,
    profile: {
      ...fixture.profile,
      is_superuser: true,
      organization_name: null,
    },
    activity_scope: "global",
  };
  vi.mocked(getDashboard).mockResolvedValue(data);
  render(<DashboardPage {...props} user={data.profile} />);
  const profile = screen.getByRole("region", { name: "Mon profil" });
  await screen.findByText("Léa Martin");
  expect(profile).toHaveTextContent("Superadmin");
  expect(profile).not.toHaveTextContent("Organisation");
  expect(screen.getAllByText("Organisation : North")).toHaveLength(2);
  expect(screen.getByText(/Activité globale/)).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Mes évaluations" }),
  ).not.toBeInTheDocument();
});

it("shows loading, explains an error and retries to an empty scoped state", async () => {
  vi.mocked(getDashboard)
    .mockRejectedValueOnce(new Error("Unavailable"))
    .mockResolvedValueOnce({ ...fixture, recent_activity: [] });
  render(<DashboardPage {...props} />);
  expect(
    screen.getByRole("region", { name: "Activité récente" }),
  ).toHaveAttribute("aria-busy", "true");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger",
  );
  fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
  expect(
    await screen.findByText("Aucune activité récente dans votre périmètre."),
  ).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it.each([true, false])(
  "ignores a stale request after leaving the dashboard (success=%s)",
  async (success) => {
    let resolve!: (data: DashboardData) => void;
    let reject!: (error: Error) => void;
    vi.mocked(getDashboard).mockReturnValue(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    );
    const { unmount } = render(<DashboardPage {...props} />);
    unmount();
    await act(async () =>
      success ? resolve(fixture) : reject(new Error("Old request")),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
