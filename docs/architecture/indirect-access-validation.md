# Preuves des accès indirects — MEP-038

## Périmètre et résultat

Audit du socle `d54909c`, dernier `origin/main` au démarrage, le 2026-10-18.
[Inventaire, matrice et diagnostic](indirect-access.md) ;
[source et critères MEP-038](../backlog/source/mess/f01.md).
Aucun défaut démontré, aucun code applicatif modifié ; les tests renforcent les preuves existantes.

## Tests ajoutés

| Suite | Cas | Résultat observable |
| --- | ---: | --- |
| `backend/tests/test_indirect_access_filters.py` | 7 | Deux pages de 23 équipes par parent, liens/compte scopés ; autre organisation refusée à Admin, accessible à Superadmin ; filtres modèles/planning. Cinq filtres relationnels Logs autorisés localement, même vide pour ID étranger/inexistant, combinés à méthode/statut/niveau/source. |
| `backend/tests/test_indirect_access_history.py` | 5 | Quatre rôles sur historique archivé autorisé ; équipes mixtes/inconnues et lignée étrangère refusées ; IDs répétés dédupliqués. Après déplacement du Coach, cinq projections conservent historique et références sans son nouveau nom privé. |
| `frontend/e2e/indirect-access.spec.ts` | 1 | Navigateur réel, lien Results autorisé puis refusé après rattachement changé sans nouvelle session ; contrôles des quatre API historiques, refus étrangers/inexistants équivalents. |

Les suites API comparent l’état métier persistant avant/après lecture/refus.
Les Logs techniques de requête sont intentionnellement exclus par `business_snapshot`.
Aucun mock des scopes, ORM ou permissions ; mots de passe fictifs et encodeur rapide de test.
Les rôles et exceptions publiques sont aussi couverts par les suites réutilisées.

## Exécution locale

Commande API : `npm run quality:targeted -- backend` suivie de :

- `tests/test_indirect_access_filters.py`, `tests/test_indirect_access_history.py` ;
- `tests/test_isolation_reads.py`, `tests/test_isolation_mutations.py`, `tests/test_isolation_history.py` ;
- `tests/test_isolation_sessions.py`, `tests/test_isolation_regressions.py` ;
- `tests/test_results_security.py`, `tests/test_result_longitudinal_security.py` ;
- `tests/test_steering_security.py`, `tests/test_dashboard_security.py`, `tests/test_email_admin.py` ;
- `tests/test_legal_inventory.py`, `tests/test_api_permission_inventory.py`, `tests/test_default_api_permissions.py`.

**230 tests réussis**, dont 12 nouveaux cas API ; Ruff, format et migrations verts.
La sélection couvre exceptions publiques, exports de licences, scopes, sessions,
mutations forgées et absence d’effets métier. Elle n’est pas une couverture globale.

React : `npm run quality:targeted -- frontend src/ResultsIntent.test.tsx src/steering.test.ts src/ResultsPage.test.tsx`.
**7 tests réussis dans 3 fichiers** ; ESLint, Prettier et typecheck verts.

Playwright : sept parcours existants permissions, Pilotage et Viewer verts après relance
sur base neuve. Le parcours longitudinal existant passe également. Une première sélection
longitudinal/Pilotage conserve une palette bleue qui invalide l’attente de changement vers bleu ;
Pilotage repasse sur base neuve, sans changement du produit ni du test existant.
Le nouveau test attend désormais la connexion et compare les refus étrangers/inexistants
au lieu d’imposer un libellé générique différent des réponses actuelles des lookups Django.

Playwright ciblé : `npm run quality:targeted -- e2e e2e/indirect-access.spec.ts` réussit (1/1).

`npm run quality:targeted` réussit : documentation (200 lignes, secrets, cohérence), statiques backend/frontend, 12 cas API et nouveau parcours Chromium. Les 6 tests `node --test scripts/legal/npm-notices.test.mjs` passent aussi. Le plan porte uniquement sur les tests et la prose ; aucune campagne globale de couverture ni build produit supplémentaire requis. Le pré-push a réexécuté ce plan avec succès avant publication.

## Revue documentaire et DoD

README annoncé avant création des tests ; source MEP-038 et index d’architecture reliés.
README, agent-rules, charte, DoD, stratégie de tests, fondamentaux, contrat backend/API,
MEP-011/037, Results, Pilotage, Dashboard, journaux et redistribution juridique relus.
Les références d’audit évoluent ; les règles qualité et contrats sont conservés.

Aucun endpoint, serializer, modèle, dépendance, rôle, écran, migration ni calcul modifié :
nouvelle migration et description OpenAPI d’une évolution non applicables.
Schéma/Swagger restent vérifiés par les tests réutilisés.
Aucun correctif applicatif : preuve rouge/verte de bug non applicable ; assertions API
passant sur l’implémentation initiale. Les erreurs initiales du nouveau test navigateur
concernent sa synchronisation et ses attentes, corrigées avant publication.
Les sélections ne remplacent pas les campagnes globales de couverture.
Limite 200 lignes, secrets, formatage et gates applicables restent bloquants.

## Intégration et clôture

Publication par `npm run publish` du commit `5fadccb9b762efa70f6b54d50bc24de0397d6f2e`.
[CI indépendante du SHA intégré](https://github.com/GaranceRichard/assess-teams/actions/runs/39166107386) :
succès confirmé le 2026-10-18, gates documentation, backend, frontend, E2E et
`Required impact gate` verts. La campagne exhaustive non requise est explicitement ignorée ;
cette CI sélective ne constitue pas une qualification MESS exhaustive.

Le checkout principal propre a été avancé exclusivement en fast-forward.
La clôture canonique intervient après cette preuve ; FEAT-049 atteint 5/5,
MESS 8 Réalisés / 62 (54 Ouverts, 13 %), E01 8/12 (67 %) et 20 PBI prêts.
La synthèse E01 affichait encore 5/12 malgré les 7 réalisations antérieures :
elle est recalculée depuis le registre, sans changer les statuts des autres chantiers.
La clôture documentaire est publiée à son tour par `npm run publish`, avec ses gates propres.
