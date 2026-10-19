# MEP-055 — Décisions MESS, conformité et revue

Compagnon du [contrat des prérequis](installation-prerequisites.md), établi le 2026-10-19 à partir de
`a7cb03b`. Les identifiants D01–D09 ci-dessous sont des décisions de ce contrat, pas de nouveaux PBI.
Aucun entretien, accord MESS, test sur cible ou qualification d’installation vierge n’est attesté.

## Décisions indispensables avant clôture

Toutes les décisions sont **en attente**. Pour chacune, enregistrer la valeur retenue, les réserves,
la référence de décision accessible aux exploitants, la date et les approbateurs habilités MESS/produit.
Ne pas versionner credentials, adresses personnelles ou clés ; référencer leur stockage protégé.

| ID | Valeur attendue / proposition à discuter | Validation demandée / entrée aval |
| --- | --- | --- |
| D01 | OS/édition/build et architecture exacts ; candidat Windows Server 2022 x64, capacité hôte mesurable | Exploitation MESS ; base de compatibilité de MEP-057/059 et recette de charge |
| D02 | CPython complet, runtime SQLite lié, origine/empreinte, patching et dépendances système/TLS/fuseau | Exploitation MESS + contributeur ; cohérence OS/ABI/wheels, aucun support déduit de la CI |
| D03 | Serveur WSGI ou ASGI et frontal, produits/versions/modules, topologie et identité du pair | Exploitation/sécurité MESS ; inventaire MEP-057, configuration MEP-054 ; aucune pile déjà livrée |
| D04 | DNS, PKI/chaîne, politique TLS, stockage des clés, renouvellement/révocation hors Internet | Sécurité/PKI MESS ; validité côté clients et SMTP, responsabilités et preuve de confiance |
| D05 | Matrice de flux avec sources/destinations/ports, accès administration et services internes | Réseau/sécurité MESS ; règles effectives, origine/CSRF et proxy cohérents |
| D06 | Identités OS, habilitations installation/service/administration initiale, ACL et gestion des secrets | Exploitation/sécurité et responsable produit ; MEP-060/062, aucune identité réelle inventée |
| D07 | Chemins absolus application/runtime/configuration/base/logs/temporaire/sauvegardes et capacité | Exploitation MESS ; code/données séparés après MEP-054/021, persistance MEP-060/026 |
| D08 | Relais SMTP interne, port/mode/authentification, expéditeur, confiance et responsabilité | Messagerie/sécurité MESS ; pas d’envoi externe nécessaire, contrôle de remise ultérieur |
| D09 | Ordonnanceur/superviseur retenu, fréquence/fuseau/créneau, droits, sorties et gestion des échecs | Exploitation MESS ; commandes existantes conservées, opérations MEP-022 et services MEP-063 |

Le profil proposé peut être amendé par MESS. Un choix différent exige de revoir le contrat et ses
consommateurs ; aucune proposition ne remplace les contraintes SQLite/hors ligne/sans Docker et Node.
La clôture de MEP-055 exige D01–D09 définies avec MESS et leurs incompatibilités résolues ; les
preuves d’installation de bout en bout restent exigées dans les PBI suivants, sans dépendance circulaire.

## Cohérence avec les capacités et les PBI consommateurs

| Consommateur | Entrée fournie / responsabilité conservée | Écart à ne pas masquer |
| --- | --- | --- |
| [MEP-054/021 — Configuration unique](../backlog/source/mess/f10.md) | Schéma et chargement commun API/workers/scripts : chemins, origine, proxies, SMTP, secrets/services | Actuellement environnement et constantes ; base fixée dans `backend`, aucune configuration unique livrée |
| [MEP-022 — Opérations](../backlog/source/mess/f11.md) | Affecter responsables et objectifs mesurables, procédures SMTP/purge/sauvegarde/reprise | Ne pas inventer disponibilité, RPO/RTO, fréquence de backup ou accord d’exploitation |
| [MEP-057 — Inventaire](../backlog/source/mess/f12.md) | Profil OS/Python, serveur/proxy, workers/ordonnanceur, assets locaux, licences et empreintes | Requirements par intervalles et aucun serveur inclus ; inventaire/verrou cible à réaliser |
| [MEP-058/059 — Frontend et wheels](../backlog/source/mess/f12.md) | Build normal et statiques locaux, wheelhouse complet adapté OS/CPU/Python | Swagger utilise un CDN par défaut ; ne pas assimiler build démo ou bootstrap à la distribution |
| [MEP-024 — Package](../backlog/source/mess/f12.md) | Assembler composants, dépendances, services et notices vérifiables, sans secret ni réseau | Aucun package autonome fourni par ce contrat |
| [MEP-060/061 — Préparation et installation](../backlog/source/mess/f13.md) | Préflight du profil/manifeste/ACL/chemins, refus avant effet destructif, installation locale | Aucun préflight ni installateur développé ici |
| [MEP-062/025 — Initialisation et diagnostic](../backlog/source/mess/f13.md) | Migrations/bootstrap explicite, même SQLite persistante ; health, schéma, statiques et workers | Commandes existantes ≠ installation vierge prouvée ; diagnostics sans secret à démontrer |
| [MEP-063/026 — Cycle de vie](../backlog/source/mess/f14.md) | Services, arrêt/reprise et mises à jour préservant configuration et données | Aucun mécanisme d’exploitation ni déplacement automatique de base ajouté |
| [MEP-064/027/065 — Sauvegarde](../backlog/source/mess/f15.md) | Chemins/droits et capacité pour sauvegarde cohérente, restauration et retour arrière | Ne pas qualifier une copie de base ouverte comme sauvegarde livrée |
| [MEP-032/068 — Recette hors ligne](../backlog/source/mess/f18.md) | Environnement vierge conforme, refus explicites, installation et usage sans Internet | Version/SHA/manifeste exacts et preuves réelles attendus ; cible actuelle inconnue |

