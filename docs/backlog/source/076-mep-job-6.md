# FEAT-047 — Documentation et transfert

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 6.

- **Intention / valeur :** Rendre l’exploitation autonome, la reprise Apache possible et les recettes exécutables.
- **Acteurs :** exploitant MESS, repreneur et responsable de recette.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-046 achevée, avec tous les travaux du job 5 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-028 — Documentation d’installation et d’exploitation

- **Identifiant / Feature parente / job :** MEP-028 / FEAT-047 — Documentation et transfert / 6.1.
- **User story :** en tant que exploitant MESS, repreneur et responsable de recette, je veux rédiger le guide opérateur aligné sur le package et ses commandes réelles.
- **Intention / description :** Rédiger le guide opérateur aligné sur le package et ses commandes réelles.
- **Acquis et frontière :** Documentation de développement existante ; contrat et scripts à livrer dans les jobs précédents.
- **Critères d’acceptation :** Prérequis, configuration, installation hors ligne, TLS/SMTP, services/workers, purge, mises à jour, sauvegarde, restauration et diagnostic décrits avec vérifications et responsabilités.
- **Vrais cas de refus :** Commande non reproductible, téléchargement cible ou secret réel dans un exemple refuse le guide.
- **Dépendances de livraison / priorité :** FEAT-046 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre l’exploitation autonome, la reprise Apache possible et les recettes exécutables.

## MEP-029 — Documentation de transfert et fork Apache 2.0

- **Identifiant / Feature parente / job :** MEP-029 / FEAT-047 — Documentation et transfert / 6.2.
- **User story :** en tant que exploitant MESS, repreneur et responsable de recette, je veux permettre à un repreneur de forker, modifier, construire et redistribuer le produit.
- **Intention / description :** Permettre à un repreneur de forker, modifier, construire et redistribuer le produit.
- **Acquis et frontière :** Architecture et règles de contribution existantes ; transfert spécifique non livré.
- **Critères d’acceptation :** Sources, versions/dépendances, build sur poste de préparation, licences/notices, extension et règles existantes documentés ; retrait des secrets et séparation build/cible ; exemple de fork reproductible.
- **Vrais cas de refus :** Source/asset sans droits établis, notice supprimée ou fork ne pouvant construire empêche le transfert.
- **Dépendances de livraison / priorité :** FEAT-046 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre l’exploitation autonome, la reprise Apache possible et les recettes exécutables.

## MEP-030 — Préparation de la recette fonctionnelle

- **Identifiant / Feature parente / job :** MEP-030 / FEAT-047 — Documentation et transfert / 6.3.
- **User story :** en tant que exploitant MESS, repreneur et responsable de recette, je veux préparer un cahier de recette fonctionnelle et UX basé sur le périmètre réellement livré.
- **Intention / description :** Préparer un cahier de recette fonctionnelle et UX basé sur le périmètre réellement livré.
- **Acquis et frontière :** PV-001, parcours E2E et stratégie de tests existants à réutiliser.
- **Critères d’acceptation :** Scénarios par rôle/parcours, données fictives, résultats attendus, refus, notation sans implicite, accessibilité/tactile/thèmes et distinction accompagnement/surveillance ; liens PBIs/preuves et anomalies suivies.
- **Vrais cas de refus :** Recette déclarée concluante sans preuve, données réelles sensibles ou capacité non livrée supposée présente refusées.
- **Dépendances de livraison / priorité :** PASS-001, EVAL-004, RESULT-001, STEER-001, FEAT-046 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre l’exploitation autonome, la reprise Apache possible et les recettes exécutables.

## MEP-031 — Préparation de la recette technique

- **Identifiant / Feature parente / job :** MEP-031 / FEAT-047 — Documentation et transfert / 6.4.
- **User story :** en tant que exploitant MESS, repreneur et responsable de recette, je veux préparer les scénarios techniques applicables au contrat cible.
- **Intention / description :** Préparer les scénarios techniques applicables au contrat cible.
- **Acquis et frontière :** Quality gates, CI et stratégie existants à réutiliser ; ils ne remplacent pas la qualification MESS.
- **Critères d’acceptation :** Installation isolée du réseau, configuration/secrets, TLS/CSRF/permissions, contention SQLite, SMTP indisponible, supervision, purge, sauvegarde/restauration/rollback ; preuves, résultats attendus et critères du contrat explicités.
- **Vrais cas de refus :** Scénario sans attente mesurable ou gate en échec présenté comme simple avertissement refuse la préparation.
- **Dépendances de livraison / priorité :** FEAT-046 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre l’exploitation autonome, la reprise Apache possible et les recettes exécutables.
