# MEP-021 — Chargement effectif de la configuration unique

[Contrat acquis MEP-054](unique-contract.md) · [preuves MEP-054](unique-validation.md) ·
[source canonique](../../backlog/source/mess/f10.md).
[Clôture fonctionnelle approuvée le 2026-11-19](unique-closure.md) ; les étapes datées ci-dessous restent historiques.

## Préparation du changement — MEP-021

- Périmètre : consommer le contrat v1 dans les settings production communs aux API, workers et commandes Django.
- Objectif : supprimer les sources concurrentes et refuser toute configuration invalide avant exécution des consommateurs.
- Effets attendus : charger un document complet, résoudre ses chemins depuis son parent et appliquer atomiquement les réglages validés, puis les revalider au démarrage effectif.
- Risques : préserver les protections MEP-009, les constantes SQLite, les modes locaux et les décisions métier sans effet de purge ni de planification.
- Vérification : tests de contrat, processus réels WSGI/ASGI/commandes/workers, refus sans base ni SMTP, diagnostics sans contenu privé et gates du dépôt.
- Fichier : `backend/config/installation.py`
- Fichier : `backend/config/installation.schema.json`
- Fichier : `backend/config/installation_paths.py`
- Fichier : `backend/config/installation_settings.py`
- Fichier : `backend/config/settings_production.py`
- Fichier : `backend/config/startup_security.py`
- Fichier : `backend/tests/installation_helpers.py`
- Fichier : `backend/tests/startup_helpers.py`
- Fichier : `backend/tests/test_installation_contract.py`
- Fichier : `backend/tests/test_installation_paths.py`
- Fichier : `backend/tests/test_installation_processes.py`
- Fichier : `backend/tests/test_startup_secrets.py`
- Fichier : `backend/tests/test_startup_security.py`
- Fichier : `backend/tests/test_http_security_configuration.py`
- Fichier : `backend/tests/test_development_accounts.py`
- Fichier : `backend/tests/test_journal_retention_startup.py`
- Fichier : `backend/tests/sqlite_contention_process.py`
- Fichier : `backend/tests/test_sqlite_configuration.py`
- Fichier : `backend/tests/test_transaction_crash.py`
- Fichier : `backend/tests/test_startup_email.py`
- Fichier : `backend/manage.py`
- Fichier : `backend/requirements.txt`
- Fichier : `backend/notifications/management/commands/send_pending_notifications.py`
- Fichier : `backend/identities/management/commands/send_password_reset_emails.py`
- Fichier : `backend/tests/test_installation_workers.py`

## Exécution prévue et limites

Le JSON Schema embarqué sera une copie exacte du bloc acquis, avec test d'identité pour éviter
une redéfinition. Aucun schéma distant téléchargé ; jsonschema est déjà fourni par le backend.
Les contrôles de structure, chemins et sémantique précèdent l'application aux settings.
Les valeurs privées ne passent ni dans os.environ ni dans les diagnostics. Les fichiers privés
nécessaires sont lus sans écriture ; certificats, ACL, disponibilité SMTP et compte effectif restent
à vérifier sur cible. Les métadonnées de services/backups sont validées sans installer ni planifier.
Les paramètres opérationnels des commandes existantes restent des arguments de commande.

Périmètre de vérification adapté avant modification des harnais multiprocessus : leurs bases
jetables seront référencées dans le fichier commun en production, plutôt que surchargées après
chargement ; les scénarios SQL et les modes développement restent conservés.

Le refus réel de la commande Django interne shell révèle que le répartiteur peut conserver une
erreur de settings puis exécuter une commande sans initialisation. L'entrée manage.py doit donc
valider les settings et le démarrage production avant de déléguer au répartiteur ; les modes
locaux conservent leur fonctionnement. Ce correctif fait partie du refus avant effet de MEP-021.

Le validateur JSON Schema déjà installé transitivement est désormais utilisé directement au runtime.
Son exigence Draft 2020-12 sera déclarée explicitement, sans ajouter de bibliothèque au socle présent.

L'inspection des consommateurs montre que le mode --watch lit actuellement une constante locale
pour sa pause. Seule la pause production sera alimentée par services.delivery_seconds ; la pause
de développement/test restera à cinq secondes, sans changer réservation, livraison ou reprise.

## Utilisation et frontière de responsabilité

En production, fournir `ASSESS_CONFIG_FILE` avec le chemin absolu d'un document v1 UTF-8
identique dans les environnements API, workers et commandes. Retirer les variables historiques
listées dans `backend/config/installation.py`, même vides ou concordantes. Aucun fichier `.env`,
répertoire implicite, fusion ou repli vers les réglages locaux n'est utilisé.
Après provisionnement privé et des répertoires requis, exécuter depuis le backend :
`python manage.py check --deploy`, puis les commandes d'exploitation avec ce même sélecteur.
Les chemins relatifs du document sont résolus depuis son parent physique absolu.
Les secrets sont lus en UTF-8 sans espaces ni saut de ligne, jamais exportés dans l'environnement.

