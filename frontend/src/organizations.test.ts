import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  renameOrganization,
  updateOrganizationMembers,
} from "./organizations";

const organization = {
  id: 1,
  name: "North",
  users: [{ id: 2, identifier: "alice", user_type: "Coach" as const }],
};

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

describe("organizations API", () => {
  it("lists organizations and serializes creation", async () => {
    document.cookie = "csrftoken=organization-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([organization]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(organization), { status: 201 }),
      );

    await expect(listOrganizations()).resolves.toEqual([organization]);
    await expect(
      createOrganization({ name: "North", user_ids: [2] }),
    ).resolves.toEqual(organization);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/organizations/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "North", user_ids: [2] }),
        headers: expect.objectContaining({
          "X-CSRFToken": "organization-token",
        }),
      }),
    );
  });

  it("rejects an API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 403 }),
    );

    await expect(listOrganizations()).rejects.toThrow(
      "Organization request failed",
    );
  });

  it("replaces an organization's members", async () => {
    document.cookie = "csrftoken=member-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(organization), { status: 200 }),
      );

    await expect(updateOrganizationMembers(1, [2])).resolves.toEqual(
      organization,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/organizations/1/members/",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ user_ids: [2] }),
        headers: expect.objectContaining({ "X-CSRFToken": "member-token" }),
      }),
    );
  });

  it("renames an organization", async () => {
    document.cookie = "csrftoken=rename-token";
    const renamed = { ...organization, name: "East" };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(renamed), { status: 200 }),
      );

    await expect(renameOrganization(1, "East")).resolves.toEqual(renamed);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/organizations/1/",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "East" }),
        headers: expect.objectContaining({ "X-CSRFToken": "rename-token" }),
      }),
    );
  });

  it("deletes an organization without parsing the empty response", async () => {
    document.cookie = "csrftoken=delete-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteOrganization(1)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/organizations/1/",
      expect.objectContaining({
        method: "DELETE",
        headers: { "X-CSRFToken": "delete-token" },
      }),
    );
  });
});
