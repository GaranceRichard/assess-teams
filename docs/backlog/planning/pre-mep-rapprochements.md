# MESS — correspondance et décisions de réconciliation du 2026-10-13

Référence de départ : `ec850ba` sur origin/main. Le [registre historique](../tracking/mess-historique.md)
conserve exactement les anciennes lignes canoniques ; les [sources archivées](../source/070-mep-historique.md)
conservent critères, dépendances d’origine et preuves. La [source active](../source/07-pre-mep.md) remplace
uniquement la préparation MESS. EPIC-001 à EPIC-010, EPIC-002A et FEAT-001 à FEAT-041 sont conservés.

## Décision de rattachement explicite

EPIC-011 passe de l’enveloppe MESS à E01 — Sécurité et robustesse. Les trois autres enjeux deviennent
EPIC-012/013/014. Les sept Features de Jobs FEAT-042 à FEAT-048 sont archivées ; vingt capacités nouvelles
portent FEAT-049 à FEAT-068. Aucun identifiant historique n’est réattribué à une autre capacité.
Pour chaque ancien PBI ouvert décomposé, son identifiant demeure sur une composante identifiable ;
les autres composantes reçoivent un nouvel identifiant. Le titre et le parent courants changent explicitement,
et le périmètre d’origine reste consultable. Le statut Ouvert et la date N/A sont conservés.
Les huit réalisations du Job 1 restent historiques, intégralement réalisées, sans réouverture.

## Correspondance exhaustive des 36 anciens travaux, jalon inclus

