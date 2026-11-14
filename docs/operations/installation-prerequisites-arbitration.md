# MEP-055 — Dossier d’arbitrage des prérequis MESS

Dossier d’atelier du **2026-11-14**, confronté à `origin/main`
`353a0ff434ebfedd0aa12428cdac5853e5e96f1c` après fetch. Source :
[MEP-055 / FEAT-059 / EPIC-013, P1](../backlog/source/mess/f11.md).
**Verdict : dossier prêt à soumettre ; PBI encore Bloqué / N/A.** Aucune approbation D01–D09 n’a été
fournie ni trouvée dans les sources consultées. Aucun entretien ni essai MESS n’est attesté.

## Périmètre de l’atelier

Faire approuver un profil cohérent, attribué, daté et vérifiable, sans construire pour une infrastructure
supposée. Le [contrat initial du 2026-10-19](installation-prerequisites.md) et ses preuves sont conservés.
Contraintes non négociables : on-premise MESS, SQLite permanent local commun API/workers, installation
et usage sans Internet, sans Docker, Node/npm, Vite ni compilation frontend sur cible. Build React en
préparation ; assets locaux, origine HTTPS commune, sessions/CSRF/droits préservés, secrets protégés et
flux internes uniquement approuvés. Le réseau interne nécessaire n’est pas un accès Internet.

Les décisions choisissent le profil ; MEP-054/021 réalise ensuite le contrat/chargement commun, MEP-057–059
l’inventaire/build/wheels, puis package, installation, services et recettes. Ce dossier ne les réalise pas.
C11/MEP-022 conserve objectifs d’exploitation et RACI ; aucun SLA, RPO/RTO ou volume approuvé inventé.

Fiches directement utilisables, avec besoin, contraintes, options/risques, recommandation, incompatibilités,
responsable attendu, question de décision, preuve et consommateurs :

- [D01–D03 : hôte, Python/SQLite/ABI et serveur](installation-prerequisites-runtime-decisions.md).
- [D04–D06 : PKI/TLS, réseau et identités/secrets](installation-prerequisites-security-decisions.md).
- [D07–D09 : chemins/capacité, SMTP et ordonnanceur](installation-prerequisites-operations-decisions.md).

