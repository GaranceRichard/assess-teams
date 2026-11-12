# MEP-031 — Cahier préparatoire de recette technique MESS

Préparé le 2026-11-12 sur le dernier `origin/main` récupéré :
`ec4c3a535065c54e3c25abea8f52b722f5bef5be`. Ce SHA est la base de rédaction, pas un candidat MESS.
[Exigence FEAT-065 / MEP-031](../backlog/source/mess/f17.md),
[registre canonique](../backlog/tracking/mess-e04.md),
[fiche de qualification](../backlog/planning/audit-20261027/fiches/MEP-031.md).

**MEP-031 reste Ouvert / N/A. Tous les verdicts TEC restent `Non exécuté`.**
Ce cahier préparatoire est publiable ; sa finalisation exige MEP-022, les décisions C11 et D01–D09
applicables, les procédures définitives et l'approbation explicite du responsable produit.
Ni test local, ni CI verte, ni clôture ultérieure du cahier ne constitue une recette MESS ou ne la déclenche.

## Préparer et utiliser le cahier

1. Lire le [protocole commun et les jeux](technical-acceptance-protocol.md), puis la
   [matrice des capacités et décisions](technical-acceptance-dependencies.md).
2. Remplir le dossier P0 pour le candidat réel, réserver un clone par lot mutable et vérifier les
   prérequis du consommateur. Un paramètre manquant ou une commande future empêche l'exécution concernée.
3. Finaliser les procédures conditionnelles depuis les livraisons réelles, sans improviser une installation,
   un outil d'injection, une politique de purge ou un script de restauration pendant la recette.
4. Exécuter nominal et chaque refus séparément ; relever attendu/observé et absence d'effet interdit.
   Une erreur serveur inattendue est un échec, jamais un refus conforme.
5. Produire un PV distinct par variante, avec les preuves protégées et la remise en état vérifiée.
   Les champs du [modèle de PV](technical-acceptance-protocol.md#preuve-et-verdict) restent vierges ici.

## Index et couverture des risques

La nomenclature TEC n'existait pas à la base inspectée ; FON et UX sont conservés.
Les préconditions P0 et la remise en état R0 font partie de chaque fiche, même lorsqu'elles sont référencées.
Chaque fiche contient objectif, contrat, risque, procédure, injection, attente, seuil, refus et preuves.

| Identifiant | Objectif / risque à qualifier | Consommateur du PV |
| --- | --- | --- |
| [TEC-01](technical-acceptance-installation.md#tec-01) | Installation vierge, package et préflight | MEP-032 |
| [TEC-02](technical-acceptance-installation.md#tec-02) | Autonomie runtime, assets et dépendances réseau | MEP-068 |
| [TEC-03](technical-acceptance-security.md#tec-03) | TLS, certificats, flux et proxy de confiance | MEP-034 |
| [TEC-04](technical-acceptance-security.md#tec-04) | Session, cookies, origine et CSRF | MEP-034 |
| [TEC-05](technical-acceptance-security.md#tec-05) | Secrets, ACL et démarrage sûr | MEP-034 |
| [TEC-06](technical-acceptance-access.md#tec-06) | Authentification, privilèges et rôles | MEP-034 |
| [TEC-07](technical-acceptance-access.md#tec-07) | Isolation organisationnelle et références forgées | MEP-034 |
| [TEC-08](technical-acceptance-sqlite.md#tec-08) | Paramètres SQLite, verrous et rollback | MEP-071 |
| [TEC-09](technical-acceptance-sqlite.md#tec-09) | Invariants et provenance sous concurrence | MEP-071 |
| [TEC-10](technical-acceptance-sqlite.md#tec-10) | Charge, stabilité, disponibilité et limites | MEP-071 |
| [TEC-11](technical-acceptance-operations.md#tec-11) | Panne SMTP, reprise et remise incertaine | MEP-034 ; réutilisation MEP-068 |
| [TEC-12](technical-acceptance-operations.md#tec-12) | Services, ordonnanceur, démarrage et arrêt | MEP-068 ; arrêt/restart MEP-071 |
| [TEC-13](technical-acceptance-operations.md#tec-13) | Journaux, conservation, purge et reprise | MEP-034 |
| [TEC-14](technical-acceptance-recovery.md#tec-14) | Sauvegarde cohérente et protection des copies | MEP-072 |
| [TEC-15](technical-acceptance-recovery.md#tec-15) | Restauration, intégrité et perte admissible | MEP-072 |
| [TEC-16](technical-acceptance-recovery.md#tec-16) | Upgrade et retour du couple version/schéma/données | MEP-072 |
| [TEC-17](technical-acceptance-installation.md#tec-17) | Refus de promotion si gate ou preuve invalide | MEP-032 ; contrôle documentaire avant MEP-035 |

## Traçabilité et preuves

La chaîne `Exigence → Contrat → Risque → Scénario → Refus → Preuve attendue → PBI consommateur`
est matérialisée par l'index, les champs des fiches et la
[matrice de traçabilité](technical-acceptance-dependencies.md#traçabilité-et-dépendances-par-scénario).
L'[inventaire de qualification](technical-acceptance-review.md) distingue capacités couvertes en développement,
couvertures partielles et capacités absentes ; aucune de ces preuves n'est un PV cible.
Les [commandes vérifiées](technical-acceptance-protocol.md#commandes-présentes) sont séparées des opérations futures.

L'investigation CI du **11 novembre 2026** reste autonome : origine non conclue, aucun test déclaré flaky,
aucun critère SQLite modifié. Son rapport dédié devra être référencé à sa publication ; aucun rapport correspondant
n'a été trouvé dans `docs/` à la base de rédaction. Les contrats MEP-010/039/040 restent les oracles.
Aucune intervention dans son worktree, dans TEAM-003, ni dans les workflows de publication.

## Sortie du préparatoire et finalisation

La [revue DoD et le registre de publication](technical-acceptance-review.md) portent exclusivement sur ce lot documentaire.
Les dépendances canoniques restent MEP-022 et MEP-039 ; les autres capacités/décisions sont des entrées
des scénarios consommateurs, sans nouvel arc de dépendance ni nouveau PBI.
Après livraison MEP-022 et décisions approuvées : remplacer les inconnues, vérifier commandes et seuils/refus,
soumettre le cahier final au responsable produit ; clôturer et recalculer les indicateurs seulement après son accord.
La préparation se termine à sa publication vérifiée, sans attendre ces décisions externes.
