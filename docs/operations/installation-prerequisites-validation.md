# MEP-055 — Décisions MESS, conformité et revue

Compagnon du [contrat des prérequis](installation-prerequisites.md), établi le 2026-10-19 à partir de
`a7cb03b`. Les identifiants D01–D09 ci-dessous sont des décisions de ce contrat, pas de nouveaux PBI.
Aucun entretien, accord MESS, test sur cible ou qualification d’installation vierge n’est attesté.

## Préparation de la consolidation du 2026-11-14

- Périmètre : dossier d’arbitrage D01–D09 et confrontation documentaire au dernier `origin/main` (`353a0ff`).
- Objectif : rendre les choix, risques, questions et preuves attendues directement utilisables en atelier MESS.
- Effets attendus : fiches motivées et tableau unique de validation, sans approbation ni clôture implicites.
- Risques : confondre proposition et accord, masquer les écarts hors ligne ou modifier des responsabilités C11.
- Vérification : sources/code et dépendances confrontés, liens et contrôles documentaires ; refus sans preuve conservé.

Aucun fichier technique ne sera modifié. Les preuves de 2026-10-19 restent historiques ; le README public,
les statuts/dates/indicateurs et les autres chantiers ne changent pas. La préparation précède la rédaction
des fiches et de la synthèse ; aucun audit applicatif acquis ne sera réexécuté.

<a id="décisions-indispensables-avant-clôture"></a>

## Correction du mandat — 2026-11-14

