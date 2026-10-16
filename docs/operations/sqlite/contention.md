# MEP-010 — Verrous et transactions concurrentes

SQLite demeure permanent en production MESS. [Paramètres MEP-039](README.md),
[mesures acquises](measurements.md) et [atomicité MEP-003](../../architecture/sqlite-transactions.md)
restent le point de départ ; aucune nouvelle campagne de capacité ni changement de moteur.

## Diagnostic établi avant correction

| Opérations exposées | Protection effective et écart constaté |
| --- | --- |
| API organisations, équipes, identités, modèles, questions, passations | `atomic` annule métier et Journal ensemble. Certaines opérations prennent d’abord le verrou d’écriture ; d’autres lisent avant d’écrire et peuvent échouer immédiatement lors de l’upgrade. Le fallback 500 masquait la nature temporaire du refus. |
| Identités, mots de passe et scope des modèles | Les UPDATE préalables prennent le vrai verrou de fichier ; `select_for_update()` seul n’en prend aucun sous SQLite. Les invariants métier restent hors correction générique. |
| Réservation `EmailNotification` | UPDATE conditionnel en autocommit : un seul claim durable avant SMTP. Rejouer tout `deliver_email` serait dangereux après acceptation ; aucune reprise englobante ajoutée. |
| Réservation `PasswordResetDelivery` | Écriture préalable puis relecture et vérifications en transaction ; SMTP ensuite. Une contention arrêtait la passe avec une erreur technique malgré un rollback rejouable. |
| Échéances `deliver_due_schedule` | Écriture préalable, refresh, attente, date et intentions atomiques ; les callbacks réseau interviennent après commit. Une tentative annulée peut être reprise uniquement avant durabilité. |
| Logs HTTP et fin de remise SMTP | Écritures indépendantes du métier ; peuvent aussi rencontrer un verrou. Un Log indisponible ne doit pas changer la réponse, ni provoquer un renvoi SMTP. |

MEP-039 a déjà établi DELETE/FULL, timeout 5 s et DEFERRED ; ils restent inchangés.
Le diagnostic ne prête aucune exclusion de ligne à `select_for_update()` et ne suppose pas WAL.
Finalisation, versions et dernier Admin restent le périmètre MEP-040.

## Corrections appliquées

Le module `config.sqlite_contention` reconnaît uniquement une `OperationalError` Django dont
la cause native SQLite porte le code primaire `SQLITE_BUSY` (y compris ses codes étendus).
Un texte d’exception ressemblant à un verrou, `SQLITE_LOCKED` ou une panne disque n’autorise pas de reprise.

Deux fonctions seulement utilisent `retryable_sqlite_atomic` : `claim_password_email` et
`deliver_due_schedule`. Chacune conserve son bloc atomique et son écriture préalable.
Après une exception, la sortie du bloc Django et son rollback précèdent diagnostic, pause et nouvelle entrée.
La réservation relit état, échéance, nombre de remises et identité éligible ; l’échéance recharge sa date,
son assignation et ses destinataires. Les callbacks enregistrés par une tentative annulée sont supprimés.
La réutilisation de l’objet schedule ne dispense jamais du `refresh_from_db()` avant les préconditions.

| Limite | Valeur et sens |
| --- | --- |
| Tentatives | Trois au maximum, première comprise ; aucun retry HTTP global |
| Pauses | 50 puis 100 ms, après rollback uniquement |
| Fenêtre de reprise | Après six secondes écoulées, une tentative échouée n’en ouvre plus une autre |
| Attente SQLite | Timeout MEP-039 de cinq secondes par attente de verrou ; configuration inchangée |
| Transaction englobante | Aucun rejeu local d’un savepoint, y compris autocommit manuel désactivé : l’appelant doit sortir de sa transaction |
| Commit déjà effectué | Un premier callback interne marque la durabilité avant les callbacks du corps ; leur échec ne rejoue jamais le métier |

La fenêtre de six secondes est un critère d’admission d’une reprise, **pas une deadline**.
Une tentative admise peut la dépasser. Le timeout SQLite concerne une attente, qui peut dépasser cinq
secondes sur ce runtime ; plusieurs instructions et le commit peuvent attendre successivement.
Durée métier, SQL, callbacks et pauses s’ajoutent : aucune promesse de réponse HTTP à cinq, six ou quinze secondes.
Les trois tentatives et deux pauses empêchent une boucle infinie ; aucune équité entre processus n’est garantie.

Les autres API conservent leur refus après rollback, sans rejeu automatique. HTTP 500 et le JSON
`detail` restent le contrat MEP-003. Le message natif est remplacé par :
« La base est occupée. Veuillez réessayer dans quelques instants. »
OpenAPI décrit cette variante ; aucune route, permission, structure ni nouveau code HTTP.

Les trois commandes workers convertissent un BUSY non résolu en `CommandError` compréhensible,
sans reprendre la passe entière, y compris en `--watch`. La fermeture des connexions existante est conservée.
Le superviseur peut redémarrer le processus comme prévu par MEP-004 ; il ne rejoue pas un claim `sending`.
Après une acceptation SMTP suivie d’un refus d’écriture, la réservation reste `sending`, puis suit le
traitement `unknown` existant et la vérification opérateur. Le PBI ne promet pas exactement une remise SMTP.

## Diagnostic d’exploitation

