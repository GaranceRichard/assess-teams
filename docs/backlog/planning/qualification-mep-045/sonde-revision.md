# Sonde temporaire de qualification MEP-045

Fichier d’exécution : `frontend/e2e/mep045-revision.ts`. Aucun changement applicatif.

À extraire du bloc TypeScript pour reproduire la commande d’[exécution](executions.md).

```typescript
import { expect, type Page, type Locator } from "@playwright/test";
import { login, gate, output } from "./mep045-support";
import { resolve } from "node:path";
export async function revise(page:Page, dialog:Locator, row:Locator,
  scores:(label:string)=>Promise<unknown>, events:object[], name:string) {
  let finals = 0, individual = 0, revisions = 0;
  const final = gate();
  await page.route("**/api/evaluations/*/finalize/", async route => {
    finals++; await final.promise;
    const response = await route.fetch();
    events.push({method:"POST",endpoint:"finalize",http:response.status()});
    await route.fulfill({response});
  });
  const validate = dialog.getByRole("button",{name:"Valider l’évaluation"});
  await validate.dblclick();
  await expect.poll(()=>finals).toBe(1);
  await expect(validate).toBeDisabled();
  final.release(); await expect(dialog).not.toBeVisible();
  expect(finals).toBe(1);
  await expect(row).toContainText("Complétée");
  await page.getByRole("button",{name:"Se déconnecter"}).click();
  await login(page,"taking-admin-e2e");
  await page.getByRole("link",{name:"Évaluations",exact:true}).click();
  await row.getByRole("button",{name:"Réviser les notes"}).click();
  page.on("request",request=>{
    if(request.method()==="PUT" && request.url().includes("/responses/")) individual++;
    if(request.method()==="PUT" && request.url().includes("/revision/")) revisions++;
  });
  await dialog.getByRole("button",{name:"Choisir la note 5 sur 10",exact:true}).click();
  await expect(dialog.locator(".transition-live #score-status")).toHaveText("Note à valider");
  expect(await scores("revision-locale")).toEqual([7,0]);
  expect(individual).toBe(0); expect(revisions).toBe(0);
  if(name==="day-1280x720" || name==="night-390x844")
    await dialog.screenshot({path:resolve(output,`${name}-revision.png`)});
  await dialog.getByRole("button",{name:"Suivant"}).click();
  await dialog.getByRole("button",{name:"Valider la révision"}).click();
  await expect(dialog).not.toBeVisible();
  expect(await scores("revision-validee")).toEqual([5,0]);
  expect(individual).toBe(0); expect(revisions).toBe(1);
  events.push({finalizations:finals,revisionIndividualPUT:individual,revisions});
}
```
