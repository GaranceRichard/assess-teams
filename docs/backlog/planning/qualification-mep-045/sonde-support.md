# Sonde temporaire de qualification MEP-045

Fichier d’exécution : `frontend/e2e/mep045-support.ts`. Aucun changement applicatif.

À extraire du bloc TypeScript pour reproduire la commande d’[exécution](executions.md).

```typescript
import { expect, type Page, type Locator } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { e2eCredential } from "./identity-fixture";
export const output = resolve(import.meta.dirname, "../../.cache/mep-045");
export async function login(page: Page, username = "taking-coach-e2e") {
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe", { exact: true }).fill(e2eCredential);
  await page.getByRole("button", { name: "Se connecter" }).click();
}
export function gate() {
  let release!: () => void;
  const promise = new Promise<void>((r) => { release = r; });
  return { promise, release };
}
export async function geometry(dialog: Locator) {
  await dialog.evaluate(async (e) => {
    await Promise.all(e.getAnimations().map((a) => a.finished));
  });
  return {
    modal: await dialog.boundingBox(),
    footer: await dialog.locator(".taking-footer").boundingBox(),
    action: await dialog.locator(".taking-content > button.taking-note-action").evaluate(e => { const r=e.getBoundingClientRect(); return { x:r.x, y:r.y, height:r.height }; }),
  };
}
export async function capture(dialog: Locator, name: string) {
  await dialog.locator(".transition-live #score-status").scrollIntoViewIfNeeded();
  await expect(dialog.locator(".transition-live #score-status")).toBeInViewport();
  await expect(dialog.getByRole("button", { name: "Fermer", exact: true })).toBeInViewport();
  await dialog.screenshot({ path: resolve(output, `${name}.png`) });
}
export function save(name: string, value: unknown) {
  writeFileSync(resolve(output, `${name}.json`), JSON.stringify(value, null, 2));
}
```
