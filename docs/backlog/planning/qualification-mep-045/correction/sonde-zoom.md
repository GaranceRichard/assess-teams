# Cellules du zoom reprises après correction

Sonde temporaire `frontend/audits/mep045-zoom.audit.ts`, dérivée du protocole initial.
Support : extraire [le support initial](../sonde-support.md) à son chemin déclaré.
Configuration et variables : [exécutions initiales](../executions.md).

```typescript
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect, test } from "@playwright/test";
import { seedTakingContext } from "../e2e/taking-fixture";
import { login, gate, output, save } from "../e2e/mep045-support";
import { frontendURL } from "../e2e/urls";
test("MEP045 native zoom 100/200/100 both themes", async ({baseURL},info)=>{
  test.setTimeout(90000); seedTakingContext();
  const extension=info.outputPath("extension"); mkdirSync(extension,{recursive:true});
  writeFileSync(resolve(extension,"manifest.json"),JSON.stringify({manifest_version:3,
    name:"MEP045 local zoom probe",version:"1.0",permissions:["tabs"],background:{service_worker:"worker.js"}}));
  writeFileSync(resolve(extension,"worker.js"),"chrome.runtime.onInstalled.addListener(()=>{});");
  const context=await chromium.launchPersistentContext(info.outputPath("profile"),{
    channel:"chromium",headless:false,viewport:null,deviceScaleFactor:undefined,
    args:["--window-size=1280,720","--window-position=-1800,0",
      `--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  const started=new Date().toISOString(), rows:object[]=[];
  try {
    const worker=context.serviceWorkers()[0]??await context.waitForEvent("serviceworker");
    const page=context.pages()[0]; await page.goto((baseURL??frontendURL)+"/evaluations");
    const cdp=await context.newCDPSession(page);
    const {windowId,bounds}=await cdp.send("Browser.getWindowForTarget");
    const initial=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
    await cdp.send("Browser.setWindowBounds",{windowId,bounds:{
      width:bounds.width+1280-initial.width,height:bounds.height+720-initial.height}});
    await login(page);
    await page.getByRole("row").filter({hasText:"Passation E2E v1"})
      .getByRole("button",{name:"Passer l’évaluation"}).click();
    const dialog=page.getByRole("dialog"), status=dialog.locator(".transition-live #score-status");
    const runs=await(await page.request.get("/api/evaluations/")).json();
    const id=runs.find((r:{evaluation_name:string})=>r.evaluation_name==="Passation E2E").id;
    for(const theme of ["day","night"]) {
      await page.evaluate(t=>{document.documentElement.dataset.theme=t;
        document.documentElement.dataset.palette="green";},theme);
      for(const zoom of [1,2,1]) {
        const actual=await worker.evaluate(`(async()=>{const [tab]=await chrome.tabs.query({url:'${frontendURL}/*'});
          await chrome.tabs.setZoom(tab.id,${zoom});return chrome.tabs.getZoom(tab.id);})()`);
        expect(actual).toBe(zoom);
        await expect.poll(()=>page.evaluate(()=>innerWidth)).toBe(1280/zoom);
        await expect.poll(()=>page.evaluate(()=>innerHeight)).toBe(720/zoom);
        await dialog.getByRole("button",{name:"Choisir la note 0 sur 10",exact:true}).click();
        await expect(status).toHaveText("Note enregistrée");
        const delay=gate(); let refuse=true;
        await page.route("**/api/evaluations/*/responses/*/",async route=>{
          await delay.promise;
          const response=await route.fetch({postData:JSON.stringify({score:refuse?11:7})});
          await route.fulfill({response});
        });
        await dialog.getByRole("button",{name:"Choisir la note 7 sur 10",exact:true}).click();
        await expect(status).toHaveText("Enregistrement…");
        for(const state of ["pending","refused","saved"]) {
          if(state==="refused") {
            delay.release(); await expect(status).toHaveAttribute("role","alert");
          }
          if(state==="saved") {
            refuse=false;
            await dialog.getByRole("button",{name:"Réessayer la sauvegarde"}).click();
            await expect(status).toHaveText("Note enregistrée");
          }
          if(state!=="saved") {
            for(let attempt=0;attempt<5;attempt++) {
              await page.keyboard.press("Escape");
              await expect(dialog).toBeVisible();
            }
            await expect(dialog.getByRole("slider")).toHaveValue("7");
            await expect(dialog.getByRole("button",{name:"Fermer",exact:true})).toBeDisabled();
          }
          const detail=await(await page.request.get(`/api/evaluations/${id}/`)).json();
          const stored=detail.questions.map((q:{score:number|null})=>q.score);
          expect(stored).toEqual([state==="saved"?7:0,null]);
          await status.scrollIntoViewIfNeeded(); await expect(status).toBeInViewport();
          const action=dialog.getByRole("button",{name:state==="saved"?"Enregistrer la note":"Réessayer la sauvegarde"});
          await action.scrollIntoViewIfNeeded(); await expect(action).toBeInViewport();
          const close=dialog.getByRole("button",{name:"Fermer",exact:true});
          if(state==="saved") await expect(close).toBeEnabled();
          else await expect(close).toBeDisabled();
          await expect(close).toBeInViewport();
          const measures=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,
            scroll:document.documentElement.scrollWidth,available:document.documentElement.clientWidth}));
          expect(measures.scroll).toBeLessThanOrEqual(measures.available);
          rows.push({theme,zoom,state,...measures,stored});
          if(zoom===2) {
            const image=await cdp.send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
            writeFileSync(resolve(output,`zoom-${theme}-${state}.png`),Buffer.from(image.data,"base64"));
          }
        }
        await page.unroute("**/api/evaluations/*/responses/*/");
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
        const trigger=page.getByRole("row").filter({hasText:"Passation E2E v1"})
          .getByRole("button",{name:"Reprendre l’évaluation"});
        await expect(trigger).toBeFocused();
        await trigger.click();
        await dialog.getByRole("button",{name:"Précédent"}).click();
        await expect(dialog.getByRole("slider")).toHaveValue("7");
      }
    }
    save("zoom",{started,finished:new Date().toISOString(),browser:context.browser()?.version(),rows,verdict:"passed"});
  } finally {await context.close();}
});
```
