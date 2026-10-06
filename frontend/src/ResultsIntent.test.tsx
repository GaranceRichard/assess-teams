import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
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
  api.listResultOrganizations.mockResolvedValue(resultOrganizations);
  api.listResultFamilies.mockResolvedValue(resultFamilies);
  api.getFamilyComparison.mockResolvedValue(resultFamilyComparison);
  window.history.replaceState(
    {},
    "",
    "/results?organization_id=1&family_id=4&team_id=10",
  );
});
afterEach(() => window.history.replaceState({}, "", "/"));

it("preselects accessible organization, family and eligible team without changing Results calculations", async () => {
  render(
    <ResultsPage actor={{ ...resultActor, is_superuser: true }} theme="day" />,
  );
  expect(await screen.findByRole("checkbox", { name: /^Alpha/ })).toBeChecked();
  expect(screen.getByLabelText("Organisation")).toHaveValue("1");
  expect(screen.getByLabelText("Modèle")).toHaveValue("4");
  expect(screen.getByRole("checkbox", { name: /^Beta/ })).not.toBeChecked();
});

it("explains when the source team has no usable result on the current family radar", async () => {
  window.history.replaceState(
    {},
    "",
    "/results?organization_id=1&family_id=4&team_id=999",
  );
  render(<ResultsPage actor={resultActor} theme="night" />);
  await screen.findByText(/L’équipe demandée n’a pas de résultat exploitable/);
  expect(screen.getByRole("checkbox", { name: /^Alpha/ })).not.toBeChecked();
});

it("does not preselect an inaccessible organization or family", async () => {
  window.history.replaceState(
    {},
    "",
    "/results?organization_id=999&family_id=999&team_id=10",
  );
  render(
    <ResultsPage actor={{ ...resultActor, is_superuser: true }} theme="day" />,
  );
  await screen.findByText(
    "Sélectionnez une organisation pour consulter ses résultats.",
  );
  expect(screen.getByLabelText("Organisation")).toHaveValue("");
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});
