import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import { e2eCredential } from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";
import { contrast } from "./palette-contrast";

test("UX-09 explains zero, absence, recency and continuity without altering results or selection", async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  seedResultsContext(true);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page
    .getByRole("link", { name: "Tableau de bord", exact: true })
    .click();
  await page.getByText("Couleurs", { exact: true }).click();
  await page.getByRole("radio", { name: "Vert", exact: true }).check();
  await page.getByRole("link", { name: "Résultats", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "green");
  await page.getByLabel("Modèle").selectOption({ label: "Radar E2E" });
  await page.getByRole("checkbox", { name: /^Équipe A/ }).check();
  await page.getByRole("checkbox", { name: /^Équipe B/ }).check();
  const selectedModel = await page.getByLabel("Modèle").inputValue();
  const directory = process.env.ASSESS_SCORE_AUDIT
    ? resolve(process.env.ASSESS_SCORE_AUDIT)
    : info.outputPath("scores");
  mkdirSync(directory, { recursive: true });
  const rows = [];
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/results/")) requests++;
  });
  for (const theme of ["day", "night"]) {
    const toggle = page.getByRole("button", {
      name: theme === "day" ? "Activer le mode jour" : "Activer le mode nuit",
    });
    if (await toggle.count()) await toggle.click();
    for (const size of [
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      for (const temporal of [false, true]) {
        const analysis = page.getByRole("switch", {
          name: "Analyse",
          exact: true,
        });
        if ((await analysis.getAttribute("aria-checked")) !== String(temporal))
          await analysis.click();
        if (temporal)
          await page
            .getByLabel("Critère", { exact: true })
            .selectOption({ index: 1 });
        for (const detailed of [false, true]) {
          await page
            .getByRole("tab", {
              name: detailed ? "Données détaillées" : "Graphique",
              exact: true,
            })
            .click();
          await expect(
            page.getByRole(detailed ? "table" : "img"),
          ).toBeVisible();
          if (temporal && detailed) {
            const table = page.getByRole("table");
            await expect(
              table.locator("tbody tr").nth(1).locator("td").first(),
            ).toContainText("0/10");
            await expect(
              table.locator("tbody tr").nth(2).locator("td").last(),
            ).toHaveText("");
            await expect(table.locator("tbody small").first()).toContainText(
              /v1 · Passation n°/,
            );
          }
          const name = `${theme}-${size.width}-${size.height}-${temporal ? "history" : "radar"}-${detailed ? "details" : "chart"}`;
          const help = page.getByRole("button", {
            name: "Scores 0–10 : mode d’emploi",
          });
          await help.focus();
          const before = requests;
          await page.keyboard.press("Enter");
          const dialog = page.getByRole("dialog", {
            name: "Comprendre les résultats",
          });
          await expect(dialog).toContainText(
            "0/10 est une note réellement mesurée",
          );
          await expect(dialog).toContainText(
            "cellule vide signifie aucune observation à ce rang",
          );
          await expect(dialog).toContainText("date de complétion initiale");
          await expect(dialog).toContainText(
            "un lien ne garantit pas un sens identique des notes",
          );
          await expect(dialog).toContainText(
            "ne prouvent pas une progression continue",
          );
          const measures = await dialog.evaluate((element) => {
            const body = element.querySelector<HTMLElement>(
              ".results-score-guide",
            )!;
            const style = getComputedStyle(body);
            const rect = body.getBoundingClientRect();
            return {
              width: document.documentElement.scrollWidth,
              available: document.documentElement.clientWidth,
              dialogTop: rect.top,
              dialogBottom: rect.bottom,
              height: innerHeight,
              text: body.textContent,
              color: style.color,
              background: style.backgroundColor,
            };
          });
          expect(measures.width).toBeLessThanOrEqual(measures.available);
          expect(measures.dialogTop).toBeGreaterThanOrEqual(0);
          expect(measures.dialogBottom).toBeLessThanOrEqual(measures.height);
          expect(
            contrast(measures.color, measures.background),
          ).toBeGreaterThanOrEqual(4.5);
          if (!temporal && !detailed)
            await page.screenshot({
              path: resolve(directory, name + "-help.png"),
              fullPage: true,
            });
          await dialog.locator("p").last().scrollIntoViewIfNeeded();
          await expect(dialog.locator("p").last()).toBeInViewport();
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0);
          await expect(help).toBeFocused();
          expect(requests).toBe(before);
          await expect(
            page.getByRole("checkbox", { name: /^Équipe A/ }),
          ).toBeChecked();
          await expect(
            page.getByRole("checkbox", { name: /^Équipe B/ }),
          ).toBeChecked();
          await expect(page.getByLabel("Modèle")).toHaveValue(selectedModel);
          await page.screenshot({
            path: resolve(directory, name + ".png"),
            fullPage: true,
          });
          rows.push({
            scenario: "UX-09",
            theme,
            palette: "green",
            ...size,
            zoom: 100,
            name,
            ...measures,
            status: "Passé",
          });
        }
      }
    }
  }
  writeFileSync(
    resolve(directory, "measurements.jsonl"),
    rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
  );
});
