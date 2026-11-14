# TEAM-005 — Clôture fonctionnelle approuvée

Décision du mainteneur : **2026-11-13** (America/Toronto).
Base documentaire : `7fb78616d864c5b8ed58c7ea71f6ed9456903cc8`.
Branche : `docs/team-005-closure-20261113` ; worktree documentaire dédié annoncé au démarrage.

## Approbation métier

> GO — Clôture fonctionnelle TEAM-005 approuvée le 13 novembre 2026.

Le mainteneur confirme les sept scénarios d’acceptation, la DoD, le contrat API,
les tests et preuves de non-régression ainsi que les deux CI de publication.
Il autorise explicitement l’enregistrement canonique suivant, sans nouveau développement :

| PBI | Statut | Date de réalisation | Blocage |
| --- | --- | --- | --- |
| TEAM-005 — Archiver une équipe | Réalisé | 2026-11-13 | aucun |

La décision métier est acquise avant cette mise à jour. L’enregistrement dans le registre
publié sera confirmé séparément après `npm run publish` et la CI du SHA exact de clôture.

## Preuves conservées

- [Qualification initiale et contrat approuvé](rapport.md) : reproduction sur le main publié,
  proposition puis approbation du refus **400**, corps exact `["Équipe déjà archivée."]`.
- [Tests rouges puis verts, intégrité et DoD](preuves.md) : premier DELETE 204, second refus
  sans mutation métier ni seconde activité, isolation, permissions et non-régressions.
- Correctif publié : `8f8985534cf562eabc15fecaa216344cd0887889` ;
  [CI applicative verte](https://github.com/GaranceRichard/assess-teams/actions/runs/43481970237).
- Rapport final publié : `7fb78616d864c5b8ed58c7ea71f6ed9456903cc8` ;
  [CI documentaire verte](https://github.com/GaranceRichard/assess-teams/actions/runs/43537142870).

Les documents de qualification gardent leurs constats et statuts datés avant approbation.
Le [registre canonique](../../tracking/pbis.md) porte désormais le statut courant approuvé.
Le contrat API, les historiques métier et les preuves techniques ne sont pas modifiés.

## Recalcul des indicateurs

Comptage des lignes canoniques actives : 34 PBI fonctionnels et 62 PBI MESS, sans doublon.
Arrondi à l’entier le plus proche selon la [gouvernance](../../governance.md).

| Périmètre | Avant | Après |
| --- | --- | --- |
| Global | 55 réalisés, 38 ouverts, 0 en cours, 3 bloqués ; 55/96 = 57 % | 56 réalisés, 37 ouverts, 0 en cours, 3 bloqués ; 56/96 = 58 % |
| PBI non réalisés | 41 | 40 |
| Fonctionnel | 25/34 réalisés = 74 % | 26/34 réalisés = 76 % |
| EPIC-002 — Gestion des équipes | 2/7 réalisés = 29 % | 3/7 réalisés = 43 % |
| FEAT-010 — Gérer la sortie et la reprise du suivi actif | 0/3 réalisés = 0 % | 1/3 réalisés = 33 % |
| MESS actif | 30/62 réalisés = 48 % | Inchangé : 30/62 réalisés = 48 % |

Les 15 Epics, 61 Features, 42 Features raffinées, 19 non raffinées et 96 PBI restent inchangés.
FEAT-010 reste partiellement réalisée ; aucune clôture de TEAM-006 ou TEAM-007 n’est déduite.

## Revue et livraison documentaires

Le lot met à jour le seul statut TEAM-005, ses mentions courantes et les agrégats dérivés.
Resynchronisation sur `09e305a1215300ea59ded1cb13e5a23e87639e70` : les apports C04 sont conservés.
Les deux conflits de source sont résolus en reprenant main, puis en remplaçant seulement la mention
TEAM-005 encore en attente de clôture ; les autres décisions et les compteurs restent inchangés.
TEAM-003/C04, TEAM-006/007 et chaque autre ligne canonique restent inchangés.
Les audits datés et leurs catégories de couverture sont conservés, sans déduction depuis les statuts.
Aucune décision MESS, dépendance ou capacité nouvelle n’est créée.
Le README produit et le code ne sont pas affectés par cet enregistrement de gouvernance.
Le plan d’impact réel confirme le seul scope documentaire. Les contrôles locaux de lignes, secrets,
structure, liens et cohérence sont conformes ; aucune campagne backend/frontend/E2E n’est relancée.
Publication directe via `npm run publish`, CI du SHA exact, fast-forward sûr de main,
puis nettoyage exclusif de ce worktree et de sa branche après succès.
