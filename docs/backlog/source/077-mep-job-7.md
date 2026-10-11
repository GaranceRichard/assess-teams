# FEAT-048 — Recette préproduction

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 7.

- **Intention / valeur :** Éprouver la livraison en préproduction MESS et établir les faits nécessaires au GO/NO-GO.
- **Acteurs :** exploitant MESS et responsables de recette et de MEP.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-047 achevée, avec tous les travaux du job 6 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-032 — Installation hors ligne sur environnement vierge

- **Identifiant / Feature parente / job :** MEP-032 / FEAT-048 — Recette préproduction / 7.1.
- **User story :** en tant que exploitant MESS et responsables de recette et de MEP, je veux exécuter l’installation du package exact sur une cible vierge conforme au contrat.
- **Intention / description :** Exécuter l’installation du package exact sur une cible vierge conforme au contrat.
- **Acquis et frontière :** Aucune qualification MESS vierge enregistrée dans le backlog.
- **Critères d’acceptation :** Installation sans réseau externe, Docker ou Node.js ; artefact/empreintes identifiés ; configuration unique, migrations, statiques, comptes et health check validés ; PV horodaté.
- **Vrais cas de refus :** Téléchargement nécessaire, intervention non documentée ou prérequis absent ouvre une anomalie bloquante.
- **Dépendances de livraison / priorité :** FEAT-047 (vague précédente entièrement achevée) / P1.
- **Valeur :** Éprouver la livraison en préproduction MESS et établir les faits nécessaires au GO/NO-GO.

## MEP-033 — Recette fonctionnelle et UX

- **Identifiant / Feature parente / job :** MEP-033 / FEAT-048 — Recette préproduction / 7.2.
- **User story :** en tant que exploitant MESS et responsables de recette et de MEP, je veux exécuter le cahier fonctionnel/UX sur le candidat identifié.
- **Intention / description :** Exécuter le cahier fonctionnel/UX sur le candidat identifié.
- **Acquis et frontière :** Socle métier et correctifs UI livrés à requalifier dans l’environnement préproduction.
- **Critères d’acceptation :** Parcours et vrais refus par rôle exécutés ; preuves clavier/tactile/thèmes et choix explicite des notes ; données/résultats et scopes cohérents ; anomalies reliées aux PBIs et retestées.
- **Vrais cas de refus :** Perte de donnée, accès indu, note implicite ou scénario critique non exécuté empêche une recette concluante.
- **Dépendances de livraison / priorité :** FEAT-047 (vague précédente entièrement achevée), MEP-032 / P1.
- **Valeur :** Éprouver la livraison en préproduction MESS et établir les faits nécessaires au GO/NO-GO.

## MEP-034 — Recette technique et reprise après incident

- **Identifiant / Feature parente / job :** MEP-034 / FEAT-048 — Recette préproduction / 7.3.
- **User story :** en tant que exploitant MESS et responsables de recette et de MEP, je veux exécuter la recette technique et les incidents sur le candidat identifié.
- **Intention / description :** Exécuter la recette technique et les incidents sur le candidat identifié.
- **Acquis et frontière :** Preuves locales de qualité acquises ; aucune recette cible globale enregistrée.
- **Critères d’acceptation :** Sécurité/configuration, charge/locks SQLite, panne SMTP, redémarrage, journaux/purge et sauvegarde/restauration/rollback démontrés ; données et provenance contrôlées ; résultats confrontés au contrat de reprise.
- **Vrais cas de refus :** Perte/corruption, restauration non démontrée, secret divulgué ou limite contractuelle dépassée bloque la conclusion.
- **Dépendances de livraison / priorité :** FEAT-047 (vague précédente entièrement achevée), MEP-032 / P1.
- **Valeur :** Éprouver la livraison en préproduction MESS et établir les faits nécessaires au GO/NO-GO.

## MEP-035 — Décision GO/NO-GO

- **Identifiant / Feature parente / rattachement :** MEP-035 / FEAT-048 — Recette préproduction / jalon après job 7, sans huitième job.
- **User story :** en tant que responsable de MEP désigné avec le MESS, je veux disposer des preuves et blocages du candidat afin de décider sa mise en production.
- **Intention / description :** consigner une décision datée sur la version et le package exacts, avec responsables, preuves de recette, points ouverts et motifs.
- **Critères d’acceptation :** décision GO ou NO-GO motivée, datée et attribuée, preuves et points ouverts reliés ; pour GO, jobs 1–7 satisfaits, recettes MEP-032/033/034 et CI conformes, arbitrages pertinents résolus ou périmètre explicitement limité, aucune anomalie bloquante sécurité/intégrité/exploitation/UX.
- **Vrais cas de refus :** candidat non identifié, preuve manquante, incident non résolu, recette critique non passée ou gate en échec imposent NO-GO ; une dérogation ne contourne jamais les gates du produit.
- **Dépendances pour GO / priorité :** MEP-032, MEP-033, MEP-034, toutes les vagues satisfaites / P1 ; NO-GO peut être consigné sur preuve de blocage avant leur achèvement.
- **Valeur :** décision traçable fondée sur l’état réel de préparation.
- **Suivi :** Réalisé signifie décision enregistrée, y compris NO-GO ; seul un GO autorise la MEP. Après NO-GO, anomalies/PBIs restent ouverts et une nouvelle décision est historisée après correction.
