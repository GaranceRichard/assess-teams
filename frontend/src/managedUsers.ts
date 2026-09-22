import { csrfToken, type UserRole } from "./auth";

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  user_type: UserRole | "Superadmin";
  pending: boolean;
};

export type UserInput = { name: string; email: string; role?: UserRole };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  if (!response.ok) throw new Error("Managed user request failed");
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function writeOptions(method: string, input?: object): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: input ? JSON.stringify(input) : undefined,
  };
}

export function listManagedUsers(): Promise<ManagedUser[]> {
  return request("/api/admin/users/");
}

export function inviteManagedUser(
  input: Required<UserInput>,
): Promise<ManagedUser> {
  return request("/api/admin/users/", writeOptions("POST", input));
}

export function updateManagedUser(
  id: number,
  input: UserInput,
): Promise<ManagedUser> {
  return request(`/api/admin/users/${id}/`, writeOptions("PUT", input));
}

export function deleteManagedUser(id: number): Promise<void> {
  return request(`/api/admin/users/${id}/`, writeOptions("DELETE"));
}

export function acceptInvitation(
  uid: string,
  token: string,
  password: string,
): Promise<void> {
  return request(
    `/api/invitations/${encodeURIComponent(uid)}/${encodeURIComponent(token)}/`,
    writeOptions("POST", { password }),
  );
}