| Ancien travail / identifiant / titre | État conservé | Destination ou acquis réutilisé | Preuve / limite |
| --- | --- | --- | --- |
| 1.1 — MEP-001 — Sécurisation de l’authentification | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [01.02 — MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md); [20.01 — MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | [Connexion et preuves](../../architecture/login-security.md) ; aucun travail relancé |
| 1.2 — MEP-002 — HTTPS, proxy, cookies et CSRF | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [01.02 — MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md); [10.01 — MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md); [20.01 — MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | [HTTP, proxy, cookies et CSRF](../../architecture/http-security.md) ; aucun travail relancé |
| 1.3 — MEP-003 — Intégrité des transactions SQLite | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [02.01 — MEP-039 — Définir les paramètres de concurrence SQLite](../source/mess/f02.md); [02.02 — MEP-010 — Gérer les verrous et les transactions concurrentes](../source/mess/f02.md); [02.03 — MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md); [20.02 — MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md) | [Transactions et tests](../../architecture/sqlite-transactions.md) ; aucun travail relancé |
| 1.4 — MEP-004 — Fiabilisation SMTP et reprises | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [08.05 — MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md); [11.02 — MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md); [14.01 — MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md); [20.01 — MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | [File SMTP et reprises](../../architecture/email-notifications.md) ; aucun travail relancé |
| 1.5 — MEP-005 — Accessibilité des modales | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [05.02 — MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md); [08.02 — MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md); [17.02 — MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md); [19.02 — MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) | [Accessibilité des dialogues](../../architecture/dialog-accessibility.md) ; aucun travail relancé |
| 1.6 — MEP-006 — Licence Apache 2.0 | Réalisé — 2026-10-11 | Historique conservé ; prérequis de [12.01 — MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md); [16.03 — MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) | [Apache 2.0, notices et tiers](../../legal/redistribution.md) ; aucun travail relancé |
| 1.7 — MEP-007 — Notation explicite sans valeur présélectionnée | Réalisé — 2026-10-12 | Historique conservé ; prérequis de [05.01 — MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md); [05.02 — MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md); [05.03 — MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md); [17.02 — MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md); [19.02 — MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) | [Notation explicite et refus](../../architecture/evaluation-taking.md#preuves-de-notation-explicite--mep-007) ; aucun travail relancé |
| 1.8 — MEP-008 — Permissions DRF restrictives | Réalisé — 2026-10-11 | Historique conservé ; prérequis de [01.04 — MEP-037 — Renforcer les permissions selon les rôles](../source/mess/f01.md); [20.01 — MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | [Permissions par défaut et exceptions](../../architecture/api-permissions.md) ; aucun travail relancé |
| 2.1 — MEP-009 — Secrets et paramètres de production | Ouvert — N/A | [01.01 — MEP-036 — Inventorier les paramètres sensibles et les valeurs par défaut](../source/mess/f01.md); [01.02 — MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md) | Identifiant conservé sur MEP-009 ; compléments atomiques distincts |
| 2.2 — MEP-010 — Concurrence et verrouillage SQLite | Ouvert — N/A | [02.01 — MEP-039 — Définir les paramètres de concurrence SQLite](../source/mess/f02.md); [02.02 — MEP-010 — Gérer les verrous et les transactions concurrentes](../source/mess/f02.md); [02.03 — MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md) | Identifiant conservé sur MEP-010 ; compléments atomiques distincts |
| 2.3 — MEP-011 — Isolation inter-organisations et rôles | Ouvert — N/A | [01.03 — MEP-011 — Contrôler l’isolation des accès entre organisations](../source/mess/f01.md); [01.04 — MEP-037 — Renforcer les permissions selon les rôles](../source/mess/f01.md); [01.05 — MEP-038 — Sécuriser les accès indirects et les exports](../source/mess/f01.md) | Identifiant conservé sur MEP-011 ; compléments atomiques distincts |
| 2.5 — MEP-012 — Protection GitHub et CI | Ouvert — N/A | [04.01 — MEP-012 — Vérifier les protections de branche et les contrôles CI](../source/mess/f04.md); [04.02 — MEP-043 — Mettre en place les protections manquantes](../source/mess/f04.md) | Identifiant conservé sur MEP-012 ; compléments atomiques distincts |
| 3.1 — MEP-013 — Ergonomie de la passation et du curseur de notation | Ouvert — N/A | [05.01 — MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md); [05.02 — MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md); [05.03 — MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md) | Identifiant conservé sur MEP-013 ; compléments atomiques distincts |
| 3.2 — MEP-014 — Lisibilité et compréhension des résultats | Ouvert — N/A | [06.01 — MEP-014 — Améliorer la hiérarchie visuelle des résultats](../source/mess/f06.md); [06.02 — MEP-046 — Clarifier les scores et les indicateurs](../source/mess/f06.md) | Identifiant conservé sur MEP-014 ; compléments atomiques distincts |
| 3.3 — MEP-015 — Ergonomie du radar et des comparaisons | Ouvert — N/A | [06.03 — MEP-015 — Améliorer la présentation des graphiques radar](../source/mess/f06.md); [06.04 — MEP-047 — Améliorer les comparaisons entre équipes et évaluations](../source/mess/f06.md) | Identifiant conservé sur MEP-015 ; compléments atomiques distincts |
| 3.4 — MEP-016 — Simplification du vocabulaire et des indicateurs de pilotage | Ouvert — N/A | [07.01 — MEP-016 — Harmoniser le vocabulaire du tableau de bord](../source/mess/f07.md); [07.02 — MEP-048 — Clarifier les indicateurs et leur interprétation](../source/mess/f07.md) | Identifiant conservé sur MEP-016 ; compléments atomiques distincts |
| 3.5 — MEP-017 — Responsive et ergonomie tactile | Ouvert — N/A | [08.01 — MEP-017 — Adapter les tableaux et contenus aux petits écrans](../source/mess/f08.md); [08.02 — MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md) | Identifiant conservé sur MEP-017 ; compléments atomiques distincts |
| 3.6 — MEP-018 — Cohérence des interactions, états vides, erreurs et chargements | Ouvert — N/A | [08.03 — MEP-018 — Améliorer les états de chargement](../source/mess/f08.md); [08.04 — MEP-050 — Améliorer les états vides](../source/mess/f08.md); [08.05 — MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md) | Identifiant conservé sur MEP-018 ; compléments atomiques distincts |
| 3.7 — MEP-019 — Cohérence visuelle des thèmes, contrastes et typographie | Ouvert — N/A | [09.01 — MEP-019 — Corriger les contrastes et la lisibilité du thème clair](../source/mess/f09.md); [09.02 — MEP-052 — Harmoniser le thème sombre](../source/mess/f09.md); [09.03 — MEP-053 — Harmoniser la typographie et la hiérarchie visuelle](../source/mess/f09.md) | Identifiant conservé sur MEP-019 ; compléments atomiques distincts |
| 4.1 — MEP-020 — Conservation et purge des journaux | Ouvert — N/A | [03.02 — MEP-042 — Configurer les durées de conservation des journaux](../source/mess/f03.md); [03.03 — MEP-020 — Automatiser la purge des journaux](../source/mess/f03.md) | Identifiant conservé sur MEP-020 ; compléments atomiques distincts |
| 4.2 — MEP-021 — Configuration unique MESS | Ouvert — N/A | [10.01 — MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md); [10.02 — MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) | Identifiant conservé sur MEP-021 ; compléments atomiques distincts |
| 4.3 — MEP-022 — Contrat d’installation et d’exploitation | Ouvert — N/A | [11.01 — MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md); [11.02 — MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) | Identifiant conservé sur MEP-022 ; compléments atomiques distincts |
| 4.4 — MEP-023 — Actualisation README, backlog et architecture | Ouvert — N/A | [11.03 — MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md); [11.04 — MEP-056 — Actualiser le backlog](../source/mess/f11.md) | Identifiant conservé sur MEP-023 ; compléments atomiques distincts |
| 5.1 — MEP-024 — Construction du package hors ligne | Ouvert — N/A | [12.01 — MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md); [12.02 — MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md); [12.03 — MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md); [12.04 — MEP-024 — Assembler le package autonome](../source/mess/f12.md) | Identifiant conservé sur MEP-024 ; compléments atomiques distincts |
| 5.2 — MEP-025 — Installation automatisée | Ouvert — N/A | [13.01 — MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md); [13.02 — MEP-061 — Installer les composants et dépendances](../source/mess/f13.md); [13.03 — MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md); [13.04 — MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) | Identifiant conservé sur MEP-025 ; compléments atomiques distincts |
| 5.3 — MEP-026 — Démarrage, arrêt et mise à jour | Ouvert — N/A | [14.01 — MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md); [14.02 — MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) | Identifiant conservé sur MEP-026 ; compléments atomiques distincts |
| 5.4 — MEP-027 — Sauvegarde, restauration et rollback | Ouvert — N/A | [15.01 — MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md); [15.02 — MEP-027 — Restaurer les données SQLite](../source/mess/f15.md); [15.03 — MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) | Identifiant conservé sur MEP-027 ; compléments atomiques distincts |
| 6.1 — MEP-028 — Documentation d’installation et d’exploitation | Ouvert — N/A | [16.01 — MEP-028 — Rédiger le guide d’installation](../source/mess/f16.md); [16.02 — MEP-066 — Rédiger le guide d’exploitation](../source/mess/f16.md) | Identifiant conservé sur MEP-028 ; compléments atomiques distincts |
| 6.2 — MEP-029 — Documentation de transfert et fork Apache 2.0 | Ouvert — N/A | [16.03 — MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) | Identifiant conservé sur MEP-029 ; compléments atomiques distincts |
| 6.3 — MEP-030 — Préparation de la recette fonctionnelle | Ouvert — N/A | [17.01 — MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md); [17.02 — MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) | Identifiant conservé sur MEP-030 ; compléments atomiques distincts |
| 6.4 — MEP-031 — Préparation de la recette technique | Ouvert — N/A | [17.03 — MEP-031 — Définir les scénarios de recette technique](../source/mess/f17.md) | Identifiant conservé sur MEP-031 ; compléments atomiques distincts |
| 7.1 — MEP-032 — Installation hors ligne sur environnement vierge | Ouvert — N/A | [18.01 — MEP-032 — Installer Assess Teams sur un environnement vierge](../source/mess/f18.md); [18.02 — MEP-068 — Vérifier le fonctionnement sans connexion Internet](../source/mess/f18.md) | Identifiant conservé sur MEP-032 ; compléments atomiques distincts |
| 7.2 — MEP-033 — Recette fonctionnelle et UX | Ouvert — N/A | [19.01 — MEP-033 — Vérifier les parcours d’administration](../source/mess/f19.md); [19.02 — MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md); [19.03 — MEP-070 — Vérifier les parcours de consultation des résultats](../source/mess/f19.md) | Identifiant conservé sur MEP-033 ; compléments atomiques distincts |
| 7.3 — MEP-034 — Recette technique et reprise après incident | Ouvert — N/A | [20.01 — MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md); [20.02 — MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md); [20.03 — MEP-072 — Exercer la sauvegarde, la restauration et le rollback](../source/mess/f20.md) | Identifiant conservé sur MEP-034 ; compléments atomiques distincts |
| 2.4 — JOURNAL-001 — Consulter les activités métier réussies ; JOURNAL-002 — Consulter les logs applicatifs | Réalisé — 2026-09-28 / 2026-09-29 ; extension HTTP 2026-10-05 | [03.01 — Séparer les journaux HTTP des événements métier : acquis référencé](../source/mess/f03.md) | Acquis référencé ; MEP-041 archivé comme doublon ; JOURNAL-001/002 gardent parents et dates |
| GO/NO-GO — MEP-035 — Décision GO/NO-GO | Ouvert — N/A ; décision non rendue | [Jalon séparé MEP-035](../tracking/mess-jalon.md) | Identifiant, absence de décision et règles de refus conservés ; exclu des PBI techniques |

## Acquis de validation et CI — aucun PBI de développement à recréer

- `c6cac21` (2026-10-13) : validations proportionnées, proofs locales bornées, isolation et publication sérialisée.
- `a416c82` (2026-10-13) : tests de configuration indépendants de l’état Django.
- `a573a3f` (2026-10-13) : trois partitions backend et deux shards E2E isolés.
- `1946f5b` (2026-10-13) : synchronisation fixture et recalibrage des poids CI.
- `ec850ba` (2026-10-13) : trois mesures CI réussies, médiane 4 min 39 s, coût runner +17,6 %.

[Validation proportionnée](../../quality/validation-costs.md), [CI](../../quality/ci.md) et
[bilan des mesures](../../quality/ci-performance.md) portent les preuves et limites. F04 vérifie les protections
distantes et corrige uniquement leurs écarts ; une optimisation déjà livrée n’est pas un travail restant.
Le pre-push et la CI restent les gates existants, sans nouvel objectif de temps ni seuil inventé.

## Acquis UI et fonctionnels — frontières conservées

PASS-001, EVAL-004 et MEP-007 livrent notes entières choisies, reprise et snapshots ; MEP-005 livre les
dialogues accessibles. RESULT-001/002 livrent radar, longitudinal par lignée et séparation Analyse/Restitution.
DASH-001, STEER-001, shell mobile et dix palettes sont acquis. F05–F09 vérifient et complètent seulement
les écarts de compréhension/ergonomie, sans nouvel indicateur métier ni redesign implicite.
Les correctifs `1c798d8`, `70766d4`, `0cdb1dc`, `dcbfe34`, `db94189`, `f6d982d` et `9a490b4`
restent documentés dans le [rapprochement historique](pre-mep-rapprochements-historique.md).

## Décisions et limites encore ouvertes

- ARB-ORG-005 bloque toujours ORG-004 : résolution ou limitation explicite de la suppression dépendante avant GO.
- USER-002/003, ORG-002 et TEAM-002/003/005/006/007 restent ouverts ; F01 ne duplique pas leur évolution métier.
- ARB-ORG-006/007/010/013 restent ouverts pour historiques, transferts, partage et agrégation.
- Les règles canoniques Organisation et rôles ne sont jamais réinterprétées par le backlog MESS.
- La recette reste limitée au candidat et au périmètre effectivement livrés ; aucun GO déduit du code ou du scoring.
- OS cible, responsabilités et seuils mesurables de disponibilité/reprise sont à convenir dans F11.
- Durées de conservation sont à définir par 03.02 ; elles ne sont pas inventées par la refonte.
- Audits externes sans rapports locaux : leurs constats sont des points à vérifier, pas des anomalies confirmées.

L’[audit du 2026-10-14](mess-audit.md) remplace l’ancienne justification par « confirmation du demandeur » :
61 était le total annoncé, 63 le nombre de points listés, 62 le nombre de PBI actifs après consolidation
MEP-041 → JOURNAL-001/002. Aucun point fonctionnel n’est retiré ; les vingt Features restent conservées.
