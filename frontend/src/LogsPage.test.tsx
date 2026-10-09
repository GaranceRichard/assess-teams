import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { LogsPage } from "./LogsPage";
import { logAdmin, mockLogs } from "./logsTestFixtures";

afterEach(() => vi.restoreAllMocks());

it("imposes Admin organization, renders the HTTP table and paginates", async () => {
  const fetchMock = mockLogs();
  render(<LogsPage actor={logAdmin} />);
  await screen.findByRole("option", { name: "Model North v1" });
  expect(
    fetchMock.mock.calls.some(([url]) =>
      String(url).includes("include_archived=true"),
    ),
  ).toBe(true);
  expect(screen.getByLabelText("Organisation")).toBeDisabled();
  expect(screen.getByLabelText("Organisation")).toHaveValue("1");
  expect(
    screen.queryByRole("option", { name: "South" }),
  ).not.toBeInTheDocument();
  for (const level of ["INFO", "WARNING", "ERROR"]) {
    const badge = screen
      .getAllByText(level)
      .find((node) => node.matches("strong"))!;
    expect(badge.closest("tr")).toHaveClass(`log-row--${level.toLowerCase()}`);
  }
  expect(screen.getByRole("columnheader", { name: "Méthode" })).toBeVisible();
  expect(
    screen.getByRole("columnheader", { name: "Évaluation" }),
  ).toBeVisible();
  fireEvent.click(screen.getAllByText("Détails")[2]);
  expect(screen.getByText("id-2")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("page=2")),
    ).toBe(true),
  );
  fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
  await waitFor(() =>
    expect(screen.getByText("Page 1 / 2 · 21 éléments")).toBeVisible(),
  );
});

it("combines all filters, resets pagination and clears", async () => {
  const fetchMock = mockLogs(true);
  render(<LogsPage actor={{ ...logAdmin, is_superuser: true }} />);
  await screen.findByRole("option", { name: "North" });
  expect(screen.getByLabelText("Utilisateur")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  await screen.findByRole("option", { name: "Model North v1" });
  const fields = {
    Utilisateur: "10",
    Équipe: "11",
    Évaluation: "12",
    Du: "01/10/2026 - 10:00",
    Au: "05/10/2026 - 10:00",
    Méthode: "POST",
    Niveau: "WARNING",
    Source: "teams",
    Statut: "400",
  };
  for (const [label, value] of Object.entries(fields))
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
  fireEvent.click(screen.getByRole("button", { name: "Filtrer" }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("actor=10")),
    ).toBe(true),
  );
  const url = fetchMock.mock.calls
    .map(([value]) => String(value))
    .find((value) => value.includes("actor=10"))!;
  const params = new URL(url, "http://localhost").searchParams;
  expect(Object.fromEntries(params)).toEqual({
    page: "1",
    organization: "1",
    actor: "10",
    team: "11",
    evaluation: "12",
    from: new Date("2026-10-01T10:00").toISOString(),
    to: new Date("2026-10-05T10:00").toISOString(),
    method: "POST",
    level: "WARNING",
    source: "teams",
    status_code: "400",
  });
  fireEvent.click(screen.getByRole("button", { name: "Effacer" }));
  expect(screen.getByLabelText("Organisation")).toHaveValue("");
  expect(screen.getByLabelText("Statut")).toHaveValue(null);
  await waitFor(() =>
    expect(String(fetchMock.mock.calls.at(-1)?.[0])).toBe(
      "/api/admin/logs/?page=1",
    ),
  );
});

it("limits dependent options and resets them on organization change", async () => {
  mockLogs(true);
  render(<LogsPage actor={{ ...logAdmin, is_superuser: true }} />);
  await screen.findByRole("option", { name: "North" });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "1" },
  });
  await screen.findByRole("option", { name: "Model North v1" });
  fireEvent.change(screen.getByLabelText("Utilisateur"), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByLabelText("Équipe"), {
    target: { value: "11" },
  });
  fireEvent.change(screen.getByLabelText("Évaluation"), {
    target: { value: "12" },
  });
  fireEvent.change(screen.getByLabelText("Organisation"), {
    target: { value: "2" },
  });
  for (const label of ["Utilisateur", "Équipe", "Évaluation"])
    expect(screen.getByLabelText(label)).toHaveValue("");
  await screen.findByRole("option", { name: "Model South v1" });
  expect(
    screen.queryByRole("option", { name: "Model North v1" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: "Alice" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Bob" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
});
