# MEP-055 — Contrat des prérequis d’installation MESS

Projet de contrat du 2026-10-19, audité sur `origin/main` à `a7cb03b`.
Périmètre : [MEP-055 — Définir les prérequis d’installation](../backlog/source/mess/f11.md).
**Aucune cible ni aucun accord d’exploitation MESS n’est attesté.** Le contrat reste à valider avec MESS ;
[suivi canonique](../backlog/tracking/mess-e03.md), [décisions et conformité](installation-prerequisites-validation.md).
Ce document définit des conditions et des contrôles attendus ; il ne fournit aucun préflight exécutable.

## Lecture et frontière

- **Démontré** : comportement ou contrainte traçable dans le dépôt, sans qualification de l’hébergement MESS.
- **Proposé** : profil de discussion, jamais une version supportée ou un choix accepté implicitement.
- **À valider MESS** : décision indispensable, avec référence, date et approbateurs à fournir avant clôture.

Exploitation on-premise, SQLite permanente, installation et fonctionnement sans accès Internet.
Aucun Docker, Node/npm, serveur Vite ou compilation frontend sur la cible. Les outils npm du dépôt sont
réservés au développement, à la préparation et aux validations ; le bootstrap actuel télécharge des dépendances.
Hors ligne signifie sans Internet, avec réseau interne autorisé pour clients, DNS, temps et relais SMTP MESS.
Une panne SMTP conserve le succès métier et les intentions en base ; elle ne garantit pas la remise des courriels.
Aucune promesse de fonctionnement sans relais pour invitations/récupération de compte n’est faite.

## OS, versions et runtime Python

| Nature | Contrat / limite | Source ou décision |
| --- | --- | --- |
| Démontré | README de développement : Python 3.12/3.13 ; Ruff cible `py312`. CI exhaustive sous Ubuntu avec Python 3.13. Cela ne certifie aucun OS serveur MESS | [README](../../README.md), [pyproject](../../backend/pyproject.toml), [workflow](../../.github/workflows/exhaustive.yml) |
| Proposé | Profil initial de discussion : Windows Server 2022 x64, CPython 3.13.x x64 et environnement Python privé de l’application. Ni compatibilité cible ni support éditeur affirmés ici | D01/D02 |
| À valider MESS | OS, édition, build/correctifs, architecture CPU, contraintes de durcissement et maintenance ; version Python complète, provenance et droit d’installation. Toute autre combinaison nécessite une qualification distincte | D01/D02 |
| Démontré | Django `>=5.2,<5.3`, DRF `>=3.16,<3.17`, drf-spectacular `>=0.28,<0.29` ; intervalles, pas un verrou de distribution | [requirements](../../backend/requirements.txt) |
| À valider MESS | Runtime avec `sqlite3`, bibliothèque SQLite liée et TLS/autorités de confiance utilisables hors ligne ; versions exactes, empreintes et dépendances transitives à figer par MEP-057/059 | D02/D04 |

Aucun minimum CPU/RAM/disque ni nombre d’utilisateurs n’est démontré pour MESS. Le relevé de capacité
(matériel, espace libre pour base/journal/temporaires/sauvegardes, volumétrie et trafic attendus) est requis ;
les seuils mesurés relèvent de la recette, sans transformer les mesures de développement en garantie.
Le fuseau applicatif actuel est `America/Toronto` avec `USE_TZ=True` ; horloge fiable et données de fuseau
Python nécessaires, sans imposer ce fuseau à l’OS. Provisionnement hors ligne à inventorier dans MEP-057/059.

## Serveur, proxy et statiques

**Démontré** : points d’entrée [WSGI](../../backend/config/wsgi.py) et [ASGI](../../backend/config/asgi.py)
sélectionnant la production par défaut. Aucun serveur de production n’est fourni par les requirements.
Le proxy Vite est uniquement de développement. `STATIC_URL` existe ; `STATIC_ROOT` et le déploiement des
statiques ne sont pas configurés dans le socle. Le serveur de développement ne qualifie pas une installation.

**Proposé** : un hôte applicatif pour API, workers et SQLite, avec serveur WSGI de production et frontal TLS
servant le build React normal à la racine. Serveur/proxy et versions exactes restent à choisir (D03),
compatibles avec D01/D02, disponibles hors ligne et sous responsabilité d’exploitation identifiée.
Les binaires, licences et éventuels composants OS doivent être inventoriés ; aucun produit tiers n’est livré ici.

