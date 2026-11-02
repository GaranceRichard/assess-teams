import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
} from "./identity-fixture";
import { menuFor } from "../src/navigation";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  video: "on",
});

for (const theme of ["day", "night"] as const) {
  for (const role of ["Admin", "Coach", "Viewer"] as const) {
    test(`mobile touch navigation, focus and retained collapse for ${role} ${theme}`, async ({
      page,
    }) => {
      const username = `mobile-${role.toLowerCase()}-e2e`;
      seedIdentity(username, role);
      assignOrganization([username], `Mobile ${role}`);
      await page.addInitScript(
        (value) => localStorage.setItem("assess-teams-theme", value),
        theme,
      );
      await page.goto("/");
      await page.getByLabel("Identifiant").fill(username);
      await page
        .getByLabel("Mot de passe", { exact: true })
        .fill(e2eCredential);
      await page.getByRole("button", { name: "Se connecter" }).tap();
      const navigation = page.getByRole("navigation", {
        name: "Navigation principale",
      });
      await expect(navigation).toBeVisible();
      expect(
        await page.evaluate(() => matchMedia("(hover: none)").matches),
      ).toBe(true);
      await expect(navigation.getByRole("link")).toHaveCount(
        menuFor(role).length,
      );
      await page.getByRole("button", { name: "Replier le menu" }).tap();
      const expand = page.getByRole("button", { name: "Déplier le menu" });
      await expect(expand).toHaveAttribute("aria-expanded", "false");
      const targets = [];
      for (const collapsed of [true, false]) {
        for (const destination of menuFor(role)) {
          const link = navigation.getByRole("link", {
            name: destination.title,
            exact: true,
          });
          await link.tap();
          await expect(page).toHaveURL(new RegExp(`${destination.path}$`));
          await expect(link).toHaveAttribute("aria-current", "page");
          await expect(
            page.getByRole("button", {
              name: collapsed ? "Déplier le menu" : "Replier le menu",
            }),
          ).toBeVisible();
          const bounds = await link.evaluate((element) => {
            const r = element.getBoundingClientRect();
            return {
              width: r.width,
              height: r.height,
              reached: element.contains(
                document.elementFromPoint(
                  r.x + r.width / 2,
                  r.y + r.height / 2,
                ),
              ),
            };
          });
          expect(bounds.reached).toBe(true);
          targets.push({
            role,
            theme,
            collapsed,
            path: destination.path,
            ...bounds,
          });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
        }
        await page
          .getByRole("button", {
            name: collapsed ? "Déplier le menu" : "Replier le menu",
          })
          .tap();
      }
      const measurements = test.info().outputPath("touch-targets.json");
      writeFileSync(measurements, JSON.stringify(targets, null, 2));
      await test.info().attach("touch-targets", {
        path: measurements,
        contentType: "application/json",
      });
      await expand.focus();
      await page.keyboard.press("Enter");
      const collapse = page.getByRole("button", { name: "Replier le menu" });
      await expect(collapse).toBeFocused();
      await expect(collapse).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Space");
      await expect(expand).toBeFocused();
      const results = navigation.getByRole("link", {
        name: "Résultats",
        exact: true,
      });
      await results.focus();
      await page.keyboard.press("Enter");
      await expect(results).toBeFocused();
      await expect(results).toHaveAttribute("aria-current", "page");
      await expect(page.locator(".transition-outgoing")).toHaveCount(0);
      await page.screenshot({
        path: test.info().outputPath(`${role}-collapsed.png`),
        fullPage: true,
      });
      await expand.tap();
      await page.screenshot({
        path: test.info().outputPath(`${role}-expanded.png`),
        fullPage: true,
      });
      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 1280, height: 480 },
      ]) {
        await page.setViewportSize(viewport);
        await collapse.focus();
        await page.keyboard.press("Enter");
        await expect(expand).toBeFocused();
        await results.focus();
        await page.keyboard.press("Enter");
        await expect(results).toBeFocused();
        await expect(expand).toBeInViewport();
        await page.screenshot({
          path: test
            .info()
            .outputPath(
              `${role}-${theme}-${viewport.width}-${viewport.height}.png`,
            ),
        });
        await expand.focus();
        await page.keyboard.press("Space");
        await expect(collapse).toBeFocused();
      }
      if (role !== "Admin") {
        await expect(
          navigation.getByRole("link", { name: "Équipes", exact: true }),
        ).toHaveCount(0);
        await page.goto("/teams");
        await expect(page.getByRole("alert")).toContainText(
          "Page non autorisée",
        );
        expect(
          (await page.request.get("/api/admin/organizations/")).status(),
        ).toBe(403);
      }
    });
  }
}
