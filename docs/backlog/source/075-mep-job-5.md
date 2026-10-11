# FEAT-046 — Packaging et installation

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 5.

- **Intention / valeur :** Produire et exploiter une livraison autonome hors ligne sur la cible contractuelle MESS.
- **Acteurs :** exploitant MESS.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-045 achevée, avec tous les travaux du job 4 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-024 — Construction du package hors ligne

- **Identifiant / Feature parente / job :** MEP-024 / FEAT-046 — Packaging et installation / 5.1.
- **User story :** en tant que exploitant MESS, je veux construire sur poste de préparation une distribution complète pour la cible validée.
- **Intention / description :** Construire sur poste de préparation une distribution complète pour la cible validée.
- **Acquis et frontière :** Build React et dépendances verrouillées existent ; package MESS absent.
- **Critères d’acceptation :** Frontend précompilé, backend, migrations, dépendances Python compatibles et éléments de service requis inclus ; versions, empreintes, licences/notices et inventaire fournis ; installation sans téléchargement.
- **Vrais cas de refus :** Artefact manquant/altéré, wheel incompatible ou dépendance réseau sur cible refuse la livraison.
- **Dépendances de livraison / priorité :** FEAT-045 (vague précédente entièrement achevée) / P1.
- **Valeur :** Produire et exploiter une livraison autonome hors ligne sur la cible contractuelle MESS.

## MEP-025 — Installation automatisée

- **Identifiant / Feature parente / job :** MEP-025 / FEAT-046 — Packaging et installation / 5.2.
- **User story :** en tant que exploitant MESS, je veux installer le package depuis la configuration centrale sans commandes ad hoc.
- **Intention / description :** Installer le package depuis la configuration centrale sans commandes ad hoc.
- **Acquis et frontière :** Bootstrap actuel prépare les environnements de développement avec npm/pip ; il ne vaut pas installateur cible.
- **Critères d’acceptation :** Prérequis et empreintes contrôlés ; droits/chemins persistants, dépendances locales, migrations, statiques et bootstrap Superadmin préparés ; relance maîtrisée ; health check et erreurs explicites.
- **Vrais cas de refus :** Configuration invalide, permission manquante ou installation partielle ne donne aucun faux succès et ne détruit pas de données.
- **Dépendances de livraison / priorité :** FEAT-045 (vague précédente entièrement achevée), MEP-024 / P1.
- **Valeur :** Produire et exploiter une livraison autonome hors ligne sur la cible contractuelle MESS.

## MEP-026 — Démarrage, arrêt et mise à jour

- **Identifiant / Feature parente / job :** MEP-026 / FEAT-046 — Packaging et installation / 5.3.
- **User story :** en tant que exploitant MESS, je veux fournir le cycle de vie des services API, workers et tâches planifiées.
- **Intention / description :** Fournir le cycle de vie des services API, workers et tâches planifiées.
- **Acquis et frontière :** Commandes de développement et workers documentés ; exploitation MESS à construire.
- **Critères d’acceptation :** Démarrage supervisé, arrêt propre, redémarrage et upgrade versionné ; état observable ; migrations maîtrisées et configuration/persistance conservées ; procédures réutilisables hors ligne.
- **Vrais cas de refus :** Échec de migration, double worker non maîtrisé ou mise à jour incompatible stoppe l’opération avec diagnostic.
- **Dépendances de livraison / priorité :** FEAT-045 (vague précédente entièrement achevée), MEP-025 / P1.
- **Valeur :** Produire et exploiter une livraison autonome hors ligne sur la cible contractuelle MESS.

## MEP-027 — Sauvegarde, restauration et rollback

- **Identifiant / Feature parente / job :** MEP-027 / FEAT-046 — Packaging et installation / 5.4.
- **User story :** en tant que exploitant MESS, je veux protéger les données et revenir à un état exploitable après incident ou upgrade refusé.
- **Intention / description :** Protéger les données et revenir à un état exploitable après incident ou upgrade refusé.
- **Acquis et frontière :** Base SQLite persistante existante ; procédure de reprise cible non prouvée.
- **Critères d’acceptation :** Sauvegarde cohérente SQLite et fichiers/configuration nécessaires ; intégrité vérifiée ; restauration exercée ; couples version applicative/schéma compatibles ; seuils de reprise du contrat démontrés.
- **Vrais cas de refus :** Sauvegarde corrompue, schéma incompatible ou reprise dépassant le contrat ne donne aucun GO de restauration.
- **Dépendances de livraison / priorité :** FEAT-045 (vague précédente entièrement achevée), MEP-025 / P1.
- **Valeur :** Produire et exploiter une livraison autonome hors ligne sur la cible contractuelle MESS.
