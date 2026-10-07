import { expect, test } from "@playwright/test";

import { palettes } from "../src/palette";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";
import { contrast } from "./palette-contrast";

// Browser geometry is the regression oracle: jsdom cannot reproduce table/flex layout.
test("Superadmin has no membership or self actions and status badges stay centered in every theme", async ({
  page,
}, testInfo) => {
  seedSuperadmin("layout-root", "unused-layout@example.com");
  seedIdentity("layout-admin", "Admin");
  seedIdentity("layout-coach", "Coach");
  assignOrganization(["layout-admin", "layout-coach"], "Layout E2E");
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("layout-root");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Utilisateurs" }).click();
  await page.getByLabel("Rechercher un utilisateur").fill("layout-");
  const rootRow = page
    .getByRole("row")
    .filter({ has: page.getByText("layout-root", { exact: true }) });
  const coachRow = page
    .getByRole("row")
    .filter({ has: page.getByText("layout-coach", { exact: true }) });
  await expect(rootRow.getByRole("cell")).toHaveCount(5);
  await expect(rootRow.getByRole("cell").nth(3)).toHaveText("—");
  await expect(rootRow.getByRole("button")).toHaveCount(0);
  await coachRow.getByRole("button", { name: "Désactiver" }).click();
  await page
    .getByRole("button", { name: "Confirmer la désactivation" })
    .click();
  await expect(coachRow.getByText("Désactivé")).toBeVisible();

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["day", "night"]) {
      for (const palette of palettes) {
        const rows = await page.evaluate(
          ({ theme, palette }) => {
            document.documentElement.dataset.theme = theme;
            document.documentElement.dataset.palette = palette;
            return ["layout-root", "layout-admin", "layout-coach"].map(
              (username) => {
                const row = [
                  ...document.querySelectorAll<HTMLTableRowElement>("tbody tr"),
                ].find((row) => row.cells[0].textContent === username)!;
                const cell = row.cells[row.cells.length - 1];
                const badge = cell.querySelector<HTMLElement>(".status-badge")!;
                const badgeRect = badge.getBoundingClientRect();
                const cellRect = cell.getBoundingClientRect();
                const range = document.createRange();
                range.selectNodeContents(badge);
                const textRect = range.getBoundingClientRect();
                const style = getComputedStyle(badge);
                return {
                  cells: row.cells.length,
                  cellDisplay: getComputedStyle(cell).display,
                  cellHeight: cellRect.height,
                  cellWidth: cellRect.width,
                  width: badgeRect.width,
                  height: badgeRect.height,
                  horizontalOffset: Math.abs(
                    textRect.x +
                      textRect.width / 2 -
                      badgeRect.x -
                      badgeRect.width / 2,
                  ),
                  verticalOffset: Math.abs(
                    textRect.y +
                      textRect.height / 2 -
                      badgeRect.y -
                      badgeRect.height / 2,
                  ),
                  rowOffset: Math.abs(
                    badgeRect.y +
                      badgeRect.height / 2 -
                      cellRect.y -
                      cellRect.height / 2,
                  ),
                  display: style.display,
                  align: style.alignItems,
                  justify: style.justifyContent,
                  boxSizing: style.boxSizing,
                  whiteSpace: style.whiteSpace,
                  radius: style.borderRadius,
                  lineHeight: style.lineHeight,
                  color: style.color,
                  background: style.backgroundColor,
                };
              },
            );
          },
          { theme, palette: palette.value },
        );
        for (const row of rows) {
          expect(row.cells).toBe(5);
          expect(row.cellDisplay).toBe("table-cell");
          expect(row.width).toBe(rows[0].width);
          expect(row.height).toBe(rows[0].height);
          expect(row.cellHeight).toBe(rows[0].cellHeight);
          expect(row.cellWidth).toBe(rows[0].cellWidth);
          expect(row.radius).toBe(rows[0].radius);
          expect(row.lineHeight).toBe(rows[0].lineHeight);
          expect(row.horizontalOffset).toBeLessThanOrEqual(1);
          expect(row.verticalOffset).toBeLessThanOrEqual(1);
          expect(row.rowOffset).toBeLessThanOrEqual(1);
          // Inline-flex is blockified to flex when the badge is a flex item.
          expect(row.display).toBe("flex");
          expect(row.align).toBe("center");
          expect(row.justify).toBe("center");
          expect(row.boxSizing).toBe("border-box");
          expect(row.whiteSpace).toBe("nowrap");
          expect(contrast(row.color, row.background)).toBeGreaterThanOrEqual(
            4.5,
          );
        }
      }
      if (width === 1440) {
        await page.screenshot({
          path: testInfo.outputPath(`users-${theme}.png`),
          fullPage: true,
        });
      }
    }
  }
});