La [matrice décision → responsable → preuve → PBI](installation-prerequisites-validation.md#décisions-indispensables-avant-clôture)
reste dans le document de validation. Les responsables y sont des **fonctions à mandater**, pas des accords acquis.

## Tableau unique de validation D01–D09

Ce tableau recueille les décisions réelles ; les fiches expliquent les choix proposés. Une date de rédaction,
un compte rendu sans approbateur habilité ou une CI verte ne remplace pas une approbation.
Pour chaque décision : valeur exacte, responsable mandaté, date réelle, référence accessible aux exploitants,
approbateur(s) habilité(s) et réserves explicites. Les secrets restent dans leur stockage protégé.

| ID | Choix proposé | Décision MESS | Responsable | Date | Référence d’approbation | Réserves | Statut |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D01 | Candidat Windows Server 2022 x64 ; édition/build/capacité à arrêter | En attente | Infrastructure/exploitation, à mandater | En attente | Non fournie | Compatibilité D02/D03 et capacité C11 | En attente |
| D02 | Candidat CPython standard 3.13.x x64 privé ; SQLite lié/ABI à figer | En attente | Exploitation + contributeur, à mandater | En attente | Non fournie | Binaire, transitives/wheels et confiance non qualifiés | En attente |
| D03 | WSGI derrière frontal TLS homologué ; Waitress à étudier | En attente | Exploitation/sécurité, à mandater | En attente | Non fournie | Produit/version du frontal, proxy/pair et service à qualifier | En attente |
| D04 | PKI MESS si disponible ; confiance et clés gérées hors Internet | En attente | Sécurité/PKI + DNS, à mandater | En attente | Non fournie | FQDN/chaîne/politique/renouvellement inconnus | En attente |
| D05 | HTTPS 443, backend loopback si même hôte ; flux internes explicites | En attente | Réseau/sécurité, à mandater | En attente | Non fournie | Matrice et accès administration à approuver | En attente |
| D06 | Identité API/workers non admin ; frontal et installation distincts | En attente | Exploitation/sécurité + produit, à mandater | En attente | Non fournie | Identités/ACL/stockage et injection des secrets à arrêter | En attente |
| D07 | Code/runtime séparés de config/data/logs/tmp ; backup protégé distinct | En attente | Exploitation/infrastructure, à mandater | En attente | Non fournie | Chemins/volumes/capacité et entrées C11 inconnus | En attente |
| D08 | Relais interne, mode TLS du service MESS homologué | En attente | Messagerie/sécurité, à mandater | En attente | Non fournie | Port/authentification/expéditeur/confiance à arrêter | En attente |
| D09 | Ordonnanceur natif ; deux workers à la minute si délai accepté | En attente | Exploitation, à mandater | En attente | Non fournie | Supervision, horaires et reprise à approuver ; purge non activée | En attente |

Windows Server 2022 et CPython 3.13.x restent des propositions ; ni support cible ni choix MESS affirmés.
Un accord assorti d’une incompatibilité non résolue ne permet pas la clôture ; conserver ses réserves visibles.

## Ordre logique et questions aux responsables

1. **Infrastructure/exploitation : D01/D02/D03 ensemble.** Quel profil homologué exact et quel couple
   runtime/serveur/frontal sont autorisés ? Désigner leurs mainteneurs et recueillir contraintes de durcissement,
   maintenance, modules et distribution hors ligne avant inventaire final MEP-057/059.
2. **Sécurité/PKI, DNS, réseau et messagerie : D04/D05/D08 ensemble.** Quels noms/chaînes/politiques TLS,
   flux/destinations/ports et relais/expéditeur/authentification sont réellement disponibles sans Internet ?
   Qui gère clés, confiance, renouvellement et incidents ? Réconcilier origine publique, proxy et SMTP.
3. **Exploitation, sécurité et produit : D06/D07/D09 ensemble.** Quelles identités/ACL, source de secrets,
   arborescence/volumes et tâches/superviseurs autorise-t-on ? Qui injecte la même configuration, surveille
   les sorties/files et intervient après échec ? Fixer mécanismes et rôles, sans inventer les seuils C11.
4. **Produit/exploitation avec C11 : capacité D01/D07.** Quels usages/volumes, conservation et objectifs
   permettront le dimensionnement et les recettes ? Relever capacité disponible et réserves ; itérer le profil
   si nécessaire, sans attendre la réalisation de MEP-071 pour commencer les décisions d’hébergement.
5. **Revue croisée et mainteneur.** Consigner neuf accords et réserves, résoudre toute contradiction,
   puis présenter une soumission de clôture distincte. Le mainteneur approuve fonctionnellement la clôture
   avant tout changement du registre ; la publication documentaire n’est pas cette approbation.

## Confrontation aux preuves du dépôt

Lecture de F11, registre, [plan](../backlog/planning/pre-mep.md),
[dépendances](../backlog/planning/mess-dependances.md) et
[décisions/C11](../backlog/planning/audit-20261027/decisions-mess.md) : aucun nouvel accord retrouvé.
Le diff `c81d131..353a0ff` ne modifie ni les settings/requirements ni les deux documents du contrat.
Les acquis du 19 octobre restent utilisables ; pas de répétition des audits/mesures déjà démontrés.
Les décomptes/validations initiaux du document de validation sont historiques, pas des indicateurs actuels.
Les omissions du dossier étaient l’absence de fiches motivées, de tableau d’accord et d’explicitation du risque
serveur/proxy. La CI actuelle est sélective, avec exhaustive séparée ; aucune ne qualifie Windows ou MESS.

| Exigence / sujet | Nature et constat vérifié | Preuve / suite |
| --- | --- | --- |
| Python/dépendances | Démontré : trois dépendances directes par intervalles, aucun serveur ni verrou cible | [requirements](../../backend/requirements.txt) ; versions/ABI exactes proposées D02, qualification MEP-057/059 |
| SQLite et chemins | Démontré : base sous backend, DELETE/FULL, timeout 5 s, DEFERRED, CONN_MAX_AGE=0 | [settings](../../backend/config/settings_base.py), [contrat SQLite](sqlite/README.md) ; séparation proposée D07, MEP-054/021 |
| API/workers | Démontré : mêmes modules possibles, variables par processus ; absence de chargeur unique livré | [inventaire](configuration/README.md), [WSGI](../../backend/config/wsgi.py), [ASGI](../../backend/config/asgi.py) ; D06/D09 puis MEP-054/021 |
| HTTP/sessions/CSRF | Démontré : origine exacte, proxy selon REMOTE_ADDR, refus proto/hosts, cookies sécurisés | [settings HTTP](../../backend/config/http_security.py), [middleware](../../backend/config/http_middleware.py) ; D03/D04/D05, recette MEP-034 |
| Assets/frontend | Démontré : build normal en préparation, proxy Vite de développement ; STATIC_URL seul dans le socle | [Vite](../../frontend/vite.config.ts), [build](../../frontend/package.json), settings ; MEP-058/024 pour distribution locale |
| Swagger hors ligne | Démontré : SpectacularSwaggerView et absence de surcharge locale ; défaut CDN de drf-spectacular 0.28.0 déjà audité, relu dans le runtime de préparation | [routes](../../backend/config/urls.py), settings ; écart non corrigé, MEP-057/058/024 et MEP-054/021/025 |
| ABI native | Risque identifié, aucune indisponibilité cible démontrée : PyYAML via drf-spectacular, rpds-py via jsonschema dans la résolution de préparation | Métadonnées des packages installés, pas un verrou cible ; fermeture et wheels exacts MEP-057/059 |
| SMTP/confiance | Démontré : contrôles de cohérence au démarrage, pas de test réseau/certificat à ce stade | [sécurité SMTP](../../backend/config/email_security.py) ; D04/D05/D08 à décider, MEP-034/068 à qualifier |
| Workers/ordonnanceur | Démontré : commandes et boucles ; aucun service/tâche cible livré | [notifications](../architecture/email-notifications.md), [purge](journal-purge.md) ; mécanismes D09 à décider, MEP-063 |
| Capacité/exploitation | À décider MESS : aucune volumétrie, SLA, RPO/RTO ou responsabilité C11 acquise | Décisions/C11 précitées ; qualification charge/reprise MEP-071/072 ultérieure |
| CI/qualification | Démontré : contrôles proportionnés et exhaustive GitHub distincte, pas de preuve d’installation MESS | [politique CI](../quality/ci.md), [workflow exhaustif](../../.github/workflows/exhaustive.yml) ; MEP-032/068 sur cible |

Observation locale de préparation : Python 3.12.10, drf-spectacular 0.28.0, jsonschema 4.26.0,
PyYAML 6.0.3 et rpds-py 2026.9.1 (wheel cp312-cp312-win_amd64). Ces métadonnées identifient des risques
transitifs ; elles ne prouvent aucune disponibilité cp313 et ne figent aucune version cible. Les notices des éditeurs consultées sont liées dans les fiches D01–D03.

## Cohérence transversale et risques à lever

| Croisement | Risque / incompatibilité à contrôler | Action et responsabilité attendues |
| --- | --- | --- |
| D01/D02/D03 | Serveur UNIX sur Windows, wheel/ABI absente, runtime système manquant | Infrastructure/exploitation + contributeur : nomenclature compatible avant package ; aucun serveur déjà retenu incompatible constaté |
| D03/D04/D05 | Waitress sans TLS natif ; filtrage/reconstruction des en-têtes contraire au contrôle Django, origine/port incohérents | Exploitation/sécurité : frontal homologué et essai pair/Host/proto/CSRF/refus ; aucune configuration générique adoptée |
| D04/D05/D08 | Certificat SMTP non reconnu, révocation dépendant d’Internet, relais en clair ou auth non supportée | PKI/réseau/messagerie : confiance et flux internes attribués, essais MEP-034/068 |
| D06/D07/D09 | Bases/configurations différentes, ACL insuffisantes, secrets exposés, services Windows supposés | Exploitation/sécurité : même profil d’exécution, séparation des lecteurs et mécanisme homologué ; réalisation MEP-021/060/063 |
| D01/D07 et C11 | Saturation base/journal/temp/logs/backup, charge non dimensionnée | Infrastructure/exploitation/produit : relever volumes/capacité et réserves ; objectifs C11 puis mesures MEP-071 |
| Toutes / hors ligne | CDN Swagger actuel, dépendance transitive ou composant OS récupéré sur Internet | MEP-057–059/024 : inventaire fermé/empreintes/assets locaux ; MEP-032/068 prouve absence de réseau Internet requis |

Aucun de ces écarts n’est corrigé ici. Ne pas faire passer le profil proposé pour un environnement déjà
compatible : la séparation des chemins, le packaging hors ligne et les services restent à réaliser.

## Acceptabilité et verdict à soumettre

**Given** les prérequis documentés, **When** D01–D09 sont confrontées aux contraintes/validations MESS,
**Then** les choix retenus doivent être cohérents, attribués, datés, vérifiables et compatibles avec Assess Teams.
La [grille C01–C10](installation-prerequisites-validation.md#critères-de-conformité-et-vrais-refus)
conserve les contrôles/refus de recette, sans prétendre les avoir exécutés sur cible.

| Refus canonique | Constat au 2026-11-14 |
| --- | --- |
| Décision non approuvée / preuve absente pour un choix définitif | Refus actif : neuf accords manquants ; aucun choix présenté définitif |
| Version ou environnement incompatible | Compatibilité cible non acquise ; D01/D02/D03 et nomenclature attendues |
| Internet indispensable | Swagger CDN actuel incompatible avec le contrat hors ligne ; distribution corrigée et recette attendues |
| Compilation frontend obligatoire sur cible | Interdite par contrat ; package hors ligne non livré, absence de besoin à prouver ultérieurement |
| Docker ou Node.js requis sur cible | Interdits ; bootstrap de développement exclu, conformité de distribution future non attestée |
| Composante obligatoire sans responsable | Fonctions proposées, aucune affectation MESS formelle ; neuf responsables à mandater |
| Conflit non résolu entre décisions | Pas de décisions rendues à réconcilier ; risques croisés ci-dessus à traiter avant clôture |

**Cas A applicable :** préparation technique soumise, validation MESS absente, clôture fonctionnelle impossible.
MEP-055 reste **Bloqué / N/A** et les indicateurs canoniques restent inchangés. MEP-054 et MEP-057 ne
sont pas débloqués par cette publication ; ils le seront après décisions cohérentes et clôture approuvée,
selon leurs prérequis. Les autres PBI consomment ensuite ces entrées sans clôture automatique.

**Décision à soumettre au mainteneur :** mandater les fonctions ci-dessus et organiser l’atelier D01–D09,
recueillir les approbations dans le tableau unique, puis demander la qualification finale et une approbation
fonctionnelle distincte. Si les accords arrivent, vérifier exhaustivité/compatibilité, aligner le contrat et
soumettre la clôture ; ne jamais modifier le registre par simple déduction technique.
