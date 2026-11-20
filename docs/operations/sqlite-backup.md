# MEP-064 — Sauvegarde cohérente SQLite

## Préparation du changement — MEP-064

- Périmètre : automatiser O07 de MEP-022 sur la base configurée par MEP-021, sans restauration ni planification implicite.
- Objectif : conserver un état transactionnel vérifiable pendant les écritures et les éléments privés nécessaires à sa reprise.
- Effets attendus : API backup SQLite, lot exclusif protégé, manifeste sans secret et vérification indépendante sur copie isolée.
- Risques : source altérée, capture incomplète, provenance trompeuse, exposition de configuration ou copie brute qualifiée à tort.
- Vérification : tests de réussite et vrais refus, écritures multiprocessus, intégrité complète/FK et invariants métier ; backend complet au gate SQLite.
- Fichier : `backend/tools/sqlite_backup.py`
- Fichier : `backend/tools/sqlite_backup_bundle.py`
- Fichier : `backend/tools/sqlite_backup_files.py`
- Fichier : `backend/tools/sqlite_backup_manifest.py`
- Fichier : `backend/tools/sqlite_backup_checks.py`
- Fichier : `backend/tools/sqlite_backup_business.py`
- Fichier : `backend/tools/sqlite_backup_inventory.py`
- Fichier : `backend/tests/test_sqlite_backup_failures.py`
- Fichier : `backend/tests/sqlite_backup_helpers.py`
- Fichier : `backend/tests/sqlite_backup_process.py`
- Fichier : `backend/tests/test_sqlite_backup.py`
- Fichier : `backend/tests/test_sqlite_backup_refusals.py`
- Fichier : `backend/tests/test_sqlite_backup_concurrency.py`

La vérification étend la confirmation de protection au répertoire parent utilisé pour sa copie
jetable. La progression facultative n’affiche que des compteurs SQLite plafonnés en fréquence.

Le format empaqueté par MEP-024 distribue `manage.py` et les modules de production. Les dépendances
proviennent du runtime approuvé. Une installation peut donc omettre le fichier de développement
`requirements.txt`. L'essai de compatibilité utilise un backend séparé sans ce fichier.

## Plan de validation préalable

Le composant est un outil opérateur Python autonome ; il consomme le chargeur MEP-021, SQLite,
les migrations et les tables métier existantes. Il n'importe aucun endpoint ni client React.
Tests directs : production du lot, contenu, provenance, fermeture, intégrité, refus et diagnostics.
Intégration : vrais fichiers configurés, schéma migré et écrivains indépendants ; comparaison de
transactions métier/journal et de la source après refus. Gate final : backend complet avec couverture
>= 90 %, statiques, contrôles dépôt et CI indépendante du SHA publié. Frontend/E2E non applicables :
aucun changement d'interface, contrat HTTP, modèle, paramètre global ou comportement métier.

## Contrat opératoire prévu

La configuration, le code et les fichiers externes doivent rester figés pendant la capture ; seules
les écritures SQLite continuent. La racine de sauvegarde configurée doit préexister, être protégée
par ACL et confirmée par l'exploitant. Aucun outil ne publie son contenu : base, configuration,
secrets et inventaire de restitution demeurent privés. Un refus conserve source et anciens lots.
La version sauvegardée sera identifiée par l'empreinte des octets applicatifs conservés, sans
inventer une version de package ni annoncer une qualification de restauration MEP-027.


## Exécuter O07

Depuis le `backend` de la même release immuable et avec le même runtime que l'API :

```powershell
python -m tools.sqlite_backup create --config C:\ProgramData\AssessTeams\config\instance.json --private-storage-confirmed --inventory-confirmed
python -m tools.sqlite_backup verify C:\ProgramData\AssessTeams\backups\UUID --private-storage-confirmed --expected-manifest-sha256 EMPREINTE_CONSERVEE
```

Le chemin de destination est exclusivement `paths.backups` du contrat MEP-021. Il doit préexister,
être inscriptible et protégé pour le compte exploitant habilité, hors dépôt, code et données actives. Le drapeau
`--private-storage-confirmed` atteste le contrôle des ACL Windows effectué par l'exploitant ; l'outil
ne certifie pas ces ACL. Sur POSIX, les permissions de groupe/autres sont refusées en complément.
L'empreinte du manifeste affichée après succès est à conserver séparément dans le suivi protégé.
La commande `verify` exige cette empreinte antérieure, notamment après transfert du lot complet.
Son répertoire parent doit aussi être protégé et inscriptible pour la copie temporaire isolée.

`--inventory-confirmed` atteste que configuration, release, runtime, ressources et producteurs de
fichiers externes sont figés. Les écritures SQLite peuvent continuer. Toute autre donnée persistante
nécessaire doit être fournie par `--required-file CHEMIN` (répétable), après inventaire de l'instance.
Le runtime configuré doit comprendre les dépendances effectivement utilisées ; son acquisition et
sa qualification restent celles du package approuvé. L'outil ne remplace pas la qualification I01.
Aucun intervalle, nettoyage, écrasement, réparation, démarrage SMTP ou restauration n'est effectué.

