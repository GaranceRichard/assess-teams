import { expect, test } from "@playwright/test";

test("the technical shell reaches Django through the Vite proxy", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Assess teams" }),
  ).toBeVisible();
  await expect(page.getByText("API opérationnelle · SQLite ok")).toBeVisible();
});

test("the Playwright backend applies Django migrations before serving", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:8000/admin/login/");
  await page.locator('input[name="username"]').fill("missing-admin");
  await page.locator('input[name="password"]').fill("invalid-password");
  await page.locator('input[type="submit"]').click();

  await expect(page.locator(".errornote")).toBeVisible();
});
