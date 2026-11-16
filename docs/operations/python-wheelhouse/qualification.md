# MEP-059 — Qualification des wheels et verdict

[Préparation](README.md) · [protocole](protocol.md) · [journal réel](installation.log) ·
[source canonique](../../backlog/source/mess/f12.md).

## Pièces et environnement contrôlés

Travaux depuis `6aec11f` (MEP-057), indépendants de MEP-021 et MEP-058 ; aucun changement applicatif.
Les quinze wheels sont versionnés, sans reconstruction, avec les mêmes noms, versions et SHA-256 que MEP-057.
Total : 10 588 058 octets ; SHA-256 du verrou versionné (octets LF dans Git) :
`1c8a11afdaba05eebbe1696d45cf3e1f1963b5483e147af76ad1345892698553`.
Les fins de ligne CRLF d’un checkout Windows ne changent ni les pins ni les empreintes des wheels.
La fermeture est Django, DRF, Spectacular, Waitress et leurs onze transitives ; aucun extra optionnel.
Le packaging utilisé pour lire métadonnées et marqueurs est celui de pip sur le poste de préparation.

Banc effectif : Windows NT 10.0.26200 AMD64 ; CPython standard 3.13.17, 64 bits, MSC v.1944,
GIL standard, ABI cp313 ; interpréteur privé extrait de l’archive MEP-057 contrôlée par SHA-256.
`python.exe` : `7c2fc2b303a4ee3cc14cc17b47bc6e8bca98c78792edd123b846a560da44b203`.
Poste de préparation : Python 3.12.10, pip 25.0.1 ; aucun de ces outils n’est ajouté au wheelhouse cible.
Il s’agit d’un environnement Windows x64/cp313 compatible pour qualifier les wheels ;
ce n’est ni Windows Server 2022 effectivement relevé, ni le runtime corrigé final, ni un site MESS.
Le journal conserve explicitement `runtime_distribution_accepted: false`.

## Preuves par critère canonique

| Critère MEP-059 | Résultat et preuve bornée |
| --- | --- |
| Wheelhouse complet | PASS : quinze archives livrées, liste exacte sans ajout/omission, quatre racines et fermeture entière vérifiées depuis les METADATA |
| Compatible OS/Python cible | PASS pour les wheels Windows AMD64 / CPython standard 3.13 : tags filename/WHEEL, Requires-Python, contraintes transitives et installation/import réels sur ce banc ; qualification du runtime final distincte ci-dessous |
| Versions identifiées | PASS : verrou exact égal à celui de MEP-057 ; les quinze distributions réellement installées correspondent à ces pins |
| Empreintes identifiées | PASS : SHA-256 recalculé des quinze archives et comparé à la provenance immuable inventoriée ; aucune nouvelle résolution flottante |
| Licences identifiées | PASS : droits/attributions MEP-057 réutilisés, 26 textes originaux hachés dans les wheels, conservés intégralement ; Waitress ZPL-2.1 et tzdata Apache/IANA distingués |
| Installation locale sans téléchargement | PASS : installation pip véritable dans un répertoire inexistant, quinze archives locales traitées, `NETWORK_ATTEMPTS=0`, imports provenant tous de cette installation |
| Sans résolution réseau | PASS : `--no-index --no-deps --only-binary=:all: --require-hashes`, cache et contrôle de version pip désactivés, options isolées et audit réseau bloquant |

Le graphe est validé avant l’installation sans résolution transitive. Les marqueurs Windows/3.13
incluent tzdata et excluent typing_extensions ; le Python 3.12 de préparation ne décide pas ce graphe.
Les 26 empreintes de notices et les preuves d’imports PE restent dans les documents propriétaires MEP-057,
sans dupliquer leurs tables ni réécrire les droits. Les archives originales constituent aussi les textes livrés.
La revue des METADATA et des textes détecte une erreur de table : asgiref 3.13.0 était étiqueté MIT,
mais son champ `License: BSD-3-Clause` et ses trois clauses BSD établissent BSD-3-Clause.
La préparation de cette correction documentaire précède l’édition de python.md ; aucun octet de licence,
version, pin ou empreinte de MEP-057 ne change. Les quatorze autres déclarations/textes sont rapprochés,
y compris les BSD génériques et le choix uritemplate.
La preuve n’est ni une simple extraction ZIP ajoutée au sys.path, ni un dry-run pip : l’installation pip
est effective et ses METADATA finales sont confrontées au verrou.
Les probes exercent PyYAML natif, HashTrieMap rpds, JSON Schema et tzdata America/Toronto.

## Vrais refus vérifiés

Dix tests passent ; le cas complet est positif et les autres contrôlent les refus réels suivants :

| Cas de refus | Observation |
| --- | --- |
| Wheel obligatoire manquante | PyYAML retiré du wheelhouse copié : commande verify en échec avant installation |
| Wheel altérée | Un octet Waitress modifié : SHA-256 invalide, refus avant pip |
| Wheel incompatible | Nom PyYAML substitué en cp312 : tag incompatible au contrôle de métadonnées ; liste canonique également refusée |
| Refus pip ABI réel | Wheel PyYAML cp313 originale présentée au vrai Python 3.12.10 : pip sort en erreur « is not a supported wheel on this platform », `NETWORK_ATTEMPTS=0` ; aucune installation réalisée |
| Interpréteur incompatible | Exécutable Python 3.12 réel refusé pour les wheels cp313 ; la CI Linux vérifie également sa différence réelle d’OS |
| Résolution non reproductible | Pin flottant, version divergente ou entrée supplémentaire non épinglée refusés |
| Archive non inventoriée | Ajout d’un wheel inconnu refusé par la liste exacte |
| Transitive absente/incompatible | Graphe sans PyYAML ou avec asgiref 3.7.0 refusé avant installation |
| Notice absente | Licence Waitress effectivement retirée de l’archive copiée : lecture impossible et empreinte globale invalide |
| Téléchargement implicite | urllib.request HTTPS refusé par audit avant connexion ; ce refus ne dépend pas d’une panne réseau |

