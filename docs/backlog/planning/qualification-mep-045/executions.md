# Exécutions MEP-045

SHA applicatif `029857a96b730aaf6357c123b429860f56e445a0`, Codex, 2026-10-29.
Windows (version système non déterminée : lecture CIM refusée), Chromium 153.0.8010.12,
Node 24.20.0, Python 3.12.10, Django 5.2.18. Horaires ci-dessous America/Toronto (UTC−04:00).
Worktree `C:/Users/garan/AppData/Local/Temp/Assess-teams-mep-045`, branche `qualification/mep-045`.

## Sélection réellement exécutée

| Commande / sélection | Résultat | Moment / portée |
| --- | --- | --- |
| `npm.cmd run test:quick --prefix frontend -- EvaluationTakingDialog.test.tsx EvaluationTakingNavigation.test.tsx` | **13 passed**, 2 fichiers, code 0 | 12:59 ; file, refus/réessai, zéro/null, navigation, révision ; API simulée explicitement |
| Depuis backend : `.venv/Scripts/python.exe -m pytest tests/test_evaluation_taking.py tests/test_evaluation_taking_lifecycle.py tests/test_evaluation_revision.py tests/test_transaction_taking.py --no-cov -q` | **30 passed** en 22,97 s, code 0 | 12:59 ; API/ORM, refus et invariants transactionnels ciblés |
| `npm.cmd run test:e2e --prefix frontend -- mep045-qualification.spec.ts --max-failures=1` | **12 passed** en 2,1 min, code 0 | 13:02–13:04 ; deux thèmes × six formats ; [sonde](sonde-integree.md) |
| `npm.cmd run test:e2e --prefix frontend -- --config .cache/mep045-zoom.config.ts --output ../.cache/mep-045/zoom-results --max-failures=1` | **1 failed**, puis diagnostic **1 failed** | 13:04 et 13:06 ; même fermeture au retour 100 %, après états clair 100/200 % ; [sonde](sonde-zoom.md) |
| `npm.cmd run test:e2e --prefix frontend -- mep045-escape.spec.ts` | **2 failed** ; 0 succès | 13:07 ; défaut reproduit sans zoom en clair/sombre ; [sonde](sonde-echap.md) |
| `npm.cmd run test:e2e --prefix frontend -- mep045-visual.spec.ts --max-failures=1` | **4 passed** en 33,9 s, code 0 | 13:08 ; lisibilité après défilement, 320×568 et 568×320 × deux thèmes ; [sonde](sonde-visuelle.md) |

Les premiers essais de la sonde intégrée n’ont pas fourni de preuve : sélecteur visant aussi des copies
inertes, lecture JSON d’une réponse 204, puis assertion de largeur identique malgré changement de libellé.
Ces erreurs de sonde ont été corrigées avant le run 12/12 ; elles ne sont ni des échecs applicatifs
retenus ni des succès. La stabilité finale porte sur position/hauteur de l’action, dialogue et pied ;
la largeur du bouton s’adapte normalement entre « Réessayer la sauvegarde » et « Enregistrer la note ».
Un démarrage initial a aussi été empêché par les droits d’écriture des hooks ; le lancement autorisé a abouti.

## Isolation et reproduction

Les wrappers canoniques ont préparé les runtimes du worktree. La base et les services sont locaux :
`backend/.cache/e2e.sqlite3`, backend 29180, frontend 29181, un worker, aucun service existant réutilisé.
Les sous-processus de fixture héritent de la même base. Aucun compte ou serveur de production.
La fixture `frontend/e2e/taking-fixture.ts` crée Coach/Admin, organisation, équipe et deux questions.

Pour reproduire depuis ce SHA, extraire les blocs TypeScript des six `sonde-*.md` à leurs chemins indiqués.
[Support](sonde-support.md) et [révision](sonde-revision.md) sont requis par la sonde intégrée.
Les sondes restent temporaires ; ne pas les ajouter au code livré de cette qualification.
Depuis la racine du worktree, dans une session PowerShell dédiée :

```powershell
$env:ASSESS_E2E_BACKEND_PORT = '29180'
$env:ASSESS_E2E_FRONTEND_PORT = '29181'
$env:ASSESS_E2E_DB = Join-Path (Get-Location) 'backend/.cache/e2e.sqlite3'
New-Item -ItemType Directory -Force '.cache/mep-045','frontend/.cache' | Out-Null
```

La configuration temporaire du zoom `frontend/.cache/mep045-zoom.config.ts` contient :

```typescript
import base from "../playwright.config";
export default { ...base, testDir: "../audits", testMatch: "**/mep045-zoom.audit.ts" };
```

Exécuter ensuite seulement la commande de la cellule voulue dans le tableau.
Les sondes Échap sont volontairement rouges sur le SHA qualifié ; ne pas inverser leurs assertions.
Le zoom utilise une extension locale éphémère et `chrome.tabs.setZoom/getZoom`,
1280×720 CSS à 100 %, 640×360 CSS et DPR=2 à 200 %, captures du framebuffer réel.
Ce n’est ni `zoom` CSS, ni une réduction de viewport présentée comme zoom navigateur.

## Comptage discriminant, pour chacun des 12 scénarios intégrés

- Sélection 0, sélection rapide 7 : une seule requête partie tant que 0 est retardé ; 7 attend.
- PUT 0 → 204 ; PUT intention 7 / injection 11 → 400 ; Suivant réessaie la même intention → 400.
- Réessai explicite 7 → 204 ; deuxième question 0 → 204 : **5 PUT**, dont trois réussis et deux refusés.
- Double clic sur Valider : **un seul POST** `/finalize/` → 200 ; aucun POST pendant la notation.
- Admin change localement 7 en 5 : **0 PUT individuel**, **0 PUT révision** avant validation.
- Validation Admin : **un seul PUT révision** → 200 ; GET final [5,0].

Les GET successifs et les codes/corps de refus réels sont conservés dans [traces](traces.md).
La substitution 7→11 sert uniquement à obtenir un vrai rejet du serveur sans toucher au contrat.
Les sélections normales et les réessais réussis utilisent l’API et SQLite réelles.
Aucune campagne exhaustive ni nouvelle mesure de couverture globale n’a été lancée.
