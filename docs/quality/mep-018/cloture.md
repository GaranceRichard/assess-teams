# MEP-018 — Clôture avec dérogation chronologique

**Clôture canonique : 2026-11-09.** Décision explicite du responsable produit et mainteneur,
communiquée le 9 novembre 2026 après lecture du [dossier de rapprochement et refus initial](decision-20261109.md).
Base de cette régularisation documentaire : `7bb8406d0ea71438538106cdb9b2b2a202b948a8`.
Resynchronisation sur `d6925709931b7d288ca00134071669deaeb0fdfc`, rattrapage documentaire
publié entre-temps : la clôture distincte de MEP-017 et les autres décisions de ce lot sont conservées.

## Décision de gouvernance

Le responsable produit constate les critères fonctionnels démontrés, les contrôles applicables
réussis et le README finalement mis à jour. Il approuve explicitement :

> J'approuve, à titre exceptionnel et pour MEP-018 uniquement, une dérogation à l'exigence
> chronologique de mise à jour préalable du README.

Cette décision autorise la clôture sur les preuves fonctionnelles acquises, avec les limites suivantes :

- La non-conformité historique **D01 est reconnue et conservée**, sans correction rétroactive prétendue.
- La dérogation concerne **MEP-018 uniquement** ; elle ne modifie ni la DoD générale ni son caractère
  bloquant pour les travaux futurs, et ne crée aucune dérogation pour un autre chantier.
- Elle ne constitue pas une validation de recette MESS, un PV cible ou un GO MESS.

Le refus initial était fondé sur l'absence de cette décision. Il reste consultable et daté ;
la présente décision en lève l'obstacle de clôture sans rendre conforme l'ordre historique.
Aucune nouvelle exigence de chargement ni modification des arbitrages C04/C06/C10 n'est introduite.

## Critères, preuves et DoD

La [matrice critère → preuve → résultat → verdict](decision-20261109.md#matrice-critère--preuve--résultat--verdict)
et le [rapport de qualification](README.md) sont réutilisés sans nouvelle campagne applicative.

| Critère / refus | Preuve acquise | Verdict de clôture |
| --- | --- | --- |
| Attente annoncée ; attente muette refusée | L01 ; `PlanningContextRace`, `planning-pending`, `shell-states` ; statut visible et commandes protégées | Satisfait |
| Réponses anciennes ignorées | Results/Pilotage : quatre ordres succès/erreur par écran et huit E2E ; Planification : quatre ordres d'équipes | Satisfait |
| Contenu courant distingué de l'ancien | L02/L04 ; sélection B conservée, aucune équipe A ni ancienne page restaurée après refus ; rechoix identique sans attente infinie | Satisfait |
| Double mutation et faux succès refusés | L03 ; `PlanningPending`, `planning-pending` : double soumission provoquée, un seul appel, succès après réponse, saisie conservée sur 400 | Satisfait |
| Documentation préalable / D01 | README finalement mis à jour ; ordre préalable non conforme, reconnu dans le rapport puis dans le refus | Dérogation exceptionnelle approuvée le 2026-11-09, limitée à MEP-018 |
| Autres points applicables de DoD | Revue documentaire et DoD du dossier initial ; gates requis réussis et preuves ci-dessous | Acquis conservés ; gates documentaires de ce lot requis avant livraison |

| Preuve publiée | SHA complet et résultat applicable |
| --- | --- |
| Correctif initial | `4d3ac770be3be0bcea047a2139aebcac44f46aae` : corrections et tests rouges puis verts consignés |
| Candidat fonctionnel | `8609c857b4404d5b1addfe8c7174a4c02fca8085` : [CI 42273721774, tentative 1](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774/attempts/1) annulée, aucun succès déduit ; [tentative 2](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774/attempts/2) réussie sur le même SHA, 133 React, 150 E2E applicatifs, 10 E2E démo |
| Consignation documentaire ultérieure | `54afdde2ff58cd50e0c3c11b55092f600d42c9dd` : preuve C2 et proposition, [CI 42277545588](https://github.com/GaranceRichard/assess-teams/actions/runs/42277545588) réussie ; aucune nouvelle preuve fonctionnelle |
| Base applicative ultérieure | `550efa5e52648c3ae934421b29c10121eb091471` : [Quality gate 42320208084](https://github.com/GaranceRichard/assess-teams/actions/runs/42320208084) et [exhaustive 42489438995](https://github.com/GaranceRichard/assess-teams/actions/runs/42489438995) réussis après CI/npm ; portée distincte du candidat fonctionnel |
| Dossier initial de rapprochement | `7bb8406d0ea71438538106cdb9b2b2a202b948a8` : [CI documentaire 42613825254](https://github.com/GaranceRichard/assess-teams/actions/runs/42613825254) réussie ; refus D01 conservé comme constat historique |

Le code applicatif, les tests, dépendances, workflows, API, migrations et permissions ne changent pas
dans cette clôture. Build, coverage, campagnes backend/frontend/E2E et nouvelle recette visuelle sont
non applicables à ce diff de prose. Les preuves gardent leurs SHA et sélections ; aucun résultat
ciblé n'est assimilé à une couverture exhaustive ou à une garantie nouvelle d'idempotence serveur.
README, règles agents, charte, DoD, stratégie de tests, fondamentaux et contrat API ont fait l'objet
de la revue d'impact : seule la documentation de décision, de suivi et ses vues dérivées est affectée.
Les contrôles documentaires frais, le pré-push bloquant et la CI du SHA exact de clôture restent
obligatoires via `npm run publish` ; le compte rendu de livraison en confirmera l'identité et le résultat.

## Limites et coordination

Zoom natif 200 %, tactile physique et complément manuel UX-06 restent les limites de qualification
annoncées ; aucune capture, approbation UX ou certification supplémentaire n'est inventée.
La future recette MESS conserve son candidat exact, sa qualification exhaustive distante et ses PV.

Cette régularisation clôt uniquement MEP-018. Les statuts des autres PBI restent ceux du dernier
registre canonique ; FEAT-056 et EPIC-012 restent incomplets. Le chantier de rattrapage documentaire
`docs/mep-backlog-reconciliation` et TEAM-003 sont préservés. Les vues partagées sont réconciliées
sur le dernier `origin/main` avant publication, sous verrou d'intégration habituel, sans reprendre
ni anticiper les clôtures préparées dans un autre worktree. Après rapprochement des lignes canoniques :
FEAT-056 4/5 (80 %), EPIC-012 16/17 (94 %), MESS 29 réalisés / 31 ouverts / 2 bloqués / 0 en cours
sur 62 (47 %), global 54 réalisés / 39 ouverts / 3 bloqués / 0 en cours sur 96 (56 %).
Seule la ligne canonique MEP-018 diffère du dernier main ; MEP-051 reste Ouvert/N/A.
