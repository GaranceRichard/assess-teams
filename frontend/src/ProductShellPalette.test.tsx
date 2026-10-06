import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ProductShell } from "./ProductShell";
import { dashboardFixture } from "./test/dashboardFixture";

vi.mock("./dashboard", () => ({ getDashboard: () => new Promise(() => {}) }));
vi.mock("./ResultsPage", () => ({
  ResultsPage: () => <p>Résultats accessibles</p>,
}));
const props = {
  user: dashboardFixture.profile,
  onNavigate: vi.fn(),
  onLogout: vi.fn(),
  theme: "day" as const,
  onThemeChange: vi.fn(),
};
afterEach(() => vi.restoreAllMocks());

it.each([200, 500])(
  "retains a pending palette save through navigation and adopts its outcome (%s)",
  async (status) => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { rerender } = render(<ProductShell {...props} path="/dashboard" />);
    const header = document.querySelector("header")!;
    expect(within(header).queryByText("Couleurs")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Couleurs"));
    fireEvent.click(screen.getByLabelText("Rose"));
    expect(document.documentElement.dataset.palette).toBe("pink");
    rerender(<ProductShell {...props} path="/results" />);
    expect(screen.queryByText("Couleurs")).not.toBeInTheDocument();
    expect(document.documentElement.dataset.palette).toBe("pink");
    rerender(<ProductShell {...props} path="/dashboard" />);
    fireEvent.click(screen.getByText("Couleurs"));
    expect(screen.getByLabelText("Rouge")).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () =>
      finish(
        status === 200
          ? new Response(
              JSON.stringify({ ...props.user, interface_palette: "pink" }),
            )
          : new Response(null, { status }),
      ),
    );
    expect(document.documentElement.dataset.palette).toBe(
      status === 200 ? "pink" : "blue",
    );
    expect(
      screen.getByLabelText(status === 200 ? "Rose" : "Bleu"),
    ).toBeChecked();
    expect(screen.getByLabelText("Rouge")).toBeEnabled();
    expect(
      screen.getByRole(status === 200 ? "status" : "alert"),
    ).toHaveTextContent(
      status === 200
        ? "Couleur enregistrée"
        : "couleur précédente est rétablie",
    );
  },
);
