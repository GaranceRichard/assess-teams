import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { ResultsPage } from "./ResultsPage";
import {
  resultActor,
  resultFamilies,
  resultFamilyComparison,
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
  api.listResultOrganizations.mockResolvedValue(resultOrganizations);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockResolvedValue(resultFamilyComparison);
});
it.each(["success", "error"])(
  "ignores obsolete family list %s on organization switch",
  async (outcome) => {
    let resolve!: (data: unknown) => void;
    let reject!: (error: Error) => void;
    api.listResultFamilies.mockReturnValueOnce(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    );
    render(
      <ResultsPage
        actor={{ ...resultActor, is_superuser: true }}
        theme="day"
      />,
    );
    await screen.findByRole("option", { name: "North" });
    fireEvent.change(screen.getByLabelText("Organisation"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Organisation"), {
      target: { value: "2" },
    });
    await screen.findByRole("option", { name: "Maturité" });
    await act(async () => {
      if (outcome === "success") resolve([]);
      else reject(new Error("old request"));
    });
    expect(screen.getByLabelText("Organisation")).toHaveValue("2");
    expect(screen.getByRole("option", { name: "Maturité" })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Organisation"), {
      target: { value: "" },
    });
    expect(screen.getByLabelText("Modèle")).toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  },
);
