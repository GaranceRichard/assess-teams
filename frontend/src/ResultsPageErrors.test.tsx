import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsPage } from "./ResultsPage";
import {
  resultActor,
  resultFamilyComparison,
  resultFamilies,
  resultOrganizations,
} from "./test/resultsFixture";

const api = vi.hoisted(() => ({
  listResultOrganizations: vi.fn(),
  listResultFamilies: vi.fn(),
  getFamilyComparison: vi.fn(),
}));
vi.mock("./results", () => api);
vi.mock("react-chartjs-2", () => ({
  Radar: () => <canvas role="img" aria-label="Radar" />,
}));
beforeEach(() => {
  vi.clearAllMocks();
  api.listResultOrganizations.mockResolvedValue([resultOrganizations[0]]);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockResolvedValue(resultFamilyComparison);
});
function deferred<T>() {
  let resolve!: (data: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
async function choose(value = "4") {
  await screen.findByRole("option", { name: "Maturité" });
  fireEvent.change(screen.getByLabelText("Modèle"), { target: { value } });
}
it.each(["organizations", "families"])(
  "shows %s loading failures",
  async (level) => {
    if (level === "organizations")
      api.listResultOrganizations.mockRejectedValueOnce(new Error("offline"));
    else api.listResultFamilies.mockRejectedValueOnce(new Error("offline"));
    render(<ResultsPage actor={resultActor} theme="day" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de charger",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  },
);
it("shows empty accessible organizations and families", async () => {
  api.listResultOrganizations.mockResolvedValueOnce([]);
  const { unmount } = render(<ResultsPage actor={resultActor} theme="day" />);
  expect(
    await screen.findByText("Aucune organisation accessible."),
  ).toBeVisible();
  unmount();
  api.listResultFamilies.mockResolvedValueOnce([]);
  render(<ResultsPage actor={resultActor} theme="day" />);
  expect(
    await screen.findByText("Aucune passation complétée accessible."),
  ).toBeVisible();
  expect(screen.getByLabelText("Modèle")).toBeDisabled();
});
it("shows comparison loading, failure and recovery on another selection", async () => {
  const pending = deferred<unknown>();
  api.getFamilyComparison.mockReturnValueOnce(pending.promise);
  render(<ResultsPage actor={resultActor} theme="day" />);
  await choose();
  expect(screen.getByRole("status")).toBeVisible();
  await act(async () => pending.reject(new Error("404")));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Impossible de charger les résultats de ce modèle.",
  );
  await choose("5");
  expect(await screen.findByRole("img")).toBeVisible();
});
it("shows a damaged empty snapshot without drawing scores", async () => {
  api.getFamilyComparison.mockResolvedValueOnce({
    ...resultFamilyComparison,
    axes: [],
    teams: [],
  });
  render(<ResultsPage actor={resultActor} theme="day" />);
  await choose();
  expect(
    await screen.findByText("Aucun résultat exploitable pour ce modèle."),
  ).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it("keeps axes even if no latest team snapshot is usable", async () => {
  api.getFamilyComparison.mockResolvedValueOnce({
    ...resultFamilyComparison,
    teams: [],
  });
  render(<ResultsPage actor={resultActor} theme="day" />);
  await choose();
  expect(await screen.findByRole("img")).toBeVisible();
});
it.each(["success", "error"])(
  "ignores stale comparison %s",
  async (outcome) => {
    const pending = deferred<unknown>();
    api.getFamilyComparison.mockReturnValueOnce(pending.promise);
    render(<ResultsPage actor={resultActor} theme="day" />);
    await choose();
    await choose("5");
    await screen.findByRole("img");
    await act(async () => {
      if (outcome === "success") pending.resolve({ axes: [], teams: [] });
      else pending.reject(new Error("old request"));
    });
    expect(screen.getByRole("img")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
it.each(["success", "error"])(
  "ignores a pending organization list %s after unmount",
  async (outcome) => {
    const pending = deferred<unknown>();
    api.listResultOrganizations.mockReturnValueOnce(pending.promise);
    const { unmount } = render(<ResultsPage actor={resultActor} theme="day" />);
    unmount();
    await act(async () => {
      if (outcome === "success") pending.resolve(resultOrganizations);
      else pending.reject(new Error("old request"));
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
