import { csrfToken } from "./auth";

export type NewPassword = { password: string; password_confirmation: string };

export class PasswordRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function write(url: string, data: object): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: JSON.stringify(data),
  });
  if (response.ok) return;
  const body = await response.json().catch(() => ({}));
  const fields = [
    "detail",
    "current_password",
    "password",
    "password_confirmation",
    "email",
  ];
  const messages = fields
    .flatMap((field) => body[field] ?? [])
    .filter((item) => typeof item === "string");
  throw new PasswordRequestError(
    response.status,
    response.status === 429
      ? "Trop de tentatives. Réessayez plus tard."
      : response.status === 403
        ? "Votre accès a expiré. Revenez à la connexion et réessayez."
        : response.status === 400 && messages.length
          ? messages.join(" ")
          : "Le service est indisponible. Réessayez plus tard.",
  );
}

export function requestPasswordRecovery(email: string): Promise<void> {
  return write("/api/password/recovery/", { email });
}

export function resetPassword(
  uid: string,
  token: string,
  data: NewPassword,
): Promise<void> {
  return write("/api/password/reset/", { uid, token, ...data });
}

export function changePassword(
  current_password: string,
  data: NewPassword,
): Promise<void> {
  return write("/api/session/password/", { current_password, ...data });
}
