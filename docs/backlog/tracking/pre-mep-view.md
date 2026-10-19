# Préparation MESS — suivi détaillé dérivé

Détail de la [synthèse principale](../synthese.md), sans autorité concurrente.
Statuts/dates et tailles issus des [sections du registre canonique](pbis.md) ; périmètre/dépendances dans les
[sources MESS](../source/07-pre-mep.md). Quatre Epics, vingt Features raffinées et 62 PBI actifs, selon l’audit du 2026-10-14.
Au 2026-10-18 : 54 Ouverts, 8 Réalisés, 0 En cours, 0 Bloqué ; avancement actif 13 %. Les acquis restent séparés.
Les huit réalisations historiques du Job 1 et le jalon sont séparés du dénominateur opérationnel.

## Avancement des capacités

Livraison calculée : tous les PBI de la Feature Réalisés selon la gouvernance/DoD ; aucun statut autonome.

| Epic | Feature / capacité | Réalisés / PBI | Avancement |
| --- | --- | ---: | ---: |
| EPIC-011 — Sécurité et robustesse | [F01 — FEAT-049 — Sécurité de production](../source/mess/f01.md) | 5 / 5 | 100 % |
| EPIC-011 — Sécurité et robustesse | [F02 — FEAT-050 — SQLite en exploitation](../source/mess/f02.md) | 3 / 3 | 100 % |
| EPIC-011 — Sécurité et robustesse | [F03 — FEAT-051 — Journalisation et conservation](../source/mess/f03.md) | 0 / 2 | 0 % |
| EPIC-011 — Sécurité et robustesse | [F04 — FEAT-052 — Gouvernance Git et intégration continue](../source/mess/f04.md) | 0 / 2 | 0 % |
| EPIC-012 — Expérience utilisateur | [F05 — FEAT-053 — Expérience de notation](../source/mess/f05.md) | 0 / 3 | 0 % |
| EPIC-012 — Expérience utilisateur | [F06 — FEAT-054 — Résultats et comparaisons](../source/mess/f06.md) | 0 / 4 | 0 % |
| EPIC-012 — Expérience utilisateur | [F07 — FEAT-055 — Pilotage et tableau de bord](../source/mess/f07.md) | 0 / 2 | 0 % |
| EPIC-012 — Expérience utilisateur | [F08 — FEAT-056 — Responsive et états d’interaction](../source/mess/f08.md) | 0 / 5 | 0 % |
| EPIC-012 — Expérience utilisateur | [F09 — FEAT-057 — Cohérence visuelle et thèmes](../source/mess/f09.md) | 0 / 3 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F10 — FEAT-058 — Configuration unique MESS](../source/mess/f10.md) | 0 / 2 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F11 — FEAT-059 — Contrat d’installation et d’exploitation](../source/mess/f11.md) | 0 / 4 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F12 — FEAT-060 — Distribution autonome hors ligne](../source/mess/f12.md) | 0 / 4 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F13 — FEAT-061 — Installation automatisée](../source/mess/f13.md) | 0 / 4 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F14 — FEAT-062 — Cycle d’exploitation](../source/mess/f14.md) | 0 / 2 | 0 % |
| EPIC-013 — Installation et exploitation MESS | [F15 — FEAT-063 — Sauvegarde et réversibilité](../source/mess/f15.md) | 0 / 3 | 0 % |
| EPIC-014 — Documentation, transfert et recette | [F16 — FEAT-064 — Documentation et transfert](../source/mess/f16.md) | 0 / 3 | 0 % |
| EPIC-014 — Documentation, transfert et recette | [F17 — FEAT-065 — Préparation des recettes](../source/mess/f17.md) | 0 / 3 | 0 % |
| EPIC-014 — Documentation, transfert et recette | [F18 — FEAT-066 — Recette d’installation hors ligne](../source/mess/f18.md) | 0 / 2 | 0 % |
| EPIC-014 — Documentation, transfert et recette | [F19 — FEAT-067 — Recette fonctionnelle et UX](../source/mess/f19.md) | 0 / 3 | 0 % |
| EPIC-014 — Documentation, transfert et recette | [F20 — FEAT-068 — Recette technique et reprise après incident](../source/mess/f20.md) | 0 / 3 | 0 % |

## E01 — EPIC-011 — Sécurité et robustesse

