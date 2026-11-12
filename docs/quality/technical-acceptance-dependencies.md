# MEP-031 — Traçabilité, dépendances et décisions

[Index](technical-acceptance.md) · [Qualification et DoD](technical-acceptance-review.md).
Statuts à `ec4c3a535065c54e3c25abea8f52b722f5bef5be` : MEP-031 **Ouvert / N/A**,
MEP-022 **Ouvert**, MEP-055 **Bloqué**, MEP-039 **Réalisé** ; C11 et D01–D09 non approuvées.
Autorités : [registre E01](../backlog/tracking/mess-e01.md), [E03](../backlog/tracking/mess-e03.md),
[E04](../backlog/tracking/mess-e04.md), [décisions](../backlog/planning/audit-20261027/decisions-mess.md).

## Dépendances canoniques et ordonnancement

Les seules dépendances canoniques de **MEP-031** sont MEP-022 et MEP-039 ([F17](../backlog/source/mess/f17.md)).
La préparation ne les clôture pas et n'ajoute pas d'arc depuis tous les outils futurs vers MEP-031.
Pour les PV, conserver exactement les prérequis des [sources F18](../backlog/source/mess/f18.md)
et [F20](../backlog/source/mess/f20.md) :

| Consommateur | Dépendances canoniques de son PBI |
| --- | --- |
| MEP-032 | MEP-025, MEP-028, MEP-031 |
| MEP-068 | MEP-032, MEP-063, MEP-030 |
| MEP-034 | MEP-068, MEP-031, MEP-009, MEP-011, MEP-037, MEP-038, MEP-020 |
| MEP-071 | MEP-068, MEP-031, MEP-010, MEP-040, MEP-063 |
| MEP-072 | MEP-068, MEP-031, MEP-064, MEP-027, MEP-065 |

Les capacités ci-dessous sont des entrées concrètes de procédure, pas des modifications de ces dépendances.
Préparer matrices/jeux et collecter décisions en parallèle est recommandé ; l'ordre I/C du
[plan](../backlog/planning/pre-mep.md) reste indicatif. Chaque scénario attend seulement les entrées qu'il consomme.
MEP-043 n'est pas réintroduit comme prérequis de MEP-034 ; F04 reste traité au GO selon la source.

## Traçabilité et dépendances par scénario

Chaque ligne relie l'exigence MEP-031 à son contrat, son risque et son consommateur ; les champs
Refus/Preuves des fiches complètent la chaîne, sans confondre preuves acquises et preuves cible attendues.
Les rôles ci-dessous sont attendus, pas des titulaires nommés ni des accords présumés.