Le [contrat HTTP existant](../architecture/http-security.md) impose une origine HTTPS commune React/API,
`APP_BASE_URL` sans sous-chemin, hosts et origines CSRF exacts. Router `/api/` et `/admin/` vers Django,
servir les statiques Django et les assets React locaux ; le repli SPA ne doit masquer ni API ni erreur backend.
Le serveur préserve `REMOTE_ADDR` réel et ne réécrit pas le schéma depuis des en-têtes clients.
Le frontal remplace `X-Forwarded-Proto` par une valeur unique calculée, conserve le Host public avec port,
et respecte le non-cache API. Accès backend limité aux pairs autorisés ; listes TLS et LOGIN cohérentes.
Une terminaison HTTPS directe reste possible selon le contrat existant, mais demande sa propre qualification.

**Écart hors ligne démontré** : drf-spectacular 0.28.0 installé utilise par défaut Swagger UI et favicon sur
`cdn.jsdelivr.net` ; [settings applicatifs](../../backend/config/settings_base.py) sans surcharge locale.
`/api/schema/` générable ne prouve donc pas `/api/docs/` utilisable hors ligne. Inventorier puis livrer les
assets locaux dans MEP-057/058/024, configurer avec MEP-054/021 et vérifier avec MEP-025.
Aucune dépendance CDN, police, script, image ou notice distante ne peut être requise par les parcours cible.

## Certificats TLS, noms et flux

**Démontré** : HTTPS obligatoire en production, cookies sécurisés et refus des proxys/origines invalides
([MEP-002](../architecture/http-security.md), [MEP-009](configuration/startup-security.md)).
**À valider MESS (D04)** : nom DNS et origine publique, certificats couvrant les noms, chaîne de confiance
approuvée côté navigateurs et Python/SMTP, clés privées protégées, titulaire et procédure de renouvellement.
La distribution de la confiance, les contrôles de validité/révocation et le renouvellement doivent rester
possibles sans Internet ; aucune autorité, version TLS ou politique MESS n’est supposée approuvée.

| Flux | Proposition à faire approuver (D05) | Limite / contrôle |
| --- | --- | --- |
| Navigateurs internes → frontal | TCP 443 ; 8443 si décidé explicitement | Port inclus dans origine publique et CSRF ; certificat reconnu |
| HTTP → frontal | TCP 80 facultatif pour redirection HTTPS | Aucune collecte de credentials en HTTP |
| Frontal → backend | TCP 8000 sur loopback si même hôte | Port d’exemple, pas une obligation ; backend inaccessible aux clients |
| API/workers → SMTP interne | TCP 587 STARTTLS ou 465 TLS implicite | Choisir un seul mode ; port réel fourni par MESS |
| Hôte/clients → services internes | DNS et source de temps approuvés, flux PKI éventuels | Liste exacte des destinations/protocoles/ports et règles pare-feu à consigner |

Aucun port réseau SQLite, broker ou accès Internet sortant n’est requis par ce contrat.
5173 (Vite) et les ports E2E ne sont pas des ports d’exploitation. Si le frontal est distant, remplacer
loopback par le pair réel et qualifier segmentation/protection du lien ; ne pas autoriser un réseau universel.

## Comptes, droits et chemins persistants

**Démontré** : production avec `DEBUG=False`, secret Django explicite et fort, contrôle SMTP au démarrage.
Le bootstrap de développement et ses identités ne doivent pas être exécutés sur la cible.
Le Superadmin Django initial est distinct du compte OS ; sa création explicite relève de MEP-062.

**Proposé / à valider MESS (D06/D07)** : compte de service sans privilège administrateur permanent, API et
workers sous la même identité initialement ; compte d’installation habilité séparément pour services,
ACL et certificats. La délégation d’administration applicative ne donne aucun droit OS.
Seuls les lecteurs autorisés accèdent aux secrets, base, journaux et sauvegardes contenant des données personnelles.
L’identité du frontal peut lire les assets, jamais la base ni les secrets Django/SMTP.
Le composant terminant TLS lit la clé privée ; les workers n’en ont pas besoin.

