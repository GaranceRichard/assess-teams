# Commandes et résultats — MEP-013

2026-10-23 et reprise finale le 2026-10-26, Codex ; Windows, Chromium local, données fictives, worktree isolé.
Référence `4492dc8` ; code du candidat identifié dans [sources.md](sources.md).

## Reproduction avant correction

`npm.cmd run test:quick --prefix frontend -- TakingFocus.test.tsx EvaluationTakingNavigation.test.tsx`
avec les nouvelles assertions et les deux fichiers applicatifs de référence :
2 tests échoués / 10, 8 passés. Le focus reçu est `#taking-title`, pas `#question-text`.

`npm.cmd run quality:targeted -- e2e e2e/evaluation-rating-focus.spec.ts`
sur la même référence : 3 échecs, aux tailles 1366×768, 1920×1080 et 375×667.
L'assertion `toBeFocused` sur le titre de question échoue ; les captures avant sont conservées.

`npm.cmd run test:quick --prefix frontend -- EvaluationTakingNavigation.test.tsx EvaluationScoreInput.test.tsx`
avant les deux corrections supplémentaires : 5 échecs sur 10 tests. Les onze choix sont absents,
Entrée attribue 5 et Suivant est actif sans réponse courante. Les sorties sont distinguées
des campagnes corrigées ci-dessous ; aucune tentative interrompue n'est revendiquée verte.

## Candidat corrigé

`npm.cmd run test:quick --prefix frontend -- EvaluationScoreInput.test.tsx EvaluationTakingNavigation.test.tsx TakingFocus.test.tsx EvaluationTakingDialog.test.tsx EvaluationTakingMarkers.test.tsx`
: 5 suites, 20 tests passés. Les ajouts couvrent uniquement les non-régressions nécessaires.

Les tests E2E existants restent la référence. La campagne corrigée du 23 octobre passe 26 cas.
Le 26 octobre, deux sélections finales sans changement applicatif intermédiaire passent :

```powershell
npm.cmd run quality:targeted -- e2e e2e/evaluation-explicit-rating.spec.ts e2e/evaluation-rating-scale.spec.ts
npm.cmd run quality:targeted -- e2e e2e/evaluation-rating-focus.spec.ts e2e/evaluation-taking-layout.spec.ts e2e/dialog-taking-accessibility.spec.ts e2e/taking-typography.spec.ts e2e/evaluation-versions.spec.ts e2e/appreciation-markers.spec.ts
```

Résultats : 11 tests en 2,3 min, puis 15 tests en 1,9 min. Les huit combinaisons
thème × souris/tactile × avec/sans repères couvrent passation puis révision, les onze nombres,
Entrée sans choix, Suivant bloqué, reprise, refus 400 et validation atomique des révisions.
Les 4 140 mesures de contraste passent, minimum 5,646:1 pour un seuil de 4,5:1.
Les statiques frontend et le build/typecheck passent ; les seuils globaux sont vérifiés au gate complet.

La première campagne UX ciblée a été interrompue après la collision d'un profil Chromium
temporaire avec le watcher Vite ; ses dernières erreurs ne sont pas des résultats d'acceptation.
La sonde utilise désormais `../.cache/mep-013/zoom-results`, hors du frontend surveillé.
Le premier gate a aussi révélé des chemins de captures Unicode mal décodés par le contrôle
repository : noms ASCII employés, sans changement de Git, des scripts ou de la CI.
Le verrou de la campagne interrompue a été retiré seulement après vérification de son PID absent.
Les campagnes finales ci-dessous remplacent ces tentatives pour la validation.

## Complément de stabilité UX-08

Avant push, le refus sans repères a reproduit une croissance du dialogue de 24 px : le test
versionné `evaluation-rating-refusal` échoue sur `3cee9e5`, avec pied déplacé de 12 px et
bouton de note de 24 px. La publication est interrompue avant push ; le backend partiel
n'est pas une preuve exhaustive. Ses seuls fragments de couverture générés ont été retirés.
`TakingStatusSizing` réserve désormais le maximum intrinsèque des messages réels dans la
zone de statut et les copies. Le texte, les annonces et les transitions restent inchangés.
Les vingt tests React ciblés, lint, Prettier et limite de lignes passent sur ce correctif.

