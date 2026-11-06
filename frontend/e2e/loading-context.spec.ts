import { expect, test } from "@playwright/test";
import {
  resultActor,
  resultOrganizations,
  resultFamilies,
} from "../src/test/resultsFixture";
import { steeringFixture } from "../src/test/steeringFixture";

for (const view of ["results", "steering"]) {
  for (const old of [200, 500]) {
    for (const current of [200, 500]) {
      test(`${view}: late ${old} cannot replace current ${current}`, async ({
        page,
      }) => {
        await page.route("**/api/session/", (route) =>
          route.fulfill({ json: { ...resultActor, is_superuser: true } }),
        );
        await page.route(`**/api/${view}/organizations/`, (route) =>
          route.fulfill({ json: resultOrganizations }),
        );
        let finish!: () => void;
        let started!: () => void;
        const waiting = new Promise<void>((resolve) => {
          finish = resolve;
        });
        const requested = new Promise<void>((resolve) => {
          started = resolve;
        });
        const pattern =
          view === "results"
            ? "**/api/results/families/?organization_id=*"
            : "**/api/steering/?organization_id=*";
        await page.route(pattern, async (route) => {
          const organization = new URL(route.request().url()).searchParams.get(
            "organization_id",
          );
          if (organization === "1") {
            started();
            await waiting;
          }
          const status = organization === "1" ? old : current;
          const json =
            view === "results"
              ? organization === "1"
                ? []
                : resultFamilies
              : { ...steeringFixture, teams: [] };
          await route.fulfill({ status, json });
        });
        await page.goto(`/${view}`);
        await page
          .getByRole("combobox", { name: "Organisation", exact: true })
          .selectOption("1");
        await requested;
        await expect(page.getByRole("status")).toContainText("Chargement");
        await page
          .getByRole("combobox", { name: "Organisation", exact: true })
          .selectOption("2");
        if (current === 500)
          await expect(page.getByRole("alert")).toBeVisible();
        else if (view === "results")
          await expect(
            page.getByRole("combobox", { name: "Modèle", exact: true }),
          ).toContainText("Maturité");
        else
          await expect(
            page.getByText("Aucune équipe active dans cette organisation."),
          ).toBeVisible();
        const response = page.waitForResponse((r) =>
          r.url().includes("organization_id=1"),
        );
        finish();
        await response;
        // Let React process the obsolete fetch body and its success/error callback.
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
        );
        await expect(
          page.getByRole("combobox", { name: "Organisation", exact: true }),
        ).toHaveValue("2");
        await expect(page.getByRole("status")).toHaveCount(0);
        await expect(page.getByRole("alert")).toHaveCount(
          current === 500 ? 1 : 0,
        );
        if (view === "steering")
          await expect(page.getByText("Alpha", { exact: true })).toHaveCount(0);
        else if (current === 200)
          await expect(
            page.getByRole("combobox", { name: "Modèle", exact: true }),
          ).toContainText("Maturité");
        else
          await expect(
            page.getByRole("combobox", { name: "Modèle", exact: true }),
          ).toBeDisabled();
      });
    }
  }
}
