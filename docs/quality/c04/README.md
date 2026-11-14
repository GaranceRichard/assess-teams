# C04 — Qualification des lectures Coach TEAM-002/003

Décision produit du 2026-11-12 : [source C04](../../backlog/source/00-arbitrage-c04-equipes-coach.md).
Branche `c04-coach-team-reads`, base initiale `2fedab8`, resynchronisée le 2026-11-13
sur `f400a8e` (tests SQLite), `3a881f8` (politique documentaire), puis `4c29aca`
(incluant le contrat TEAM-005 publié), worktree isolé
`C:\Users\garan\Desktop\Projets\Assess-teams-worktrees\c04-coach-team-reads`.
README annoncé avant développement. Aucun autre worktree n’est modifié.

Publication technique réussie sur [`09e305a`](https://github.com/GaranceRichard/assess-teams/commit/09e305a1215300ea59ded1cb13e5a23e87639e70) ;
[CI indépendante verte](https://github.com/GaranceRichard/assess-teams/actions/runs/43542234233).
[Preuves finales](validations.md#validation-finale-et-publication-réussie--2026-11-13).
Les deux clôtures sont [approuvées séparément](#clôtures-canoniques-approuvées--2026-11-13) ; le registre porte Réalisé / 2026-11-13 / aucun pour chaque PBI.

## Périmètre et preuves

- TEAM-002 : collection active minimale Coach, compte actif, affectation et appartenance
  courantes ; liste vide valide et état vide explicite du contexte Dashboard existant.
- TEAM-003 : GET par identifiant, actif ou archivé, quatre champs uniquement ;
  aucune mutation métier et même 404 pour absence et inaccessibilité.
- TEAM-006 reste un PBI distinct ; `include_archived` n’élargit pas la liste Coach.
- Mutations et consultation d’organisations protégées par les permissions existantes ;
  C03/C05 et les droits Results/passations/planning ne changent pas.

Avant adaptation, `test_coach_team_reads.py` : **17 échecs attendus, 3 succès**, lectures
Coach refusées en 403 au lieu des succès et 404 de périmètre requis (9,54 s).
Après adaptation, première campagne ciblée : **78 succès** (40,51 s), incluant détail,
intégrité, contrats stricts OpenAPI/Swagger, liste, Logs et isolation.
Pagination/création et matrice des rôles : **93 succès** (21,89 s).
React Dashboard : **8 succès**, dont l’état vide Coach. Les résultats complets et les
références de publication seront consignés dans [validations](validations.md).

Le schéma de collection utilise `anyOf` pour les projections Coach/Admin qui se
recouvrent ; `oneOf` rejetait la liste vide et les réponses Admin. Reproduction :
**2 échecs attendus, 3 succès**, puis contrats et schéma strict : **14 succès** (1,25 s).
Les schémas génériques des autres collections ne sont pas modifiés. L’assertion
transverse de pagination contrôle maintenant chaque projection Équipes : **10 succès**
(6,72 s). Parcours navigateur ciblés Coach/Admin : **3 succès** (32,9 s).

Les tests API couvrent aussi les passations en cours/complétées sans affectation d’équipe,
les liens étrangers conservés, les sessions après retrait et la désactivation du compte.
Le parcours Playwright dédié vérifie les requêtes réelles, les refus de mutation,
le retrait courant et le contexte vide, sans nouvelle route ni écran administratif.

## Reprise du 2026-11-13

La campagne du candidat initial `063767c` a validé **1 517 tests backend**
(97,53 % de couverture) et **494 tests frontend** dans 119 fichiers
(statements 94,87 %, branches 93,33 %, fonctions 96,35 %, lignes 95,71 %).
Elle s’est interrompue pendant les E2E, après au moins 77 parcours réussis sur 151.
Aucune qualification complète n’est déduite de cette campagne interrompue.
Le nouveau candidat resynchronisé doit terminer la campagne complète avant publication.

## Revue documentaire et DoD

README, règles agents, charte qualité, DoD, stratégie de tests, fondamentaux, isolation,
contrats API/équipes et permissions ont été revus. Les règles générales restent applicables
sans modification ; les documents de contrat, sources de décision et vues courantes affectés
sont actualisés. Les audits datés conservent leur diagnostic historique avec un renvoi C04.
Aucun modèle ou migration, dépendance, rôle ou historique nouveau : migrations nouvelles N/A.
La capture HTTP reste obligatoire ; aucun Journal métier pour une lecture ou un refus.
Aucun statut, date canonique ou indicateur modifié avant approbation de clôture.

## Revue de contenu après la nouvelle politique documentaire

Le contrat propriétaire [Équipes](../../architecture/teams-api.md) porte le bloc normalisé
et l’inventaire des fichiers API, tests et état vide réellement concernés. Sa pertinence
vient des permissions, projections et refus de consultation qu’il décrit ; aucun script
qualité ni règle de publication n’est modifié par C04. Le README reste la nouvelle vitrine
produit et ne reçoit qu’une précision publique du périmètre de lecture Coach.

La préparation réelle avant développement a utilisé le README et la source de décision C04,
sous l’ancienne règle. Le nouveau format de bloc et l’inventaire fichier par fichier sont
formalisés après développement pendant la resynchronisation ; cette chronologie est explicite,
sans antériorité inventée ni dérogation prétendument approuvée. La décision, les refus testés,
les limites TEAM-006/C03/C05 et les acquis de validation restent traçables. La revue de l’agent
ne constitue pas une approbation humaine de clôture ou de ce point de chronologie.

La campagne complète du candidat `eb533d880ff375a52699b3ca09e7e354d4d80c0d` est verte :
**1 519 backend**, **494 frontend**, **151 E2E applicatifs** et **10 E2E de démo**.
Couverture backend **97,53 %** ; quatre seuils frontend supérieurs à 90 %.
Cette campagne précède la dernière intégration TEAM-005 ; le candidat final et son
pré-push sont décrits dans les validations, sans réécriture artificielle des preuves.

## Soumissions distinctes

Le passage ci-dessous conserve l’état de soumission antérieur au GO ; les décisions ultérieures sont enregistrées séparément plus bas.

Les dossiers [TEAM-002](soumission-team-002.md) et [TEAM-003](soumission-team-003.md)
sont soumis séparément après qualification complète, publication et CI verte du SHA exact.
Ces soumissions conservées décrivent l’état avant le GO ; les deux décisions indépendantes ci-dessous portent leur approbation ultérieure.
La recette sur cible MESS demeure indépendante ; aucune qualification locale ne vaut PV MESS.

## Clôtures canoniques approuvées — 2026-11-13

Enregistrement documentaire repris le 2026-11-14, sans modifier la date fonctionnelle approuvée du 2026-11-13.
Le GO du mainteneur approuve distinctement [TEAM-002](cloture-team-002.md) et
[TEAM-003](cloture-team-003.md), chacune à Réalisé, date 2026-11-13, blocage aucun.
Critères, refus, DoD, validations complètes et deux CI publiées sont explicitement approuvés.
Le registre est modifié sur ces deux lignes seulement ; les preuves et la chronologie réelle
ci-dessus restent conservées. Le lot est strictement documentaire, sans impact produit README.

| Indicateur | Avant les deux décisions | Après les deux décisions |
| --- | --- | --- |
| Global | 56/96 réalisés = 58 % ; 37 ouverts, 0 en cours, 3 bloqués | 58/96 réalisés = 60 % ; 35 ouverts, 0 en cours, 3 bloqués |
| PBI non réalisés | 40 | 38 |
| Fonctionnel | 26/34 réalisés = 76 % | 28/34 réalisés = 82 % |
| EPIC-002 — Gestion des équipes | 3/7 réalisés = 43 % | 5/7 réalisés = 71 % |
| FEAT-007 — Consulter les équipes | 0/2 réalisés = 0 % | 2/2 réalisés = 100 % |
| MESS actif | 30/62 réalisés = 48 % | Inchangé : 30/62 réalisés = 48 % |

Comptage recalculé depuis les 34 lignes fonctionnelles et les 62 lignes MESS actives,
sans doublon, avec arrondi à l’entier le plus proche selon la gouvernance. Les 15 Epics,
61 Features, 42 raffinées, 19 non raffinées et 96 PBI restent inchangés. Aucune clôture
ou décision supplémentaire n’est déduite ; TEAM-005, TEAM-006/007, C03/C05, arbitrages
Organisation et décisions MESS sont préservés. L’inscription publiée est à confirmer
après `npm run publish` et la CI verte du SHA exact de ce lot, puis nettoyage exclusif.
