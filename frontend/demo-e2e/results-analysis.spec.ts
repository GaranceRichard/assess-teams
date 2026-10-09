import { expect, test } from "@playwright/test";

test("analysis selection changes all four views and keeps the criterion without API calls", async ({
  page,
}) => {
  const apiCalls: string[] = [];
  await page.route("**/api/**", (route) => {
    apiCalls.push(route.request().url());
    return route.abort();
  });
  await page.goto("./#/results");
  const analysis = page.getByRole("combobox", { name: "Analyse", exact: true });
  await expect(analysis).toHaveValue("radar");
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await analysis.focus();
  await page.keyboard.press("End");
  await expect(analysis).toHaveValue("temporal");
  await expect(page.getByRole("img")).toHaveCount(0);
  const criterion = page.getByLabel("Critère", { exact: true });
  await criterion.selectOption("1");
  await expect(
    page.getByRole("img", { name: /Évolution de Clarté des objectifs/ }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Données détaillées" }).click();
  const table = page.getByRole("table");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(table.getByRole("columnheader")).toHaveText([
    "Aurore",
    "Boréal",
    "Canopée",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
  for (const cell of await table.getByRole("cell").all()) {
    await expect(cell).toHaveText(
      /^\d+\/10 \(\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}\)$/,
    );
  }
  await analysis.selectOption("radar");
  await expect(table).toHaveAccessibleName(
    "Critères et scores des équipes sélectionnées",
  );
  await page.getByRole("tab", { name: "Graphique" }).click();
  await expect(table).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await analysis.selectOption("temporal");
  await expect(criterion).toHaveValue("1");
  await expect(
    page.getByRole("img", { name: /Évolution de Clarté des objectifs/ }),
  ).toBeVisible();
  expect(apiCalls).toEqual([]);
});
