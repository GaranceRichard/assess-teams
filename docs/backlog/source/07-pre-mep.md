# EPIC-011 — Préparation de la mise en production MESS

## Objectif et périmètre

Préparer une livraison exploitable, sûre et utilisable au MESS à partir du socle métier existant.
Cette source intègre les 36 entrées demandées le 2026-10-10 : 35 travaux et le jalon GO/NO-GO.
Elle ne déclare aucune implémentation pré-MEP réalisée par cette mise à jour documentaire.

La hiérarchie Epic → Feature → PBI, les états, les règles de qualité, de tests et d’architecture restent ceux
de la [gouvernance](../governance.md), de la [DoD](../../quality/definition-of-done.md), de la
[stratégie de tests](../../quality/test-strategy.md) et de l’[architecture](../../architecture/fundamentals.md).

## Décisions structurantes du périmètre

- SQLite est conservé en production ; qualification de sa contention réelle, sans migration de moteur.
- Déploiement on-premise au MESS ; installation cible hors ligne, sans Docker ni Node.js.
- La construction React et la préparation des dépendances ont lieu sur un poste de préparation.
- Configuration d’installation centralisée, distincte des paramètres métier et arbitrages de FEAT-031.
- Apache 2.0 permet la reprise, le fork et la modification ; droits des dépendances/assets à vérifier.
- Curseur entier 0–10 et repères descriptifs existants conservés ; aucune note attribuée implicitement.
- Évaluation, résultat, accompagnement et pilotage restent distincts ; aucune surveillance individuelle.

## Features et vagues obligatoires

Chaque Feature porte un job ; tous ses PBIs peuvent progresser indépendamment dans leur périmètre.
Le job suivant démarre lorsque tous les travaux du précédent sont satisfaits. Une livraison déjà réalisée
compte comme acquise sans être refaite. Les dépendances internes de livraison sont explicites dans les sources.

- [FEAT-042 — Fondations : job 1](071-mep-job-1.md).
- [FEAT-043 — Robustesse : job 2](072-mep-job-2.md).
- [FEAT-044 — UI/UX : job 3](073-mep-job-3.md).
- [FEAT-045 — Exploitation et contrat de déploiement : job 4](074-mep-job-4.md).
- [FEAT-046 — Packaging et installation : job 5](075-mep-job-5.md).
- [FEAT-047 — Documentation et transfert : job 6](076-mep-job-6.md).
- [FEAT-048 — Recette préproduction : job 7](077-mep-job-7.md).

Le jalon MEP-035 — Décision GO/NO-GO clôt la séquence après le job 7.
Le [plan des vagues](../planning/pre-mep.md) donne les prérequis et les conditions de validation.

## Réconciliation et limites des preuves

Les [rapprochements avec les livraisons](../planning/pre-mep-rapprochements.md) expliquent les compléments
et les écarts. Les audits technique et UI/UX ont été réalisés hors dépôt ; leurs rapports ne sont pas disponibles sous
forme de fichiers locaux, selon la clarification du demandeur. La réconciliation repose sur le backlog,
les 36 entrées du prompt et les éléments/preuves du dépôt. Les constats d’audit sont des points à vérifier,
sans conclusion d’audit ni référence documentaire inventée.

Chaque PBI commence par vérifier le point et les acquis : réutiliser les preuves satisfaisantes,
compléter uniquement les écarts avérés et qualifier ce qui reste non démontré sur la cible MESS.
Une correction ne découle pas automatiquement d’un intitulé d’audit. Les écarts observés dans le dépôt
sont distingués des hypothèses à vérifier ; les réalisations historiques restent conservées.

Priorité P1 au sens du backlog existant : préparation après le premier parcours. L’ordre impératif des jobs
fixe la priorité d’exécution pré-MEP ; les sept vagues sont requises pour le GO, y compris le chantier UI/UX.
Les recommandations de taille et de modèle restent À définir, sans estimation ni affectation implicite.
