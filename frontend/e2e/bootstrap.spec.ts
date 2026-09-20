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
