# C04 — Qualification des lectures Coach TEAM-002/003

Décision produit du 2026-11-12 : [source C04](../../backlog/source/00-arbitrage-c04-equipes-coach.md).
Branche `c04-coach-team-reads`, base `2fedab8`, worktree isolé
`C:\Users\garan\Desktop\Projets\Assess-teams-worktrees\c04-coach-team-reads`.
README annoncé avant développement. Aucun autre worktree n’est modifié.

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

## Revue documentaire et DoD

README, règles agents, charte qualité, DoD, stratégie de tests, fondamentaux, isolation,
contrats API/équipes et permissions ont été revus. Les règles générales restent applicables
sans modification ; les documents de contrat, sources de décision et vues courantes affectés
sont actualisés. Les audits datés conservent leur diagnostic historique avec un renvoi C04.
Aucun modèle ou migration, dépendance, rôle ou historique nouveau : migrations nouvelles N/A.
La capture HTTP reste obligatoire ; aucun Journal métier pour une lecture ou un refus.
Aucun statut, date canonique ou indicateur modifié avant approbation de clôture.

## Soumissions distinctes

Les dossiers [TEAM-002](soumission-team-002.md) et [TEAM-003](soumission-team-003.md)
seront soumis séparément après qualification complète, publication et CI verte du SHA exact.
Ces soumissions ne sont pas des clôtures approuvées et ne modifient pas le registre canonique.
La recette sur cible MESS demeure indépendante ; aucune qualification locale ne vaut PV MESS.
