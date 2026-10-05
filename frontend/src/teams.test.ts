import { afterEach, describe, expect, it, vi } from "vitest";

import { createTeam, deleteTeam, listTeams, updateTeam } from "./teams";

const team = {
  id: 4,
  name: "Alpha",
  organization_id: 1,
  is_active: true,
  coaches: [{ id: 2, identifier: "coach" }],
};

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

describe("teams API", () => {
  it("lists, creates, updates and deletes teams", async () => {
    document.cookie = "csrftoken=team-token";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([team]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(team), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(team), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const input = { name: "Alpha", coach_ids: [2] };

    await expect(listTeams(1)).resolves.toEqual([team]);
    await createTeam(1, input);
    await updateTeam(4, input);
    await deleteTeam(4);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/organizations/1/teams/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
        headers: expect.objectContaining({ "X-CSRFToken": "team-token" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/admin/teams/4/",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/admin/teams/4/",
      expect.objectContaining({ method: "DELETE", body: undefined }),
    );
  });

  it("rejects an API error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 403 }),
    );

    await expect(listTeams(1)).rejects.toThrow("Team request failed");
  });
});

it("includes archived teams for structured Logs filters", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify([{ ...team, is_active: false }]), {
      status: 200,
    }),
  );
  await expect(listTeams(1, true)).resolves.toEqual([
    { ...team, is_active: false },
  ]);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/admin/organizations/1/teams/?include_archived=true",
    { credentials: "same-origin" },
  );
});
