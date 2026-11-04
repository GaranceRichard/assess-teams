# MEP-050 — Qualification et proposition de clôture

Campagne du 2026-11-03, base `76f486a0b84168f28229476cf04dffe094ffd81d`.
[Contrat FEAT-056](../../backlog/source/mess/f08.md) ·
[fiche d’audit](../../backlog/planning/audit-20261027/fiches/MEP-050.md) ·
[réserve O1](../mep-047/README.md) · [inventaire et relecture des captures](preuves.md).

## Qualification préalable

L’inventaire des composants et de leurs tests précède les corrections. Le README a annoncé
le périmètre avant toute modification applicative dans le worktree isolé.
Les jeux sont fictifs ; aucune donnée cible MESS ni compte de production utilisé.

| Vue / rôle autorisé | Attendu | Observation initiale / décision |
| --- | --- | --- |
| Résultats, Admin/Coach/Viewer | 200 vide distinct d’un échec | Organisations/familles vides explicites ; attente et alertes séparées, protections conservées |
| Résultats, axes conservés mais séries exclues | Expliquer l’absence de série éligible | O1 reproduit : demande de sélectionner des équipes sans case disponible, dans Radar/Graphique et Radar/Données détaillées |
| Lien profond Résultats devenu inéligible | Aucune action impossible | La notice demandait aussi de choisir une équipe disponible lorsque la liste était vide |
| Utilisateurs, Admin/Coach | Absence et recherche vide explicites | Tableau sans ligne, sans explication ; ajout de messages distincts, recherche effaçable conservée |
| Équipes, modèles, planification, évaluations, rôles autorisés | Pas de vide valide pendant lecture/refus | Les enfants de CollectionFrame pouvaient afficher leur vide en parallèle du chargement ou de l’alerte |
| Journal et Logs, Admin | Absence distincte du filtre appliqué | Même message « correspond aux filtres » sans filtre ; ancien vide encore affiché pendant une nouvelle requête |
| Pilotage, Admin | Absence d’équipe explicite, erreur distincte | SteeringPage/SteeringTeams et tests existants conformes ; aucune correction de calcul ou indicateur |
| Dashboard, tous rôles | Absence d’activité/assignation explicite | DashboardActivity et DashboardPage distinguent attente/erreur et absence ; pas de changement |
| Routes refusées, Coach/Viewer | Refus sans contenu métier étranger | ProductShell affiche « Page non autorisée » ; API Pilotage 403 et identifiant d’organisation hors scope Results 404 conservées |

Les droits ne se déduisent pas du nom d’un endpoint : Coach peut lire `/api/admin/users/`
dans son périmètre. Le refus de qualification utilise Pilotage, réservé aux Admins.
Aucun nouveau CTA de création, droit, filtre métier, score ou donnée de remplacement ajouté.

## Corrections bornées

- Radar et détails : « Aucune équipe avec un résultat exploitable pour cette version. »
  lorsque `teams` est vide ; invitation à sélectionner conservée lorsqu’il existe des équipes.
  Le message précède le graphique pour être lisible sur mobile ; les axes, versions, archives et sélections existantes restent consultables.
- Lien profond : notice invitant au choix seulement si une autre équipe éligible existe.
- CollectionFrame : attente puis échec prioritaires sur le contenu, compteur masqué en échec.
  Messages d’erreur propres à chaque page conservés ; pagination et mutations inchangées.
- Utilisateurs : « Aucun utilisateur accessible. » / « Aucun résultat. », selon la recherche appliquée.
- Journal/Logs : absence accessible sans filtre ; message sans correspondance si filtre appliqué.
  Le rattachement organisationnel imposé à l’Admin Logs ne constitue pas un filtre utilisateur.
  Effacer relance la collection ; chargement/erreur ne réutilisent pas l’ancien message vide.

## Preuves exécutables

