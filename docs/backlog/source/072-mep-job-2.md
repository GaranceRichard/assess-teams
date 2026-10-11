# FEAT-043 — Robustesse

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 2.

- **Intention / valeur :** Fiabiliser le fonctionnement concurrent et les frontières de sécurité du socle de production.
- **Acteurs :** contributeur, administrateur et exploitant MESS.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-042 achevée, avec tous les travaux du job 1 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## 2.4 — Journalisation HTTP et métier : acquis conservé

Ce travail référence [JOURNAL-001 — Consulter les activités métier réussies](06-journaux.md#journal-001--consulter-les-activités-métier-réussies) et [JOURNAL-002 — Consulter les logs applicatifs](06-journaux.md#journal-002--consulter-les-logs-applicatifs).
Les deux PBIs restent réalisés dans FEAT-039/040, avec leurs dates et extension HTTP du 2026-10-05. Aucun nouveau PBI ni déplacement de rattachement.
Capture HTTP, activités réussies, confidentialité, filtres et scopes acquis ; conservation/purge en 4.1 et qualification cible en 7.3 restent distinctes.

## MEP-009 — Secrets et paramètres de production

- **Identifiant / Feature parente / job :** MEP-009 / FEAT-043 — Robustesse / 2.1.
- **User story :** en tant que contributeur, administrateur et exploitant MESS, je veux valider les réglages de production et l’approvisionnement des secrets avant toute installation.
- **Intention / description :** Valider les réglages de production et l’approvisionnement des secrets avant toute installation.
- **Acquis et frontière :** settings_production existe ; clé et URL explicites, SMTP configurable, plusieurs valeurs par défaut restantes.
- **Critères d’acceptation :** DEBUG désactivé ; réglages obligatoires validés ; secrets externes au code/package, accès restreint et rotation documentée ; aucun credential de développement chargé.
- **Vrais cas de refus :** Secret manquant, valeur de développement ou combinaison de paramètres invalide empêche un démarrage trompeur.
- **Dépendances de livraison / priorité :** FEAT-042 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fiabiliser le fonctionnement concurrent et les frontières de sécurité du socle de production.

## MEP-010 — Concurrence et verrouillage SQLite

- **Identifiant / Feature parente / job :** MEP-010 / FEAT-043 — Robustesse / 2.2.
- **User story :** en tant que contributeur, administrateur et exploitant MESS, je veux qualifier et renforcer la contention réelle du déploiement SQLite conservé en production.
- **Intention / description :** Qualifier et renforcer la contention réelle du déploiement SQLite conservé en production.
- **Acquis et frontière :** EVAL-003, USER-004 et AUTH-002 possèdent des protections et preuves de concurrence ciblées.
- **Critères d’acceptation :** Écritures simultanées API/workers, timeout, stratégie de transactions et reprise bornée qualifiés sur fichier SQLite ; limites de charge mesurées ; aucune confiance implicite en select_for_update sur SQLite.
- **Vrais cas de refus :** Verrou occupé, conflit concurrent ou épuisement des reprises ne provoque ni perte, ni double succès, ni blocage sans diagnostic.
- **Dépendances de livraison / priorité :** EVAL-003, USER-004, AUTH-002, FEAT-042 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fiabiliser le fonctionnement concurrent et les frontières de sécurité du socle de production.

## MEP-011 — Isolation inter-organisations et rôles

- **Identifiant / Feature parente / job :** MEP-011 / FEAT-043 — Robustesse / 2.3.
- **User story :** en tant que contributeur, administrateur et exploitant MESS, je veux compléter les protections manquantes sans redéfinir les rôles ou les arbitrages métier.
- **Intention / description :** Compléter les protections manquantes sans redéfinir les rôles ou les arbitrages métier.
- **Acquis et frontière :** Scopes, matrices et refus déjà livrés ; USER-002/003, ORG-002/004 et TEAM-002/003 restent ouverts dans leurs périmètres.
- **Critères d’acceptation :** Matrice canonique vérifiée sur lectures, mutations, IDs forgés, changements de rattachement et données historiques ; refus sans effet ; accès Superadmin intentionnels ; écarts métier renvoyés aux PBIs existants.
- **Vrais cas de refus :** Accès hors organisation ou élévation de rôle refusé sans divulgation ; aucun partage ou droit implicite.
- **Dépendances de livraison / priorité :** AUTH-001, ORG-005, ORG-006, COACH-001, FEAT-042 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fiabiliser le fonctionnement concurrent et les frontières de sécurité du socle de production.

## MEP-012 — Protection GitHub et CI

- **Identifiant / Feature parente / job :** MEP-012 / FEAT-043 — Robustesse / 2.5.
- **User story :** en tant que contributeur, administrateur et exploitant MESS, je veux garantir l’intégration protégée de main avec le circuit de publication existant.
- **Intention / description :** Garantir l’intégration protégée de main avec le circuit de publication existant.
- **Acquis et frontière :** Hooks, workflow parallèle et Full quality gate existent ; réglages distants de protection non prouvés par le dépôt.
- **Critères d’acceptation :** Protection distante et check Full quality gate vérifiés ; force-push/suppression interdits et contournements maîtrisés ; push branche dédiée vers main compatible avec AGENTS.md ; preuve de CI requise conservée.
- **Vrais cas de refus :** Qualité en échec ou tentative d’intégration hors circuit ne permet aucune publication ; aucun gate contourné.
- **Dépendances de livraison / priorité :** FEAT-042 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fiabiliser le fonctionnement concurrent et les frontières de sécurité du socle de production.
