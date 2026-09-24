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

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch("/api/admin/organizations/", {
    credentials: "same-origin",
    ...init,
  });
  if (!response.ok) throw new Error("Organization request failed");
  return (await response.json()) as T;
}

export function listOrganizations(): Promise<Organization[]> {
  return request();
}

export function createOrganization(
  input: OrganizationInput,
): Promise<Organization> {
  return request({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify(input),
  });
}
