import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { e2eCredential } from "./identity-fixture";
import { seedResponsiveContext } from "./responsive-fixture";
import {
  reachable,
  responsiveGeometry,
  setResponsiveTheme,
} from "./responsive-geometry";

for (const theme of ["day", "night"]) {
  test(`long collections retain data, actions and pagination at UX-05 sizes (${theme})`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    page.setDefaultTimeout(10_000);
    seedResponsiveContext();
    await page.goto("/users");
    await page.getByLabel("Identifiant").fill("shell-admin-e2e");
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(
      page.getByRole("heading", { name: "Utilisateurs", exact: true }),
    ).toBeVisible();
    await setResponsiveTheme(page, theme);
    const measurements = [];
    for (const size of [
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
      { width: 1280, height: 480 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      for (const route of [
        "users",
        "teams",
        "templates",
        "planning",
        "evaluations",
        "steering",
        "activity-journal",
        "logs",
      ]) {
        await page.goto(`/${route}`);
        await setResponsiveTheme(page, theme);
        if (["teams", "templates"].includes(route))
          await page
            .getByRole("combobox", { name: "Organisation" })
            .selectOption({ label: "Shell viewport E2E" });
        if (route === "logs") {
          await page
            .getByRole("combobox", { name: "Niveau", exact: true })
            .selectOption("ERROR");
          await page
            .getByRole("button", { name: "Filtrer", exact: true })
            .click();
          await expect(page.locator(".collection-scroll")).toContainText(
            "Texte long sans perte de contenu.",
          );
        }
        const region = page.getByRole("region", {
          name: "Contenu de la collection",
          exact: true,
        });
        const pager = page.getByRole("navigation", {
          name: "Pagination",
          exact: true,
        });
        await expect(pager).toContainText("Page 1 /");
        await expect(page.locator(".collection-frame")).toHaveAttribute(
          "aria-busy",
          "false",
        );
        const first = await region.innerText();
        await region.focus();
        await page.keyboard.press("End");
        if (
          await region.evaluate(
            (element) => element.scrollHeight > element.clientHeight,
          )
        )
          await expect
            .poll(() => region.evaluate((element) => element.scrollTop))
            .toBeGreaterThan(0);
        const dimensions = await region.evaluate((element) => ({
          height: element.clientHeight,
          scrollHeight: element.scrollHeight,
          width: element.clientWidth,
          scrollWidth: element.scrollWidth,
          scrollTop: element.scrollTop,
        }));
        expect.soft(dimensions.height).toBeGreaterThan(0);
        const rowAction = region
          .locator("button:not(:disabled), a[href]")
          .last();
        const rowBounds = (await rowAction.count())
          ? await reachable(rowAction)
          : null;
        let rowScroll = null;
        if (await rowAction.count()) {
          rowScroll = await rowAction.evaluate((element) => ({
            width: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: getComputedStyle(element).overflowX,
          }));
          if (
            rowScroll.scrollWidth > rowScroll.width &&
            rowScroll.overflowX === "auto"
          ) {
            await rowAction.press("ArrowRight");
            await expect
              .poll(() => rowAction.evaluate((element) => element.scrollLeft))
              .toBeGreaterThan(0);
          }
        }
        const next = pager.getByRole("button", {
          name: "Suivant",
          exact: true,
        });
        const nextBounds = await reachable(next);
        await page.keyboard.press("Enter");
        await expect(pager).toContainText("Page 2 /");
        await expect(page.locator(".collection-frame")).toHaveAttribute(
          "aria-busy",
          "false",
        );
        expect.soft(await region.innerText()).not.toBe(first);
        const previous = pager.getByRole("button", {
          name: "Précédent",
          exact: true,
        });
        await reachable(previous);
        await page.keyboard.press("Enter");
        await expect(pager).toContainText("Page 1 /");
        await expect(page.locator(".collection-frame")).toHaveAttribute(
          "aria-busy",
          "false",
        );
        expect.soft(await region.innerText()).toBe(first);
        measurements.push({
          theme,
          route,
          size,
          dimensions,
          rowBounds,
          rowScroll,
          nextBounds,
          regions: await responsiveGeometry(page),
        });
        await region.evaluate((element) => element.scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(
            `${theme}-${size.width}-${size.height}-${route}.png`,
          ),
          fullPage: true,
        });
      }
    }
    writeFileSync(
      info.outputPath("measurements.jsonl"),
      measurements.map((row) => JSON.stringify(row)).join("\n") + "\n",
    );
  });
}