L'import valide tout le document avant application ; le démarrage effectif revalide aussi les
settings, les constantes de protection et l'identité de la source. Un changement de fichier ou
de politique nécessite l'arrêt coordonné et le redémarrage des consommateurs. Il n'y a pas de
rechargement à chaud ni de registre de coordination entre processus indépendamment lancés.
Le lanceur doit fournir le même sélecteur à tous ; la supervision relève des PBI d'exploitation.

`DATABASES.default.NAME`, les protections HTTP/SMTP, limites de connexion, conservation des
journaux, `STATIC_ROOT`, `FILE_UPLOAD_TEMP_DIR` et `TIME_ZONE` consomment les valeurs validées.
Les deux modes `--watch` consomment la fréquence de livraison en production. Les chemins de
logs/backups et les autres métadonnées services restent disponibles dans `settings.INSTALLATION`
pour leurs consommateurs ; aucun serveur, frontal, service, sauvegarde ou ordonnanceur n'est installé.
Les valeurs nulles des backups et `journals.activity=keep` ne permettent aucune destruction.
Les modes développement/test conservent leurs entrées historiques et leur sélection explicite.

## Preuves par critère et revue de contenu

| Critère ou refus | Preuves permanentes |
| --- | --- |
| Contrat acquis et source unique | `test_installation_contract.py` : identité du schéma MEP-054, types, obligations, défauts et toutes les sources concurrentes même vides |
| API, workers et scripts | `test_installation_processes.py` : démarrages WSGI/ASGI/alias, santé/schema/docs HTTP, commandes Django et trois workers sur fichier/base communs, y compris depuis un autre cwd |
| Chemins non ambigus | `test_installation_paths.py` : base de résolution, séparateurs, déplacement, collisions, code/runtime et répertoires synchronisés refusés |
| Refus avant effet | Processus réels : champ absent, valeur invalide et source concurrente refusés ; sentinelles SQLite/réseau/mutations FS ; aucune base créée ; base existante inchangée octet pour octet |
| Application complète | Surcharges effectives de base, limites, static, remise après commit, document ou sélection de source refusées avant service |
| Confidentialité | Contenus JSON et privés absents des diagnostics ; aucune exportation de secrets dans os.environ |
| Protections et modes locaux | Suites startup/HTTP/SMTP/journaux/SQLite conservées ; choix CLI development et cadence locale des deux workers testés |

La préparation a réellement précédé chaque modification technique ; les extensions de périmètre
ont été notées avant adaptation des harnais, de manage.py, du manifest et des pauses des workers.
Le premier gate a refusé des références ajoutées hors du bloc de préparation ; elles ont été
regroupées sans inventer de préalable. Le refus shell a échoué avant correction et passe ensuite.
Le document propriétaire décrit le contrat d'exploitation concerné, sans remplissage artificiel.

Revue : README, règles agents, charte, DoD, stratégie de tests, fondamentaux et API/OpenAPI lus.
Le README produit ne change pas : aucun parcours public ni installation exposée ajouté.
Les pages de configuration, développement, HTTP, connexion, SMTP et mots de passe sont actualisées.
Les preuves historiques MEP-054/009 et l'inventaire de distribution MEP-057 restent conservés ;
jsonschema 4.26 était déjà dans leur fermeture et devient une exigence directe déclarée.
Aucun endpoint, modèle, migration, permission ou décision métier modifié. Les contrôles de ces
domaines et les E2E sont néanmoins exécutés par le plan exhaustif imposé par le dépôt.

Les ACL, groupes effectifs du compte de service, lecteurs synchronisés non identifiables par
leur chemin/environnement, confiance et échéance TLS/SMTP restent à qualifier sur le site cible.
Le chargeur ne sonde ni le relais SMTP ni le frontal ; il ne prétend pas qualifier un site MESS.
Le schéma embarqué doit accompagner le backend distribué ; le packaging reste son PBI propre.
À la livraison initiale : clôture proposée sous réserve d'approbation ; aucun statut canonique changé.

## Résultats locaux avant publication — 2026-11-15

La commande canonique `quality:targeted -- backend` sur les douze suites de chargement,
startup, HTTP, développement, SQLite et crash réussit : **287 tests**. Le complément final des
collisions runtime/releases et frontend/static réussit dans les **31 tests de chemins**.
Les quatre suites nouvelles portent désormais **149 cas permanents**. Ruff lint et format
conformes sur 383 fichiers Python, aucune migration manquante, limite de 200 lignes conforme.

