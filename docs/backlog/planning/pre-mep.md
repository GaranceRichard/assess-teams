# Ordonnancement MESS — dépendances réelles et livraison progressive

La [source active](../source/07-pre-mep.md) remplace la succession des Jobs 1 à 7.
Les [sections canoniques](../tracking/pbis.md#préparation-mess--registre-courant) portent les statuts et dates.
Les dépendances des fiches sont orientées du dépendant vers son prérequis ; les repères ci-dessous
correspondent aux identifiants de la [vue détaillée](../tracking/pre-mep-view.md).

## Règle de préparation et de livraison

Un PBI Ouvert est prêt lorsque tous ses prérequis de livraison sont Réalisés et qu’aucune décision,
preuve, autorisation d’accès ou donnée d’environnement indispensable ne manque. Ouvert n’est pas Bloqué
uniquement parce qu’un prérequis reste à réaliser. Un blocage réellement constaté est inscrit au registre.
Une préparation indépendante (cahier, analyse, conception) peut commencer avant disponibilité d’un livrable ;
la clôture attend les entrées concrètes listées dans la source. Aucun prérequis ne découle de l’ancien Job.

Une Feature est livrée lorsque tous ses PBI sont Réalisés selon la DoD, avec preuves et intégration.
Cette livraison est calculée, sans statut autonome, et n’attend pas une Feature sans dépendance.
Chaque PBI est intégré au fil de l’eau par `npm run publish`, depuis sa branche/worktree dédiés,
après resynchronisation et gates complets. La refonte ne modifie ni AGENTS.md ni les gates.

## PBI prêts au regard des dépendances connues du registre

Au 2026-10-18, 22 PBI sont prêts selon les dépendances enregistrées ; tous les prérequis cités ci-dessous sont Réalisés ; aucun blocage supplémentaire
n’est constaté. La disponibilité réelle des accès GitHub/MESS est vérifiée au lancement et tracée si manquante.

- [01.05 — MEP-038 — Sécuriser les accès indirects et les exports](../source/mess/f01.md) : prérequis MEP-011, MEP-037 réalisés.
- [02.03 — MEP-040 — Gérer les conflits sur les opérations critiques](../source/mess/f02.md) : prérequis MEP-010, EVAL-003, USER-004 et AUTH-002 réalisés ; conflits métier restant à éprouver.
- [03.02 — MEP-042 — Configurer les durées de conservation des journaux](../source/mess/f03.md) : prérequis JOURNAL-001, JOURNAL-002.
- [04.01 — MEP-012 — Vérifier les protections de branche et les contrôles CI](../source/mess/f04.md) : prérequis aucune.
- [05.01 — MEP-044 — Clarifier l’affichage des notes et de leur échelle](../source/mess/f05.md) : prérequis PASS-001, EVAL-004, MEP-007.
- [05.02 — MEP-013 — Améliorer l’ergonomie du curseur et de la sélection](../source/mess/f05.md) : prérequis PASS-001, EVAL-004, MEP-005, MEP-007.
- [05.03 — MEP-045 — Confirmer visuellement l’enregistrement de la notation](../source/mess/f05.md) : prérequis PASS-001, MEP-007.
- [06.01 — MEP-014 — Améliorer la hiérarchie visuelle des résultats](../source/mess/f06.md) : prérequis RESULT-001, RESULT-002.
- [06.02 — MEP-046 — Clarifier les scores et les indicateurs](../source/mess/f06.md) : prérequis RESULT-001, RESULT-002.
- [06.03 — MEP-015 — Améliorer la présentation des graphiques radar](../source/mess/f06.md) : prérequis RESULT-001.
- [06.04 — MEP-047 — Améliorer les comparaisons entre équipes et évaluations](../source/mess/f06.md) : prérequis RESULT-001, RESULT-002.
- [07.01 — MEP-016 — Harmoniser le vocabulaire du tableau de bord](../source/mess/f07.md) : prérequis STEER-001, DASH-001.
- [07.02 — MEP-048 — Clarifier les indicateurs et leur interprétation](../source/mess/f07.md) : prérequis STEER-001, DASH-001.
- [08.01 — MEP-017 — Adapter les tableaux et contenus aux petits écrans](../source/mess/f08.md) : prérequis PASS-001, RESULT-001, DASH-001.
- [08.02 — MEP-049 — Améliorer la navigation mobile et les interactions tactiles](../source/mess/f08.md) : prérequis PASS-001, MEP-005.
- [08.03 — MEP-018 — Améliorer les états de chargement](../source/mess/f08.md) : prérequis AUTH-001, PASS-001, RESULT-001.
- [08.04 — MEP-050 — Améliorer les états vides](../source/mess/f08.md) : prérequis AUTH-001, RESULT-001.
- [08.05 — MEP-051 — Améliorer la présentation des erreurs](../source/mess/f08.md) : prérequis PASS-001, MEP-004.
- [09.02 — MEP-052 — Harmoniser le thème sombre](../source/mess/f09.md) : prérequis DASH-001.
- [11.01 — MEP-055 — Définir les prérequis d’installation](../source/mess/f11.md) : prérequis aucune.
- [17.01 — MEP-030 — Définir les scénarios de recette fonctionnelle](../source/mess/f17.md) : prérequis PASS-001, EVAL-004, RESULT-001, STEER-001.
- [17.02 — MEP-067 — Définir les scénarios de recette UX](../source/mess/f17.md) : prérequis MEP-005, MEP-007, DASH-001, RESULT-001.

03.01 est un acquis de JOURNAL-001/002, hors PBI MESS ; MEP-041 est archivé, sans réouverture. Le responsable peut préparer les autres PBI selon leurs
prérequis précis ; une Feature partiellement prête ne réclame pas la livraison complète d’un ancien Job.

## Chaînes et entrées de livraison par capacité

| Capacité | Dépendances de livraison et liberté de progression |
| --- | --- |
| F01 — Sécurité de production | 01.01 → 01.02 ; isolation 01.03 et rôles 01.04 indépendants → 01.05 |
| F02 — SQLite en exploitation | MEP-003 acquis → 02.01 → 02.02 → 02.03 ; pas de changement de moteur |
| F03 — Journalisation et conservation | JOURNAL-001/002 (03.01 acquis) → 03.02 → 03.03 ; aucune reprise du collecteur |
| F04 — Gouvernance Git et CI | 04.01 → 04.02 ; aucun écart peut être clos par preuve, sans changement artificiel |
| F05 à F09 — UX | Socle livré ; 09.01/09.03 attendent les mesures du cahier 17.02 ; aucune attente de F01/F02 entière |
| F10 — Configuration unique | 01.01 et 11.01 → 10.01 ; 10.01 et 01.02 → 10.02 |
| F11 — Contrat MESS | 11.01, 10.01, 03.02 → 11.02 ; 10.02 et 11.02 → 11.03/11.04 |
| F12 — Distribution autonome | 11.01/10.01/licence → 12.01 ; 12.02 et 12.03 indépendants → 12.04 avec configuration et contrat |
| F13 — Installation automatisée | Package/configuration → 13.01 → 13.02 → 13.03 → 13.04 |
| F14 — Cycle d’exploitation | Installation → 14.01 ; 14.01 et sauvegarde 15.01 → 14.02 |
| F15 — Sauvegarde et réversibilité | Installation/contrat → 15.01 ; sauvegarde et démarrage → 15.02 ; mise à jour et restauration → 15.03 |
| F16 — Documentation et transfert | Guide installation après 13.04/11.03 ; exploitation après purge/upgrade/rollback ; transfert après package/licence |
| F17 — Préparation des recettes | 17.01/17.02 préparables sur le socle ; 17.03 après contrat et paramètres SQLite ; aucun besoin d’attendre tout F16 |
| F18 — Installation hors ligne | Installation vérifiée, guide et cahier technique → 18.01 ; services et cahier fonctionnel → 18.02 |
| F19 — Recette fonctionnelle et UX | 18.02 et cahiers ; écarts UX/sécurité consommés par parcours selon les dépendances des fiches |
| F20 — Recette technique et reprise | 18.02, cahier technique et capacités éprouvées ; instance/snapshot isolé pour les incidents |

Ces flèches signifient prérequis → consommateur. Les fiches individuelles précisent la liste exhaustive
des identifiants ; le tableau ne crée aucune dépendance supplémentaire de Feature entière.
Les recettes F19/F20 portent la même empreinte de candidat que F18. Un correctif modifiant le candidat
impose requalification des preuves affectées ; la préparation de scénarios peut progresser indépendamment.

## GO/NO-GO

[MEP-035 — Décision GO/NO-GO](../tracking/mess-jalon.md) est un jalon final explicite.
GO exige les capacités MESS satisfaites et les preuves sécurité, installation, exploitation et recette du
candidat exact, les gates conformes et aucune anomalie bloquante. Les arbitrages pertinents sont résolus
ou le périmètre explicitement limité. NO-GO peut être enregistré avant achèvement sur blocage démontré.
Aucun pourcentage, Job historique ni simple succès de CI n’autorise la mise en production.

[Audit et matrice de couverture](mess-audit.md) : 62 PBI actifs ; les 63 points initiaux restent couverts.
