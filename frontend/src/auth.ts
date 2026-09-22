export type UserRole = "Admin" | "Coach" | "Viewer";

export type SessionUser = {
  username: string;
  role: UserRole;
  is_superuser: boolean;
};

type Credentials = { username: string; password: string };

async function parseUser(response: Response): Promise<SessionUser> {
  if (!response.ok) throw new Error("Authentication request failed");
  return (await response.json()) as SessionUser;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const response = await fetch("/api/session/", { credentials: "same-origin" });
  if (response.status === 403) return null;
  return parseUser(response);
}

export async function login(credentials: Credentials): Promise<SessionUser> {
  const response = await fetch("/api/session/login/", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify(credentials),
  });
  return parseUser(response);
}

function csrfToken(): string {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("csrftoken="));
  return decodeURIComponent(cookie?.split("=")[1] ?? "");
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/session/logout/", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-CSRFToken": csrfToken() },
  });
  if (!response.ok) throw new Error("Logout request failed");
}
