import { expect, test, type Page } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  seedIdentity,
  seedSuperadmin,
} from "./identity-fixture";

async function login(page: Page, username: string) {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("link", { name: "Logs", exact: true }),
  ).toBeVisible();
}

async function createHttpLogs(page: Page, teamName: string) {
  return page.evaluate(async (name) => {
    const organizations = await (
      await fetch("/api/admin/organizations/")
    ).json();
    const organizationId = organizations[0].id as number;
    const url = `/api/admin/organizations/${organizationId}/teams/`;
    const csrf = decodeURIComponent(
      document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("csrftoken="))!
        .split("=")[1],
    );
    const created = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      body: JSON.stringify({ name, coach_ids: [] }),
    });
    const team = await created.json();
    const rejected = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      body: JSON.stringify({ name, coach_ids: [] }),
    });
    await fetch(url);
    return {
      organizationId,
      teamId: team.id as number,
      created: created.status,
      rejected: rejected.status,
    };
  }, teamName);
}

test("HTTP logs are created, filtered and isolated across Admin organizations and Superadmin", async ({
  page,
}) => {
  seedIdentity("http-logs-admin-a", "Admin");
  seedIdentity("http-logs-admin-b", "Admin");
  assignOrganization(["http-logs-admin-a"], "HTTP Logs A");
  assignOrganization(["http-logs-admin-b"], "HTTP Logs B");
  seedSuperadmin("http-logs-root", "http-logs-root-cleanup@example.com");

  await login(page, "http-logs-admin-b");
  const foreign = await createHttpLogs(page, "HTTP Beta");
  expect(foreign.created).toBe(201);
  expect(foreign.rejected).toBe(400);
  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await login(page, "http-logs-admin-a");
  const own = await createHttpLogs(page, "HTTP Alpha");
  expect(own.created).toBe(201);
  expect(own.rejected).toBe(400);
  const csrf = await page.evaluate(() =>
    decodeURIComponent(
      document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("csrftoken="))!
        .split("=")[1],
    ),
  );
  expect(
    (
      await page.request.delete(`/api/admin/teams/${own.teamId}/`, {
        headers: { "X-CSRFToken": csrf },
      })
    ).status(),
  ).toBe(204);
  await page.getByRole("link", { name: "Logs", exact: true }).click();
  await expect(page.getByLabel("Organisation")).toHaveValue(
    String(own.organizationId),
  );
  await expect(page.getByLabel("Organisation")).toBeDisabled();
  await expect(page.getByRole("option", { name: "HTTP Alpha" })).toBeAttached();
  await expect(page.getByRole("option", { name: "HTTP Beta" })).toHaveCount(0);
  await page
    .getByLabel("Équipe", { exact: true })
    .selectOption(String(own.teamId));
  await page.getByLabel("Méthode").selectOption("POST");
  await page.getByLabel("Statut").fill("201");
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(page.getByText("Page 1 · 1 entrées")).toBeVisible();
  await expect(page.locator(".log-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".log-table tbody tr")).toContainText(
    "HTTP POST 201",
  );
  await expect(page.locator(".log-table tbody tr")).toContainText(
    "HTTP Logs A",
  );
  await expect(page.locator(".log-table tbody")).not.toContainText(
    "HTTP Logs B",
  );

  const forged = await page.request.get(
    `/api/admin/logs/?organization=${foreign.organizationId}&team=${foreign.teamId}`,
  );
  expect(forged.status()).toBe(200);
  expect((await forged.json()).count).toBe(0);
  await page.getByRole("button", { name: "Effacer" }).click();
  await page.getByLabel("Méthode").selectOption("POST");
  await page.getByLabel("Niveau").selectOption("WARNING");
  await page.getByLabel("Source").selectOption("teams");
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(page.locator(".log-table tbody tr").first()).toContainText(
    "HTTP POST 400",
  );
  await expect(page.locator(".log-table tbody tr").first()).toHaveClass(
    /log-row--warning/,
  );
  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await login(page, "http-logs-root");
  await page.getByRole("link", { name: "Logs", exact: true }).click();
  await expect(page.getByLabel("Organisation")).toBeEnabled();
  await page
    .getByLabel("Organisation")
    .selectOption(String(foreign.organizationId));
  await expect(page.getByRole("option", { name: "HTTP Beta" })).toBeAttached();
  await page
    .getByLabel("Équipe", { exact: true })
    .selectOption(String(foreign.teamId));
  await page.getByLabel("Méthode").selectOption("POST");
  await page.getByLabel("Statut").fill("201");
  await page.getByRole("button", { name: "Filtrer" }).click();
  await expect(page.locator(".log-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".log-table tbody tr")).toContainText(
    "HTTP Logs B",
  );
  await page
    .getByLabel("Organisation")
    .selectOption(String(own.organizationId));
  await expect(page.getByLabel("Équipe", { exact: true })).toHaveValue("");
  await expect(page.getByRole("option", { name: "HTTP Beta" })).toHaveCount(0);
});
