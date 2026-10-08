import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { e2eCredential, seedIdentity } from "./identity-fixture";

test.use({ trace: "off" }); // Passwords and tokens must never enter trace archives.
const renewed = "Playwright-renewed-phrase-2026!";

function deliveredLink(email: string): string | undefined {
  const directory = resolve(import.meta.dirname, "../../backend/.mail");
  let files: string[];
  try {
    files = readdirSync(directory);
  } catch {
    return;
  }
  for (const file of files.reverse()) {
    const message = readFileSync(resolve(directory, file), "utf8");
    if (!message.includes("To: " + email)) continue;
    const link = message.match(
      /https?:\/\/[^\s]+\/password\/reset#[A-Za-z0-9_-]+\/[a-z0-9-]+/,
    );
    if (link) return link[0];
  }
}

async function fillNew(page: import("@playwright/test").Page) {
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill(renewed);
  await page.getByLabel("Confirmer le nouveau mot de passe").fill(renewed);
  await page
    .getByRole("button", { name: "Modifier mon mot de passe", exact: true })
    .click();
}

async function login(
  page: import("@playwright/test").Page,
  name: string,
  password: string,
) {
  await page.goto("/");
  await page.getByLabel("Identifiant").fill(name);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
}

test("forgot password sends a real email, resets once and returns to login", async ({
  page,
}) => {
  const name = "recovery-" + Date.now();
  seedIdentity(name, "Viewer");
  await page.goto("/");
  await page.getByRole("link", { name: "Mot de passe oublié ?" }).click();
  await page.getByLabel("Adresse email").fill(name + "@example.com");
  await page.getByRole("button", { name: "Recevoir un lien" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Si un compte actif correspond",
  );
  let link: string | undefined;
  await expect
    .poll(
      () => {
        link = deliveredLink(name + "@example.com");
        return Boolean(link);
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  const target = new URL(link!);
  await page.goto(target.pathname + target.hash);
  await expect(
    page.getByLabel("Nouveau mot de passe", { exact: true }),
  ).toBeVisible();
  await expect.poll(() => new URL(page.url()).hash === "").toBe(true);
  await fillNew(page);
  await expect(page.getByRole("status")).toContainText("Reconnectez-vous");
  await page.getByRole("button", { name: "Retour à la connexion" }).click();
  await login(page, name, renewed);
  await page.goto(target.pathname + target.hash);
  await fillNew(page);
  await expect(page.getByRole("alert")).toContainText("invalide ou expiré");
  await page.getByRole("button", { name: "Demander un nouveau lien" }).click();
  await page
    .getByLabel("Adresse email")
    .fill("absent-" + name + "@example.com");
  await page.getByRole("button", { name: "Recevoir un lien" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Si un compte actif correspond",
  );
});

test("profile change checks current password, preserves one session and fits mobile", async ({
  page,
  browser,
}) => {
  const name = "change-" + Date.now();
  seedIdentity(name, "Viewer");
  await login(page, name, e2eCredential);
  const second = await browser.newContext();
  const other = await second.newPage();
  await login(other, name, e2eCredential);
  await page.setViewportSize({ width: 375, height: 812 });
  await page
    .locator("summary")
    .filter({ hasText: "Modifier mon mot de passe" })
    .click();
  await page.getByLabel("Mot de passe actuel").fill("Invalid-test-current!");
  await fillNew(page);
  await expect(page.getByRole("alert")).toContainText("actuel est incorrect");
  await page.getByLabel("Mot de passe actuel").fill(e2eCredential);
  await fillNew(page);
  await expect(page.getByRole("status")).toContainText(
    "Votre session reste ouverte",
  );
  await expect(page.getByRole("navigation")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await other.reload();
  await expect(
    other.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Tableau de bord" }),
  ).toBeVisible();
  await second.close();
});
