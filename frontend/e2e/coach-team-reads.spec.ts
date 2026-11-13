import { expect, test } from "@playwright/test";

import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedCoachTeams,
  seedIdentity,
} from "./identity-fixture";

test("C04 bounds Coach reads to current active assignments and retained archives", async ({
  page,
}) => {
  seedIdentity("c04-admin", "Admin");
  seedIdentity("c04-coach", "Coach");
  assignOrganization(["c04-admin", "c04-coach"], "C04 E2E");
  seedCoachTeams("c04-coach", "C04 E2E", ["Active C04", "Archived C04"]);
  runDjangoShell([
    "from identities.models import Organization",
    "from teams.models import Team",
    "org = Organization.objects.get(name='C04 E2E')",
    "Team.objects.create(name='Unassigned C04', organization=org)",
    "Team.objects.filter(name='Archived C04', organization=org).update(is_active=False)",
  ]);
  await page.goto("/");
  await page.getByLabel("Identifiant").fill("c04-admin");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  const organizations = await (
    await page.request.get("/api/admin/organizations/")
  ).json();
  const org = organizations.find(
    (item: { name: string }) => item.name === "C04 E2E",
  );
  const collection = `/api/admin/organizations/${org.id}/teams/`;
  const teams = await (
    await page.request.get(`${collection}?include_archived=true`)
  ).json();
  const active = teams.find(
    (item: { name: string }) => item.name === "Active C04",
  );
  const archived = teams.find(
    (item: { name: string }) => item.name === "Archived C04",
  );
  const hidden = teams.find(
    (item: { name: string }) => item.name === "Unassigned C04",
  );
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await page.getByLabel("Identifiant").fill("c04-coach");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText(/^Équipes :/)).toContainText("Active C04");
  await expect(
    page.getByRole("link", { name: "Équipes", exact: true }),
  ).toHaveCount(0);

  const minimal = {
    id: active.id,
    name: active.name,
    organization_id: org.id,
    is_active: true,
  };
  for (const query of [
    "",
    "?include_archived=true",
    "?page=1&include_archived=true",
  ]) {
    const response = await page.request.get(`${collection}${query}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(query.includes("page=") ? data.results : data).toEqual([minimal]);
    if (query.includes("page=")) expect(data.count).toBe(1);
  }
  for (const team of [active, archived]) {
    const response = await page.request.get(`/api/admin/teams/${team.id}/`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      id: team.id,
      name: team.name,
      organization_id: org.id,
      is_active: team.is_active,
    });
  }
  const hiddenResponse = await page.request.get(
    `/api/admin/teams/${hidden.id}/`,
  );
  const missingResponse = await page.request.get("/api/admin/teams/999999999/");
  expect(hiddenResponse.status()).toBe(404);
  expect(missingResponse.status()).toBe(404);
  expect(await hiddenResponse.json()).toEqual(await missingResponse.json());
  expect((await page.request.get("/api/admin/organizations/")).status()).toBe(
    403,
  );
  const csrf = (await page.context().cookies()).find(
    (cookie) => cookie.name === "csrftoken",
  )!.value;
  const headers = { "X-CSRFToken": csrf };
  expect(
    (
      await page.request.post(collection, {
        headers,
        data: { name: "Forbidden", coach_ids: [] },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.put(`/api/admin/teams/${active.id}/`, {
        headers,
        data: { name: "Forbidden", coach_ids: [] },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.delete(`/api/admin/teams/${archived.id}/`, { headers })
    ).status(),
  ).toBe(403);

  runDjangoShell([
    "from identities.models import User",
    "from teams.models import Team",
    "coach = User.objects.get(username='c04-coach')",
    "coach.coached_teams.clear()",
  ]);
  expect(
    (await page.request.get(`/api/admin/teams/${archived.id}/`)).status(),
  ).toBe(404);
  expect(await (await page.request.get(collection)).json()).toEqual([]);
  await page.reload();
  await expect(
    page.getByText("Aucune équipe active actuellement affectée."),
  ).toBeVisible();

  runDjangoShell([
    "from identities.models import User",
    "from teams.models import Team",
    "coach = User.objects.get(username='c04-coach')",
    "team = Team.objects.get(name='Archived C04', organization__name='C04 E2E')",
    "team.coaches.add(coach)",
    "coach.organizations.clear()",
  ]);
  expect(
    (await page.request.get(`/api/admin/teams/${archived.id}/`)).status(),
  ).toBe(404);
  expect((await page.request.get(collection)).status()).toBe(404);
});