| Preuve | Entrées / résultat acquis | Portée et limite |
| --- | --- | --- |
| Rouge sur les sources exactes de départ | Vitest : 8 échecs, 16 passants dans 4 fichiers ; sources restaurées octet pour octet après exécution | Défauts réels O1, lien profond, absence/recherche et état de collection ; log local `.cache/mep-050/red.txt` |
| Vert ciblé | 24 passants dans les mêmes 4 fichiers avant extension Admin/Coach de la recherche | Doubles API/canvas React ; ne prétend pas être une API réelle |
| Consommateurs existants | 81 passants dans 23 fichiers lors du premier passage ; plan final : **209 passants, 52 fichiers** | Équipes, modèles, passation, planning, utilisateurs, journaux, logs et Résultats |
| `frontend/e2e/empty-states.spec.ts` | **3 passants**, Django/SQLite et Chromium réels ; 24 captures finales | Trois rôles, snapshots incomplets, absence de repli ancien, deux restitutions, deux thèmes et deux formats |

Campagne finale `npm run quality:targeted` : **209 tests React, 130 E2E applicatifs et 10 E2E de démo passants**, aucun skip ni flaky signalé. Les passages intermédiaires ci-dessus se recouvrent et ne s’additionnent pas. Plan, preuves et métriques figés dans le stockage de l’[inventaire](preuves.md).

Build de production `npm run build --prefix frontend` réussi ; lint, Prettier et TypeScript réussis. Le test de refus dans le dialogue Utilisateurs cible son alerte propre ; l’erreur de lecture de la collection reste visible séparément, sans faux vide.

Deux parcours `frontend/e2e/empty-collections.spec.ts` passants : attente, absence, recherche sans résultat, effacement et erreurs HTTP 403/500 injectées, avec huit captures.

Tests de non-régression ajoutés ou renforcés : `ResultsPageErrors.test.tsx`,
`ResultsIntent.test.tsx`, `EmptyCollections.test.tsx`, `UsersEmptyStates.test.tsx`.
HTTP 403/500 injectés dans les tests React des journaux : alerte, aucun message vide.
Les refus réels sont exercés séparément dans Chromium/Django ; aucune injection 500 ne vaut
une démonstration de panne réelle ni une décision d’accès backend.

La reproduction O1 conserve les axes et annule un score de chaque dernière COMPLETED du jeu isolé.
Le run ancien intact ne redevient pas une série radar ; réponse 200 avec `teams: []`.
Le test contrôle l’absence de case, d’invitation impossible et de cellule `0 / 10` fabriquée.
Un zéro mesuré reste couvert par les parcours Results existants ; aucun calcul modifié.

## Revue DoD et impact documentaire

- README préalable et rapport de qualification : périmètre, écarts, refus et limites explicites.
- Relecture AGENTS/règles, charte, DoD, stratégie et coûts : obligations conservées.
- Fondamentaux, layout produit, Results et contrat backend relus : documentation de présentation
  complétée ; aucun endpoint, schéma, modèle, migration, permission ou contrat HTTP changé.
- Tests backend/coverage backend et migrations non applicables au diff de présentation selon
  le plan calculé ; aucun seuil global n’est déduit d’une sélection Vitest partielle.
- Plan obligatoire : documentation, statiques frontend, dépendants Vitest, tous les E2E.
  Plan local final réussi, avec builds applicatif et démo. Le pré-push et la CI du SHA
  publié restent les conditions finales de livraison, confirmées dans le compte rendu de publication.
- Pas de PR ; publication via `npm run publish`, suivi CI et fast-forward sûr du main principal.

## Décision proposée

Clôture fonctionnelle MEP-050 proposée sur les preuves de cette correction, après gates et CI verts.
**Le registre reste Ouvert / N/A jusqu’à décision explicite de l’utilisateur.**
Cette proposition ne clôture aucun autre PBI, ne requalifie pas MEP-047 et ne vaut pas recette MESS.
Le parcours existant de zoom natif 200 % des transitions passe dans la suite globale ; les états vides MEP-050 ne sont pas qualifiés spécifiquement à ce zoom. Tactile physique et environnement MESS non exécutés.
Les captures automatiques doivent être distinguées de leur relecture visuelle réellement effectuée.