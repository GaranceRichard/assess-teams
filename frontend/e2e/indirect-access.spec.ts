import { expect, test } from "@playwright/test";
import {
  assignOrganization,
  e2eCredential,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

test("historical Results deep links lose access immediately after membership changes", async ({
  page,
}) => {
  seedResultsContext();
  seedIdentity("indirect-spare-admin", "Admin");
  seedIdentity("indirect-other-admin", "Admin");
  assignOrganization(["indirect-other-admin"], "Indirect B E2E");
  runDjangoShell([
    "from identities.models import Organization, User",
    "Organization.objects.get(name='Results E2E').users.add(User.objects.get(username='indirect-spare-admin'))",
  ]);
  await page.goto("/results");
  await page.getByLabel("Identifiant").fill("results-admin-e2e");
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Résultats", exact: true }),
  ).toBeVisible();
  const organizations = await (
    await page.request.get("/api/results/organizations/")
  ).json();
  const org = organizations[0].id;
  const families = await (
    await page.request.get(`/api/results/families/?organization_id=${org}`)
  ).json();
  const family = families[0].family_id;
  const version = families[0].id;
  const comparison = await (
    await page.request.get(`/api/results/families/${family}/`)
  ).json();
  const team = comparison.teams[0].team_id;
  const lineage = comparison.axes[0].lineage_id;
  const deepLink = `/results?organization_id=${org}&family_id=${family}&team_id=${team}`;
  await page.goto(deepLink);
  await expect(page.getByRole("checkbox", { name: /^Équipe A/ })).toBeChecked();
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toBeVisible();
  const session = (await page.context().cookies()).find(
    (cookie) => cookie.name === "sessionid",
  )!.value;
  runDjangoShell([
    "from identities.models import Organization, User",
    "actor = User.objects.get(username='results-admin-e2e')",
    "actor.organizations.set([Organization.objects.get(name='Indirect B E2E')])",
  ]);
  await page.reload();
  await expect(
    page.getByText("Aucune passation complétée accessible."),
  ).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: /Radar des résultats/ }),
  ).toHaveCount(0);
  expect(
    (await page.context().cookies()).find(
      (cookie) => cookie.name === "sessionid",
    )!.value,
  ).toBe(session);
  for (const path of [
    `/api/results/families/?organization_id=${org}`,
    `/api/results/families/${family}/`,
    `/api/results/versions/${version}/`,
    `/api/results/families/${family}/criteria/${lineage}/?team_ids=${team}`,
  ]) {
    const refused = await page.request.get(path);
    expect(refused.status()).toBe(404);
    const missingPath = path
      .replace(/\/\d+\//g, "/999999/")
      .replace(/(organization_id|team_ids)=\d+/g, "$1=999999");
    const missing = await page.request.get(missingPath);
    expect(missing.status()).toBe(404);
    expect(await refused.json()).toEqual(await missing.json());
    expect(Object.keys(await refused.json())).toEqual(["detail"]);
  }
});
