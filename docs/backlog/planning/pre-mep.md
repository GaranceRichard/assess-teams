# Ordonnancement pré-MEP — sept jobs successifs

Cette planification applique les dépendances des [sources pré-MEP](../source/07-pre-mep.md).
Les statuts individuels restent dans le [registre](../tracking/pbis.md) ; la
[vue détaillée dérivée](../tracking/pre-mep-view.md) rassemble les 35 travaux et le jalon.
Les travaux métier antérieurs et leurs arbitrages restent dans l’[ordonnancement existant](ordonnancement.md).

## Ordre, objectifs et conditions d’entrée

| Vague | Objectif | Prérequis de lancement | Travaux à lancer ensemble |
| --- | --- | --- | --- |
| Job 1 — Fondations | Accès, intégrité et choix explicite | Aucun job préalable ; acquis historiques référencés | 1.1 à 1.8 |
| Job 2 — Robustesse | Production, concurrence et cloisonnement | Tous les travaux du job 1 satisfaits | 2.1, 2.2, 2.3, 2.5 ; 2.4 acquis |
| Job 3 — UI/UX | Compréhension et usage de bout en bout | Tous les travaux du job 2 satisfaits, dont 2.4 acquis | 3.1 à 3.7 |
| Job 4 — Exploitation et contrat de déploiement | Contrat MESS et configuration | Tous les travaux du job 3 satisfaits | 4.1 à 4.4 |
| Job 5 — Packaging et installation | Livraison autonome hors ligne | Tous les travaux du job 4 satisfaits | 5.1 à 5.4, préparation parallèle |
| Job 6 — Documentation et transfert | Autonomie et cahiers de recette | Tous les travaux du job 5 satisfaits | 6.1 à 6.4 |
| Job 7 — Recette préproduction | Preuves sur le candidat MESS | Tous les travaux du job 6 satisfaits | 7.1 à 7.3, préparation parallèle |
| Jalon — GO/NO-GO | Décision sur le candidat exact | Rapports et blocages des sept jobs disponibles | MEP-035 — Décision GO/NO-GO |

## Parallélisme au sein d’un job

Le lancement parallèle couvre analyse, conception et préparation sur un contrat commun.
Les dépendances internes de livraison ne disparaissent pas : un travail ne peut être validé avant
son entrée concrète. Les PBIs conservent un suivi individuel, sans déplacer leur rattachement au job.

- Job 1 : les huit travaux peuvent démarrer ensemble ; 1.1/1.2/1.8 partagent le contrat des accès,
  1.3/1.4 celui des effets après commit, 1.5/1.7 celui de la passation. Coordonner les fichiers partagés.
- Job 2 : quatre compléments indépendants après job 1 ; 2.4 conserve les preuves JOURNAL-001/002.
  2.5 vérifie la protection GitHub en gardant la publication directe depuis un worktree dédié.
- Job 3 : les sept travaux UI/UX forment une vague propre ; 3.1 réutilise le choix explicite du job 1.
  3.2/3.3 partagent les données de restitution ; 3.5/3.6/3.7 restent transverses sans refaire ces fonctions.
- Job 4 : les quatre travaux se préparent ensemble ; 4.4 ne clôt sa réconciliation qu’après livraison
  de 4.1/4.2/4.3 (MEP-020/021/022). Configuration et contrat sont stabilisés avant job 5.
- Job 5 : scripts, services et reprise se préparent sur le contrat du job 4 ; la validation de 5.2
  attend le package 5.1 (MEP-024), celle de 5.3 et 5.4 l’installation 5.2 (MEP-025).
- Job 6 : les quatre documents/cahiers se rédigent en parallèle à partir de la livraison job 5.
- Job 7 : les trois équipes préparent leurs recettes ensemble ; exécuter d’abord 7.1 (MEP-032).
  7.2 et 7.3 utilisent ensuite la même version installée. Les incidents/restaurations de 7.3
  exigent une instance ou un snapshot isolé pour ne pas invalider les preuves fonctionnelles de 7.2.

## Suivi et passage au job suivant

Avant lancement, consulter les états, les blocages et les acquis dans le registre canonique.
Ouvert ne signifie pas immédiatement lançable : les prérequis de vague s’appliquent en plus du statut.
Un blocage réel (décision, accès, environnement ou anomalie) est renseigné sur le PBI concerné ;
sa levée est tracée et les vues dérivées sont actualisées selon la gouvernance existante.

La vague est satisfaite quand les critères/refus de tous ses travaux sont livrés avec leurs preuves,
selon les gates et la DoD existants. Aucun pourcentage de PBIs réalisés ne vaut autorisation de MEP.
Une nouvelle anomalie sur un acquis crée un complément ciblé ou rouvre le travail concerné avec historique,
sans effacer la date ni prétendre que toute sa capacité était absente.

## Décision finale

Le [jalon MEP-035](../source/077-mep-job-7.md#mep-035--décision-gono-go) présente candidat,
preuves, anomalies, arbitrages pertinents et responsabilités. Un GO exige les sept jobs satisfaits
et les gates existants conformes. Un NO-GO explicite le blocage et renvoie aux travaux de correction ;
la décision peut être enregistrée même si la préparation n’est pas achevée.
Le responsable de décision et les critères mesurables de disponibilité/reprise sont à préciser avec le MESS
dans le contrat 4.3 ; aucun nouveau comité, gate qualité ou processus d’architecture n’est créé.
