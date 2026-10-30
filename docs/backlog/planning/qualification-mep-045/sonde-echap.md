# Sonde temporaire de qualification MEP-045

Fichier d’exécution : `frontend/e2e/mep045-escape.spec.ts`. Aucun changement applicatif.

À extraire du bloc TypeScript pour reproduire la commande d’[exécution](executions.md).

```typescript
import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { seedTakingContext } from "./taking-fixture";
import { login, output, save } from "./mep045-support";
for (const theme of ["day","night"]) test(`MEP045 repeated Escape refusal ${theme}`,async({page,browser})=>{
  seedTakingContext();
  await page.addInitScript(t=>localStorage.setItem("assess-teams-theme",t),theme);
  await page.setViewportSize({width:1280,height:720});
  await page.goto("/evaluations"); await login(page);
  const row=page.getByRole("row").filter({hasText:"Passation E2E v1"});
  await row.getByRole("button",{name:"Passer l’évaluation"}).click();
  const dialog=page.getByRole("dialog"), status=dialog.locator(".transition-live #score-status");
  const runs=await(await page.request.get("/api/evaluations/")).json();
  const id=runs.find((r:{evaluation_name:string})=>r.evaluation_name==="Passation E2E").id;
  const stored=async()=>{
    const response=await page.request.get(`/api/evaluations/${id}/`);
    expect(response.status()).toBe(200);
    return (await response.json()).questions.map((q:{score:number|null})=>q.score);
  };
  await dialog.getByRole("button",{name:"Choisir la note 0 sur 10",exact:true}).click();
  await expect(status).toHaveText("Note enregistrée"); expect(await stored()).toEqual([0,null]);
  await page.route("**/api/evaluations/*/responses/*/",async route=>{
    const response=await route.fetch({postData:JSON.stringify({score:11})});
    expect(response.status()).toBe(400); await route.fulfill({response});
  });
  await dialog.getByRole("button",{name:"Choisir la note 7 sur 10",exact:true}).click();
  await expect(status).toHaveAttribute("role","alert");
  await expect(dialog.getByRole("button",{name:"Fermer",exact:true})).toBeDisabled();
  const events:object[]=[];
  await page.exposeFunction("recordCancel",(value:object)=>events.push(value));
  await dialog.evaluate(e=>{
    e.addEventListener("cancel",event=>setTimeout(()=>{
      (window as unknown as {recordCancel:(o:object)=>void}).recordCancel({
        type:"cancel",cancelable:event.cancelable,prevented:event.defaultPrevented,
        open:(e as HTMLDialogElement).open});
    },0));
    e.addEventListener("close",()=>{
      (window as unknown as {recordCancel:(o:object)=>void}).recordCancel({type:"close"});
    });
  });
  await page.screenshot({path:resolve(output,`escape-${theme}-before.png`)});
  let attempts=0;
  for(;attempts<4;attempts++) {
    await page.keyboard.press("Escape");
    if(!await dialog.isVisible()) { attempts++; break; }
  }
  const open=await dialog.isVisible();
  await page.screenshot({path:resolve(output,`escape-${theme}-after.png`)});
  const beforeReload=await stored();
  await page.reload(); await row.getByRole("button",{name:"Reprendre l’évaluation"}).click();
  await expect(dialog.getByRole("slider")).toHaveAttribute("data-unanswered","true");
  await dialog.getByRole("button",{name:"Précédent"}).click();
  const restored=await dialog.getByRole("slider").inputValue();
  save(`escape-${theme}`,{time:new Date().toISOString(),browser:browser.version(),theme,zoom:1,
    viewport:[1280,720],attempts,open,events,beforeReload,afterReload:await stored(),restored,
    expected:"dialog remains open with local 7 after every Escape",verdict:open?"passed":"failed"});
  expect(open,"unsafe repeated Escape must keep the refused local score available").toBe(true);
});
```