La procédure de neuf approbations externes n’a pas été demandée par le responsable produit.
Elle est retirée des prérequis courants. D01–D09 sont conservés comme axes d’analyse technique du
[profil REF-WIN-01](installation-prerequisites.md#profil-technique-de-référence-ref-win-01), sans accord MESS supposé.
Le [dossier publié](installation-prerequisites-arbitration.md) reste historique ; recommandations et preuves
techniques utiles sont conservées, ses conditions d’atelier ne pilotent plus les PBI.

Acceptation actuelle de MEP-055 : prérequis explicites, profil cohérent et contrôlable, adaptations de site,
incompatibilités et refus documentés. Le contrat n’attend pas l’installation complète de ses consommateurs.
La levée Bloqué→Ouvert a été approuvée explicitement le 2026-11-14 par le responsable produit ;
réalisation N/A, aucune clôture ni autre changement de statut autorisé par cette décision.
MEP-054/057 peuvent produire leurs sorties indépendamment de cette régularisation du suivi.

## Cohérence avec les capacités et les PBI consommateurs

| Consommateur | Entrée fournie / responsabilité conservée | Écart à ne pas masquer |
| --- | --- | --- |
| [MEP-054/021 — Configuration unique](../backlog/source/mess/f10.md) | Schéma et chargement commun API/workers/scripts : chemins, origine, proxies, SMTP, secrets/services | Actuellement environnement et constantes ; base fixée dans `backend`, aucune configuration unique livrée |
| [MEP-022 — Opérations](../backlog/source/mess/f11.md) | Affecter responsables et objectifs mesurables, procédures SMTP/purge/sauvegarde/reprise | Définir protocole et rôles de référence ; ne promettre aucun SLA/RPO/RTO ni accord MESS |
| [MEP-057 — Inventaire](../backlog/source/mess/f12.md) | Profil OS/Python, serveur/proxy, workers/ordonnanceur, assets locaux, licences et empreintes | Requirements par intervalles et aucun serveur inclus ; inventaire/verrou cible à réaliser |
| [MEP-058/059 — Frontend et wheels](../backlog/source/mess/f12.md) | Build normal et statiques locaux, wheelhouse complet adapté OS/CPU/Python | Swagger utilise un CDN par défaut ; ne pas assimiler build démo ou bootstrap à la distribution |
| [MEP-024 — Package](../backlog/source/mess/f12.md) | Assembler composants, dépendances, services et notices vérifiables, sans secret ni réseau | Aucun package autonome fourni par ce contrat |
| [MEP-060/061 — Préparation et installation](../backlog/source/mess/f13.md) | Préflight du profil/manifeste/ACL/chemins, refus avant effet destructif, installation locale | Aucun préflight ni installateur développé ici |
| [MEP-062/025 — Initialisation et diagnostic](../backlog/source/mess/f13.md) | Migrations/bootstrap explicite, même SQLite persistante ; health, schéma, statiques et workers | Commandes existantes ≠ installation vierge prouvée ; diagnostics sans secret à démontrer |
| [MEP-063/026 — Cycle de vie](../backlog/source/mess/f14.md) | Services, arrêt/reprise et mises à jour préservant configuration et données | Aucun mécanisme d’exploitation ni déplacement automatique de base ajouté |
| [MEP-064/027/065 — Sauvegarde](../backlog/source/mess/f15.md) | Chemins/droits et capacité pour sauvegarde cohérente, restauration et retour arrière | Ne pas qualifier une copie de base ouverte comme sauvegarde livrée |
| [MEP-032/068 — Recette hors ligne](../backlog/source/mess/f18.md) | Environnement vierge conforme, refus explicites, installation et usage sans Internet | Version/SHA/manifeste exacts et preuves réelles attendus ; cible actuelle inconnue |

MEP-054 et MEP-057 ne dépendent plus de la clôture MEP-055 ; MEP-022 ne dépend plus de 055/054.
Les versions/ABI et composants restent une entrée obligatoire du package ; aucun contrôle technique retiré.
Les mesures SQLite de MEP-039/010/040 n’attestent ni volumétrie ni disponibilité MESS.

## Critères de conformité et vrais refus

Cette grille est une spécification de recette/préflight pour les PBI suivants, **pas le résultat d’essais cible**.
La conformité ne peut être prononcée sur une valeur manquante ; conserver un diagnostic sans secret.

| Contrôle | Cas conforme à démontrer | Cas de refus / qualification suspendue |
| --- | --- | --- |
| C01 — Profil identifié | OS/build/CPU/Python/SQLite identiques au profil de référence versionné et au manifeste | OS/version non retenus, architecture ou ABI différente ou non vérifiée |
| C02 — Hors ligne | Installation puis parcours produit, admin/docs/assets, workers sans sortie Internet | Téléchargement pip/CDN, Docker, Node/npm, Vite, compilation frontend ou asset absent |
| C03 — Serveur | Service de production et routage React/API/admin/statiques locaux, lien profond fonctionnel | Serveur dev, build démo, 404 masquée par SPA, serveur manquant ou module incompatible |
| C04 — TLS/proxy | Chaîne reconnue hors ligne, URL HTTPS, hosts/CSRF/pairs exacts ; faux forwarded refusé | Certificat expiré/non reconnu, HTTP de mutation, wildcard/proxy universel, pair réécrit |
| C05 — Flux | Accès client au frontal, backend limité au proxy, SMTP/DNS/temps internes du profil | Backend exposé aux clients, port occupé/non autorisé, service obligatoire hors contrat |
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

## Revue historique des critères de MEP-055 et de la DoD

Revue du chantier initial du **2026-10-19** : les résultats et décomptes ci-dessous sont historiques,
non des indicateurs recalculés au 2026-11-14. Les conditions D01–D09 de ces revues sont remplacées par la correction du mandat ci-dessus.

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

## Revue historique de consolidation du 2026-11-14

Préparation effectuée dans ce document avant rédaction des fiches ; aucun travail technique entrepris,
aucun écart de procédure constaté. Six documents d’exploitation concernés : contrat/validation existants,
synthèse d’arbitrage et trois groupes de fiches. Leurs responsabilités sont séparées : exigences, preuves
attendues, décisions à recueillir et recommandations. Aucune approbation humaine attribuée à l’agent.

README public, AGENTS/règles, charte, DoD, stratégie de tests, fondamentaux/API et contrats HTTP/SMTP,
SQLite, configuration, notifications et purge relus pour impact ; aucun changement public ou applicatif.
F11, registre canonique, plans/dépendances et décisions/C11 consultés ; statuts, dates et indicateurs
inchangés. Historiques et preuves préexistants conservés ; leurs chiffres datés ne sont pas réactualisés.

Contrôles locaux : `npm run quality:targeted` réussi, scope documentaire seul, zéro échec ;
`git diff --check` conforme, 64 chemins de liens locaux résolus dans les six documents, fichiers <= 200 lignes.
Relecture des refus : absence d’accord bloque toujours ; CDN Swagger encore incompatible avec le hors ligne ;
profil/version/ACL/flux/services non qualifiés ne sont pas déclarés conformes. Aucun test applicatif,
coverage, build ou essai Windows/MESS déclenché pour ce diff documentaire. Pre-push et CI du SHA exact
restent requis par la publication ; leur résultat Git/GitHub ne vaut ni validation MESS ni clôture fonctionnelle.
