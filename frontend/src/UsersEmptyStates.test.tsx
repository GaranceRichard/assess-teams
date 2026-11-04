import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SuperadminDashboard } from "./SuperadminDashboard";
import { logAdmin } from "./logsTestFixtures";

afterEach(() => vi.restoreAllMocks());
it.each(["Admin", "Coach"] as const)(
  "%s distinguishes no accessible users from a search without matches and restores the collection",
  async (role) => {
    let empty = true;
    const user = {
      id: 1,
      identifier: "Visible",
      email: "visible@example.com",
      user_type: "Viewer",
      is_active: true,
      pending: false,
      organizations: ["North"],
    };
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const results = empty || String(input).includes("search=") ? [] : [user];
      return Promise.resolve(
        new Response(
          JSON.stringify({
            count: results.length,
            results,
            next: null,
            previous: null,
          }),
        ),
      );
    });
    const view = render(<SuperadminDashboard actor={{ ...logAdmin, role }} />);
    expect(
      await screen.findByText("Aucun utilisateur accessible."),
    ).toBeVisible();
    view.unmount();
    empty = false;
    render(<SuperadminDashboard actor={{ ...logAdmin, role }} />);
    expect(await screen.findByText("Visible")).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "absent" },
    });
    expect(await screen.findByText("Aucun r\u00e9sultat.")).toBeVisible();
    expect(
      screen.queryByText("Aucun utilisateur accessible."),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(await screen.findByText("Visible")).toBeVisible();
  },
);
