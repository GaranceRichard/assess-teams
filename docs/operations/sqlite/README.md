# MEP-039 — Référence de concurrence SQLite MESS

SQLite reste définitivement le moteur de production. Cette référence qualifie les paramètres ;
les [corrections MEP-010](contention.md) et la [qualification MEP-040](critical-conflicts.md)
complètent cette référence pour les refus techniques et les invariants métier critiques.
[Mesures et protocole](measurements.md) ; [résultats bruts JSONL](mep-039-measurements.jsonl).

## Configuration appliquée

Le [socle Django](../../../backend/config/settings_base.py) impose les mêmes valeurs en développement
et production, sans variable nouvelle, dépendance supplémentaire, serveur ou accès Internet.

| Paramètre | Référence | Justification / limite |
| --- | --- | --- |
| Moteur / fichier | `django.db.backends.sqlite3`, `backend/db.sqlite3` | Fichier local partagé par API et workers sur une même machine |
| `OPTIONS.timeout` | 5 secondes | 100 ms refuse un verrou de 200 ms ; 1 s et 5 s attendent avec succès. Conserver 5 s laisse une marge aux rafales ; reprises bornées MEP-010 distinctes |
| `OPTIONS.init_command` | `PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;` | État explicite, journal rollback qualifié ; synchronisation durable conservée |
| `OPTIONS.transaction_mode` | `DEFERRED` | Conserve les frontières MEP-003 et leurs savepoints ; une lecture préalable peut rendre l’attente de verrou inopérante |
| `ATOMIC_REQUESTS` / autocommit | `False` / défaut Django `True` | Blocs métier explicites ; aucune transaction élargie à toute requête |
| `CONN_MAX_AGE` | 0 | Connexion fermée à la fin d’une requête ; coût de réouverture mesuré, pas de pool |
| `CONN_HEALTH_CHECKS` | défaut Django `False` | Pas de connexion HTTP persistante à contrôler |
| `foreign_keys` / `locking_mode` / `read_uncommitted` | Django `ON` / SQLite `NORMAL` / `OFF` | Intégrité et isolation conservées ; valeurs vérifiées à la connexion |

Le timeout est une attente SQLite, pas une borne HTTP de cinq secondes : les expirations mesurées
atteignent 5,62 s sur ce poste. Un refus d’upgrade après lecture peut au contraire être immédiat.
Il ne corrige ni transaction longue ni conflit métier ; les reprises opt-in bornées relèvent de [MEP-010](contention.md).

## Choix du journal et des transactions

