import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { LogsPage } from "./LogsPage";
import { logAdmin, logOrganizations, mockLogs } from "./logsTestFixtures";

afterEach(() => vi.restoreAllMocks());

it("shows loading and API failures", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 403 }),
  );
  render(<LogsPage actor={logAdmin} />);
  expect(screen.getByText("Chargement…")).toBeVisible();
  expect(
    await screen.findByText("Impossible de charger les logs."),
  ).toBeVisible();
  expect(
    await screen.findByText("Impossible de charger les organisations."),
  ).toBeVisible();
});

it("shows a dependency failure and an empty result", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);
    if (url.includes("/teams/") || url.includes("/evaluations/"))
      return Promise.resolve(new Response(null, { status: 500 }));
    const body = url.includes("/organizations/")
      ? [logOrganizations[0]]
      : { count: 0, results: [], previous: null, next: null };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  });
  render(<LogsPage actor={logAdmin} />);
  expect(
    await screen.findByText("Impossible de charger les filtres dépendants."),
  ).toBeVisible();
  expect(
    screen.getByText("Aucun log ne correspond aux filtres."),
  ).toBeVisible();
});

it("ignores pending requests after unmount", async () => {
  mockLogs(true);
  const { unmount } = render(
    <LogsPage actor={{ ...logAdmin, is_superuser: true }} />,
  );
  unmount();
  await Promise.resolve();
});

it("keeps the Admin organization after clearing", async () => {
  mockLogs();
  render(<LogsPage actor={logAdmin} />);
  await screen.findByRole("option", { name: "Model North v1" });
  fireEvent.change(screen.getByLabelText("Niveau"), {
    target: { value: "ERROR" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
  fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
  expect(screen.getByLabelText("Organisation")).toHaveValue("1");
  expect(screen.getByLabelText("Niveau")).toHaveValue("");
});
