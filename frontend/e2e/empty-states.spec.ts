import { expect, test } from "@playwright/test";
import {
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

for (const role of ["Admin", "Coach", "Viewer"] as const) {
  test(`${role}: real excluded snapshots explain empty series and preserve scope`, async ({
    page,
  }, testInfo) => {
    seedResultsContext();
    const username = `empty-${role.toLowerCase()}-e2e`;
    seedIdentity(username, role);
    runDjangoShell([
      "from identities.models import Organization, User",
      "from teams.models import Team",
      "from assessments.models import EvaluationRunQuestion, EvaluationRun",
      "org = Organization.objects.get(name='Results E2E')",
      `actor = User.objects.get(username='${username}')`,
      "org.users.add(actor)",
      ...(role === "Coach"
        ? [
            "[team.coaches.add(actor) for team in Team.objects.filter(organization=org)]",
            "EvaluationRun.objects.filter(organization=org).update(assignee=actor)",
          ]
        : []),
      "EvaluationRunQuestion.objects.filter(run__organization=org, run__completed_at__gte='2026-10-01T00:00:00Z', index=1).update(score=None)",
    ]);
    await page.goto("/results");
    await page.getByLabel("Identifiant").fill(username);
    await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByLabel("Mod\u00e8le").selectOption({ label: "Radar E2E" });
    const response = await page.request.get(
      "/api/results/families/?organization_id=" +
        (await page.getByLabel("Organisation").inputValue()),
    );
    expect(response.status()).toBe(200);
    const families = await response.json();
    const comparison = await page.request.get(
      `/api/results/families/${families[0].family_id}/?evaluation_id=${families[0].id}`,
    );
    expect(comparison.status()).toBe(200);
    expect(await comparison.json()).toMatchObject({ teams: [] });
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      for (const theme of ["day", "night"]) {
        await page.evaluate(
          (value) => localStorage.setItem("assess-teams-theme", value),
          theme,
        );
        await page.reload();
        await page
          .getByLabel("Mod\u00e8le")
          .selectOption({ label: "Radar E2E" });
        for (const tab of ["Graphique", "Donn\u00e9es d\u00e9taill\u00e9es"]) {
          await page.getByRole("tab", { name: tab, exact: true }).click();
          await expect(
            page.getByText(
              "Aucune \u00e9quipe avec un r\u00e9sultat exploitable pour cette version.",
            ),
          ).toBeVisible();
          await expect(
            page.getByText(/S\u00e9lectionnez une ou plusieurs \u00e9quipes/),
          ).toHaveCount(0);
          await expect(page.getByRole("checkbox")).toHaveCount(0);
          await expect(
            page.getByRole("cell", { name: "0 / 10", exact: true }),
          ).toHaveCount(0);
          const message = page.getByText(
            "Aucune \u00e9quipe avec un r\u00e9sultat exploitable pour cette version.",
          );
          await message.scrollIntoViewIfNeeded();
          const box = await message.boundingBox();
          expect(box!.y).toBeGreaterThanOrEqual(0);
          expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
          await page.locator(".page-viewport").evaluate(async (element) => {
            await Promise.all(
              element.getAnimations().map((animation) => animation.finished),
            );
          });
          await page.screenshot({
            path: testInfo.outputPath(
              `${viewport.width}-${theme}-${tab === "Graphique" ? "radar" : "details"}.png`,
            ),
          });
        }
      }
    }
    if (role !== "Admin") {
      await page.goto("/steering");
      await expect(page.getByRole("alert")).toContainText(
        "Page non autoris\u00e9e",
      );
      expect(
        (await page.request.get("/api/steering/organizations/")).status(),
      ).toBe(403);
    }
    expect(
      (
        await page.request.get("/api/results/families/?organization_id=999999")
      ).status(),
    ).toBe(404);
  });
}
