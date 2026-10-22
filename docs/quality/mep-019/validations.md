# Commandes et résultats MEP-019

Les campagnes E2E utilisent `quality:targeted e2e` : ports et base SQLite jetables propres au worktree.
Les logs bruts restent dans `.cache/mep-019/` ; les mesures et captures utiles sont versionnées.

| Commande / sélection | Sortie observée | Décision |
| --- | --- | --- |
| `npm run quality:targeted -- e2e e2e/light-theme.spec.ts e2e/light-taking.spec.ts`, avant CSS | `2 failed` ; bordures et pixels de piste 1,283:1 <3 | Défaut reproduit |
| `npm run quality:targeted -- e2e e2e/light-preferences.spec.ts`, avant CSS | `1 passed`, `1 failed` ; préférences conformes, champ global 1,283:1 <3 | Défaut global reproduit |
| `npm run test:quick --prefix frontend -- EvaluationVersions.test.tsx`, avant état de sélection | `1 failed`, `2 passed` ; `aria-pressed` reçu `null` | Défaut sémantique reproduit |
| Même test React, après correction | `3 passed` | Non-régression conforme |
| `quality:targeted e2e` : `dark-theme`, `dark-theme-screens`, `evaluation-rating-focus`, `light-preferences`, `light-taking`, `light-theme`, `palettes`, `theme-surfaces`, `theme-tokens` | `14 passed (2.4m)` après correction CSS | Contrôles sombres, vingt combinaisons de tokens, surfaces et interactions conformes |
| `npm run quality:targeted -- e2e e2e/light-theme.spec.ts e2e/light-taking.spec.ts e2e/light-preferences.spec.ts`, après CSS et coche | `4 passed (1.2m)` | Preuves finales des écrans et préférences |

Les noms abrégés de la campagne 14 tests sont les fichiers `frontend/e2e/<nom>.spec.ts`.
Les matrices de couleurs comportent 1 590 paires distinctes finales, toutes conformes.
Les dix mesures de piste sont conformes. Les dix comparaisons du dialogue sombre ont zéro pixel différent.
Le complément `palette-refusal-visible.png` est produit lors du parcours complet final, après défilement.

`npm run quality:targeted` calcule le plan réel : repository, backend, frontend et E2E exhaustifs,
car les nouveaux artefacts de preuve et le helper d’audit sont classés conservativement par la politique existante.
Son résultat, le pre-push et la CI exacte seront consignés dans le rapport après leur exécution.

Backend complet : 1 434 tests passants, coverage 97,48 %. Frontend complet : 428 tests passants ;
statements 96,42 %, branches 94,79 %, fonctions 96,63 %, lignes 97,30 %. Lint, formatage et build passent.

Le plan exhaustif local resynchronisé passe : scopes repository/backend/frontend/E2E, chacun avec statut 0
dans les métriques du runner. E2E application : 77 passants ; démo : 10 passants, dont le survol
et la navigation dans les dix palettes. La campagne finale de préférences avec messages visibles passe (2 tests).
