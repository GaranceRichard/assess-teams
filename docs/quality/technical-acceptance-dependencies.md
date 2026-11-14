# MEP-031 — Traçabilité, dépendances et décisions

[Index](technical-acceptance.md) · [Qualification et DoD](technical-acceptance-review.md).
État courant au 2026-11-14 : MEP-031 et MEP-022 Ouverts ; MEP-055 **Ouvert/N/A sur approbation
explicite**, sans clôture ; MEP-039 réalisé. Les axes D01–D09 ne sont plus des décisions externes
obligatoires. [Profil et C11](../operations/installation-prerequisites.md) : paramètres techniques du projet,
limites et engagements éventuels du site réel distincts. Tous les verdicts TEC restent **Non exécuté**.

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
Préparer matrices/jeux et définir les paramètres techniques en parallèle est recommandé ; l'ordre I/C du
[plan](../backlog/planning/pre-mep.md) reste indicatif. Chaque scénario attend seulement les entrées qu'il consomme.
MEP-043 n'est pas réintroduit comme prérequis de MEP-034 ; F04 reste traité au GO selon la source.

## Traçabilité et dépendances par scénario

Chaque ligne relie l'exigence MEP-031 à son contrat, son risque et son consommateur ; les champs
Refus/Preuves des fiches complètent la chaîne, sans confondre preuves acquises et preuves cible attendues.
Les rôles ci-dessous sont attendus, pas des titulaires nommés ni des accords présumés.

| Scénario / exigence → contrat → risque | Capacité disponible | Capacité manquante | Entrée de profil / politique applicable | Responsable | Consommateur |
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

## Paramètres techniques à finaliser et décisions de site

MEP-022 fixe les valeurs de campagne avant essai : valeur/unité, jeu, instrument/version, fenêtre,
bornes de mesure, répétitions, arrêt et preuves. Ces choix relèvent du projet ; aucun accord externe
n’est requis pour développer ou qualifier le banc. Les invariants acquis restent obligatoires.

| Paramètre | Entrée / vérification sur référence | Limite du site réel |
| --- | --- | --- |
| Charge/volume | Acteurs/écrivains, mix, paliers et durée fixés par 022 ; intégrité, refus sûrs et limites observées en 071 | Aucune volumétrie ni performance garantie au MESS sans usage représentatif défini et éprouvé |
| Latence/disponibilité | Formule, événements, fenêtre et mesures brutes ; critères structurels sans corruption ni double effet | Aucun SLA externe inventé ; une garantie demandée requiert un objectif produit explicite |
| SMTP/intervention | Détecter panne, observer file/reprises et mesurer résorption ; mécanismes acquis conservés | Relais, titulaires et éventuels délais de service du site à établir avant exploitation réelle |
| Sauvegarde | Contenu/version/schéma/destination protégée, méthode cohérente et contrôle d’intégrité ; paramètres 022 | Aucune politique de conservation ni perte réelle acceptée implicitement |
| Reprise | Clone au point choisi, début incident et fin aux contrôles de service réussis ; durée/jalons perdus mesurés | RPO/RTO contractuels éventuels à décider si requis ; aucune conclusion de conformité à un objectif inconnu |
| Purge/preuves | Activity=keep ; simulation et lots techniques sur données fictives autorisées ; références protégées | Toute destruction métier reste soumise à la politique réellement approuvée ; aucun assouplissement |
| Rôles opératoires | 022 décrit qui installe, observe et restaure ; exécutant habilité sur le banc nommé dans son PV | Titulaires du site réel nécessaires avant exploitation, sans bloquer le cahier ni les outils |
| D01–D03 | Profil REF-WIN-01 ; versions/ABI/composants exacts et empreintes 057, wheels 059, intégration serveur éprouvée | OS/build/runtime/ressources réels à comparer ; une différence non testée reste non qualifiée |
| D04–D05 | Noms/ports/TLS/confiance locaux et refus proxy/CSRF, aucune sortie Internet | DNS/PKI/flux réels à fournir et éprouver ; aucune homologation déduite du banc |
| D06–D07 | Comptes/ACL/chemins persistants et refus avant écrasement, même configuration et SQLite | Droits et stockage réels à vérifier ; aucune donnée ni clé de production dans les preuves |
| D08–D09 | Relais de test, ordonnanceur et état observable selon profil ; pas de double worker | Accès et supervision réels à attribuer et qualifier avant GO du site |

Les procédures exactes des outils futurs sont complétées par le PBI consommateur avant essai ; MEP-031
n’attend pas leur réalisation pour définir le cahier. Une inconnue d’intégrité, de sécurité ou une
précondition matérielle absente empêche bien le verdict de la variante concernée.
