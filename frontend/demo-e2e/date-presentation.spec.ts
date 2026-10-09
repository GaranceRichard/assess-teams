import { expect, test } from "@playwright/test";

test.use({ locale: "en-US", timezoneId: "America/Toronto" });

async function expectDates(page: import("@playwright/test").Page) {
  const times = page.locator("time");
  expect(await times.count()).toBeGreaterThan(0);
  for (const time of await times.all()) {
    const raw = (await time.getAttribute("datetime"))!;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [year, month, day] = raw.split("-");
      await expect(time).toHaveText(`${day}/${month}/${year}`);
    } else {
      await expect(time).toHaveText(/^\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}$/);
    }
  }
  await expect(page.locator("body")).not.toContainText(
    /\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}/,
  );
}

test("public demo dates are uniform even in an English browser", async ({
  page,
}) => {
  await page.route("**/api/**", (route) => route.abort());
  await page.goto("./#/dashboard");
  await expect(
    page.getByRole("list", { name: "Dernières activités" }),
  ).toBeVisible();
  await expectDates(page);
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expectDates(page);
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expectDates(page);
  await page.getByRole("button", { name: "1. Clarté des objectifs" }).click();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  await expect(
    page.getByRole("region", { name: "Observations historiques", exact: true }),
  ).toBeVisible();
  await expectDates(page);
  await page.getByRole("link", { name: "Pilotage", exact: true }).click();
  await expect(
    page.getByText("08/10/2026", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("01/10/2026", { exact: true })).toBeVisible();
  await expectDates(page);
  await page.getByRole("button", { name: "Activer le mode nuit" }).click();
  await expectDates(page);
});