| Repère | PBI et source | Taille | Statut / date | Prérequis PBI |
| --- | --- | --- | --- | --- |
| 01.01 | [MEP-036 — Inventorier les paramètres sensibles et les valeurs par défaut](../source/mess/f01.md) | XS | Réalisé — 2026-10-14 | aucune |
| 01.02 | [MEP-009 — Sécuriser les secrets et vérifier la configuration au démarrage](../source/mess/f01.md) | S | Réalisé — 2026-10-15 | MEP-036, MEP-002 |
| 01.03 | [MEP-011 — Contrôler l’isolation des accès entre organisations](../source/mess/f01.md) | S | Réalisé — 2026-10-17 | AUTH-001, ORG-005, ORG-006, COACH-001 |
| 01.04 | [MEP-037 — Renforcer les permissions selon les rôles](../source/mess/f01.md) | S | Réalisé — 2026-10-18 | MEP-008, USER-004 |
| 01.05 | [MEP-038 — Sécuriser les accès indirects et les exports](../source/mess/f01.md) | S | Réalisé — 2026-10-18 | MEP-011, MEP-037 |
| 02.01 | [MEP-039 — Définir les paramètres de concurrence SQLite](../source/mess/f02.md) | XS | Réalisé — 2026-10-15 | MEP-003 |
| 02.02 | [MEP-010 — Gérer les verrous et les transactions concurrentes](../source/mess/f02.md) | S | Réalisé — 2026-10-16 | MEP-039, MEP-003 |
| 02.03 | [MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md) | S | Réalisé — 2026-10-18 | MEP-010, EVAL-003, USER-004, AUTH-002 |
| 03.02 | [MEP-042 — Configurer les durées de conservation des journaux](../source/mess/f03.md) | XS | Ouvert — N/A | JOURNAL-001, JOURNAL-002 |
| 03.03 | [MEP-020 — Automatiser la purge des journaux](../source/mess/f03.md) | S | Ouvert — N/A | MEP-042 |
| 04.01 | [MEP-012 — Vérifier les protections de branche et les contrôles CI](../source/mess/f04.md) | XS | Ouvert — N/A | aucune |
| 04.02 | [MEP-043 — Mettre en place les protections manquantes](../source/mess/f04.md) | S | Ouvert — N/A | MEP-012 |

## E02 — EPIC-012 — Expérience utilisateur

| Repère | PBI et source | Taille | Statut / date | Prérequis PBI |
| --- | --- | --- | --- | --- |
| 05.01 | [MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md) | XS | Ouvert — N/A | PASS-001, EVAL-004, MEP-007 |
| 05.02 | [MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md) | S | Ouvert — N/A | PASS-001, EVAL-004, MEP-005, MEP-007 |
| 05.03 | [MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md) | XS | Ouvert — N/A | PASS-001, MEP-007 |
| 06.01 | [MEP-014 — Améliorer la hiérarchie visuelle des résultats](../source/mess/f06.md) | S | Ouvert — N/A | RESULT-001, RESULT-002 |
| 06.02 | [MEP-046 — Clarifier les scores et les indicateurs](../source/mess/f06.md) | XS | Ouvert — N/A | RESULT-001, RESULT-002 |
| 06.03 | [MEP-015 — Améliorer la présentation des graphiques radar](../source/mess/f06.md) | S | Ouvert — N/A | RESULT-001 |
| 06.04 | [MEP-047 — Améliorer les comparaisons entre équipes et évaluations](../source/mess/f06.md) | S | Ouvert — N/A | RESULT-001, RESULT-002 |
| 07.01 | [MEP-016 — Harmoniser le vocabulaire du tableau de bord](../source/mess/f07.md) | XS | Ouvert — N/A | STEER-001, DASH-001 |
| 07.02 | [MEP-048 — Clarifier les indicateurs et leur interprétation](../source/mess/f07.md) | S | Ouvert — N/A | STEER-001, DASH-001 |
| 08.01 | [MEP-017 — Adapter les tableaux et contenus aux petits écrans](../source/mess/f08.md) | S | Ouvert — N/A | PASS-001, RESULT-001, DASH-001 |
| 08.02 | [MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md) | S | Ouvert — N/A | PASS-001, MEP-005 |
| 08.03 | [MEP-018 — Améliorer les états de chargement](../source/mess/f08.md) | XS | Ouvert — N/A | AUTH-001, PASS-001, RESULT-001 |
| 08.04 | [MEP-050 — Améliorer les états vides](../source/mess/f08.md) | XS | Ouvert — N/A | AUTH-001, RESULT-001 |
| 08.05 | [MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md) | S | Ouvert — N/A | PASS-001, MEP-004 |
| 09.01 | [MEP-019 — Corriger les contrastes et la lisibilité du thème clair](../source/mess/f09.md) | S | Ouvert — N/A | DASH-001, MEP-067 |
| 09.02 | [MEP-052 — Harmoniser le thème sombre](../source/mess/f09.md) | XS | Ouvert — N/A | DASH-001 |
| 09.03 | [MEP-053 — Harmoniser la typographie et la hiérarchie visuelle](../source/mess/f09.md) | S | Ouvert — N/A | DASH-001, MEP-067 |

