# FEAT-045 — Exploitation et contrat de déploiement

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 4.

- **Intention / valeur :** Fixer le contrat MESS et les paramètres nécessaires à un déploiement exploitable.
- **Acteurs :** exploitant MESS et responsable produit.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-044 achevée, avec tous les travaux du job 3 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-020 — Conservation et purge des journaux

- **Identifiant / Feature parente / job :** MEP-020 / FEAT-045 — Exploitation et contrat de déploiement / 4.1.
- **User story :** en tant que exploitant MESS et responsable produit, je veux définir puis mettre en œuvre conservation, rotation et purge contrôlée des journaux applicatifs et techniques.
- **Intention / description :** Définir puis mettre en œuvre conservation, rotation et purge contrôlée des journaux applicatifs et techniques.
- **Acquis et frontière :** JOURNAL-001/002 livrent deux journaux distincts ; aucune politique de purge globale prouvée.
- **Critères d’acceptation :** Durées, périmètres, responsabilités et accès explicités ; purge planifiable et traçable ; stockage borné ; distinction Journal/Logs et intégrité des preuves requises conservées.
- **Vrais cas de refus :** Purge avant durée autorisée, divulgation de données sensibles ou effacement des preuves métier requises refusés.
- **Dépendances de livraison / priorité :** JOURNAL-001, JOURNAL-002, FEAT-044 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fixer le contrat MESS et les paramètres nécessaires à un déploiement exploitable.

## MEP-021 — Configuration unique MESS

- **Identifiant / Feature parente / job :** MEP-021 / FEAT-045 — Exploitation et contrat de déploiement / 4.2.
- **User story :** en tant que exploitant MESS et responsable produit, je veux centraliser la configuration d’installation, distincte des paramètres métier FEAT-031.
- **Intention / description :** Centraliser la configuration d’installation, distincte des paramètres métier FEAT-031.
- **Acquis et frontière :** Paramètres répartis entre settings et environnement ; pas de contrat d’installation centralisé livré.
- **Critères d’acceptation :** Une source validée couvre chemins, SQLite, URL/hosts/proxy/TLS, SMTP, secrets ou leurs références, services, sauvegardes et journaux ; API, workers et scripts la consomment sans valeurs divergentes.
- **Vrais cas de refus :** Sources concurrentes, secret exposé ou paramètre obligatoire manquant refusés.
- **Dépendances de livraison / priorité :** FEAT-044 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fixer le contrat MESS et les paramètres nécessaires à un déploiement exploitable.

## MEP-022 — Contrat d’installation et d’exploitation

- **Identifiant / Feature parente / job :** MEP-022 / FEAT-045 — Exploitation et contrat de déploiement / 4.3.
- **User story :** en tant que exploitant MESS et responsable produit, je veux fixer avec le MESS les conditions d’installation et d’exploitation on-premise.
- **Intention / description :** Fixer avec le MESS les conditions d’installation et d’exploitation on-premise.
- **Acquis et frontière :** README décrit le développement ; cible serveur MESS non qualifiée.
- **Critères d’acceptation :** OS/versions supportés, Python, serveur applicatif/proxy, certificats, comptes/droits, chemins persistants, ports, SMTP et ordonnanceurs définis ; SQLite conservé ; aucune dépendance Internet, Docker ou Node.js sur cible ; responsabilités et critères de disponibilité/reprise documentés.
- **Vrais cas de refus :** Environnement hors contrat, prérequis indisponible ou serveur exigeant une chaîne de build frontend empêche la qualification.
- **Dépendances de livraison / priorité :** FEAT-044 (vague précédente entièrement achevée) / P1.
- **Valeur :** Fixer le contrat MESS et les paramètres nécessaires à un déploiement exploitable.

## MEP-023 — Actualisation README, backlog et architecture

- **Identifiant / Feature parente / job :** MEP-023 / FEAT-045 — Exploitation et contrat de déploiement / 4.4.
- **User story :** en tant que exploitant MESS et responsable produit, je veux réconcilier les références avec le contrat MEP validé, lors de sa future réalisation.
- **Intention / description :** Réconcilier les références avec le contrat MEP validé, lors de sa future réalisation.
- **Acquis et frontière :** Documentation produit et gouvernance existantes conservées.
- **Critères d’acceptation :** README distingue développement et installation MESS ; architecture documente décisions concrètes sans nouvelle gouvernance ; backlog reflète preuves, statuts et limites réels ; liens cohérents.
- **Vrais cas de refus :** Fonction non livrée annoncée disponible, prérequis cible contradictoire ou historique supprimé refusés.
- **Dépendances de livraison / priorité :** FEAT-044 (vague précédente entièrement achevée), MEP-020, MEP-021, MEP-022 / P1.
- **Valeur :** Fixer le contrat MESS et les paramètres nécessaires à un déploiement exploitable.
