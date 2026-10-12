# Notifications par courriel — Job 1.4 / MEP-004

## Succès métier et remise

Les invitations, modifications/activations de comptes, confirmations de planning et échéances
conservent leurs destinataires et contenus. Leur intention est persistée dans `EmailNotification`,
dans la transaction métier existante. Un rollback annule également cette intention.
Le réseau SMTP intervient après commit ou dans un worker ; aucun verrou métier ne reste ouvert.
Un refus SMTP ne change donc pas une création réussie en erreur HTTP et ne rejoue jamais le métier.
Les réponses API existantes conservent leurs codes/champs : 201/200 signifient succès métier,
sans garantir la réception du courriel. Le Journal d’activité reste distinct du diagnostic de remise.

Une échéance crée sa passation et avance le calendrier dès la mise en file, même pendant une panne.
La reprise travaille sur cette notification persistée, sans recréer la passation ni avancer le planning.
Sans destinataire éligible, l’avertissement existant est conservé et l’échéance n’avance pas.
Lors de la remise, les invitations et responsabilités de planning sont revérifiées : compte actif,
adresse inchangée, rattachement et assignation courants ; une responsabilité suspendue est annulée.
Les invitations devenues inutilisables sont annulées ; leur lien signé est généré seulement à la remise.
Aucun token ni mot de passe n’est persisté dans la file.

## États et reprises

| État | Sens / action |
| --- | --- |
| `pending` | Intention durable, prête pour le worker |
| `sending` | Réservée par un seul worker, réseau en cours |
| `retry` | Reprise automatique après refus temporaire ou connexion indisponible |
| `sent` | SMTP a accepté le message ; ce n’est pas une preuve de lecture ni de livraison finale |
| `failed` | Refus permanent, configuration invalide ou plafond atteint ; reprise administrative |
| `unknown` | Remise incertaine après interruption ; vérifier les journaux SMTP avant toute reprise |
| `cancelled` | Destinataire ou invitation devenu inéligible ; aucun envoi |

La réservation utilise un UPDATE conditionnel atomique, compatible avec SQLite et plusieurs workers.
La clé unique de planning associe planification, type, échéance, destinataire et empreinte du contenu.
Un appel répété pour la même intention conserve la même ligne ; chaque destinataire a sa propre remise.
Une reprise ignore les messages déjà acceptés et ceux qui sont encore en cours.
Le même `Message-ID` accompagne toutes les tentatives d’une notification. SMTP ne garantit pas sa déduplication.
Une intention annulée sans soumission peut être remise en attente après réaffectation explicite.
Les invitations/modifications/activations distinctes restent des événements distincts.

Les codes SMTP 4xx et les refus de connexion sont retentés : cinq tentatives maximum,
délais de 1, 2, 4 puis 8 minutes (calcul plafonné à une heure). Les 5xx sont arrêtés.
Un timeout/disconnect avant soumission est repris ; après début de soumission, il devient `unknown`.
Un worker interrompu laisse une trace `sending`, convertie en `unknown` après cinq minutes.
Une interruption entre acceptation SMTP et confirmation en base ne peut être rendue exactement une fois
sans coopération du serveur SMTP ; elle n’entraîne pas de renvoi automatique aveugle.

## Administration et confidentialité

Dans `/admin/`, le Superadmin technique consulte **Email notifications** : état, tentatives,
dates, code d’erreur sûr, organisation et référence. Filtres par état/organisation/date.
Les contenus et adresses sont absents des pages d’administration de la file et des journaux de remise.
Les rôles métier n’obtiennent aucun accès global aux files. Les Logs existants restent cloisonnés.
Les transitions de remise alimentent `source=notifications`, avec catégorie correspondant à l’état.
Le diagnostic contient des références et codes contrôlés, jamais le texte brut d’une exception SMTP.