## E03 — EPIC-013 — Installation et exploitation MESS

| Repère | PBI et source | Taille | Statut / date | Prérequis PBI |
| --- | --- | --- | --- | --- |
| 10.01 | [MEP-054 — Définir le contrat de configuration unique](../source/mess/f10.md) | S | Ouvert — N/A | MEP-036, MEP-055 |
| 10.02 | [MEP-021 — Charger et valider la configuration unique](../source/mess/f10.md) | S | Ouvert — N/A | MEP-054, MEP-009 |
| 11.01 | [MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) | XS | Ouvert — N/A | aucune |
| 11.02 | [MEP-022 — Définir les opérations d’exploitation](../source/mess/f11.md) | S | Ouvert — N/A | MEP-055, MEP-054, MEP-042 |
| 11.03 | [MEP-023 — Actualiser le README et l’architecture](../source/mess/f11.md) | XS | Ouvert — N/A | MEP-021, MEP-022 |
| 11.04 | [MEP-056 — Actualiser le backlog](../source/mess/f11.md) | XS | Ouvert — N/A | MEP-021, MEP-022 |
| 12.01 | [MEP-057 — Inventorier les dépendances nécessaires à la distribution](../source/mess/f12.md) | S | Ouvert — N/A | MEP-055, MEP-054, MEP-006 |
| 12.02 | [MEP-058 — Préparer le frontend compilé pour la distribution](../source/mess/f12.md) | S | Ouvert — N/A | MEP-057 |
| 12.03 | [MEP-059 — Préparer les dépendances Python hors ligne](../source/mess/f12.md) | S | Ouvert — N/A | MEP-057 |
| 12.04 | [MEP-024 — Assembler le package autonome](../source/mess/f12.md) | S | Ouvert — N/A | MEP-058, MEP-059, MEP-021, MEP-022 |
| 13.01 | [MEP-060 — Préparer les répertoires et les paramètres d’installation](../source/mess/f13.md) | S | Ouvert — N/A | MEP-024, MEP-021 |
| 13.02 | [MEP-061 — Installer les composants et dépendances](../source/mess/f13.md) | S | Ouvert — N/A | MEP-060 |
| 13.03 | [MEP-062 — Initialiser SQLite et les données nécessaires](../source/mess/f13.md) | S | Ouvert — N/A | MEP-061 |
| 13.04 | [MEP-025 — Vérifier l’installation et diagnostiquer les échecs](../source/mess/f13.md) | S | Ouvert — N/A | MEP-062 |
| 14.01 | [MEP-063 — Automatiser le démarrage et l’arrêt de l’application](../source/mess/f14.md) | S | Ouvert — N/A | MEP-025, MEP-004 |
| 14.02 | [MEP-026 — Automatiser la mise à jour de l’application](../source/mess/f14.md) | S | Ouvert — N/A | MEP-063, MEP-064 |
| 15.01 | [MEP-064 — Réaliser une sauvegarde cohérente de SQLite](../source/mess/f15.md) | S | Ouvert — N/A | MEP-025, MEP-022 |
| 15.02 | [MEP-027 — Restaurer les données SQLite](../source/mess/f15.md) | S | Ouvert — N/A | MEP-064, MEP-063 |
| 15.03 | [MEP-065 — Revenir à la version précédente après une mise à jour](../source/mess/f15.md) | S | Ouvert — N/A | MEP-026, MEP-027 |

