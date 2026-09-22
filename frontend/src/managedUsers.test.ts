import { afterEach, describe, expect, it, vi } from "vitest";

import {
  acceptInvitation,
  deleteManagedUser,
  inviteManagedUser,
  listManagedUsers,
  updateManagedUser,
} from "./managedUsers";

const user = {
  id: 2,
  name: "Alice Martin",
  email: "alice@example.com",
  user_type: "Coach" as const,
  pending: true,
};

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

describe("managed users API", () => {
  it("lists users and serializes create and update requests", async () => {
    document.cookie = "csrftoken=admin-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([user]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(user), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(user), { status: 200 }),
      );

    await expect(listManagedUsers()).resolves.toEqual([user]);
    await inviteManagedUser({
      name: user.name,
      email: user.email,
      role: "Coach",
    });
    await updateManagedUser(user.id, { name: "Alice M.", email: user.email });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/users/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRFToken": "admin-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/admin/users/2/",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deletes a user and accepts an encoded invitation", async () => {
    const credential = "new-password";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await deleteManagedUser(2);
    await acceptInvitation("uid/value", "token value", credential);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/users/2/",
      expect.objectContaining({ method: "DELETE", body: undefined }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/invitations/uid%2Fvalue/token%20value/",
      expect.objectContaining({
        body: JSON.stringify({ password: credential }),
      }),
    );
  });

  it("rejects an API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 403 }),
    );

    await expect(listManagedUsers()).rejects.toThrow(
      "Managed user request failed",
    );
  });
});
