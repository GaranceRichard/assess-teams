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
  const analysis = page.getByRole("switch", { name: "Analyse", exact: true });
  await expect(analysis).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await analysis.focus();
  await page.keyboard.press("Space");
  await expect(analysis).toHaveAttribute("aria-checked", "true");
  await expect(analysis).toBeFocused();
  await expect(analysis).toHaveAccessibleDescription("Dans le temps");
  await page.keyboard.press("Enter");
  await expect(analysis).toHaveAttribute("aria-checked", "false");
  await expect(analysis).toHaveAccessibleDescription("Radar");
  await page.keyboard.press("Space");
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
  await analysis.click();
  await expect(table).toHaveAccessibleName(
    "Critères et scores des équipes sélectionnées",
  );
  await page.getByRole("tab", { name: "Graphique" }).click();
  await expect(table).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  await analysis.click();
  await expect(criterion).toHaveValue("1");
  await expect(
    page.getByRole("img", { name: /Évolution de Clarté des objectifs/ }),
  ).toBeVisible();
  expect(apiCalls).toEqual([]);
});

test("analysis switch stays readable in both themes and on mobile", async ({
  page,
}) => {
  await page.goto("./#/results");
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const theme of ["day", "night"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme) {
        await page
          .getByRole("button", {
            name: `Activer le mode ${theme === "day" ? "jour" : "nuit"}`,
          })
          .click();
      }
      const control = page.locator(".results-analysis-control");
      await expect(control.getByText("Radar", { exact: true })).toBeVisible();
      await expect(control.getByText("Dans le temps")).toBeVisible();
      const box = await control.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      await page.screenshot({
        path: test.info().outputPath(`switch-${theme}-${width}.png`),
        fullPage: true,
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".results-analysis-thumb")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});