## E04 — EPIC-014 — Documentation, transfert et recette

| Repère | PBI et source | Taille | Statut / date | Prérequis PBI |
| --- | --- | --- | --- | --- |
| 16.01 | [MEP-028 — Rédiger le guide d’installation](../source/mess/f16.md) | XS | Ouvert — N/A | MEP-025, MEP-023 |
| 16.02 | [MEP-066 — Rédiger le guide d’exploitation](../source/mess/f16.md) | XS | Ouvert — N/A | MEP-020, MEP-026, MEP-065, MEP-023 |
| 16.03 | [MEP-029 — Documenter le transfert, le fork et la licence Apache 2.0](../source/mess/f16.md) | XS | Ouvert — N/A | MEP-006, MEP-024 |
| 17.01 | [MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md) | S | Ouvert — N/A | PASS-001, EVAL-004, RESULT-001, STEER-001 |
| 17.02 | [MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) | XS | Ouvert — N/A | MEP-005, MEP-007, DASH-001, RESULT-001 |
| 17.03 | [MEP-031 — Définir les scénarios de recette technique](../source/mess/f17.md) | S | Ouvert — N/A | MEP-022, MEP-039 |
| 18.01 | [MEP-032 — Installer Assess Teams sur un environnement vierge](../source/mess/f18.md) | S | Ouvert — N/A | MEP-025, MEP-028, MEP-031 |
| 18.02 | [MEP-068 — Vérifier le fonctionnement sans connexion Internet](../source/mess/f18.md) | S | Ouvert — N/A | MEP-032, MEP-063, MEP-030 |
| 19.01 | [MEP-033 — Vérifier les parcours d’administration](../source/mess/f19.md) | S | Ouvert — N/A | MEP-068, MEP-030, MEP-067, MEP-011, MEP-037 |
| 19.02 | [MEP-069 — Vérifier les parcours d’évaluation et de notation](../source/mess/f19.md) | S | Ouvert — N/A | MEP-068, MEP-030, MEP-067, MEP-044, MEP-013, MEP-045, MEP-017, MEP-049, MEP-018, MEP-050, MEP-051, MEP-019, MEP-052, MEP-053 |
| 19.03 | [MEP-070 — Vérifier les parcours de consultation des résultats](../source/mess/f19.md) | S | Ouvert — N/A | MEP-068, MEP-030, MEP-067, MEP-014, MEP-046, MEP-015, MEP-047, MEP-016, MEP-048, MEP-017, MEP-019, MEP-052, MEP-053 |
| 20.01 | [MEP-034 — Vérifier la sécurité et l’isolation des organisations](../source/mess/f20.md) | S | Ouvert — N/A | MEP-068, MEP-031, MEP-009, MEP-011, MEP-037, MEP-038, MEP-020, MEP-043 |
| 20.02 | [MEP-071 — Vérifier la concurrence et la stabilité SQLite](../source/mess/f20.md) | S | Ouvert — N/A | MEP-068, MEP-031, MEP-010, MEP-040, MEP-063 |
| 20.03 | [MEP-072 — Exercer la sauvegarde, la restauration et le rollback](../source/mess/f20.md) | S | Ouvert — N/A | MEP-068, MEP-031, MEP-064, MEP-027, MEP-065 |

## Historique et jalon

[Job 1 — huit réalisations MEP-001 à MEP-008, avec dates et preuves](mess-historique.md) : aucune relance.
[JOURNAL-001/002](pbis.md) restent réalisés dans leurs Features fonctionnelles avec leurs dates initiales.
03.01 est un acquis référencé, hors des PBI actifs ; [MEP-041 — alias consolidé](mess-doublons-historique.md) garde sa trace historique.
Les [acquis CI](../planning/pre-mep-rapprochements.md#acquis-de-validation-et-ci--aucun-pbi-de-développement-à-recréer)
sont réutilisés par F04 ; présence de CI ne prouve pas l’activation des protections distantes.
[MEP-035 — Décision GO/NO-GO](mess-jalon.md) : Ouvert, N/A, décision non rendue, hors scoring PBI.
Les [PBI prêts selon les prérequis connus](../planning/pre-mep.md#pbi-prêts-au-regard-des-dépendances-connues-du-registre)
se consultent sans l’ancien ordre de Jobs. Les arbitrages Organisation restent dans leur source canonique.
