# Inventaire — SMTP, files et exploitation

[Conventions](README.md#lecture-de-linventaire). **B/D/P** : settings base/development/production,
liés dans [Django](django.md). **G** : défauts Django locaux.
**N** = [notifications/delivery.py](../../../backend/notifications/delivery.py),
**R** = [password_delivery.py](../../../backend/identities/application/password_delivery.py).
[Contrat des notifications](../../architecture/email-notifications.md) et
[gestion des mots de passe](../../architecture/password-management.md).

| Paramètre | Source | Défaut public / comportement | Sens. | Production |
| --- | --- | --- | --- | --- |
| `EMAIL_BACKEND` | D / P | filebased / smtp Django ; aucune variable homonyme lue | C | Fixe SMTP ; backend fichier interdit |
| `EMAIL_FILE_PATH` | D | `BASE_DIR/.mail`, courriels privés hors Git | I | Interdit ; pas défini en P |
| `EMAIL_HOST` | P, variable homonyme | `localhost` | I | Exploitation : relais valide, défaut local non preuve de disponibilité |
| `EMAIL_PORT` | P, variable homonyme | 587, conversion int ; plage non contrôlée explicitement | P | Défaut ; adéquation relais à qualifier |
| `EMAIL_USE_SSL` | P, variable homonyme | `false` ; seule chaîne dont lower() vaut true active SSL implicite | C | Conditionnel selon relais ; R02 |
| `EMAIL_USE_TLS` | P, variable homonyme | True si SSL désactivé, False sinon ; même parseur true | C | Conditionnel STARTTLS ; exclusif SSL, R02 |
| `EMAIL_HOST_USER` | P, variable homonyme | chaîne vide, pas d'authentification SMTP avec credentials incomplets | I | Conditionnel si relais authentifié, identifiant réel omis |
| `EMAIL_HOST_PASSWORD` | P, variable homonyme | chaîne vide, aucune valeur reproduite | S | Conditionnel si relais authentifié ; gestion/rotation externes |
| `EMAIL_TIMEOUT` | P / G en D | P : 10 s par opération socket ; D : None (pas SMTP) | P | Fixe P, pas variable lue |
| `DEFAULT_FROM_EMAIL` | D / P, variable en P | D : Assess teams <noreply@assess-teams.local> ; P : noreply@assess-teams.local | I | Exploitation : expéditeur accepté par relais ; défaut local R02 |
| `EMAIL_SSL_CERTFILE` / `EMAIL_SSL_KEYFILE` | G | `None` / `None`, pas de variable ni certificat client configuré | I/S | Conditionnel si SMTP mTLS ; absence de mécanisme propre au dépôt |
| SMTP CA / validation certificat | backend SMTP Django, ssl Python | contexte TLS système vérifiant certificat ; pas de CA custom dans settings | C | Exploitation si CA MESS privée ; confiance système à provisionner |
| `EMAIL_USE_LOCALTIME` / `EMAIL_SUBJECT_PREFIX` | G | `False` / `[Django] ` (mail_admins) | P | Défaut ; sujets produit construits explicitement |
| `SERVER_EMAIL` / `ADMINS` / `MANAGERS` | G | `root@localhost` / `[]` / `[]` | I | Défaut hérité pour diagnostics Django, pas canal métier configuré |
| suffixe `Message-ID` | [transport.py](../../../backend/notifications/transport.py) | `<référence-job@assess-teams.local>`, référence UUID ou password-id ; pas variable | I | Fixe ; compatibilité relais à qualifier |
| SMTP `local_hostname` | backend SMTP Django / DNS_NAME | nom de machine via getfqdn(), valeur réelle non consultée | I | Défaut système ; pas variable produit |
| `EMAIL_DELIVER_ON_COMMIT` | B / P | D : True ; P : False, mise en file uniquement | C | Fixe P ; worker indispensable |
| `EMAIL_MAX_ATTEMPTS` | B / N | 5 ; aucun override environnement | P | Fixe ; borne notifications générales |
| lot notifications | N, argument `limit` | 100 jobs par passe | P | Fixe par worker, pas option CLI |
| délai reprises notifications | N | min(60 × 2^(tentative−1), 3600) s, exposant borné à 10 | P | Fixe |
| remise notification interrompue | N | après 5 min en sending → unknown | C | Fixe ; reprise manuelle après vérification SMTP |
| récupération : tentatives / fenêtre | R | 3 / 15 min depuis création du job | C | Fixe ; ne renouvelle pas la fenêtre lors d'une reprise |
| récupération : délai reprise / lot | R | 1 min / 100 jobs par passe | P | Fixe |
| récupération : remise interrompue | R | next_attempt_at dépassé de 4 min → unknown | C | Fixe ; généralement 5 min depuis réservation |
| `--watch` des deux workers | [notifications command](../../../backend/notifications/management/commands/send_pending_notifications.py), [password command](../../../backend/identities/management/commands/send_password_reset_emails.py) | False : une passe ; True : boucle avec pause de 5 s | P | Conditionnel : service supervisé ou ordonnanceur chaque minute |
| module settings / base workers | mêmes commands et Django `--settings` | sélection Django par défaut production | C | Exploitation : identiques à API, ne pas utiliser D ni DB E2E |
| génération échéances | [send_due_evaluation_notifications](../../../backend/assessments/management/commands/send_due_evaluation_notifications.py), doc mail | pas de daemon ni argument métier ; au moins quotidienne recommandée | P | Exploitation : ordonnanceur à installer ; R08 |
| supervision files/relai/processus | doc mail | pas d'ordonnanceur/service de production livré | I | Exploitation : redémarrage, âge pending/retry, failed/unknown ; R08 |
| rétention files / mail / journaux | N / R et docs mail | récupération acceptée/inéligible supprimée ; intentions générales conservées ; aucune purge automatique globale | C | Exploitation ; MEP-042/020, hors correction MEP-036 |

Le SMTP local sans authentification est un cas permis, pas un défaut à corriger systématiquement.
SSL et STARTTLS simultanés sont refusés par le backend Django à la création de la connexion,
pas par l'import des settings. Une chaîne booléenne mal orthographiée désactive silencieusement l'option.
Le contexte TLS standard a été vérifié dans `django/core/mail/backends/smtp.py` du runtime local.
Les adresses/contenus, liens temporaires, passwords et tokens présents en base ou mail local
ne sont jamais des valeurs d'inventaire ; protéger les bases et sauvegardes correspondantes.
