import { expect, test, type Page } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

async function prepare(page: Page, suffix: string) {
  const owner = `org004-owner-${suffix}`;
  const root = `org004-root-${suffix}`;
  const name = `ORG-004 ${suffix}`;
  seedIdentity(owner, "Admin");
  seedSuperadmin(root, `unused-${suffix}@example.com`);
  assignOrganization([owner], name);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(root);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByRole("link", { name: "Organisation", exact: true }).click();
  const response = await page.request.get("/api/admin/organizations/");
  const organization = (await response.json()).find(
    (item: { name: string }) => item.name === name,
  );
  expect(organization).toBeTruthy();
  const token = (await page.context().cookies()).find(
    (cookie) => cookie.name === "csrftoken",
  )!.value;
  return {
    owner,
    name,
    id: organization.id as number,
    headers: { "X-CSRFToken": token },
  };
}

for (const width of [1280, 390]) {
  test(`ORG-004 confirms and deletes only an admissible organization at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    const context = await prepare(page, `empty-${width}`);
    const row = page
      .locator(".organization-list li")
      .filter({ hasText: context.name });
    await row.getByRole("button", { name: "Supprimer", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("quel que soit leur état");
    await expect(dialog).toContainText("durées de rétention applicables");
    const confirm = dialog.getByRole("button", {
      name: "Supprimer l’organisation",
    });
    await expect(confirm).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath("confirmation.png") });
    const deleted = page.waitForResponse(
      (response) => response.request().method() === "DELETE",
    );
    await confirm.click();
    expect((await deleted).status()).toBe(204);
    await expect(row).toHaveCount(0);
    await page.reload();
    await expect(
      page.locator(".organization-list li").filter({ hasText: context.name }),
    ).toHaveCount(0);
    for (const endpoint of ["activity-journal", "logs"]) {
      const response = await page.request.get(
        `/api/admin/${endpoint}/?organization_origin_id=${context.id}`,
      );
      expect(response.status()).toBe(200);
      const history = await response.json();
      expect(history.count).toBeGreaterThan(0);
      expect(
        history.results.every(
          (entry: { organization_origin_id: number }) =>
            entry.organization_origin_id === context.id,
        ),
      ).toBe(true);
    }
    runDjangoShell([
      "from identities.models import Organization, User",
      `assert User.objects.filter(username='${context.owner}', is_active=True).exists()`,
      `assert not Organization.objects.filter(pk=${context.id}).exists()`,
      `assert not User.objects.get(username='${context.owner}').organizations.exists()`,
    ]);
  });

  test(`ORG-004 cancels then refuses a dependency created during confirmation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    const context = await prepare(page, `refusal-${width}`);
    const row = page
      .locator(".organization-list li")
      .filter({ hasText: context.name });
    const deletes: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "DELETE") deletes.push(request.url());
    });
    await row.getByRole("button", { name: "Supprimer", exact: true }).click();
    await page.getByRole("button", { name: "Annuler", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(deletes).toHaveLength(0);
    await row.getByRole("button", { name: "Supprimer", exact: true }).click();
    const created = await page.request.post(
      `/api/admin/organizations/${context.id}/teams/`,
      {
        headers: context.headers,
        data: { name: "Protected team", coach_ids: [] },
      },
    );
    expect(created.status()).toBe(201);
    const team = await created.json();
    for (const archived of [false, true]) {
      if (archived) {
        const response = await page.request.delete(
          `/api/admin/teams/${team.id}/`,
          { headers: context.headers },
        );
        expect(response.status()).toBe(204);
      }
      const refused = page.waitForResponse(
        (response) =>
          response.request().method() === "DELETE" &&
          response.url().endsWith(`/organizations/${context.id}/`),
      );
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Supprimer l’organisation" })
        .click();
      expect((await refused).status()).toBe(400);
      await expect(page.getByRole("alert")).toContainText("équipes");
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(row).toBeVisible();
    }
    await page.getByRole("button", { name: "Annuler", exact: true }).click();
    await page.reload();
    await expect(
      page.locator(".organization-list li").filter({ hasText: context.name }),
    ).toBeVisible();
    const journal = await page.request.get(
      `/api/admin/activity-journal/?organization_origin_id=${context.id}`,
    );
    expect(
      (await journal.json()).results.some(
        (entry: { action: string }) => entry.action === "organization_deleted",
      ),
    ).toBe(false);
  });
}
