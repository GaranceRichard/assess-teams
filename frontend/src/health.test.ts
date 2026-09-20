import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchHealth } from "./health";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("health API client", () => {
  it("honors the backend health response contract", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", database: "ok" }), {
        status: 200,
      }),
    );

    await expect(fetchHealth()).resolves.toEqual({
      status: "ok",
      database: "ok",
    });
    expect(fetch).toHaveBeenCalledWith("/api/health/");
  });

  it("rejects an unsuccessful backend response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    );

    await expect(fetchHealth()).rejects.toThrow(
      "Health check failed with status 503",
    );
  });
});