L’action « Reprogrammer les notifications en échec ou en reprise » remet les états `failed/retry`
en attente et ouvre un nouveau cycle borné ; elle ignore les états acceptés/en cours/annulés.
Pour `unknown`, l’action séparée « Après vérification SMTP : reprendre les remises incertaines »
est réservée aux cas où l’exploitant a vérifié l’absence d’acceptation sur le relais.
Si l’acceptation est confirmée, l’action « Confirmer l’acceptation dans les journaux SMTP » clôt l’incertitude
sans envoyer un autre courriel. Aucun de ces gestes ne modifie l’opération métier.

La file de récupération `PasswordResetDelivery` et son worker sont conservés : non-énumération publique,
liens générés à la remise, trois tentatives et fenêtre de quinze minutes. La réservation explicite
empêche deux workers de remettre le même job ; les erreurs/interruptions incertaines sont visibles
sur sa propre page d’administration. La reprise ne renouvelle jamais la fenêtre de quinze minutes.
Les jobs acceptés ou inéligibles sont supprimés comme auparavant ; les échecs restent diagnostiquables.
Les journaux et sorties du worker ne contiennent aucune adresse ni lien de récupération.

La base contient les adresses et contenus ordinaires nécessaires à la reprise : protéger ses accès et backups.
Les intentions générales et leurs clés sont conservées pour le suivi et la déduplication.
Aucune purge automatique de ces clés n’est ajoutée ; une éventuelle politique de rétention devra préserver
la déduplication. Les fichiers de courriel de développement restent privés et ignorés par Git.

## Exploitation MESS / on-premise

Appliquer `identities.0008` et `notifications.0001/0002` avec les mêmes settings et la même base que l’API.
Aucun broker, fournisseur de messagerie ou service externe supplémentaire n’est requis.
Le relais SMTP interne se configure avec `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`,
`EMAIL_USE_SSL`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` et `DEFAULT_FROM_EMAIL`.
TLS explicite et SSL implicite sont exclusifs ; SMTP interne sans authentification accepte des credentials vides.
Le timeout réseau reste borné à dix secondes par opération socket. Les workers traitent cent jobs par passe.
L’URL publique `APP_BASE_URL` reste configurée comme dans la [gestion du mot de passe](password-management.md).

En production, les requêtes métier font uniquement la mise en file (`EMAIL_DELIVER_ON_COMMIT=False`).
Superviser ces deux processus avec redémarrage automatique, ou les lancer chaque minute par l’ordonnanceur local :

```powershell
python manage.py send_pending_notifications --watch --settings=config.settings_production
python manage.py send_password_reset_emails --watch --settings=config.settings_production
```

Conserver aussi la commande quotidienne existante `send_due_evaluation_notifications` pour générer les échéances.
Sa sortie compte désormais les planifications mises en file ; le statut SMTP vient de la file.
En développement, `dev:backend` démarre et arrête les deux workers et conserve la remise après commit
pour les parcours existants (`EMAIL_DELIVER_ON_COMMIT=True`).
Superviser l’âge du plus ancien `pending/retry`, les volumes `failed/unknown`, la disponibilité des workers
et du relais. Après panne : rétablir SMTP, laisser reprendre les 4xx puis traiter les échecs permanents.

## Validation et revue documentaire

Les tests `test_email_queue/business/admin/smtp/concurrency/migration` couvrent succès, rollback, HTTP malgré panne,
refus 4xx/5xx, timeout, reprise partielle, plafond, déduplication, éligibilité, droits et confidentialité.
Un serveur SMTP local réel exerce acceptation/refus/absence de réponse ; deux workers sur SQLite fichier
vérifient l’unicité de réservation, une écriture concurrente pendant l’envoi réseau
et l’absence de verrou d’écriture des workers inactifs pendant une transaction métier.
Les migrations préservent la file de récupération existante et l’historique métier.
Les suites existantes protègent invitations, activation, récupération, échéances et récurrences.
Les parcours E2E existants restent exécutés par le gate complet.

Revue : README, API/OpenAPI, architecture, environnements, backlog, stratégie et couverture fonctionnelle.
Les règles des agents, la charte qualité et la DoD restent applicables sans modification des seuils.
Références Django : [courriels](https://docs.djangoproject.com/en/5.2/topics/email/)
et [transactions](https://docs.djangoproject.com/en/5.2/topics/db/transactions/).