## Contenu et restitution

Chaque succès crée un nouveau répertoire UUID, après travail dans `.incomplete-UUID` exclusivement.
La source est ouverte en lecture seule par URI SQLite ; la copie utilise `Connection.backup`, par
pas de 128 pages. `--timeout` borne l'opération SQLite (300 secondes par défaut, borne technique
modifiable, aucun objectif MESS). `--progress` affiche les compteurs SQLite sur stderr.
En contention durable, interrompre puis diagnostiquer avant reprise.
Les contrôles ne portent que sur un fichier copié dans un répertoire temporaire isolé et supprimé.

| Élément | Préservation et vérification |
| --- | --- |
| SQLite | `database.sqlite3`, fermé avant SHA-256 ; jamais une copie brute ni un assemblage des fichiers actifs |
| Configuration | JSON original MEP-021, références privées de clés Django/SMTP, certificat et clé TLS, octets conservés |
| Application | Sources Python/migrations, schéma JSON et requirements si présents dans le backend exécutant l'outil ; frontend et statiques configurés |
| Runtime | Tous les fichiers du répertoire `paths.runtime`, plus versions réellement chargées Python/Django/SQLite |
| Autres fichiers | Tous les `--required-file` de l'inventaire ; aucune référence seule considérée comme restitution |
| Inventaire privé | `private-inventory.json` : origine réelle SQLite, chemins d'origine et de restitution, tailles et SHA-256 individuels, durée SQLite, nonce aléatoire |
| Manifeste | `manifest.json` : UUID, méthode, UTC de capture, SHA-256 SQLite/application/schéma/migrations/inventaire et `restore_qualified=false` |

Les fichiers capturés sont stockés sous `files/NNNNN` pour éviter les chemins Windows excessifs.
L'inventaire privé associe ces noms courts aux chemins de restitution ; aucune extraction automatique
n'est livrée ici. La version applicative est **adressée par contenu** : `application_sha256` agrège
les chemins de restitution, tailles et empreintes des sources, frontend, statiques et runtime conservés.
Elle identifie les octets sauvegardés, sans confondre un numéro de version déclaré avec une preuve.
Les migrations appliquées et le schéma SQL sont relus depuis la copie SQLite, puis hachés ; les
migrations du produit doivent correspondre exactement aux fichiers applicatifs sauvegardés.

Le manifeste refuse tout champ libre supplémentaire : ni chemin privé, ni contenu de configuration,
ni empreinte individuelle de secret. Son empreinte d'inventaire porte sur l'ensemble privé salé par
un nonce aléatoire de 256 bits, pas sur un secret isolé. Base, fichiers et inventaire restent sensibles :
ne jamais joindre le lot à une issue, au dépôt, à un diagnostic public ou à une publication CI.
L'intégrité repose sur l'empreinte de manifeste conservée séparément ; ce mécanisme n'est pas une
signature d'origine. Une réécriture de toutes les empreintes et de leur ancre n'est pas authentifiée.

## Refus et limites

Un code non nul et `REFUSED CODE_FIXE` signalent l'échec sans contenu privé. Un succès affiche
seulement UUID, empreinte du manifeste et absence de qualification de restauration. `Ctrl+C` renvoie
130 et `INTERRUPTED`. Les lots `.incomplete-*` ne sont jamais vérifiables comme lots terminés.
Les anciens lots et la source sont préservés ; isoler les incomplets et décider leur retrait privé.
La réserve d'espace préalable est indicative : une croissance concurrente ou un disque plein reste
un refus sûr, sans promesse de capacité. Les liens symboliques/jonctions et fichiers absents sont refusés.

`quick_check(1)`, `integrity_check` complet, FK, appartenance structurelle organisation/modèle/équipe,
lignées des questions, complétude des passations terminées, provenance des journaux et états des files
sont vérifiés sans réparation. Les noms historiques et utilisateurs légitimement supprimés restent
admis. Aucun contrôle ne peut reconstruire un événement métier arbitrairement supprimé avant capture ;
la preuve transactionnelle sous écritures est apportée par le banc concurrent.

Une copie locale ne couvre pas la perte physique du disque. Transférer le lot complet vers un stockage
séparé protégé, avec le même régime de confidentialité, puis exécuter `verify` avec l'ancre antérieure.
La qualification de reprise exige encore O08/MEP-027 ; décisions de point, effets externes SMTP,
mesures de reprise et recette MESS restent à leurs PBI. Les essais automatisés ne sont pas un PV MESS.

[Preuves et revue documentaire](sqlite-backup-validation.md) · [O07/O08 de MEP-022](operations-continuity.md).
