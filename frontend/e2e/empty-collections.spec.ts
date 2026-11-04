import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`collection absence, filter recovery and injected errors at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 720 });
    await page.route("**/api/session/", (route) =>
      route.fulfill({
        json: {
          username: "empty-admin",
          role: "Admin",
          is_superuser: false,
          organization_name: "North",
          team_names: [],
          interface_palette: "blue",
        },
      }),
    );
    let available = false;
    let status = 200;
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let hold = true;
    await page.route("**/api/admin/users/**", async (route) => {
      if (hold) await pending;
      const results =
        available && !route.request().url().includes("search=")
          ? [
              {
                id: 10,
                identifier: "Visible",
                email: "visible@example.com",
                user_type: "Viewer",
                is_active: true,
                pending: false,
                organizations: ["North"],
              },
            ]
          : [];
      await route.fulfill({
        status,
        json:
          status === 200
            ? { count: results.length, results, next: null, previous: null }
            : { detail: "Unavailable" },
      });
    });
    await page.goto("/users");
    await expect(page.getByRole("status")).toHaveText(
      "Chargement des utilisateurs\u2026",
    );
    await expect(page.getByText("Aucun utilisateur accessible.")).toHaveCount(
      0,
    );
    hold = false;
    release();
    await expect(page.getByText("Aucun utilisateur accessible.")).toBeVisible();
    async function capture(name: string) {
      await page.locator(".page-viewport").evaluate(async (element) => {
        await Promise.all(
          element.getAnimations().map((animation) => animation.finished),
        );
      });
      await page.screenshot({ path: testInfo.outputPath(`${name}.png`) });
    }
    await capture("absence");
    available = true;
    await page.reload();
    await expect(
      page.getByRole("cell", { name: "Visible", exact: true }),
    ).toBeVisible();
    await page.getByRole("searchbox").fill("absent");
    await expect(page.getByText("Aucun r\u00e9sultat.")).toBeVisible();
    await expect(page.getByText("Aucun utilisateur accessible.")).toHaveCount(
      0,
    );
    await capture("filter");
    await page.getByRole("searchbox").fill("");
    await expect(
      page.getByRole("cell", { name: "Visible", exact: true }),
    ).toBeVisible();
    for (const code of [403, 500]) {
      status = code;
      await page.reload();
      await expect(page.getByRole("alert")).toHaveText(
        "Impossible de charger les utilisateurs.",
      );
      await expect(page.getByText("Aucun utilisateur accessible.")).toHaveCount(
        0,
      );
      await expect(
        page.getByText("0 \u00e9l\u00e9ment", { exact: true }),
      ).toHaveCount(0);
      await capture(`error-${code}`);
    }
  });
}
