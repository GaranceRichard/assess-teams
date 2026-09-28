import { afterEach, expect, it, vi } from "vitest";

import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  type ScheduleInput,
  updateSchedule,
} from "./planning";

const input: ScheduleInput = {
  organization_id: 2,
  team_id: 3,
  evaluation_id: 4,
  mode: "monthly",
  first_due_date: "2026-10-05",
  assignee_id: 7,
};

afterEach(() => {
  vi.restoreAllMocks();
  document.cookie = "csrftoken=; Max-Age=0";
});

it("lists and creates evaluation schedules with CSRF", async () => {
  document.cookie = "csrftoken=planning-token";
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 9, ...input }), { status: 201 }),
    );

  await listSchedules();
  await createSchedule(input);

  expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/planning/", {
    credentials: "same-origin",
  });
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    "/api/admin/planning/",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify(input),
      headers: expect.objectContaining({ "X-CSRFToken": "planning-token" }),
    }),
  );
});

it("rejects an unsuccessful planning request", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 400 }),
  );

  await expect(createSchedule(input)).rejects.toThrow(
    "Planning request failed",
  );
});

it("updates and deletes a schedule with CSRF", async () => {
  document.cookie = "csrftoken=planning-token";
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 9, ...input }), { status: 200 }),
    )
    .mockResolvedValueOnce(new Response(null, { status: 204 }));

  await updateSchedule(9, input);
  await deleteSchedule(9);

  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    "/api/admin/planning/9/",
    expect.objectContaining({ method: "PUT", body: JSON.stringify(input) }),
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    "/api/admin/planning/9/",
    expect.objectContaining({ method: "DELETE" }),
  );
});
