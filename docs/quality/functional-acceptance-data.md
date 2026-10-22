# MEP-030 — Préconditions, jeux fictifs et preuves API

Retour au [cahier fonctionnel](functional-acceptance.md). Ces données sont une spécification de préparation,
aucune base ni identité n'a été créée par MEP-030. Utiliser exclusivement une instance de recette isolée.

## Préparer les acteurs et les données

L'exploitant prépare le Superadmin par le bootstrap Django existant, sans appartenance organisationnelle.
Il remet les accès fictifs hors du dépôt et des rapports ; ne pas recopier les credentials des fixtures.
Le Superadmin crée/invite les identités via Utilisateurs puis crée les organisations en sélectionnant leurs membres.
Terminer l'activation des invitations avant les cas connectés ; une invitation en attente est conservée pour FON-04.
Chaque organisation présente conserve au moins un Admin actif. Ne pas employer l'ORM pour contourner un refus produit.

| Jeu | Préparation par les écrans existants / valeurs exactes |
| --- | --- |
| G0 — accès | Superadmin `rec-sa` ; organisation `Recette Alpha` avec `rec-admin-a`, `rec-admin-pair`, `rec-coach-a`, `rec-coach-autre`, `rec-viewer-a` ; `Recette Beta` avec `rec-admin-b`, `rec-coach-b`, `rec-viewer-b`. Adresse de chaque compte : son identifiant suivi de `@example.test`, acheminée uniquement vers une boîte SMTP de recette. `rec-viewer-attente` reste invité non activé. |
| G1 — organisation/équipe | Depuis G0, créer `Équipe A` et `Équipe B` actives dans Alpha, `Équipe Beta` dans Beta ; affecter `rec-coach-a` à A/B. Garder une identité Coach active non rattachée pour FON-05, et une organisation sans équipe/modèle/planning pour le seul contrôle de renommage. |
| G2 — référentiel | Admin Alpha : Modèles → créer `Modèle Recette`, brouillon v1 ; question 1 `Collaboration`, repères 0=`Absent`, 5=`Partagé`, 10=`Maîtrisé` ; question 2 `Livraison`, sans repères. Créer aussi `Modèle vide` sans question pour le refus de validation ; modèle validé local dans Beta pour les références étrangères. |
| G3 — passation | Après FON-08 : Planification → modèle v1 validé, équipe A, responsable `rec-coach-a`, mode immédiat ; une seconde planification `Modèle suppléance` (une question) pour FON-12. Garder une passation vierge, puis une commencée avec [5, null], et une complétée [0, 10] sur des clones distincts. Distinguer chaque run/échéance/planning dans le relevé. |
| G4 — résultats déterministes | Sur clone de développement dédié, reprendre les données de `seedResultsContext(false)` puis `seedResultsContext(true)` sur deux états séparés : voir valeurs ci-dessous. La variante true recrée le jeu ; elle ne se lance pas après le nominal sur une base à conserver. Pour une recette manuelle cible, préparer les mêmes versions/notes via Modèles, Planification, passation et replanification ; relever les vraies dates/IDs, sans falsifier l'horloge ni les complétions. |
| G5 — pilotage | À la date backend D, 3 actives Alpha : A avec un résultat et une attente D−1 ; B avec un résultat, aucune attente antérieure à D ; C `Jamais évaluée` sans résultat, avec attente à D. Ajouter une équipe archivée avec résultat et une équipe Beta. Relever les échéances persistées ; le simple planning futur ne suffit pas à créer un retard. |
| G6 — journaux | Conserver les IDs et heures d'une création d'équipe réussie, d'une finalisation et révision réussies, puis d'une création d'équipe doublon refusée. Réserver une organisation distincte pour vérifier les scopes ; ne pas purger pendant la campagne. |

Les préparations G0–G3 sont des parcours produit ; leurs succès doivent être observés, pas présumés.
G4/G5 déterministes nécessitent l'exploitant sur clone de développement si les dates historiques sont imposées.
Il peut reprendre la logique des fixtures existantes ci-dessous, puis fournit l'inventaire vérifié des sources.
Sur cible MESS, aucune installation de Node/npm n'est demandée : préparer par les écrans et consigner les valeurs
réelles, ou fournir un clone fictif préparé et identifié par l'exploitant. Si G4/G5 ne peuvent être constitués,
les variantes concernées restent Bloquées ; aucune fixture de développement n'est lancée sur la cible de production.

## Oracles de résultats et de pilotage