| Classe de chemin | Contrat proposé de droits et persistance | Réalité actuelle / suite |
| --- | --- | --- |
| Application et runtime | Chemins absolus locaux ; lecture/exécution service, écriture installation | Pas de racine MESS confirmée ; D07 fixe les chemins réels |
| Configuration et secrets | Hors assets publics ; lecture service, modification restreinte ; aucune valeur en ligne de commande/journal | Variables d’environnement actuelles ; fichier/source unique et références : MEP-054/021 |
| SQLite et auxiliaires | Disque local persistant ; lecture/écriture/création/suppression dans le répertoire par API/workers | Actuellement `BASE_DIR/db.sqlite3` dans `backend` ; aucun paramètre de chemin production livré |
| Logs techniques externes et temporaires | Écriture bornée et protégée du service, lecture exploitation ; capacité réservée | Logs applicatifs/activité déjà en SQLite ; collecte/rétention externes : MEP-022 |
| Sauvegardes | Destination protégée, droits distincts et capacité décidée ; hors cycle de remplacement applicatif | Sauvegarde cohérente/restauration : MEP-064/027, aucune procédure livrée ici |

Pour le profil Windows discuté, exemples à remplacer/valider en D07 : `C:\AssessTeams\releases` et
`C:\AssessTeams\runtime` ; sous `C:\ProgramData\AssessTeams`, sous-répertoires `config`, `data`, `logs`,
`tmp`, `backups`. Ces chemins illustratifs n’existent pas par contrat et ne configurent aucun composant actuel.
Une destination de sauvegarde distincte et protégée reste à décider ; aucun volume MESS n’est présumé.

La séparation code/données est un **objectif proposé**, pas une option actuelle. MEP-054/021 doivent prévoir
le chemin persistant commun ; MEP-060/062/026 devront le préserver lors d’installation, relance et mise à jour.
Ne pas déplacer la base par une variable inventée, un lien de fichiers implicite ou un script de développement.
Le répertoire contenant SQLite doit autoriser le journal rollback, pas seulement l’écriture du fichier principal.

Le [contrat SQLite démontré](sqlite/README.md) exige un fichier local sur le même hôte que les processus :
SMB/NFS, dossier synchronisé et accès direct depuis plusieurs hôtes sont exclus. Conserver DELETE/FULL,
timeout 5 s, `DEFERRED`, `CONN_MAX_AGE=0` ; aucune bascule WAL ni moteur de remplacement.
Une seule instance de chaque worker au départ, concurrence API modeste à mesurer ; aucun SLA inventé.

## SMTP et ordonnanceur

**Démontré** : [configuration SMTP](../../backend/config/email_security.py), file durable et
[workers existants](../architecture/email-notifications.md). Fournir `EMAIL_HOST`, port, expéditeur autorisé,
mode TLS et, si requis, les deux credentials. Pas de credentials si relais sans authentification approuvé.
TLS obligatoire hors loopback ou avec authentification ; STARTTLS et TLS implicite sont exclusifs.
Expéditeur vide/de développement, credentials incomplets/faibles ou mode incohérent refusent le démarrage.
L’acceptation SMTP ne garantit pas la réception finale ; les statuts incertains exigent vérification.
**À valider MESS (D08)** : relais interne, accès/quotas, expéditeur, authentification, confiance TLS,
responsable de la remise et des incidents ; aucun fournisseur Internet obligatoire.

| Commande existante | Besoin à contractualiser (D09) |
| --- | --- |
| `send_pending_notifications` | Worker surveillé `--watch` ou invocation chaque minute sans chevauchement |
| `send_password_reset_emails` | Même alternative ; respecter la fenêtre de récupération de quinze minutes |
| `send_due_evaluation_notifications` | Invocation quotidienne pour générer les échéances, distincte de leur remise |
| `purge_journals` | Simulation par défaut ; exécution seulement après autorisation et politique technique approuvées |

**Proposé** : ordonnanceur natif de l’OS retenu (Planificateur Windows pour le profil discuté), sans broker,
Python absolu, répertoire de travail `backend`, même configuration/base/identité que l’API, sorties protégées.
**À valider MESS** : mécanisme de supervision, horaires/fuseau, absence de chevauchement et de rattrapage en
rafale, reprise après panne et responsable des codes non nuls. Aucun service ni tâche n’est créé ici.
La [purge livrée](journal-purge.md) n’autorise aucune durée métier ; ne pas activer de suppression par défaut.
Les opérations, disponibilité et objectifs de reprise sont à convenir dans MEP-022 ; leur automatisation
relève de MEP-063 et des PBI de sauvegarde/restauration, sans extension du présent chantier.