Les dépendances canoniques restent inchangées : MEP-055 n’attend pas la réalisation de ses consommateurs.
Ceux qui en dépendent ne sont pas prêts à clôturer tant que son contrat n’est pas approuvé.
Les mesures SQLite de MEP-039/010/040 n’attestent ni volumétrie ni disponibilité MESS.

## Critères de conformité et vrais refus

Cette grille est une spécification de recette/préflight pour les PBI suivants, **pas le résultat d’essais cible**.
La conformité ne peut être prononcée sur une valeur manquante ; conserver un diagnostic sans secret.

| Contrôle | Cas conforme à démontrer | Cas de refus / qualification suspendue |
| --- | --- | --- |
| C01 — Profil approuvé | OS/build/CPU/Python/SQLite identiques au profil signé et au manifeste | OS/version non retenus, architecture ou ABI différente, décision absente |
| C02 — Hors ligne | Installation puis parcours produit, admin/docs/assets, workers sans sortie Internet | Téléchargement pip/CDN, Docker, Node/npm, Vite, compilation frontend ou asset absent |
| C03 — Serveur | Service de production et routage React/API/admin/statiques locaux, lien profond fonctionnel | Serveur dev, build démo, 404 masquée par SPA, serveur manquant ou module incompatible |
| C04 — TLS/proxy | Chaîne reconnue hors ligne, URL HTTPS, hosts/CSRF/pairs exacts ; faux forwarded refusé | Certificat expiré/non reconnu, HTTP de mutation, wildcard/proxy universel, pair réécrit |
| C05 — Flux | Accès client au frontal, backend limité au proxy, SMTP/DNS/temps internes approuvés | Backend exposé aux clients, port occupé/non autorisé, service obligatoire hors contrat |
| C06 — Identités/secrets | Service non administrateur, secrets forts privés, bootstrap production explicite | Credentials de développement, droits globaux, secret dans commande/rapport/assets |
| C07 — Persistance | Chemins absolus approuvés, ACL base/répertoire auxiliaire correctes, relance sans perte | Base SMB/NFS/synchronisée/multi-hôte, répertoire non inscriptible, données écrasées |
| C08 — SQLite | Même fichier API/workers ; DELETE/FULL, timeout 5000 ms, FK actives ; espace disponible | Autre moteur, WAL imposé, bases différentes, journal impossible ou volume insuffisant |
| C09 — SMTP | TLS/authentification/expéditeur valides, relais interne accessible ; états de remise observables | TLS/SSL simultanés, relais distant en clair, credentials partiels, fausse annonce de remise |
| C10 — Ordonnanceur | Deux workers et génération quotidienne effectifs sous même configuration ; sorties surveillées | Worker absent, autre base/settings, exécutions en rafale, erreurs ignorées, purge non autorisée |

Un refus SMTP temporaire reste compatible avec la persistance métier, mais interdit de déclarer la remise
réussie. Absence durable de relais ou d’ordonnanceur requis : qualification d’installation non acquise.
Les contrôles ciblés de démarrage existants ne vérifient pas certificat, droits OS, ports, service ou disponibilité
SMTP réels : MEP-009 ne suffit pas à conclure une conformité infrastructure.
Pour une future recette, consigner profil et SHA exacts, manifeste/empreintes, configuration expurgée,
conditions réseau, preuves conformes **et** refus, résultats/codes et réserves ; aucun faux succès partiel.

## Revue des critères de MEP-055 et de la DoD

| Attendu de la source | Résultat de ce chantier |
| --- | --- |
| OS/versions, Python, serveur/proxy, certificats, comptes/droits, chemins, ports, SMTP et ordonnanceur | Tous couverts par le contrat ; D01–D09 explicitement non validées |
| Définis avec MESS | **Non satisfait** : aucune décision MESS attestée ; MEP-055 reste Bloqué, date de réalisation N/A |
| Sans Docker, Node/npm ni Internet requis sur cible | Exigence conservée ; distribution et essai hors ligne à réaliser ; écart Swagger explicité |
| Refus environnement hors contrat / compilation frontend sur cible | C01/C02/C03 et grille de refus spécifiés, sans prétendre à une exécution sur cible |
| Limite de périmètre | Documentation seulement ; aucun installateur/package/service/ordonnanceur ajouté |

Revue documentaire effectuée : README annoncé préalablement ; règles agents, charte, DoD et stratégie
vérifiées et inchangées ; fondamentaux reliés ; API/OpenAPI, sécurité HTTP/SMTP, inventaire, SQLite,
notifications et purge confrontés au contrat. Aucun endpoint, modèle, migration, dépendance ou permission modifié.
Source F11, registre et vues dérivées alignés ; aucune autre clôture ou décision métier introduite.
Les tests applicatifs, couvertures, builds, lint/typecheck frontend, génération OpenAPI et migrations sont
non applicables à ce diff exclusivement documentaire selon la politique proportionnée du dépôt.
Les contrôles documentaires/structurels, secrets, limite de lignes, pre-push et CI restent obligatoires.
La livraison Git de cette préparation ne signifie pas que MEP-055 satisfait la DoD : l’acceptation MESS manque.
Validation locale : `npm run quality:targeted` réussi (scope documentaire seul), zéro échec ;
`git diff --check` conforme ; 296 liens locaux des documents modifiés résolus, aucun absent.
Registre MESS recompté : 51 Ouverts, 1 Bloqué (MEP-055), 10 Réalisés ; synthèses alignées.
Le pre-push et la CI du SHA publié sont vérifiables dans Git/GitHub Actions ; aucun résultat cible revendiqué.
