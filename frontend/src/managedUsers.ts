import { csrfToken, type UserRole } from "./auth";

export type ManagedUser = {
  id: number;
  identifier: string;
  email: string;
  user_type: UserRole | "Superadmin";
  is_active: boolean;
  pending: boolean;
  organizations: string[];
};

export type UserInput = {
  identifier: string;
  email: string;
  role?: UserRole;
  is_active?: boolean;
};

export type InviteUserInput = Required<
  Pick<UserInput, "identifier" | "email" | "role">
>;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail ??
        (Object.values(data).flat().join(" ") || "Managed user request failed"),
    );
  }
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
  input: InviteUserInput,
): Promise<ManagedUser> {
  return request("/api/admin/users/", writeOptions("POST", input));
}

export function updateManagedUser(
  id: number,
  input: UserInput,
): Promise<ManagedUser> {
  return request(`/api/admin/users/${id}/`, writeOptions("PUT", input));
}

export function setManagedUserActivation(
  id: number,
  active: boolean,
): Promise<ManagedUser> {
  const action = active ? "reactivate" : "deactivate";
  return request(`/api/admin/users/${id}/${action}/`, writeOptions("POST"));
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
