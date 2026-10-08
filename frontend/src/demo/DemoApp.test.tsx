import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { state, resetDemo } from "./store";
vi.mock("../ProductShell", () => ({
  ProductShell: (props: {
    path: string;
    onNavigate: (path: string) => void;
    onThemeChange: (theme: string) => void;
    pageContent: import("react").ReactNode;
    headerAction: import("react").ReactNode;
    pageNotice: import("react").ReactNode;
  }) => (
    <div>
      <span>{props.path}</span>
      {props.headerAction}
      {props.pageNotice}
      {props.pageContent}
      <button onClick={() => props.onNavigate("/teams")}>Équipes</button>
      <button onClick={() => props.onThemeChange("night")}>Nuit</button>
    </div>
  ),
}));
vi.mock("../EvaluationTakingPage", () => ({
  EvaluationTakingPage: () => <p>Passation réelle</p>,
}));
vi.mock("../SteeringPage", () => ({
  SteeringPage: () => <p>Pilotage réel</p>,
}));
vi.mock("./DemoResults", () => ({ DemoResults: () => <p>Radar réel</p> }));
import { DemoApp } from "./DemoApp";
beforeEach(() => {
  resetDemo();
  window.location.hash = "";
});
it("guide, navigue par fragment, change le thème et réinitialise tous les états locaux", async () => {
  render(<DemoApp />);
  expect(screen.getByText("/dashboard")).toBeInTheDocument();
  expect(screen.getByText(/Mesurer pour accompagner/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("Équipes"));
  expect(window.location.hash).toBe("#/teams");
  expect((await screen.findAllByText("Aurore"))[0]).toBeInTheDocument();
  fireEvent.click(screen.getByText("Nuit"));
  expect(document.documentElement.dataset.theme).toBe("night");
  state.palette = "violet";
  state.questions = [];
  fireEvent.click(screen.getByText("Réinitialiser la démo"));
  expect(state.questions).toHaveLength(5);
  expect(state.palette).toBe("green");
  expect(document.documentElement.dataset.theme).toBe("day");
  expect(window.location.hash).toBe("#/dashboard");
});
it.each([
  "/templates",
  "/results",
  "/evaluations",
  "/steering",
  "/planning",
  "/unknown",
])("compose une page non vide pour %s", (path) => {
  window.location.hash = "#" + path;
  render(<DemoApp />);
  expect(screen.getByText(path)).toBeInTheDocument();
  expect(screen.getByLabelText("Démonstration")).toBeInTheDocument();
});
