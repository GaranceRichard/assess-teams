import { csrfToken } from "./auth";

export type OrganizationMember = {
  id: number;
  identifier: string;
  user_type: "Admin" | "Coach" | "Viewer" | "Superadmin";
};

export type Organization = {
  id: number;
  name: string;
  users: OrganizationMember[];
};

type OrganizationInput = { name: string; user_ids: number[] };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
  });
  if (!response.ok) throw new Error("Organization request failed");
  return (await response.json()) as T;
}

export function listOrganizations(): Promise<Organization[]> {
  return request("/api/admin/organizations/");
}

export function createOrganization(
  input: OrganizationInput,
): Promise<Organization> {
  return request("/api/admin/organizations/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify(input),
  });
}

export function updateOrganizationMembers(
  organizationId: number,
  userIds: number[],
): Promise<Organization> {
  return request(`/api/admin/organizations/${organizationId}/members/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify({ user_ids: userIds }),
  });
}

export function renameOrganization(
  organizationId: number,
  name: string,
): Promise<Organization> {
  return request(`/api/admin/organizations/${organizationId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify({ name }),
  });
}
