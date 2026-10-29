# Décisions de préparation MESS : environnement, objectifs et responsabilités

[Trajectoire](trajectoire.md) · [C11](contradictions.md).
Source des D01–D09 : [matrice canonique MEP-055](../../../../docs/operations/installation-prerequisites-validation.md).
Les décisions sont toujours non approuvées. Les propriétaires ci-dessous sont des rôles attendus,
pas des personnes nommées ni des accords acquis. Aucune valeur OS/SLA/RPO/RTO/volumétrie n’est fixée.

## Environnement MESS — D01 à D09

| Décision | Objet à arrêter et preuve d’accord | Propriétaire attendu | Ordre logique et livrables débloqués |
| --- | --- | --- | --- |
| D01 | OS/édition/build, CPU/architecture et capacité hôte ; référence du profil approuvé | Exploitation MESS | Compatibilité initiale avec D02/D03 ; inventaire 057, wheels 059, préflight 060 et charge 071. Windows Server reste une proposition. |
| D02 | CPython, SQLite lié, ABI, origine/empreinte, patching et bibliothèques système/TLS/fuseau | Exploitation + contributeur | Après compatibilité OS/CPU ; 057/059 puis installation/runtime. CI Python locale ne vaut pas approbation du binaire cible. |
| D03 | Serveur WSGI/ASGI et frontal, versions/modules, topologie et identité du proxy | Exploitation/sécurité | Cohérence D01/D02 ; source du contrat 054, build/routage 058, package 024 et services 063. |
| D04 | DNS/PKI, chaîne et règles TLS, gestion privée des clés, renouvellement/révocation sans Internet | Sécurité/PKI | En parallèle D03/D05/D08 puis cohérence d’ensemble ; config 054/021 et recette TLS 034. |
| D05 | Flux approuvés : sources/destinations/ports, administration et services internes | Réseau/sécurité | En parallèle de D03/D04/D08 ; frontal/backend/SMTP cohérents ; 054, préflight et hors Internet 068. |
| D06 | Identités OS, droits installation/service/bootstrap, ACL et stockage des secrets | Exploitation/sécurité + produit pour accès initial | Après définition des composants et en lien D07/D09 ; 060/062/063. Identité OS ≠ responsable humain d’incident C11. |
| D07 | Chemins absolus code/runtime/configuration/base/logs/temp/backup et capacité | Exploitation | Cohérence D01/D06 et objectifs de conservation ; 054/021/060, persistance upgrade 026 et sauvegarde 064. |
| D08 | SMTP interne, port/mode/authentification/expéditeur, confiance et responsabilité technique | Messagerie/sécurité | Cohérence PKI/flux/identités ; 054/021/063 et essais de remise/indisponibilité 034/068. |
| D09 | Ordonnanceur/superviseur, fréquences/fuseau/créneaux/droits, sorties et échecs | Exploitation | Après commandes/processus identifiés, avec D06/D07 ; opérations 022, services/tâches 063, contrôle workers 025. |

Les décisions peuvent être préparées en parallèle. D01/D02/D03 fixent la compatibilité ; D04/D05/D08
fixent la confiance et les flux ; D06/D07/D09 fixent l’exécution/persistance. Une revue croisée les
concilie avant clôture de MEP-055 et consommation finale par MEP-054/057.
Les exigences de charge C11 peuvent conduire à réviser le dimensionnement D01/D07 : itération de décision,
pas dépendance circulaire imposant de livrer la charge cible avant de choisir un hôte.

## Objectifs et responsabilités — C11 / MEP-022

C11 est un repère de cet audit ; il ne remplace aucune D et ne constitue pas un SLA déjà décidé.

| Ensemble à décider | Contenu mesurable attendu | Responsable attendu | Consommateurs et preuve d’entrée |
| --- | --- | --- | --- |
| Charge/volume | Utilisateurs/sessions/actions simultanées, écrivains API/workers, volumes run/questions/journaux, durée et mix de charge ; critères de latence/échec s’ils sont requis | Produit pour usage + exploitation/contributeur pour mesure | 031 et 071 : scénario et seuils approuvés avant essai ; référence locale DELETE/FULL/5 s n’est pas un objectif MESS. |
| Disponibilité | Périmètre de service, fenêtre d’observation, maintenance, événements comptés et seuil décidé | Exploitation + responsable produit/MESS | 022/031/063 et recette technique ; formule et source de mesure, pas un pourcentage sans période. |
| Sauvegarde | Fréquence, contenu, conservation/accès, vérification, destination/capacité et responsabilités | Exploitation/sécurité + propriétaire des données | 064/066 : méthode et politique approuvées, droits/chemins D06/D07 ; aucune fréquence par défaut inventée. |
| Reprise RPO/RTO | Perte admissible et point de reprise, durée jusqu’au service rétabli, départ/fin de mesure, couple version/schéma et conséquences des données post-upgrade | Produit/propriétaire des données + exploitation | 027/065/072 : cas d’incident et seuils signés ; pas d’ancien code sur schéma incompatible ni perte acceptée implicitement. |
| Exploitation humaine | Qui installe, surveille, reçoit l’échec, intervient, autorise restauration/rollback et conclut le PV ; suppléance/escalade si requise | Responsables MESS habilités | Contrat 022, guides 028/066, PV ; rôle nommé et preuve d’accord pour chaque opération nécessaire. |
| Mesure et décision | Jeu fictif/clone, instruments, sortie expurgée, constat d’échec et autorité d’acceptation | Responsable recette + exploitation | 031/032/034/071/072 et GO : résultats attribués, rejouables, échec non transformé en avertissement. |

Les responsables humains ci-dessus ne sont ni un nouveau rôle produit ni des comptes OS réels à inventer.
Les politiques de conservation des preuves métier et les décisions de suppression restent distinctes
de la seule capacité disque ou durée technique des logs.

## Conditions de lancement différenciées

| Travail | Préparation possible maintenant | Autorisation de passage au travail complet / preuve nécessaire |
| --- | --- | --- |
| Collecter D01–D09 et C11 | Matrices et questions existantes, liste des inconnues | Valeurs/réserves/référence/date/approbateurs réellement fournis ; pas d’approbation par silence. |
| Contrat/configuration/inventaire 054/021/057 | Schéma et inventaire de l’existant, consommateurs et contraintes | Profil D01–D09 cohérent ; 054 validé avant chargeur ; droits/versions/empreintes établis pour inventaire. |
| Construction/pose 058/059/024/060–062/025 | Protocole, trames et scénarios de refus, sans artefact final supposé | Prérequis canoniques livrés, profil/ABI/ACL/chemins disponibles, package vérifié et config/opérations 021/022 réelles. |
| Installation vierge 032 | Réserver environnement, préparer PV et guide | Package final exact, cible vierge conforme, guide 028 et cahier 031, Internet bloqué ; preuve de pose et diagnostic complets. |
| Concurrence 071 | Préparer harness/matrice d’invariants et mesures locales existantes | C11 charge/volumes/seuils approuvés, même fichier SQLite cible API/workers, services 063 et prérequis F20 réalisés ; clone isolé et protocole 031. |
| Reprise 072 | Préparer incident et contrôles de provenance | C11 RPO/RTO/responsables/couples approuvés, backup/restore/rollback livrés, clone identifié du candidat et outils F15 ; aucun test destructif sur données d’autres PV. |

Un environnement approuvé ne prouve pas l’objectif d’exploitation ; un objectif approuvé ne prouve pas
la réussite des essais. D01–D09 débloquent un contrat et des constructions ; les PV valident leurs
résultats sur un candidat exact. Aucune date ou durée de livraison n’est déduite de cet ordre.