| Scénario / exigence → contrat → risque | Capacité disponible | Capacité manquante | Décision externe | Responsable | Consommateur |
| --- | --- | --- | --- | --- | --- |
| [TEC-01](technical-acceptance-installation.md#tec-01) installation → MEP-055 → pose incomplète/destructive | Matrice de prérequis, Django/migrations | MEP-057/058/059/024 package ; 060/061 préflight/pose ; 062/025 bootstrap/diagnostic ; guide 028 | D01–D09, C11 capacité/durée | Exploitation, contributeur distribution, recette | MEP-032 |
| [TEC-02](technical-acceptance-installation.md#tec-02) hors Internet → F18/055 → dépendance externe | Build local, parcours FON ; écart CDN identifié | 058/024 assets locaux complets, 063 services ; capture réseau cible à choisir | D05/D08, C11 fenêtre | Réseau/exploitation, recette | MEP-068 |
| [TEC-03](technical-acceptance-security.md#tec-03) TLS/proxy → MEP-002/009 → confiance usurpée | Middleware/refus et tests HTTP | Frontal/serveur/certificats réels, procédure PKI | D03–D05 ; C11 intervention | Sécurité/PKI/réseau, exploitation | MEP-034 |
| [TEC-04](technical-acceptance-security.md#tec-04) CSRF → MEP-002 → mutation d'origine étrangère | Session/CSRF/cookies testés | Injection client et frontal cible qualifiés | D03–D05 | Recette sécurité, exploitation | MEP-034 |
| [TEC-05](technical-acceptance-security.md#tec-05) secrets/config → MEP-009/036/042 → démarrage dangereux | Contrôles d'import/ready et rotation documentée | 054/021 contrat/chargeur commun ; ACL et stockage cible | D06/D07, C11 rotation | Sécurité/exploitation, contributeur config | MEP-034 |
| [TEC-06](technical-acceptance-access.md#tec-06) auth/permissions → MEP-001/037 → élévation | Matrices/sessions/refus réels | Paramètres et preuve des pairs/ACL cible | D05/D06, adaptation LOGIN via 022 | Sécurité, recette/exploitation | MEP-034 |
| [TEC-07](technical-acceptance-access.md#tec-07) isolation → MEP-011/038 → fuite directe/indirecte | Scopes/mutations/archives et tests ; aucun export métier | Jeux et observations MESS, pas de nouveau développement supposé | Profil d'accès approuvé ; arbitrages hors extension conservés | Recette, Admins témoins | MEP-034 |
| [TEC-08](technical-acceptance-sqlite.md#tec-08) locks → MEP-039/010/003 → effet partiel/rejeu | Paramètres, BUSY traduit, deux retries opt-in, tests processus | Harness/barrières cible par 071, services 063 | D01/D02/D07/D09, C11 injection | Exploitation SQLite/contributeur mesure | MEP-071 |
| [TEC-09](technical-acceptance-sqlite.md#tec-09) concurrence → MEP-040 → double effet/provenance | Matrice et 42 cas de développement | Transposition contrôlée des combinaisons au clone MESS par 071 | C11 protocole/répétitions | Recette/contributeur mesure | MEP-071 |
| [TEC-10](technical-acceptance-sqlite.md#tec-10) charge/disponibilité → C11/039 → saturation | Mesures synthétiques et limites explicites | Outil/protocole cible 071, services 063, profil représentatif | C11 charge/disponibilité/reprise ; D01/D02/D07/D09 | Produit/exploitation/recette | MEP-071 |
| [TEC-11](technical-acceptance-operations.md#tec-11) SMTP → MEP-004 → faux succès/doublon | Files, claims, retries, admin, tests SMTP réels locaux | Relais/injecteur de recette et supervision 022/063 | D08/D09, C11 résorption/escalade | Messagerie/exploitation, recette | MEP-034 ; MEP-068 nominal |
| [TEC-12](technical-acceptance-operations.md#tec-12) services → MEP-004/039/F14 → workers doublés | Commandes workers/échéances, fermeture des connexions | Services 063, diagnostic 025, procédure arrêt/restart | D03/D06/D07/D09 ; C11 disponibilité/RACI | Exploitation OS/service | MEP-068/071 |
| [TEC-13](technical-acceptance-operations.md#tec-13) journaux → MEP-042/020 → destruction interdite | Rétention, simulation/reçus/reprise et refus | Jeux historiques cible 034, backup/restore 064/027, tâches et politiques externes | C11 conservation/limites ; autorité métier/conformité ; D09 | Exploitation, propriétaire données/conformité | MEP-034 |
| [TEC-14](technical-acceptance-recovery.md#tec-14) backup → F15/039 → copie incohérente | SQLite/atomicité documentées | Outil/méthode 064 et destination protégée | C11 backup ; D06/D07 | Exploitation/sécurité, propriétaire données | MEP-072 |
| [TEC-15](technical-acceptance-recovery.md#tec-15) restore → F15/027 → écrasement/perte | Invariants et migrations identifiables | Restauration 027, backup 064, services 063 | C11 RPO/RTO/autorisation | Exploitation, propriétaire données/recette | MEP-072 |
| [TEC-16](technical-acceptance-recovery.md#tec-16) rollback → F14/F15 → couple incompatible | Versions/migrations historisées | Upgrade 026 et rollback 065 reproductibles, deux packages qualifiés | C11 couple/perte/RPO/RTO | Exploitation, produit/propriétaire données | MEP-072 |
| [TEC-17](technical-acceptance-installation.md#tec-17) gates → CI/DoD → promotion invalide | Plan/pre-push/CI/qualification/promotion exact SHA | Preuve exhaustive du futur candidat ; témoins de refus accessibles | Périmètre candidat/GO explicite, aucun changement de gouvernance | Responsable dépôt/produit/recette | MEP-032 ; MEP-035 |

## Paramètres et décisions restant à obtenir

Pour chaque décision : référence, valeur/unité, périmètre, date, réserves et approbateurs habilités.
Aucune valeur du matériel local, des fixtures ou des essais CI n'est substituable à un objectif approuvé.

| Repère | Valeur attendue | Décideur attendu | Usage / effet bloquant |
| --- | --- | --- | --- |
| C11 — charge/volume | `À définir — C11 / MEP-022` : utilisateurs/sessions/actions, écrivains API/workers, taille des données, mix/débit et paliers | Produit pour usage ; exploitation/contributeur pour mesure | TEC-08/09/10/14 : définir injection/charge ; absence bloque protocole quantitatif et conclusion de capacité |
| C11 — protocole | `À définir — C11 / MEP-022` : instruments/versions, barrières, fenêtres/durée/répétitions, horloge, conditions d'arrêt et collecte | Recette + exploitation/contributeur | TEC-02/08/09/10/11/13/14 : reproduction et mesure ; absence bloque les variantes concernées |
| C11 — performances/stabilité | `À définir — C11 / MEP-022` : latence/percentiles, débit utile, budget d'erreurs/BUSY, ressources et limites disque | Produit + exploitation | TEC-01/08/10/14 : comparer mesure/objectif ; absence interdit verdict de performance ou dimensionnement |
| C11 — disponibilité | `À définir — C11 / MEP-022` : service couvert, période, formule, événements/exclusions maintenance et seuil | Exploitation + responsable produit/MESS | TEC-10/12 : calculer disponibilité ; absence bloque cette qualification |
| C11 — notifications/intervention | `À définir — C11 / MEP-022` : âge de file, délai de résorption, détection/intervention/rotation et escalade | Messagerie/exploitation + produit pour service attendu | TEC-03/05/10/11/12 : mesurer reprise/alertes ; absence bloque acceptation opérationnelle, sans changer les retries livrés |
| C11 — sauvegarde | `À définir — C11 / MEP-022` : fréquence, contenu, conservation, destination/capacité, vérification et accès | Exploitation/sécurité + propriétaire données | TEC-13/14/15 : sauvegarde autorisée et restaurable ; absence bloque destruction et qualification backup |
| C11 — RPO | `À définir — C11 / MEP-022` : perte admissible par incident, unité, point de référence et traitement données post-upgrade | Produit/propriétaire données + exploitation | TEC-15/16 : comparer jalons récupérés/perdus ; absence interdit d'accepter une perte |
| C11 — RTO | `À définir — C11 / MEP-022` : durée admissible, début incident/décision, fin service accepté, cas couverts | Exploitation + produit/propriétaire données | TEC-10/15/16 : mesurer reprise ; absence bloque verdict temporel |
| C11 — conservation/purge/preuves | `À définir — C11 / MEP-022` : durée technique, lots/plafonds/fréquence, politiques des logs externes/backups/PV, gel et accès | MESS métier/conformité/propriétaire données + exploitation | TEC-13 et tous PV : autorisation/supervision ; absence bloque purge finie et finalisation ; activity reste keep |
| C11 — responsabilités | `À définir — C11 / MEP-022` : titulaires installation/surveillance/incident/restore/rollback/PV, autorisation et suppléance | Responsables MESS habilités | P0 et TEC-01 à 17 : attribuer les gestes ; absence bloque leur exécution autorisée et clôture MEP-031 |
| D01/D02 | Profil OS/build/CPU/capacité et Python/SQLite/ABI/empreintes approuvés | Exploitation MESS + contributeur pour runtime | TEC-01/08/10 et package ; incompatibilité ou absence bloque profil cible |
| D03/D04/D05 | Serveur/frontal/topologie/pair réel, TLS/PKI/DNS/renouvellement/révocation, flux exacts | Exploitation/sécurité/PKI/réseau MESS | TEC-01/02/03/04/06/12 : confiance et réseau ; absence bloque conformité infrastructure |
| D06/D07 | Identités/habilitations/ACL/secrets et chemins absolus/capacité | Exploitation/sécurité ; produit pour accès initial | TEC-01/05/08/12/14/15/16 : permissions/persistance ; absence bloque installation/reprise sûre |
| D08 | Relais/port/TLS/authentification/expéditeur/confiance et responsabilité | Messagerie/sécurité MESS | TEC-02/05/11 : remise et injection contrôlées ; absence bloque recette SMTP |
| D09 | Superviseur/ordonnanceur, fréquence/fuseau/créneaux/droits/sorties et échecs | Exploitation MESS | TEC-11/12/13 : exécution/restart/absence de chevauchement ; absence bloque recette services |

Les groupes D ci-dessus résument la [matrice canonique D01–D09](../operations/installation-prerequisites-validation.md)
qui conserve le détail par décision. Une proposition Windows Server ou un délai --watch n'est pas un accord.
La politique de destruction métier n'est pas approuvée par une valeur de configuration : activity reste protégée.
Tout paramètre encore manquant conserve son libellé ; aucun silence ne vaut approbation ni dérogation.