```powershell
npm.cmd run quality:targeted -- e2e e2e/evaluation-explicit-rating.spec.ts e2e/evaluation-rating-scale.spec.ts e2e/evaluation-rating-refusal.spec.ts e2e/evaluation-rating-focus.spec.ts e2e/evaluation-taking-layout.spec.ts e2e/dialog-taking-accessibility.spec.ts e2e/taking-typography.spec.ts e2e/evaluation-versions.spec.ts e2e/appreciation-markers.spec.ts
```

34 tests passés en 4,7 min. Les huit cas ajoutés vérifient passation/révision, deux thèmes,
390×844 et 320×568, refus 400, notes retenues, géométrie inchangée et réessai réussi.
Leur mesure exclut les copies inertes ; le défilement utilisateur est distingué d'un déplacement
du bouton de note. Le complément de capture impose l'erreur dans le viewport après scroll.

## Zoom navigateur natif, hors collecte CI

Configuration Playwright locale temporaire `frontend/.cache/taking-audit.config.ts`,
héritant de `playwright.config.ts` avec `testDir: "../audits"` et
`testMatch: "**/taking-zoom.audit.ts"`. Aucun fichier de configuration versionné modifié.
Variables locales : ports backend/frontend 8193/5193, base jetable
`backend/.cache/taking-zoom.sqlite3`, `ASSESS_TAKING_AUDIT=1`.

```powershell
npm.cmd run test:e2e --prefix frontend -- --config .cache/taking-audit.config.ts --output ../.cache/mep-013/zoom-results
```

Rejoué avec la réserve de statut le 26 octobre : 1 test passé, 20,4 s.
Dix-huit mesures d'action pour clair/sombre × zoom 100/200/100 %,
sans débordement horizontal ni action hors du viewport, focus et note 5 conservés,
aucun PUT supplémentaire à la navigation. Les quatre captures et le relevé brut sont dans
[zoom/](zoom/measurements.jsonl). Le framebuffer conserve le zoom réellement rendu.

## Gates de livraison

`npm.cmd run quality:targeted` calcule le diff réel. Captures et sonde locale non cartographiées
imposent le plan exhaustif conservateur : repository, backend, frontend et E2E application/démo.
La publication utilise `npm.cmd run publish` : resynchronisation, pre-push exhaustif bloquant,
push direct de la branche dédiée vers main, fast-forward sûr puis attente de la CI exacte.
Les résultats complets et le SHA sont ajoutés après leur réussite ; aucune clôture anticipée.

La sélection de refus avec assertion du thème réel et capture du message visible passe aussi : 8 tests en 55,4 s.

## Correction après la CI Linux

Le pre-push de `d0e37c039e63af115edce25dda864998a115541b` passe : backend 1 434 tests,
couverture 97,48 %, frontend 432 tests (lignes 97,33 %, branches 94,78 %), E2E application
96 tests et démo 10 tests. La CI [40330422624](https://github.com/GaranceRichard/assess-teams/actions/runs/40330422624)
reste rouge : hauteur desktop 623,90625 px au lieu de <600 et déplacement vertical de 11 px
du range après focus du bouton sur mobile 375×667. Aucun seuil ni test n’est assoupli.

Une sonde temporaire réutilise les fixtures et scénarios existants avec trois polices :
`system-ui`, Arial et Verdana. Cette dernière reproduit localement le dépassement à
624,296875 px. Les marges des paragraphes sont réduites à 0,2 rem avec un sélecteur local
prioritaire sur le style général, celles du titre de question à 0,5 rem. Le contrôle tactile,
les textes, la réserve intrinsèque des erreurs et le pied du dialogue sont conservés.
Les [mesures avant/après](font-metrics.json) donnent respectivement 551,0625, 551,453125
et 599,453125 px après correction : trois contrôles de hauteur réussis. Les trois variantes
du scénario existant de focus mobile passent aussi, sans défilement induit ni changement
des assertions. Ces sondes locales ne remplacent pas la CI Linux du nouveau SHA publié.

Après ce correctif : la même sélection UX-07/08 passe 34 tests en 4,5 min ;
les vingt tests React ciblés, lint et formatage passent. Le zoom navigateur natif est
rejoué avec succès (1 test en 19,2 s) : les quatre captures et dix-huit mesures sont actualisées.
Les captures des trente-quatre scénarios et les empreintes des sources ont été renouvelées.
