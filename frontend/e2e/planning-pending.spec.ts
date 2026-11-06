import { expect, test } from "@playwright/test";
import { resultActor } from "../src/test/resultsFixture";
import { evaluation, existing, team } from "../src/test/planningFixture";

for (const mobile of [false, true]) {
  for (const status of [201, 400]) {
    test(`planning protects delayed mutation ${status} ${mobile ? "mobile night" : "desktop day"}`, async ({
      page,
    }, info) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 },
      );
      if (mobile)
        await page.addInitScript(() =>
          localStorage.setItem("assess-teams-theme", "night"),
        );
      await page.route("**/api/session/", (route) =>
        route.fulfill({ json: resultActor }),
      );
      let finishInitial!: () => void;
      const initial = new Promise<void>((resolve) => {
        finishInitial = resolve;
      });
      await page.route("**/api/admin/organizations/", async (route) => {
        await initial;
        await route.fulfill({
          json: [
            {
              id: 1,
              name: "North",
              users: [{ id: 10, identifier: "admin", user_type: "Admin" }],
            },
          ],
        });
      });
      await page.route("**/api/admin/evaluations/", (route) =>
        route.fulfill({ json: [evaluation] }),
      );
      await page.route("**/api/admin/organizations/1/teams/", (route) =>
        route.fulfill({ json: [team] }),
      );
      let finish!: () => void;
      const pending = new Promise<void>((resolve) => {
        finish = resolve;
      });
      let calls = 0;
      await page.route("**/api/admin/planning/**", async (route) => {
        if (route.request().method() !== "POST")
          return route.fulfill({
            json: { count: 0, results: [], next: null, previous: null },
          });
        calls += 1;
        await pending;
        await route.fulfill({
          status,
          json: status === 201 ? existing : { detail: "refused" },
        });
      });
      await page.goto("/planning");
      await expect(page.getByRole("status")).toHaveText(
        "Chargement de la planification…",
      );
      await expect(
        page.getByRole("combobox", { name: "Organisation", exact: true }),
      ).toBeDisabled();
      await page.screenshot({ path: info.outputPath("planning-initial.png") });
      finishInitial();
      await page
        .getByRole("combobox", { name: "Équipe", exact: true })
        .selectOption("3");
      await page.getByLabel("Responsable de l’évaluation").selectOption("10");
      await page.getByLabel("Modèle d’évaluation").selectOption("2");
      await page
        .getByRole("button", { name: "Planifier l’évaluation" })
        .click();
      await expect.poll(() => calls).toBe(1);
      await expect(
        page.getByRole("button", { name: "Enregistrement…" }),
      ).toBeDisabled();
      await expect(
        page.getByRole("combobox", { name: "Équipe", exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole("combobox", { name: "Organisation", exact: true }),
      ).toBeDisabled();
      await page.locator(".planning-form").evaluate((form) => {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      });
      await page.screenshot({ path: info.outputPath("planning-saving.png") });
      expect(calls).toBe(1);
      finish();
      if (status === 400) {
        await expect(page.getByRole("alert")).toHaveText(
          "La planification de l’évaluation a été refusée.",
        );
        await expect(
          page.getByRole("combobox", { name: "Équipe", exact: true }),
        ).toHaveValue("3");
        await expect(
          page.getByRole("button", {
            name: "North - Maturité v1 - Alpha - coach",
          }),
        ).toHaveCount(0);
      } else {
        await expect(
          page.getByRole("button", {
            name: "North - Maturité v1 - Alpha - coach",
          }),
        ).toBeVisible();
        await expect(
          page.getByRole("combobox", { name: "Équipe", exact: true }),
        ).toHaveValue("");
      }
      await expect(
        page.getByRole("combobox", { name: "Organisation", exact: true }),
      ).toBeEnabled();
      await page.screenshot({ path: info.outputPath("planning-settled.png") });
    });
  }
}
