# MEP-047 — extraits des observations locales

Extraits calculés à partir des JSON originaux dont les empreintes sont dans [preuves.md](preuves.md).
Date/exécutant : 2026-11-01, Codex ; SHA `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`.
Ce relevé documentaire ne rejoue aucun scénario. Statuts et valeurs ci-dessous sont observés, pas des attendus supposés.

## Jeu et séparation des phases

Dans `observations.json` : organisations A=8/B=9, équipes A1=13/A2=14/B1=15, famille A=7.
Les fixtures E2E réinitialisent A ; la phase de bascule `context-switch.json` utilise A=15/B=9.
La phase de captures Vert utilise encore une nouvelle initialisation : ne pas mélanger ces IDs.
Comptes, organisations, scores et dates sont fictifs. Une session navigateur distincte est utilisée par rôle.

## Portée réelle par rôle — API et interface

| Compte fictif | Projection ou liste observée | HTTP |
| --- | --- | ---: |
| `results-admin-e2e` | Équipe A (ID 13), Équipe B (ID 14) | 200 |
| `MEP047 B-admin` | MEP047 B Team (ID 15) | 200 |
| `m47-coach-a` | Équipe A (ID 13) | 200 |
| `m47-coach-b` | Équipe B (ID 14) | 200 |
| `m47-coach-none` | Liste de familles vide [] | 200 |
| `m47-viewer` | Équipe A (ID 13), Équipe B (ID 14) | 200 |
| `m47-root` | Équipe A (ID 13), Équipe B (ID 14) | 200 |

Les sept événements `role-observation-passed` terminent les parcours API/UI correspondants.
Le Superadmin commence sans organisation choisie ; les autres scopes sont imposés selon leurs droits.
Le Coach sans assignation voit « Aucune passation complétée accessible. », sans série.

## Refus réels depuis Admin A

| Opération | URL réellement appelée | HTTP et corps observés |
| --- | --- | --- |
| unknown | `/api/results/families/999999/` | 404 ; `{"detail": "No Evaluation matches the given query."}` |
| foreign family | `/api/results/families/8/` | 404 ; `{"detail": "No Evaluation matches the given query."}` |
| foreign organization | `/api/results/families/?organization_id=9` | 404 ; `{"detail": "No Organization matches the given query."}` |
| foreign version | `/api/results/families/7/?evaluation_id=18` | 404 ; `{"detail": "No Evaluation matches the given query."}` |
| foreign lineage | `/api/results/families/7/criteria/1d35caa3-bd10-4280-bd0d-ae2029c22c10/?evaluation_id=16` | 404 ; `{"detail": "Pas trouvé."}` |
| mixed teams | `/api/results/families/7/criteria/b495dce6-db17-4b43-b7e4-b4a0cdb9b8cc/?evaluation_id=16&team_ids=13&team_ids=15` | 404 ; `{"detail": "Pas trouvé."}` |

Les corps famille étrangère/inconnue sont identiques ; une liste mêlant A et B est refusée en entier.
Même refus observé sur les variantes Coach A, Coach B et Viewer A ; aucune donnée étrangère renvoyée.
Les 403 des API administratives Viewer et le parcours Viewer sont vérifiés par les E2E et tests backend,
pas inventés à partir des 404 de cette sonde.

## Lignées et valeurs datées

| Cas / équipe | Run | Version | Score | Complétion (réponse API) | Texte snapshoté |
| --- | ---: | ---: | ---: | --- | --- |
| Lignée partagée / Équipe A | 29 | 1 | 2 | 2026-09-01T08:00:00-04:00 | Collaboration |
| Lignée partagée / Équipe A | 27 | 1 | 0 | 2026-10-02T08:00:00-04:00 | Collaboration |
| Lignée partagée / Équipe A | 30 | 2 | 6 | 2026-10-05T08:00:00-04:00 | Collaboration v2 |
| Lignée partagée / Équipe B | 28 | 1 | 8 | 2026-10-03T08:00:00-04:00 | Collaboration |
| Lignée partagée / Équipe B | 31 | 2 | 7 | 2026-10-06T08:00:00-04:00 | Collaboration v2 |
| Homonyme distinct / Équipe A | 30 | 2 | 4 | 2026-10-05T08:00:00-04:00 | Collaboration |