Les warnings du logger `config.sqlite_contention` ne contiennent ni SQL, adresse, contenu, token,
credential ni exception brute : opération statique, résultat, tentative, durée de reprise, code SQLite
et UUID de corrélation HTTP. Ils restent disponibles sur stderr même si le fichier SQLite refuse un Log.
La durée de reprise vaut zéro à la frontière HTTP où elle n’est pas mesurée ; ce n’est pas une latence.
Les Logs HTTP existants conservent leur corrélation et leur traitement des échecs de capture.

| `outcome` | Lecture opérationnelle |
| --- | --- |
| `retry_after_rollback` puis `resolved` | Verrou résolu après reprise sûre, un seul résultat validé |
| `exhausted` | Troisième tentative refusée ; mutation annulée |
| `wait_budget_exhausted` | Fenêtre écoulée après un refus ; pas de nouvelle tentative |
| `non_replayable` | API sans opt-in, transaction englobante ou callback après commit : aucun rejeu |
| `stopped_without_replay` | Passe worker arrêtée ; consulter les événements précédents et les états de file |

Une attente résolue directement par SQLite reste un succès normal, sans événement de reprise supplémentaire.
Un refus API est de la contention, pas un diagnostic de conflit métier MEP-040 ni la preuve d’une panne disque.
En cas de répétition : examiner transactions/lectures longues, chevauchement des workers, âge des files,
latence disque et corrélation ; réduire la concurrence. Ne pas simplement augmenter le timeout.
Ne jamais relancer aveuglément les remises incertaines après SMTP.

## Qualification reproductible

Depuis `backend`, avec le runtime préparé :

```powershell
.venv/Scripts/python.exe -m pytest tests/test_sqlite_contention_operational.py tests/test_sqlite_replay_safety.py
```

Le premier fichier lance onze scénarios avec settings développement **et production** : 22 cas sur
fichiers jetables. Le démarrage production valide ses paramètres réels. La remise immédiate est désactivée pour piloter
les workers ; le transport de courriel est remplacé par un transport local suspendu. Sessions, CSRF, permissions, endpoints, ORM, modèles et Journal
restent réels. Les PRAGMA MEP-039 sont conservés, sauf `busy_timeout=100` ms dans les pairs de test pour
provoquer rapidement les branches ; `test_sqlite_configuration` vérifie toujours 5000 ms dans les deux modes.

`spawn` crée des processus indépendants. Pipes et signaux encadrent lecture, première écriture,
Journal écrit, rollback et SMTP après commit. Aucune ordonnance dépendante d’un simple sommeil.
Les attentes de message sont limitées à 15 s, joins à 15 s, campagne isolée à 60 s ; les enfants restants
sont arrêtés et joints même sur échec. Les temporaires sont propres au test et ne visent jamais une base existante.
Chaque inspection d’invariants se fait avec une nouvelle connexion, après fermeture de tous les pairs
et des connexions Django ; cette connexion d’inspection est aussi explicitement fermée.

| Cas | Invariants vérifiés après fermeture |
| --- | --- |
| Deux API, verrou libéré | Deux créations distinctes, deux activités cohérentes, aucun succès perdu |
| Deux API, verrou prolongé | Une réussite, un refus explicite ; aucune création ni activité du perdant |
| Lecteur bloque le commit API | Équipe et activité déjà écrites puis entièrement annulées |
| API lit puis worker écrit | Upgrade API refusé ; équipe active, aucun Journal de faux succès ; une remise worker |
| Deux workers récupération | Reprise puis claim perdant ignoré ; une seule remise, aucun double succès |
| Deux workers échéance | Une seule avancée et intention, une passation ; second retour `False` après relecture |
| Reprise après verrou d’écriture | Rollback complet avant reprise ; une remise |
| Reprise après refus au commit | Réservation provisoire annulée avant nouvelle tentative ; une remise |
| Reprises épuisées | Trois essais, job encore pending et attempts=0, aucun réseau |
| Précondition modifiée pendant la reprise | Job devenu inéligible : retour skipped, aucun réseau |
| Refus après SMTP | Aucun retry d’envoi ; claim durable sending, attempts=1 |

Chaque fichier passe `integrity_check=ok`, `foreign_key_check` vide et la comparaison
IDs/noms des équipes créées avec les entrées du Journal. Le protocole SMTP refuse une seconde remise imprévue.
Les tests de sécurité complètent par les gardes nested/après commit, fenêtre écoulée,
erreurs non BUSY et sortie lisible des trois commandes. Ils ne remplacent pas la preuve multiprocessus.
Les acquisitions MEP-003/039 et MEP-004 sont exécutées en non-régression.

L’interpréteur intermédiaire capture stdout **et** stderr et attend la fin des auxiliaires `spawn`,
notamment `resource_tracker`, avant de retourner à pytest-cov. La protection MEP-039 contre les fragments
de couverture tardifs reste intacte ; la fusion stricte des trois shards CI n’est pas assouplie.

## Livraison et limites

Les résultats de validation et la reproduction avant correction sont consignés dans
[les preuves MEP-010](contention-validation.md). La CI du SHA publié demeure bloquante.
Le dispositif en vigueur classe transactions/SQLite en exhaustif : frontend et E2E sont donc obligatoires,
sans changement fonctionnel de ces couches. Aucun modèle, migration, dépendance, infrastructure ou moteur ajouté.

Revue documentaire : README, AGENTS/règles, charte, DoD, stratégie/couverture, fondamentaux,
transactions, API/OpenAPI, notifications, référence SQLite, source et registre canoniques.
Leurs seuils et règles ne changent pas. Capacité, stabilité sur machine MESS et recette restent MEP-071 ;
les conflits de finalisation, version et dernier Admin restent MEP-040, sans arbitrage implicite.
