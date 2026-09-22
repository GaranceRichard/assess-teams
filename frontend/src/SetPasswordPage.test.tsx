import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SetPasswordPage } from "./SetPasswordPage";

const acceptInvitation = vi.hoisted(() => vi.fn());
vi.mock("./managedUsers", () => ({ acceptInvitation }));

it("sets the invited account password", async () => {
  acceptInvitation.mockResolvedValue(undefined);
  const onComplete = vi.fn();
  render(<SetPasswordPage uid="uid" token="token" onComplete={onComplete} />);

  fireEvent.change(screen.getByLabelText("Mot de passe"), {
    target: { value: "new-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));

  await waitFor(() =>
    expect(acceptInvitation).toHaveBeenCalledWith(
      "uid",
      "token",
      "new-password",
    ),
  );
  expect(onComplete).toHaveBeenCalledOnce();
});

it("reports an expired invitation", async () => {
  acceptInvitation.mockRejectedValue(new Error("expired"));
  render(<SetPasswordPage uid="uid" token="token" onComplete={vi.fn()} />);

  fireEvent.change(screen.getByLabelText("Mot de passe"), {
    target: { value: "new-password" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Valider" }).closest("form")!,
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "invalide ou expirée",
  );
});
