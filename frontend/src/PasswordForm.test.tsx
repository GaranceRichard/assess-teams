import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { PasswordForm } from "./PasswordForm";
import { changePassword, resetPassword } from "./passwords";
import { ProfilePassword } from "./ProfilePassword";

vi.mock("./passwords", () => ({
  changePassword: vi.fn(),
  resetPassword: vi.fn(),
}));
afterEach(() => vi.resetAllMocks());

const newPhrase = "New-test-phrase!";

function fill(confirmation = newPhrase) {
  fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
    target: { value: "New-test-phrase!" },
  });
  fireEvent.change(screen.getByLabelText("Confirmer le nouveau mot de passe"), {
    target: { value: confirmation },
  });
  const current = screen.queryByLabelText("Mot de passe actuel");
  if (current)
    fireEvent.change(current, { target: { value: "Current-test-phrase!" } });
  fireEvent.click(
    screen.getByRole("button", { name: "Modifier mon mot de passe" }),
  );
}

it("opens the authenticated form from the profile and preserves the current session", async () => {
  vi.mocked(changePassword).mockResolvedValue(undefined);
  render(<ProfilePassword />);
  fireEvent.click(
    screen.getByText("Modifier mon mot de passe", { selector: "summary" }),
  );
  expect(screen.getByLabelText("Mot de passe actuel")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  fill();
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Votre session reste ouverte",
  );
  expect(
    screen.queryByLabelText("Mot de passe actuel"),
  ).not.toBeInTheDocument();
  expect(changePassword).toHaveBeenCalledWith("Current-test-phrase!", {
    password: newPhrase,
    password_confirmation: newPhrase,
  });
});

it("refuses a confirmation mismatch before sending credentials", async () => {
  render(<PasswordForm />);
  fill("Mismatch-test-phrase!");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "ne correspondent pas",
  );
  expect(changePassword).not.toHaveBeenCalled();
});

it("disables fields while saving and explains a backend refusal", async () => {
  let reject!: (error: Error) => void;
  vi.mocked(changePassword).mockReturnValue(
    new Promise((_, no) => {
      reject = no;
    }),
  );
  render(<PasswordForm />);
  fill();
  expect(
    screen.getByRole("button", { name: "Enregistrement…" }),
  ).toBeDisabled();
  expect(screen.getByLabelText("Nouveau mot de passe")).toBeDisabled();
  await act(async () =>
    reject(new Error("Le mot de passe actuel est incorrect.")),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("actuel est incorrect");
  expect(
    screen.getByRole("button", { name: "Modifier mon mot de passe" }),
  ).toBeEnabled();
});

it("resets without a current password and returns explicit success", async () => {
  vi.mocked(resetPassword).mockResolvedValue(undefined);
  const onSuccess = vi.fn();
  render(
    <PasswordForm
      recovery={{ uid: "uid", token: "token" }}
      onSuccess={onSuccess}
    />,
  );
  expect(
    screen.queryByLabelText("Mot de passe actuel"),
  ).not.toBeInTheDocument();
  fill();
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Reconnectez-vous",
  );
  expect(onSuccess).toHaveBeenCalledOnce();
  expect(resetPassword).toHaveBeenCalledWith("uid", "token", {
    password: newPhrase,
    password_confirmation: newPhrase,
  });
});

it("handles an unavailable reset service safely", async () => {
  vi.mocked(resetPassword).mockRejectedValue(undefined);
  render(<PasswordForm recovery={{ uid: "uid", token: "token" }} />);
  fill();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Le service est indisponible.",
  );
});
