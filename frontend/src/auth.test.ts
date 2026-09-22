import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, login, logout } from "./auth";

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

describe("session API", () => {
  it("returns no user for an anonymous session", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 403 }),
    );
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the current user and sends login credentials", async () => {
    document.cookie = "csrftoken=login-token";
    const credential = "valid-test-credential";
    const user = {
      username: "sam",
      role: "Coach",
      is_superuser: false,
    } as const;
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(user), { status: 200 }));

    await expect(
      login({ username: "sam", password: credential }),
    ).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/session/login/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "sam", password: credential }),
        headers: expect.objectContaining({ "X-CSRFToken": "login-token" }),
      }),
    );
  });

  it("rejects an unexpected current-session error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    await expect(getCurrentUser()).rejects.toThrow(
      "Authentication request failed",
    );
  });

  it("sends the decoded CSRF token when logging out", async () => {
    document.cookie = "csrftoken=csrf%20token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await logout();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/session/logout/",
      expect.objectContaining({
        headers: { "X-CSRFToken": "csrf token" },
      }),
    );
  });

  it("reports a rejected logout", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 403 }),
    );
    await expect(logout()).rejects.toThrow("Logout request failed");
  });
});
