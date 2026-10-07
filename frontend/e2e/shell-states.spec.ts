import { expect, test } from "@playwright/test";

const actor = {
  id: 1,
  username: "shell-state-admin",
  role: "Admin",
  is_superuser: false,
  organization_name: "Test",
  team_names: [],
  interface_palette: "blue",
};

test("collection geometry survives loading, empty data and a real server failure", async ({
  page,
}) => {
  await page.route("**/api/session/", (route) =>
    route.fulfill({ json: actor }),
  );
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route("**/api/admin/users/?page=1", async (route) => {
    await pending;
    await route.fulfill({
      json: { count: 0, next: null, previous: null, results: [] },
    });
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/users");
  await expect(
    page.getByRole("heading", { name: "Utilisateurs" }),
  ).toBeVisible();
  const frame = page.locator(".collection-frame");
  await expect(frame).toHaveAttribute("aria-busy", "true");
  const initial = await frame.boundingBox();
  finish();
  await expect(frame).toHaveAttribute("aria-busy", "false");
  expect(await frame.boundingBox()).toEqual(initial);
  await page.unroute("**/api/admin/users/?page=1");
  await page.route("**/api/admin/users/?page=1", (route) =>
    route.fulfill({ status: 500, json: { detail: "Service unavailable" } }),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toHaveText(
    "Impossible de charger les utilisateurs.",
  );
  expect(await frame.boundingBox()).toEqual(initial);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    720,
  );
});