Lignée partagée : `b495dce6-db17-4b43-b7e4-b4a0cdb9b8cc` ; homonyme : `08f5278f-2e89-431b-b777-d4f487bc0ed6`.
La lignée partagée contient v1 et v2 ; l’homonyme n’apporte que ses points v2.
Ce lien n’affirme aucune équivalence sémantique universelle des scores.

## Refus de snapshots endommagés et distinction zéro/absence

Dernière COMPLETED A : premier score mis à `null` ; snapshot B : premier texte rendu incompatible.
Ces corruptions sont injectées exclusivement dans la base fictive isolée.

| Étape | HTTP | Résultat observé |
| --- | ---: | --- |
| families before | 200 | Famille disponible avec v1 archivée/v2 validée |
| intact archived snapshots | 200 | 3 axes ; équipes [13, 14] |
| latest completed incomplete and incompatible | 200 | 3 axes ; équipes [] |
| version without completed results | 404 | {"detail": "No Evaluation matches the given query."} |
| excluded team history | 404 | {"detail": "Pas trouvé."} |
| v2 zero measured | 200 | 4 axes ; équipes [13, 14] |
| missing old scores are omitted | 200 | Points A : [(2, 0)] |

L’ancien run A disponible n’est pas repris quand sa dernière COMPLETED est inutilisable.
UI v1 : axes et échelle, aucune série ni case d’équipe ; message invitant au choix : réserve O1.
Après omission des anciens scores manquants et mise à 0 du courant : seul point A `(v2, 0)` ;
le tableau affiche ce 0 et laisse les cellules sans observation vides.

## Conservation et réponses obsolètes

| Thème | Viewport | Comparatifs avant | Comparatifs après | Largeur du document |
| --- | --- | ---: | ---: | ---: |
| day | 1280×720 | 2 | 2 | 1280 |
| night | 1280×720 | 2 | 2 | 1280 |
| day | 390×844 | 2 | 2 | 390 |
| night | 390×844 | 2 | 2 | 390 |

Le retour entre radar, données et historique conserve v1 archivée et les deux équipes.
Deux événements `delayed-http-ignored`, success puis error, attestent les assertions finales :
réponse v1 retenue, v2 choisie, ancien succès puis ancien 500 livrés ; v2 reste sans alerte.
Le 500 fictif est un incident obsolète, pas un refus métier de sécurité.

Bascule réelle Superadmin : `family-reset` (modèle 15, équipes décochées, critère absent),
puis `organization-reset` (organisation 9) : HTTP 200, équipe B1=15 seule, version=1, scores=[0,10].
Les anciennes équipes/critère ne persistent pas à ce changement intentionnel.

## Observations visuelles acquises et limites

Le rapport initial décrit les 16 vues archive bleues relues et les quatre vues Vert stables explicitement relues :
`green-stable-day-1280-radar.png`, `green-stable-night-1280-history-details.png`,
`green-stable-day-390-history-details.png`, `green-stable-night-390-radar-details.png`.
Les PNG sont présents et identifiés dans le [manifeste original](manifest-original.md), mais non publiés.
Contexte, sélection, version, dates et provenance restent lisibles ; zéro et vide sont distincts.
Les captures UX-09 prises pendant la fermeture de l’aide ne valent pas validation de l’arrière-plan (O2).
Les 32 mesures UX-09 et les tests automatiques ne remplacent pas la relecture ni une recette MESS.
Zoom natif 200 %, tactile physique et acceptation sur cible MESS non exécutés lors de cette qualification.