[results-fixture.ts](../../frontend/e2e/results-fixture.ts) construit `Results E2E`, Admin `results-admin-e2e`,
A/B, famille `Radar E2E`, critères Collaboration/Livraison/Amélioration ; v1 archivée reste exploitable.
La variante true copie v1 en v2, renomme Collaboration en `Collaboration v2` avec même lignée, complète A/B,
puis crée un brouillon v3 sans résultat. Les dates ci-dessous sont UTC ; l'affichage est local au navigateur.

| Équipe / version | Complétion initiale | Scores ordonnés |
| --- | --- | --- |
| A / v1 ancienne | 2026-09-01 12:00 UTC | [2, 2, 2] |
| A / v1 récente | 2026-10-02 12:00 UTC | [0, 10, 7] |
| B / v1 | 2026-10-03 12:00 UTC | [8, 3, 5] |
| A / v2 | 2026-10-05 12:00 UTC | [6, 9, 8] |
| B / v2 | 2026-10-06 12:00 UTC | [7, 4, 6] |

FON-14 sur variante false : radar v1 A=[0,10,7], B=[8,3,5], jamais A=[2,2,2].
FON-15 sur variante true : radar v2 ; Collaboration A=2→0→6, B=8→7, textes historiques v1/v2 conservés.
Chaque colonne temporelle suit sa propre chronologie ; aucune ligne commune par date ni zéro ajouté à B.
Pour G4 manuel, remplacer seulement dates/IDs et noms par le relevé signé ; notes/ordre/continuité restent vérifiables.
Pour FON-16, rattacher explicitement un Viewer et des Coachs distincts à l'organisation du jeu choisi ;
assigner au Coach A seulement les runs A et à un autre Coach les runs B avant démarrage sur le clone préparé.
La modification d'une responsabilité après démarrage n'est pas un moyen de fabriquer ce scope historique.

G5 : attendu `active_teams=3`, `teams_with_results=2`, `teams_without_results=1`, `overdue_evaluations=1`.
A=En retard, B=À jour, C=Jamais évaluée ; D n'est pas en retard. Archives et Beta exclus.
La dernière complétion est le maximum des dates initiales A/B ; aucune révision ne la déplace.
Si D change à minuit, recréer le jeu ou recalculer explicitement les attentes avant le verdict.

## Références de préparation existantes

Toutes dans `frontend/e2e/`, elles se réinitialisent et peuvent supprimer les données de leur organisation de test.

| Besoin | Fixture ou parcours de référence |
| --- | --- |
| Identités, appartenance, journaux | [identity-fixture.ts](../../frontend/e2e/identity-fixture.ts), `organizations.spec.ts`, `permissions.spec.ts` |
| Passation deux questions / suppléance | [taking-fixture.ts](../../frontend/e2e/taking-fixture.ts) ; repères à ajouter comme G2 |
| Copie v1/v2 et repères snapshotés | [evaluation-versions.spec.ts](../../frontend/e2e/evaluation-versions.spec.ts) |
| Pilotage relatif à aujourd'hui | [steering-fixture.ts](../../frontend/e2e/steering-fixture.ts) ; G5 précise la variante manuelle avec échéance à D |
| Accueil / complétion et révision | [dashboard-fixture.ts](../../frontend/e2e/dashboard-fixture.ts) |

## Effectuer les vérifications API sans ambiguïté

Utiliser le navigateur connecté à la même origine et son panneau Réseau, ou Swagger `/api/docs/` avec session/CSRF.
Pour les écritures de refus indiquées dans les fiches : partir d'une requête nominale observée, copier sa structure,
remplacer uniquement la valeur précisée, garder méthode/URL/champs contractuels et le CSRF valide en mémoire.
Une requête nominale non disponible doit être préparée selon `/api/schema/`, sans deviner de champ.
Ne jamais publier la requête copiée brute. Ne pas tester une permission métier avec un CSRF invalide : ce serait un autre refus.
Initialiser le cookie CSRF via `GET /api/session/` ; anonyme, son 403 est attendu. Les API de session refusent
les anonymes avec 403 ; `/api/users/` technique conserve son exception 401 selon le [contrat](../architecture/api-permissions.md).

Avant et après chaque refus d'écriture : GET autorisé de l'objet/liste, état/notes/provenance et Journal métier ;
une relecture par Admin/Superadmin du même jeu vérifie l'absence d'effet quand l'acteur refusé ne peut lire.
Noter code et corps expurgé : 400 validation/invariant, 403 rôle, 404 ressource hors scope masquée ; les filtres
Logs étrangers peuvent répondre 200 avec liste vide (FON-07). Ne pas assimiler toute erreur à un refus conforme.
Les injections de panne de tests sont des simulations de service, clairement marquées ; elles ne prouvent pas
une panne SMTP, un conflit SQLite ou une qualification technique MESS. Utiliser des clones pour les essais de refus.
