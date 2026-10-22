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
Pre-push, publication et CI du SHA exact restent en attente ; MEP-044 reste ouvert.
