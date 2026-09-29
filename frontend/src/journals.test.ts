import { afterEach, describe, expect, it, vi } from "vitest";

import { listActivityEntries, listLogEntries } from "./journals";

const filters = {
  date: "2026-09-28",
  organizationId: "7",
  player: "Marie Martin",
  team: "Architecture",
  level: "ERROR",
  source: "assessments",
};

afterEach(() => vi.restoreAllMocks());

describe("journal APIs", () => {
  it("queries activity with pagination and filters", async () => {
    const page = { count: 0, next: null, previous: null, results: [] };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(page), { status: 200 }));

    await expect(listActivityEntries(filters, 2)).resolves.toEqual(page);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/admin/activity-journal/?");
    expect(url).toContain("page=2");
    expect(url).toContain("date=2026-09-28");
    expect(url).toContain("organization_id=7");
    expect(url).toContain("player=Marie+Martin");
    expect(url).toContain("team=Architecture");
    expect(url).toContain("level=ERROR");
    expect(url).toContain("source=assessments");
  });

  it("omits empty filters and rejects an error response", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 403 }));

    await expect(
      listLogEntries(
        {
          date: "",
          organizationId: "",
          player: "",
          team: "",
          level: "",
          source: "",
        },
        1,
      ),
    ).rejects.toThrow("Journal request failed");
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/logs/?page=1", {
      credentials: "same-origin",
    });
  });
});
