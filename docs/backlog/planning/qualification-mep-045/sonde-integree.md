# Sonde temporaire de qualification MEP-045

Fichier d’exécution : `frontend/e2e/mep045-qualification.spec.ts`. Aucun changement applicatif.

À extraire du bloc TypeScript pour reproduire la commande d’[exécution](executions.md).

```typescript
import { expect, test } from "@playwright/test";
import { seedTakingContext } from "./taking-fixture";
import { login, gate, capture, geometry, save } from "./mep045-support";
import { revise } from "./mep045-revision";
const viewports = [[1280,720],[1920,1080],[1280,480],[390,844],[320,568],[568,320]];
for (const theme of ["day", "night"]) for (const [width,height] of viewports) {
  test(`MEP045 ${theme} ${width}x${height}`, async ({ browser }, info) => {
    test.setTimeout(90000);
    seedTakingContext();
    const touch = width === 390;
    const context = await browser.newContext({ baseURL: info.project.use.baseURL,
      viewport: {width,height}, hasTouch: touch, isMobile: touch });
    await context.addInitScript((t) => {
      localStorage.setItem("assess-teams-theme", t);
    }, theme);
    const page = await context.newPage();
    const name = `${theme}-${width}x${height}`;
    const events: object[] = [];
    const reads: object[] = [];
    const started = new Date().toISOString();
    try {
      await page.goto("/evaluations"); await login(page);
      await page.evaluate(() => document.documentElement.dataset.palette = "green");
      const row = page.getByRole("row").filter({has:page.getByText("Passation E2E v1",{exact:true})});
      await row.getByRole("button", {name:"Passer l’évaluation"}).click();
      const dialog = page.getByRole("dialog");
      const status = dialog.locator(".transition-live #score-status");
      const slider = dialog.getByRole("slider");
      const runs = await (await page.request.get("/api/evaluations/")).json();
      const id = runs.find((r: {evaluation_name:string}) => r.evaluation_name === "Passation E2E").id;
      const scores = async (label: string) => {
        const response = await page.request.get(`/api/evaluations/${id}/`);
        expect(response.status()).toBe(200);
        const data = await response.json();
        const values = data.questions.map((q: {score:number|null}) => q.score);
        reads.push({label, http:response.status(), scores:values, state:data.state});
        return values;
      };
      expect(await scores("vierge")).toEqual([null,null]);
      await expect(slider).toHaveAttribute("aria-valuetext","Aucune note sélectionnée");
      await slider.press("Enter");
      await expect(dialog.getByRole("button",{name:"Suivant"})).toBeDisabled();
      const zero = gate(), seven = gate();
      let calls = 0, refuse = true;
      await page.route("**/api/evaluations/*/responses/*/", async route => {
        const index = ++calls;
        const intended = route.request().postDataJSON().score;
        if(index === 1) await zero.promise;
        if(index === 2) await seven.promise;
        const sent = intended === 7 && refuse ? 11 : intended;
        const response = await route.fetch({postData:JSON.stringify({score:sent})});
        events.push({index,method:"PUT",intended,sent,http:response.status(),body:response.status()===204 ? null : await response.json()});
        await route.fulfill({response});
      });
      const choose = async (n:number) => {
        const button = dialog.getByRole("button", {name:`Choisir la note ${n} sur 10`,exact:true});
        if(touch) await button.tap();
        else { await button.focus(); await button.press("Enter"); }
      };
      await choose(0); await expect.poll(() => calls).toBe(1);
      await choose(7);
      await expect(slider).toHaveValue("7");
      await expect(status).toHaveText("Enregistrement…");
      await expect(status).toHaveAttribute("role","status");
      expect(calls).toBe(1);
      expect(await scores("attente-0-et-7")).toEqual([null,null]);
      const initial = await geometry(dialog);
      await capture(dialog,`${name}-pending`);
      await expect(dialog.getByRole("button",{name:"Fermer",exact:true})).toBeDisabled();
      await expect(dialog.getByRole("button",{name:"Suivant"})).toBeDisabled();
      await page.keyboard.press("Escape"); await expect(dialog).toBeVisible();
      zero.release(); await expect.poll(() => calls).toBe(2);
      await expect(status).toHaveText("Enregistrement…");
      expect(await scores("0-persiste-7-attend")).toEqual([0,null]);
      seven.release();
      await expect(status).toHaveAttribute("role","alert");
      await expect(status).toContainText("n’a pas été enregistrée");
      await expect(slider).toHaveValue("7");
      await expect(dialog.getByRole("button",{name:"Fermer",exact:true})).toBeDisabled();
      await page.keyboard.press("Escape"); await expect(dialog).toBeVisible();
      expect(await scores("refus-7")).toEqual([0,null]);
      const refused = await geometry(dialog);
      expect(refused).toEqual(initial);
      await capture(dialog,`${name}-refused`);
      await dialog.getByRole("button",{name:"Suivant"}).click();
      await expect.poll(() => calls).toBe(3);
      await expect(status).toContainText("n’a pas été enregistrée");
      await expect(dialog.locator(".transition-live .question-position")).toHaveText("Question 1 / 2");
      refuse = false;
      await dialog.getByRole("button",{name:"Réessayer la sauvegarde"}).click();
      await expect(status).toHaveText("Note enregistrée");
      expect(await scores("reessai-7")).toEqual([7,null]);
      expect(await geometry(dialog)).toEqual(initial);
      await capture(dialog,`${name}-saved`);
      await dialog.getByRole("button",{name:"Suivant"}).click();
      await expect(slider).toHaveAttribute("aria-valuetext","Aucune note sélectionnée");
      await choose(0); await expect(status).toHaveText("Note enregistrée");
      expect(await scores("deuxieme-0")).toEqual([7,0]);
      await dialog.getByRole("button",{name:"Précédent"}).click();
      await expect(slider).toHaveValue("7");
      await dialog.getByRole("button",{name:"Fermer",exact:true}).click();
      await page.reload();
      await row.getByRole("button",{name:"Reprendre l’évaluation"}).click();
      await expect(slider).toHaveValue("7");
      expect(await scores("reprise-apres-reload")).toEqual([7,0]);
      await dialog.getByRole("button",{name:"Suivant"}).click();
      await expect(slider).toHaveValue("0");
      await revise(page, dialog, row, scores, events, name);
      expect(calls).toBe(5);
      save(name,{started,finished:new Date().toISOString(),theme,width,height,touch,
        browser:browser.version(),palette:"green",events,reads,geometry:{initial,refused},verdict:"passed"});
    } finally { await context.close(); }
  });
}
```
