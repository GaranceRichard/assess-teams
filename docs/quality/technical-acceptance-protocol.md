# MEP-031 — Protocole commun, données et commandes

Retour au [cahier](technical-acceptance.md). P0, G et R0 sont normatifs pour toutes les fiches TEC.

## P0 — Dossier préalable de chaque variante

- Candidat : version, SHA Git complet, package/manifeste et empreintes SHA-256 des archives,
  runtime et outils ; provenance et versions du schéma/migrations. Aucune substitution par le SHA de rédaction.
- Environnement : identifiant du clone/hôte, OS/build/CPU/RAM/disque, Python/SQLite, serveur/frontal,
  navigateur, horloge UTC et fuseaux ; chemins et identité OS approuvés D01–D09.
- Configuration : référence/version expurgée, settings production, origine, hosts, pairs transport,
  flux autorisés et politique de conservation ; attester les secrets présents sans valeur ni empreinte de secret.
  Vérifier que l'API, les workers et commandes utilisent la même configuration et le même fichier SQLite.
- Rôles : exécutant habilité OS, responsable recette, observateur, autorité d'incident et approbateur désignés
  par MEP-022 ; comptes applicatifs distincts, mots de passe privés remis hors des preuves.
- État initial : services/PID/tâches, état des files, compteurs et relevé des objets/relations/activités,
  point de sauvegarde cohérent, contrôles d'intégrité et espace disponible. Documenter l'état spécifique de la fiche.
- Paramètres : décision signée, valeur/unité, instrument/version, source et formule de mesure,
  fenêtre, bornes de début/fin, critère d'échec et condition d'arrêt approuvés avant toute injection.
  Les entrées manquantes restent `À définir — C11 / MEP-022` selon la [matrice](technical-acceptance-dependencies.md).
- Réseau et sécurité : isoler cible/clones, limiter SMTP à la boîte de recette ; autoriser les injections
  seulement dans ce périmètre. Ne jamais désactiver la vérification TLS pour fabriquer un succès.

Précondition absente : variante non lançable, à consigner Bloqué dans un futur PV ; le cahier reste Non exécuté.
Un scénario conditionnel n'est pas une procédure d'exploitation livrée. Sa finalisation bloque la clôture MEP-031.

## G — Jeux fictifs reproductibles

| Jeu | Constitution et état à relever |
| --- | --- |
| G-A | Reprendre [G0–G3 de MEP-030](functional-acceptance-data.md) via les écrans : Alpha/Beta, quatre rôles, deux Admins Alpha, Coach assigné/non assigné, Viewer, invité non activé. Relever les IDs réellement créés et les sessions distinctes. |
| G-S | Depuis G-A, modèle à deux questions, run commencé [5, non noté], run complet [0,10] sur clones distincts, brouillon et active de même famille. Pour dernier Admin, conserver exactement deux Admins actifs dans la variante incompatible ; trois dans la variante compatible. |
| G-N | Adresses `rec-…@example.test` du jeu G0 exclusivement vers relais/boîtes de recette ; une invitation, une récupération et une échéance arrivant réellement à date. Relever IDs de jobs, planning, run, activité et `Message-ID` dans un relevé protégé. Aucun token archivé. |
| G-J | Une activité métier et son Log corrélé, un refus HTTP, Log global et organisation Beta ; lots techniques avant, à et après la borne de purge. Préparation historique sur clone fictif identifié par MEP-034, sans changer l'horloge de l'hôte ; aucun outil cible de datation livré ici. |
| G-R | Clone de G-A/G-S/G-N/G-J avec inventaire signé des notes, lignées, versions, auteurs/dates, relations, activités, files et migrations ; jalon métier identifiable avant backup, jalon après backup et jalon après upgrade. Les volumes additionnels relèvent de C11, pas de ces petits jeux de contrôle. |

Ces cardinalités vérifient des invariants, pas une capacité MESS. Pas de seed développeur sur cible,
de données réelles ni de partage avec les PV fonctionnels. Exporter le relevé d'état par une lecture autorisée
ou un outil d'inspection approuvé sur clone ; l'empreinte brute d'une base active ne prouve pas l'absence de mutation métier.

## Commandes présentes

Les commandes suivantes sont vérifiées dans le dépôt de référence ; elles ne sont pas exécutées par ce PBI.
Depuis `backend`, avec le Python **du service**, son injection privée et ses chemins définitifs :

```text
python manage.py check --deploy --settings=config.settings_production
python manage.py showmigrations --plan --settings=config.settings_production
python manage.py send_pending_notifications --settings=config.settings_production
python manage.py send_password_reset_emails --settings=config.settings_production
python manage.py send_due_evaluation_notifications --settings=config.settings_production
python manage.py purge_journals --settings=config.settings_production
```

