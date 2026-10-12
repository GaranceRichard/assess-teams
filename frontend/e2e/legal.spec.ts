import { expect, test } from "@playwright/test";

test("public legal notices and attributions remain readable without login", async ({
  page,
}) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Mentions légales et licence" });
  const popup = page.waitForEvent("popup");
  await link.click();
  const legal = await popup;
  await expect(legal.getByRole("heading", { level: 1 })).toHaveText(
    "Mentions légales et licence",
  );
  await expect(
    legal.getByText("Développement initial : Garance Richard."),
  ).toBeVisible();
  await legal
    .getByRole("link", { name: "Licence Apache 2.0 intégrale (anglais)" })
    .click();
  await expect(legal.locator("body")).toContainText(
    "TERMS AND CONDITIONS FOR USE",
  );
  await expect(legal.locator("body")).toContainText(
    "END OF TERMS AND CONDITIONS",
  );
  const notices = await page.request.get("/legal/THIRD-PARTY.txt");
  expect(notices.ok()).toBe(true);
  expect(await notices.text()).toContain("Chart.js Contributors");
  expect((await page.request.get("/legal/missing.txt")).status()).toBe(404);
});
