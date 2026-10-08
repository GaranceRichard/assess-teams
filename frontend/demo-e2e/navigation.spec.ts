import { expect, test } from "@playwright/test";

test("liens profonds, refresh, retour navigateur, aperçus, palettes et mobile", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("requestfailed", (request) => failures.push(request.url()));
  for (const path of [
    "dashboard",
    "teams",
    "templates",
    "evaluations",
    "results",
    "steering",
    "users",
    "organization",
    "planning",
    "activity-journal",
    "logs",
  ]) {
    await page.goto("./#/" + path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
  await page
    .getByRole("link", { name: "Tableau de bord", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Voir les résultats", exact: true }),
  ).toHaveAttribute("href", "#/results");
  await page.getByText("Couleurs", { exact: true }).click();
  for (const mode of ["day", "night"]) {
    if (mode === "night")
      await page.getByRole("button", { name: "Activer le mode nuit" }).click();
    for (const name of [
      "Bleu",
      "Indigo",
      "Violet",
      "Rose",
      "Rouge",
      "Orange",
      "Ambre",
      "Vert",
      "Émeraude",
      "Turquoise",
    ]) {
      await page.getByRole("radio", { name, exact: true }).check();
      await expect(
        page.getByRole("radio", { name, exact: true }),
      ).toBeEnabled();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole("link", { name: "Équipes", exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath("dashboard-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failures).toEqual([]);
});
