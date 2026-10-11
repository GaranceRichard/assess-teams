# FEAT-042 — Fondations

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 1.

- **Intention / valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.
- **Acteurs :** responsable produit, contributeur et administrateur.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** aucune.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-001 — Sécurisation de l’authentification

- **Identifiant / Feature parente / job :** MEP-001 / FEAT-042 — Fondations / 1.1.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux renforcer les accès restants, notamment la connexion, sans recréer la gestion du mot de passe.
- **Intention / description :** Renforcer les accès restants, notamment la connexion, sans recréer la gestion du mot de passe.
- **Acquis et frontière :** AUTH-001, AUTH-002 et AUTH-003 restent réalisés ; sessions, récupération, validateurs et limitation des parcours de mot de passe sont acquis.
- **Critères d’acceptation :** Tentatives de connexion bornées et refus génériques ; sessions renouvelées/inactivées selon les règles existantes ; invitations et récupération conservées ; aucune fuite de credentials.
- **Vrais cas de refus :** Abus, compte inactif, session invalide ou rejeu ne donnent aucun accès.
- **Dépendances de livraison / priorité :** AUTH-001, AUTH-002, AUTH-003 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-002 — HTTPS, proxy, cookies et CSRF

- **Identifiant / Feature parente / job :** MEP-002 / FEAT-042 — Fondations / 1.2.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux rendre cohérente la chaîne navigateur, proxy de confiance et API derrière HTTPS au MESS.
- **Intention / description :** Rendre cohérente la chaîne navigateur, proxy de confiance et API derrière HTTPS au MESS.
- **Acquis et frontière :** Middleware CSRF et protections des mutations présents ; paramètres de production partiels.
- **Critères d’acceptation :** HTTPS imposé ; cookies de session/CSRF sécurisés et politique SameSite explicite ; headers proxy acceptés uniquement du proxy autorisé ; origines, URL publique et protection CSRF cohérentes.
- **Vrais cas de refus :** Origine non autorisée, CSRF absent/invalide ou header proxy forgé ne permettent aucune mutation.
- **Dépendances de livraison / priorité :** AUTH-001 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-003 — Intégrité des transactions SQLite

- **Identifiant / Feature parente / job :** MEP-003 / FEAT-042 — Fondations / 1.3.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux compléter les frontières transactionnelles à risque sans remplacer SQLite.
- **Intention / description :** Compléter les frontières transactionnelles à risque sans remplacer SQLite.
- **Acquis et frontière :** Transactions, contraintes et protections déjà livrées dans ORG-001, USER-004, EVAL-003 et PASS-001.
- **Critères d’acceptation :** Écritures métier et Journal cohérents ; rollback sans état partiel ; envois réseau hors transaction d’écriture ; contraintes et provenance historiques conservées.
- **Vrais cas de refus :** Échec à mi-opération ou rejet métier ne laisse ni donnée partielle ni activité de succès.
- **Dépendances de livraison / priorité :** ORG-001, USER-004, EVAL-003, PASS-001 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-004 — Fiabilisation SMTP et reprises

- **Identifiant / Feature parente / job :** MEP-004 / FEAT-042 — Fondations / 1.4.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux étendre la fiabilité aux invitations et notifications restantes en réutilisant le socle approprié.
- **Intention / description :** Étendre la fiabilité aux invitations et notifications restantes en réutilisant le socle approprié.
- **Acquis et frontière :** NOTIF-001 livre les courriels de planning ; AUTH-002 possède déjà une file durable et des reprises dédiées.
- **Critères d’acceptation :** État durable de remise, reprise après panne, délais bornés et diagnostic sans secret ; intention conservée après commit ; politique de doublons explicite ; worker de récupération conservé.
- **Vrais cas de refus :** SMTP indisponible ou redémarrage ne perd pas silencieusement une intention et ne bloque pas une écriture métier.
- **Dépendances de livraison / priorité :** NOTIF-001, AUTH-002 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-005 — Accessibilité des modales

- **Identifiant / Feature parente / job :** MEP-005 / FEAT-042 — Fondations / 1.5.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux compléter l’accès clavier et lecteur d’écran sur toutes les modales du produit.
- **Intention / description :** Compléter l’accès clavier et lecteur d’écran sur toutes les modales du produit.
- **Acquis et frontière :** Modales natives et améliorations ciblées de passation déjà présentes ; aucune conformité globale déclarée.
- **Critères d’acceptation :** Nom accessible, focus initial et retour au déclencheur, parcours Tab contenu, Échap cohérent avec sauvegarde, erreurs annoncées ; actions accessibles sans souris.
- **Vrais cas de refus :** Focus perdu, action inaccessible au clavier ou fermeture effaçant une saisie non sauvegardée sont refusés.
- **Dépendances de livraison / priorité :** PASS-001 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-006 — Licence Apache 2.0

- **Identifiant / Feature parente / job :** MEP-006 / FEAT-042 — Fondations / 1.6.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux permettre la reprise et la modification du produit sous Apache 2.0.
- **Intention / description :** Permettre la reprise et la modification du produit sous Apache 2.0.
- **Acquis et frontière :** Aucun LICENSE ou NOTICE racine identifié lors de la réconciliation.
- **Critères d’acceptation :** Licence Apache 2.0 intégrale, attribution et notices applicables présentes ; inventaire des licences des éléments distribués et conditions de redistribution vérifiés.
- **Vrais cas de refus :** Dépendance ou asset aux droits incompatibles/non établis empêche la distribution.
- **Dépendances de livraison / priorité :** aucune / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-007 — Notation explicite sans valeur présélectionnée

- **Identifiant / Feature parente / job :** MEP-007 / FEAT-042 — Fondations / 1.7.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux exiger un choix de note pour chaque question en conservant le curseur entier 0–10 et les repères existants.
- **Intention / description :** Exiger un choix de note pour chaque question en conservant le curseur entier 0–10 et les repères existants.
- **Acquis et frontière :** PASS-001 et EVAL-004 restent réalisés ; score initial null mais interface proposant 5 et Suivant pouvant le sauvegarder.
- **Critères d’acceptation :** État non répondu visible et accessible ; aucun score sélectionné sémantiquement ou persisté avant un choix explicite ; zéro distinct d’absence ; reprise des notes existantes et snapshots inchangés.
- **Vrais cas de refus :** Suivant, ouverture, fermeture, reprise ou finalisation sans choix ne crée aucune note ; passation incomplète refusée.
- **Dépendances de livraison / priorité :** PASS-001, EVAL-004 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.

## MEP-008 — Permissions DRF restrictives

- **Identifiant / Feature parente / job :** MEP-008 / FEAT-042 — Fondations / 1.8.
- **User story :** en tant que responsable produit, contributeur et administrateur, je veux fermer par défaut les API et inventorier les exceptions publiques intentionnelles.
- **Intention / description :** Fermer par défaut les API et inventorier les exceptions publiques intentionnelles.
- **Acquis et frontière :** Permissions explicites sur de nombreuses vues ; DEFAULT_PERMISSION_CLASSES absent des settings de base.
- **Critères d’acceptation :** Politique DRF restrictive par défaut ; exceptions publiques limitées et documentées, avec leurs protections ; permissions et contrats existants conservés.
- **Vrais cas de refus :** Endpoint sans permission explicite, anonyme ou rôle interdit n’accède pas aux données métier.
- **Dépendances de livraison / priorité :** AUTH-001 / P1.
- **Valeur :** Protéger les accès, les écritures et la saisie avant les renforcements de production.