Les fixtures privées sont générées hors sources, même quand le lanceur qualité place TMP/TEMP
sous le worktree ; leurs répertoires uniques sont nettoyés automatiquement. Le refus de secrets
sous les sources reste actif. L'erreur système de résolution est masquée sans masquer le refus.
La campagne exhaustive intermédiaire a été arrêtée avant sa fin pour ce durcissement ; elle
n'est pas utilisée comme preuve complète. Le plan impose repository/backend/frontend/E2E ;
le pré-push doit le réussir sur le candidat resynchronisé, puis la CI indépendante du SHA exact.
Le rapport de publication fournit ces résultats et leur référence ; aucun gate n'est dispensé.

## Ajustement préalable du harnais sous couverture — 2026-11-16

Le pré-push révèle que coverage sauvegarde sa propre base SQLite dans un callback atexit,
après le refus Django ; la sentinelle signalait cette collecte comme un effet applicatif.
Le harnais déjà préparé (`backend/tests/installation_helpers.py`, `backend/tests/test_installation_processes.py`
et `backend/tests/test_installation_paths.py`) gardera la sentinelle pendant le démarrage et les
callbacks applicatifs enregistrés ensuite, puis la désactivera avant les callbacks de collecte
préexistants. Vérification : 21 vrais refus sous couverture et contre-épreuve d'une mutation
applicative à la sortie. Aucune couverture désactivée, aucun chemin SQLite applicatif exempté,
aucune modification des validateurs ni des seuils de publication.

Vérification du 2026-11-16 : **22 tests sous couverture réussis**, soit les 21 refus réels et
la contre-épreuve à la sortie. La collecte de couverture reste active et les mutations
applicatives restent interdites. Les quatre suites de configuration totalisent maintenant
**150 cas permanents**. Les permissions des seuls caches jetables de ce worktree ont été
réparées après mélange des comptes sandbox/utilisateur ; aucun fichier de production touché.

## Préparation de la résolution de resynchronisation — 2026-11-17

MEP-058 publié ajoute les ressources Swagger locales aux settings de production. Le conflit
sur `backend/config/settings_production.py` sera résolu en conservant ces ressources et leurs
protections, avec l'URL publique issue du fichier commun. Aucun contrat de chargement changé.
Vérification : les trois tests Swagger locaux de MEP-058 et les tests de configuration/API
restent dans le backend exhaustif du pré-push, suivi de la CI indépendante du SHA publié.

## Préparation du changement — correction CI MEP-021 — 2026-11-17

Le SHA `8a7371ac8076b6cd6717ed05755c7696bf167696` a passé les quatre gates locaux puis
échoué en CI : trois refus shell reflètent leur marqueur dans la ligne source de la traceback
Python 3.13, bien que le refus ImproperlyConfigured précède la commande. Le test sera corrigé
en séparant la préparation des arguments de l'appel runpy ; les assertions et l'audit restent intacts.
- Périmètre : corriger uniquement la construction du programme de test ; aucun code applicatif changé.
- Objectif : distinguer une ligne source affichée d'une sentinelle réellement exécutée.
- Effets attendus : les mêmes refus détectent les effets réels sur Python 3.12 et Python 3.13.
- Risques : conserver le refus avant effet et la confidentialité, sans masquer les effets applicatifs.
- Vérification : reproduire les trois échecs avec sources en linecache, puis 21 refus sous couverture et contre-test atexit, pré-push applicable et CI indépendante du SHA correctif.
- Fichier : `backend/tests/test_installation_processes.py`
Un test WAL existant a aussi expiré (attente 100 ms, libération prévue après 30 ms) ; son shard est
relancé sans modification pour qualifier cet incident distinct. Aucun timeout applicatif n'est changé.
Le statut canonique MEP-021 reste inchangé ; la clôture attend l'approbation du demandeur.

Résultats : les trois refus shell échouent avant correction et passent après, avec le formateur
traceback utilisant linecache. Les **22 tests sous couverture** (21 refus et contre-test atexit)
passent aussi après correction. Aucune assertion retirée, aucune sentinelle désactivée.
Le shard WAL inchangé réussit à sa relance sur le même SHA (run 44100923741, tentative 2) ;
la marge de temps de ce probe reste sensible à l'ordonnancement, sans modification de SQLite.
La préparation réelle précédait le code ; ses libellés ont été normalisés au format du gate.
Revue documentaire du correctif : propriétaire actualisé ; README, règles, charte, DoD, stratégie,
architecture et API restent pertinents, sans impact produit ni changement du contrat MEP-054.
