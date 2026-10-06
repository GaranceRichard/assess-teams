import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { PalettePicker } from "./PalettePicker";
import type { SessionUser } from "./auth";

const user: SessionUser = {
  username: "member",
  role: "Viewer",
  is_superuser: false,
  organization_name: null,
  team_names: [],
  interface_palette: "pink",
};

afterEach(() => vi.restoreAllMocks());

it("restores the server preference and exposes ten named visual choices", () => {
  const { unmount } = render(<PalettePicker user={user} />);
  expect(document.documentElement.dataset.palette).toBe("pink");
  expect(screen.getAllByRole("radio", { hidden: true })).toHaveLength(10);
  expect(screen.getByLabelText("Rose")).toBeChecked();
  expect(document.querySelectorAll(".palette-swatch")).toHaveLength(10);
  unmount();
  expect(document.documentElement.dataset.palette).toBe("green");
});

it("changes immediately, serializes saves and adopts the authoritative response", async () => {
  document.cookie = "csrftoken=palette-token";
  let complete!: (response: Response) => void;
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  render(<PalettePicker user={user} />);
  fireEvent.click(screen.getByText("Couleurs"));
  fireEvent.click(screen.getByLabelText("Bleu"));
  expect(document.documentElement.dataset.palette).toBe("blue");
  expect(
    screen.getByRole("group", { name: "Couleur d’accent" }),
  ).toHaveAttribute("aria-busy", "true");
  expect(screen.getByLabelText("Rouge")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Bleu"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/session/",
    expect.objectContaining({
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": "palette-token",
      },
      body: JSON.stringify({ interface_palette: "blue" }),
    }),
  );
  await act(async () =>
    complete(
      new Response(JSON.stringify({ ...user, interface_palette: "blue" })),
    ),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Couleur enregistrée.");
  expect(screen.getByLabelText("Bleu")).toBeChecked();
  fireEvent.click(screen.getByLabelText("Bleu"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it.each([403, 500])(
  "rolls back and explains a rejected save (%s)",
  async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status }),
    );
    render(<PalettePicker user={user} />);
    fireEvent.click(screen.getByText("Couleurs"));
    fireEvent.click(screen.getByLabelText("Rouge"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couleur précédente est rétablie",
    );
    expect(document.documentElement.dataset.palette).toBe("pink");
    expect(screen.getByLabelText("Rose")).toBeChecked();
    expect(screen.getByLabelText("Vert")).toBeEnabled();
  },
);

it("keeps the next user's palette when an old save completes after logout", async () => {
  let complete!: (response: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const first = render(<PalettePicker user={user} />);
  fireEvent.click(screen.getByLabelText("Bleu"));
  first.unmount();
  render(
    <PalettePicker
      user={{ ...user, username: "other", interface_palette: "red" }}
    />,
  );
  await act(async () =>
    complete(
      new Response(JSON.stringify({ ...user, interface_palette: "blue" })),
    ),
  );
  expect(document.documentElement.dataset.palette).toBe("red");
});

it("shows a checked safe default for an unknown preference from the server", () => {
  render(
    <PalettePicker
      user={{
        ...user,
        interface_palette: "unknown" as SessionUser["interface_palette"],
      }}
    />,
  );
  expect(screen.getByLabelText("Vert")).toBeChecked();
  expect(document.documentElement.dataset.palette).toBe("green");
});