WAL permet le commit d’un écrivain malgré un lecteur actif, contrairement à DELETE dans nos essais.
Il garde un seul écrivain et ne supprime pas les refus après lecture. Les réouvertures de connexion
réduisent aussi son bénéfice dans cette charge. Il n’est pas retenu sur le runtime mesuré SQLite 3.49.1 :
le [défaut WAL-reset documenté par SQLite](https://www.sqlite.org/wal.html#walresetbug)
concerne les connexions concurrentes et peut corrompre le fichier. SQLite annonce un correctif en
3.51.3 et ultérieures, avec backports 3.44.6 et 3.50.7. Les essais WAL utilisent uniquement des fichiers jetables.
Tout futur choix WAL exige un runtime corrigé, des mesures sur la cible et une procédure de checkpoint/backup.
Il ne nécessite jamais un changement de moteur.

`IMMEDIATE` prend le verrou d’écriture dès l’entrée dans une transaction, y compris avant une lecture.
Ce comportement est exercé par les probes `BEGIN IMMEDIATE` : attente possible puis refus borné.
Le généraliser modifierait tous les blocs `atomic`, y compris ceux qui ne font finalement qu’une lecture.
MEP-039 conserve donc `DEFERRED` ; [MEP-010](contention.md) traite les refus sans modifier ce choix.
`EXCLUSIVE` n’est pas retenu : aucun besoin d’exclure davantage les lecteurs n’est démontré.
Les [notes Django SQLite](https://docs.djangoproject.com/en/5.2/ref/databases/#sqlite-notes)
décrivent ces modes, l’attente et les limites de concurrence.

## Connexions API et workers

Chaque processus/thread Django ouvre sa propre connexion au même fichier ; ne pas partager une connexion
entre processus ni la créer avant un fork. La fermeture HTTP relève du cycle de requête Django.
Dans les deux commandes `send_pending_notifications` et `send_password_reset_emails`,
`close_old_connections()` est appelé avant/après chaque passe, aussi en cas d’exception.
Avec `CONN_MAX_AGE=0`, les connexions sont libérées avant les cinq secondes de sommeil en mode `--watch`.
La connexion est réutilisée pendant une passe (cent jobs maximum), sans garder de transaction pendant SMTP.
La commande quotidienne `send_due_evaluation_notifications` termine son processus après la mise en file.

Les workers conservent leurs réservations conditionnelles existantes, sans réimplémentation.
Les intentions sont validées avec le métier ; le réseau intervient après commit.
Les logs HTTP peuvent écrire même pour une lecture API : compter ces écritures dans la charge réelle.
Le test API + deux workers sur fichier vérifie une passation complète pendant un envoi SMTP suspendu,
un second claim refusé (`skipped`), puis la remise, avec notes et activité métier uniques.
La fermeture des connexions ne change ni la réservation, ni les règles de remise MEP-004.

## Verrous réellement observés

`select_for_update()` n’émet **aucun `FOR UPDATE`** avec le backend SQLite.
Un test Django en développement et production lit une identité ainsi, puis un autre processus prend
le verrou d’écriture et modifie cette même ligne : la prétendue protection de ligne n’existe pas.
En DELETE, ce second écrivain peut modifier puis annuler malgré la lecture ; son commit attendrait le lecteur.
En WAL, il valide et la première transaction ne peut plus devenir écrivain (`SQLITE_BUSY_SNAPSHOT`).
[SQLite décrit cette isolation](https://www.sqlite.org/isolation.html).

Les usages existants dans passation, versionnement, lifecycle, planifications et limites d’authentification
ne constituent donc pas des preuves de sérialisation. Les écritures préalables déjà présentes dans
`assessments/adapters/api/scope.py` et `identities/application/passwords.py` prennent, elles, le verrou
d’écriture réel. Aucun de ces mécanismes n’est modifié. Les garanties d’atomicité MEP-003 demeurent ;
elles ne prouvent pas que deux opérations métier incompatibles sont exclues (MEP-040).

## Conditions d’exploitation et limites

- Héberger le fichier sur disque local avec verrouillage fiable ; API, workers et SQLite partagent la machine.
  Écarter un partage SMB/NFS, dossier synchronisé ou plusieurs hôtes accédant directement au fichier.
- Protéger le répertoire et ses fichiers auxiliaires ; conserver de l’espace pour le journal et les backups.
  La cohérence des sauvegardes reste MEP-064 ; copier un fichier ouvert n’est pas une procédure livrée ici.
- Déployer ces paramètres avec API et workers arrêtés. Un fichier antérieurement WAL doit être fermé par
  tous ses utilisateurs avant conversion ; ne jamais supprimer ses fichiers `-wal`/`-shm` pour forcer le mode.
- Après redémarrage, vérifier par une connexion Django au fichier cible `journal_mode=delete`,
  `synchronous=2`, `busy_timeout=5000` et `foreign_keys=1`. Les tests exercent aussi une seconde ouverture.
- Démarrer avec une seule instance de chaque worker existant et une concurrence API modeste ; ne pas
  augmenter les processus pour gagner du débit d’écriture. Un écrivain reste la limite du moteur.
  Les essais ne fixent aucun nombre garanti d’utilisateurs MESS ni SLA : matériel, volumétrie et trafic
  de production ne sont pas fournis. Qualifier ces entrées lors de la recette MEP-071.
- Éviter les traitements longs et chevauchements de mutations critiques ; surveiller latences, HTTP 500,
  `database is locked`, âge des files et transactions/lectures longues. Réduire le chevauchement en cas
  de contention ; augmenter le timeout seul ne rend pas une opération incompatible sûre.

## Acceptation, refus et DoD

| Attendu | Preuve |
| --- | --- |
| CU01/CU02 — processus et contention réels | 126 mesures sur fichiers, trois répétitions, résultats et compteurs conservés |
| CU03 — paramètres exploitables | Settings explicites, contrôle Django des PRAGMA, cycle API/workers décrit et testé |
| CU04 — limites sans garanties inventées | Charge synthétique, durées, refus, matériel non qualifié et périmètre cible distingués |
| Refus : confiance dans `select_for_update` | SQL compilé sans clause et écriture concurrente sur la ligne lue |
| Refus : paramètres non mesurés / autre moteur | Comparaison timeout/journal/connexions sur fichier ; SQLite reste seul moteur |
| CU05 — acquis préservés | Suites MEP-003 de rollback, Journal, crash, contrats et livraison ; test API + workers |
| CU06 — validation et suivi | Gates du dépôt, pre-push et CI existants ; entrée canonique MEP-039 liée aux preuves |

Revue documentaire : README, AGENTS/règles, charte, DoD, stratégie/couverture fonctionnelle,
fondamentaux, transactions, notifications, inventaire de configuration, source et suivi canonique.
API et OpenAPI inchangés : aucun endpoint, schéma, permission ou code de réponse nouveau ;
les tests de contrat et E2E existants restent applicables. Aucun modèle/migration ni dépendance ajouté.
Les règles qualité et leurs seuils ne changent pas. La disponibilité cible et le GO restent hors de ce PBI.

Validation initiale du 2026-10-15, avant resynchronisation MEP-009 : 939 tests backend
(couverture 97,11 %), 393 tests frontend
(lignes 97,30 %, branches 94,78 %), 64 E2E applicatifs et 9 E2E démo réussis.
Lint, formatage, limite de 200 lignes, migrations, contrats/OpenAPI, builds et contrôles de sécurité passent.
La publication et la CI du commit sont vérifiables dans l’historique Git/GitHub Actions de cette livraison.
