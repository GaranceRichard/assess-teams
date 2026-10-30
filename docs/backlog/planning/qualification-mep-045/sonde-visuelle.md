# Sonde temporaire de qualification MEP-045

Fichier d’exécution : `frontend/e2e/mep045-visual.spec.ts`. Aucun changement applicatif.

À extraire du bloc TypeScript pour reproduire la commande d’[exécution](executions.md).

```typescript
import {expect,test} from "@playwright/test";
import {seedTakingContext} from "./taking-fixture";
import {login,gate,capture,save} from "./mep045-support";
for(const theme of ["day","night"]) for(const [width,height] of [[320,568],[568,320]])
 test(`MEP045 visual status reachability ${theme} ${width}`,async({page})=>{
  seedTakingContext(); await page.setViewportSize({width,height});
  await page.addInitScript(t=>localStorage.setItem("assess-teams-theme",t),theme);
  await page.goto("/evaluations"); await login(page);
  await page.evaluate(()=>document.documentElement.dataset.palette="green");
  await page.getByRole("row").filter({hasText:"Passation E2E v1"})
    .getByRole("button",{name:"Passer l’évaluation"}).click();
  const dialog=page.getByRole("dialog"), status=dialog.locator(".transition-live #score-status");
  const delay=gate();let refuse=true;const rows:object[]=[];
  await page.route("**/api/evaluations/*/responses/*/",async route=>{
    await delay.promise; const response=await route.fetch({postData:JSON.stringify({score:refuse?11:7})});
    await route.fulfill({response});
  });
  await dialog.getByRole("button",{name:"Choisir la note 7 sur 10",exact:true}).click();
  await expect(status).toHaveText("Enregistrement…");
  for(const state of ["pending","refused","saved"]) {
    if(state==="refused") {delay.release();await expect(status).toHaveAttribute("role","alert");}
    if(state==="saved") {refuse=false;await dialog.getByRole("button",{name:"Réessayer la sauvegarde"}).click();
      await expect(status).toHaveText("Note enregistrée");}
    await dialog.locator(".taking-content").evaluate(e=>e.scrollTop=e.scrollHeight);
    const text=await status.locator(":scope > span:last-child").evaluate(e=>{
      const range=document.createRange();range.selectNodeContents(e);const r=range.getBoundingClientRect();
      return {top:r.top,bottom:r.bottom};
    });
    const action=(await dialog.locator(".taking-content > button").boundingBox())!;
    expect(text.bottom).toBeLessThanOrEqual(action.y);
    await capture(dialog,`${theme}-${width}x${height}-${state}`);
    rows.push({state,text,action,fullyReadable:true});
  }
  save(`visual-${theme}-${width}`,{date:new Date().toISOString(),theme,width,height,rows,verdict:"passed"});
 });
```