`python` désigne le chemin absolu approuvé D02/D07, pas un exécutable arbitraire du PATH.
Les deux commandes de remise acceptent `--watch` ; l'échéance est une passe unique.
`showmigrations` inspecte le schéma ; les migrations/bootstrap cible restent à orchestrer par MEP-062.
Le [contrat HTTP](../architecture/http-security.md) tolère uniquement `security.W005` et `security.W021`
dans `check --deploy`. Un check valide ne prouve ni PKI, ni SMTP disponible, ni santé globale.
La purge sans option simule seulement si une durée technique finie approuvée est injectée ; `keep` la refuse.

Sources : [manage.py](../../backend/manage.py),
[notifications](../../backend/notifications/management/commands/send_pending_notifications.py),
[récupération](../../backend/identities/management/commands/send_password_reset_emails.py),
[échéances](../../backend/assessments/management/commands/send_due_evaluation_notifications.py),
[purge et options](../operations/journal-purge.md).
Les commandes SQL de diagnostic `PRAGMA journal_mode`, `synchronous`, `busy_timeout`, `foreign_keys`,
`quick_check(1)` et `foreign_key_check` proviennent des [contrats SQLite](../operations/sqlite/README.md)
et de [purge](../operations/journal-purge.md) ; les lire sur une connexion Django au fichier désigné,
jamais sur une base créée implicitement par une erreur de chemin.

Depuis le **poste de contribution**, pas la cible MESS sans Node/npm :

```text
git rev-parse HEAD
npm run quality:plan -- --base origin/main --head HEAD
npm run quality:targeted
npm run quality:qualify -- SHA_COMPLET
npm run quality:promote -- SHA_COMPLET RUN_ID
npm run publish
```

`SHA_COMPLET` et `RUN_ID` sont des champs à remplacer par les valeurs réelles ; les autres commandes
ne comportent aucun paramètre futur inventé. Sources : [package.json](../../package.json),
[validation](validation-costs.md), [qualification](../../scripts/quality/qualification.mjs).
Installateur/préflight, service OS, backup/restore/rollback et générateur de charge cible : commandes finales
absentes, propriétaires dans la matrice ; aucune commande `npm dev`, Vite ou bootstrap local ne les remplace.

## R0 — Remise en état et refus

Arrêter l'injection, libérer et fermer chaque connexion/processus d'essai ; retirer uniquement les règles
réseau/certificats/tâches ajoutés sur le clone. Rétablir la configuration approuvée et son ordre de démarrage.
Vérifier PID, absence de tâche doublée, intégrité, état métier et files ; une remise incertaine exige la vérification
SMTP de TEC-11, jamais un renvoi automatique. Faire attester l'état sûr par l'exploitant.
Si l'intégrité ou la remise en état ne sont pas démontrées : isoler le clone, arrêter la campagne et conserver
les preuves ; restaurer seulement par une procédure livrée et vérifiée (TEC-15), ou recréer le clone autorisé.
Ne jamais supprimer un journal SQLite auxiliaire, corriger une table ou réinitialiser le lot d'un autre PV.

## Preuve et verdict

Créer un enregistrement par scénario **et par variante**, sans remplir de résultat anticipé :

```text
PV/campagne ; TEC-ID/variante ; consommateur ; date UTC/exécutant/relecteur
Candidat version/SHA complet ; manifeste/empreintes ; clone/configuration expurgée
Contrat/exigence/décisions approuvées ; paramètres et instruments/version
Rôles/jeu/IDs ; état initial ; préconditions satisfaites ou blocage
Actions/commandes exactes ; injection/horodatages ; écarts au protocole
Attendu/seuil/formule ; observé/mesures brutes ; codes HTTP et processus
Refus attendu et absence d'effet interdit ; comparaison avant/après
Pièces/empreintes/localisation protégée ; anomalie ou PBI existant ; retest
Remise en état vérifiée ; signataire/date ; verdict : Non exécuté | Bloqué | Passé | Échoué
```

Conserver logs expurgés, compteurs, mesures, états et captures demandés par la fiche ; corréler avec
`X-Correlation-ID` quand disponible. Expurger cookies, headers sensibles, credentials, liens signés,
adresses réelles et traces réseau brutes contenant des secrets. Sauvegardes/configuration privées restent
hors dépôt ; le PV conserve leurs références protégées et empreintes des artefacts non secrets.
Durée/accès des preuves : décision MEP-022 requise. Un refus n'est conforme que si son diagnostic attendu
et l'absence d'effet interdit sont observés ; une CI verte ne change aucun verdict de ce cahier.
