# Validations MEP-044

Référence `f327f71` ; entrées exactes dans [sources.md](sources.md).

| Commande / sélection | Résultat |
| --- | --- |
| `npm run test:quick --prefix frontend -- src/AppreciationScale.test.tsx src/EvaluationTakingNavigation.test.tsx`, avant correction | Deux échecs attendus : repère réel et échelle absents ; huit tests passent |
| `npm run test:quick --prefix frontend -- src/AppreciationScale.test.tsx src/AppreciationTooltip.test.tsx src/AppreciationPoints.test.tsx src/EvaluationTakingMarkers.test.tsx src/EvaluationTakingNavigation.test.tsx` | 16 tests passent après correction |
| `npm run quality:targeted -- e2e e2e/evaluation-explicit-rating.spec.ts e2e/appreciation-markers.spec.ts e2e/evaluation-rating-focus.spec.ts e2e/evaluation-taking-layout.spec.ts e2e/evaluation-versions.spec.ts` | 15 E2E passent, 1,9 min |
| `npm run quality:targeted -- e2e e2e/evaluation-rating-scale.spec.ts` | Trois E2E passent, 35,4 s ; 840 mesures ≥4,5:1 |

Le plan initial exige documentation, frontend statique, React dépendants et E2E complet.
L’ajout des captures versionnées rend le plan conservateur exhaustif selon la classification existante.
`npm run quality:targeted` exécute ce plan sans modification de ses règles ni de la CI.
Backend complet : 1 434 tests passants en 20 min 31 s, couverture 97,48 % (seuil 90 %).
Frontend complet : 428 tests dans 103 fichiers ; statements 96,42 %, branches 94,79 %,
fonctions 96,63 %, lignes 97,30 %. Lint, formatage, typecheck et build passent.
E2E complet : 82 tests application passent en 10 min ; les 10 tests démo passent en 33,2 s.
Les quatre scopes repository/backend/frontend/E2E ont chacun un statut 0 dans les métriques.
Les refus affichés pendant les tests du socle qualité sont les scénarios négatifs attendus ;
les gates réels terminent sans échec.
Pre-push exhaustif vert, push direct `1e22be2aacc6c63d64c5b27a915eb0c91c6ed673`, [CI du SHA exact verte](https://github.com/GaranceRichard/assess-teams/actions/runs/39967554796).
MEP-044 est clôturé après ces preuves ; la clôture documentaire suit le même circuit publish.

## Correction après CI Linux du premier SHA

La [CI `fd85621`](https://github.com/GaranceRichard/assess-teams/actions/runs/39959414795) échoue
sur deux hauteurs desktop de 612,296875 px, seuil existant `<600` conservé.
Le contrôle de ligne ajouté à `evaluation-rating-scale` reproduit la cause avant correction :
`1 failed, 2 passed`, échelle sur une ligne supplémentaire.
Après l’en-tête compact : `quality:targeted e2e`, sélection `evaluation-rating-scale`,
`evaluation-taking-layout`, `evaluation-rating-focus` : `12 passed (1.6m)`.
Le correctif `1e22be2` est republié avec pre-push exhaustif et [CI exacte verte](https://github.com/GaranceRichard/assess-teams/actions/runs/39967554796) ; aucun gate n’est contourné.

Le contrôle d’accès final à la note utilise ses rectangles de texte rendu, après défilement
du corps si nécessaire : `quality:targeted e2e e2e/evaluation-rating-scale.spec.ts`,
`3 passed (39.3s)` ; 840 mesures, minimum 5,646:1. Les styles communs restent inchangés.

Le pre-push final du 23 octobre valide à nouveau les quatre scopes avec statut 0 :
repository 76,7 s, backend 1 178,8 s, frontend 57,0 s et E2E 588,9 s.
La CI indépendante du SHA corrigé réussit, y compris les deux cas de hauteur Linux.

Dans le shard CI `Playwright E2E (1/2)` du SHA `1e22be2`, les cas existants
1366×768 et 1920×1080 passent respectivement en 4,9 s et 5,0 s ;
`evaluation-taking-layout.spec.ts` reste inchangé, avec `toBeLessThan(600)`.

Clôture resynchronisée sur MEP-014 `2fbfb9e` : uniquement des fichiers Markdown modifiés,
ligne et fichiers Résultats préservés ; les compteurs incluent son statut « En cours ».
Son pré-push valide aussi les deux hauteurs desktop corrigées (6,4 s et 6,6 s).
