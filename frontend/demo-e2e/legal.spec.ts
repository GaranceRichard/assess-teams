import { expect, test } from "@playwright/test";

test("static demo includes local licenses under its deployment base without API", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("/assess-teams/");
  const link = page.getByRole("link", { name: "Mentions légales et licence" });
  await expect(link).toHaveAttribute("href", "/assess-teams/legal/index.html");
  const popup = page.waitForEvent("popup");
  await link.click();
  const legal = await popup;
  await expect(legal.getByRole("heading", { level: 1 })).toHaveText(
    "Mentions légales et licence",
  );
  await legal
    .getByRole("link", {
      name: "Licences et attributions du frontend distribué",
    })
    .click();
  await expect(legal.locator("body")).toContainText("Meta Platforms, Inc");
  await expect(legal.locator("body")).toContainText("Chart.js Contributors");
});