Le gate repository exécute ces mêmes tests ; le test des scopes vérifie qu’un échec de ce contrôle bloque le gate.
Le test de tag cp312 substitue un nom sur une copie : aucune autre wheel n’est présentée comme téléchargée.
L’archive livrée garde toujours son nom et son hash cp313 d’origine ; le Python incompatible est, lui, réellement exécuté.
Le refus pip supplémentaire utilise offline_pip.py avec l’interpréteur de préparation 3.12 et le chemin
de la wheel PyYAML livrée, `install --no-index --no-deps --only-binary=:all: --require-hashes --target <neuf>`.
Il complète les dix tests automatisés par un rejet effectif de la wheel native, sans artefact de substitution.

## I01 — Runtime corrigé non encore disponible

**I01 reste ouverte et bloquante pour un candidat de distribution accepté.**
Python 3.13.17 est utilisé uniquement pour qualifier ABI et wheels ; son refus de distribution acquis en MEP-057 demeure.
Aucune acceptation de risque, qualification sécurité du runtime, livraison de cet interpréteur ou nouvelle provenance n’est décidée.
Le runtime corrigé Windows identifié, ses empreintes, sous-composants, notices et ABI mesurée restent à obtenir.
La source 3.13.18 inventoriée n’est pas transformée en un binaire Windows disponible.
L’attente de sonde sur le runtime final mentionnée dans runtime.md de MEP-057 n’est **pas acquise** par ce banc.
Rejouer installation, fermeture et imports sur le runtime corrigé retenu avant d’accepter ce candidat final ;
une différence ABI/OS ou de métadonnées qui invalide les preuves impose de corriger/requalifier les wheels concernés.
Aucun runtime refusé n’est renommé candidat accepté et aucun assemblage MEP-024 n’est réalisé.
La réserve I03 sur Windows Server/site réel demeure également ; les seules preuves OS sont celles du banc effectivement exécuté.

Les critères de préparation des wheels sont démontrés sur l’environnement compatible demandé.
Aucune incompatibilité des quinze wheels n’est constatée ; cette conclusion ne qualifie ni sécurité ni compatibilité
d’un runtime final encore absent. Une distribution autonome reste refusée tant que cette preuve manque.

## Revue documentaire et DoD

La préparation d’exploitation a été écrite avant les scripts et les archives ; celle de qualité avant
l’intégration du contrôle aux gates, puis étendue avant l’adaptation du test de scopes existant.
Documents propriétaires adaptés : exploitation pour la préparation des dépendances, qualité pour le gate.
README produit, AGENTS, règles agents, charte, DoD, stratégie de tests, architecture fondamentale,
contrat API/OpenAPI, profil d’installation et politique documentaire examinés : aucune évolution produit,
API, modèle, configuration, migration, installation exposée ni règle de publication.
README produit inchangé, index docs enrichi ; versions, empreintes et notices MEP-057 préservées,
avec correction explicite de sa seule mention de licence asgiref.
Aucun raffinement repris ; aucun statut canonique modifié, ni PR, ni travail MEP-021/058/024 ajouté.

Tests fonctionnels positifs/refus et sonde d’intégration réelle présents ; responsabilités séparées,
fichiers maintenus sous 200 lignes, lint/format des nouveaux scripts contrôlés, pas de secret ni runtime privé versionné.
Pas de nouveau contrat API, modèle, migration ni parcours métier à ajouter ; le plan conservateur impose néanmoins
backend/frontend/E2E complets et couvertures >=90 %, sans dérogation ni contournement.
Le journal est une sortie d’exécution dont seuls les chemins du worktree sont normalisés.

Verdict fonctionnel : **préparation des wheels qualifiée ; clôture fonctionnelle MEP-059 proposée au seul
périmètre canonique des dépendances Python**, sans levée I01 ni acceptation d’un runtime final.
La DoD de livraison exige encore le succès des validations locales, du pré-push et de la CI du SHA exact.
Le rapport final confirme ces gates ; toute incompatibilité réelle ou gate rouge interdit de déclarer le PBI réalisé.
Le statut canonique attend l’approbation explicite de l’utilisateur.

## Validations locales finales — 2026-11-16

`npm run quality:targeted` : PASS sur les quatre scopes exhaustifs requis, sans échec final.
Backend : 1 604 tests passés, couverture totale 97,53 % ; lint, format et migrations conformes.
Frontend : 499 tests dans 120 fichiers ; statements 94,97 %, branches 93,55 %, fonctions 96,47 %, lignes 95,81 %.
Lint, format, typecheck et build frontend : PASS. E2E : 155 parcours produit et 10 parcours démo passés.
Repository : lignes, secrets, cohérence, préparation documentaire, tests des scripts et scopes : PASS.
Les dix tests propres au wheelhouse passent, ainsi que l’installation réelle et le refus pip ABI documentés ci-dessus.
Ruff check et format des cinq scripts de distribution : PASS ; liens documentaires locaux vérifiés.

La reprise a détecté un processus de validation terminé ; seul son verrou périmé a été retiré après contrôle du PID.
Un passage de la fixture documentaire a détecté un changement d’état Git ; sa reproduction isolée,
puis le gate complet ont passé sans modification ni contournement de ce test existant.
La preuve backend précédente n’étant plus réutilisable selon son empreinte, la campagne complète a été rejouée.
Ces validations locales ne remplacent pas le pré-push ni la CI indépendante du SHA effectivement publié.
