# Gestion sécurisée du mot de passe — AUTH-002 / AUTH-003

## Parcours fonctionnels

À la connexion, « Mot de passe oublié ? » ouvre `/password/forgot` sans authentification.
L’utilisateur saisit son email et reçoit toujours le même accusé pour une adresse valide.
Chargement, erreurs de service/fréquence, succès générique et nouvelle demande sont disponibles.
Le courriel destiné à un compte actif unique avec mot de passe utilisable contient un lien temporaire.
Les comptes en attente continuent leur invitation ; la récupération ne les active pas.
Une adresse historiquement ambiguë ne déclenche aucun envoi, sans choisir arbitrairement un compte.

Le lien ouvre `/password/reset#uid/token`. Le fragment ne part jamais dans les requêtes HTTP.
React le retire immédiatement de l’historique et le conserve uniquement en mémoire, sans stockage navigateur.
Un rechargement exige de rouvrir le lien du courriel.
L’utilisateur saisit et confirme le nouveau mot de passe ; aucun mot de passe actuel n’est demandé.
Un lien refusé ou expiré affiche un message explicite et propose une nouvelle demande.
Le succès efface les champs et le token, puis propose le retour à la connexion sans connexion automatique.

Dans Tableau de bord → Mon profil, « Modifier mon mot de passe » ouvre un formulaire accessible
au clavier dans la carte existante, sans menu principal supplémentaire.
Le mot de passe actuel est vérifié par le backend ; le nouveau est confirmé et validé.
Chargement, refus et succès utilisent `aria-busy`, `alert` et `status`.
Les composants et tokens CSS existants respectent modes jour/nuit, dix palettes et mobile.
La démonstration statique masque cette capacité qui exige un backend réel.

## Audit et décisions de sécurité

L’audit initial relève : sessions Django par cookie, écritures protégées par CSRF, authentification
Basic limitée aux API techniques existantes, invitations via `default_token_generator`,
email Django et journaux HTTP ne conservant ni corps ni URL de requête.
Les validateurs Django étaient désactivés et les emails locaux affichés dans la console.

Les deux parcours et le choix initial par invitation utilisent les quatre validateurs Django :
longueur minimale de 8 caractères, similarité avec l’identité, mots de passe courants et mots de passe
entièrement numériques. La création technique API et les commandes Django appliquent aussi cette
configuration. Les nouveaux mots de passe API sont bornés à 128 caractères ; les espaces sont conservés.
Le mot de passe actuel accepte aussi les longues phrases historiques, comme le login existant.
Aucune règle de composition arbitraire n’est ajoutée. Les mots de passe déjà stockés restent utilisables.
La récupération et la modification refusent le mot de passe actuel ; aucun historique complet
ni interdiction de réutiliser un mot de passe plus ancien n’est livré.

La récupération utilise `PasswordResetTokenGenerator` avec un `key_salt` dédié.
Les tokens de récupération et d’invitation ne sont pas interchangeables.
`PASSWORD_RECOVERY_TIMEOUT = 3600` fixe une heure de validité depuis la génération à la remise.
Le contrôle Django reste utilisé avant cette borne supplémentaire ; `PASSWORD_RESET_TIMEOUT = 259200`
conserve les trois jours des invitations existantes, sans révoquer leur signature ni raccourcir leur durée.
Django lie le token au mot de passe haché, à la dernière connexion et à l’email : changement de mot de passe,
connexion ultérieure ou changement d’email invalide le lien. Consommation et écriture sont atomiques.
SQLite prend son verrou d’écriture avant la lecture ; les autres moteurs verrouillent la ligne utilisateur.
Deux consommations concurrentes ne peuvent réussir toutes les deux.
Tous les liens précédents sont invalidés par une consommation réussie. Une nouvelle demande seule ne
révoque pas les autres liens encore valides : ils restent soumis au même usage unique effectif.
Aucun token n’est stocké en clair, y compris dans la file de remise.

La modification ne reçoit aucun identifiant cible. Tout rôle, y compris Superadmin, modifie seulement
le compte de sa session. Champs supplémentaires, rôles/privilèges ou organisations sont refusés.
Identité, rattachements, préférences et historique métier sont préservés.
Les invitations conservent leur endpoint et leurs préconditions ; leur politique de mot de passe est renforcée.

La modification conserve la session courante via `update_session_auth_hash`, renouvelle sa clé et
invalide les autres sessions au prochain contrôle d’authentification.
La réinitialisation invalide toutes les sessions au prochain contrôle, sans en ouvrir une nouvelle.
Django compare le hash de session ; il ne supprime pas globalement les lignes de sessions.

## Non-énumération, fréquence et confidentialité

La demande publique ne consulte pas les comptes et n’envoie aucun email dans le cycle HTTP.
Elle met en file la même adresse validée, existante ou absente : même code, corps et chemin
synchrone, sans délai SMTP dépendant de l’existence du compte.
Le worker vérifie l’éligibilité à la remise et jette les demandes sans destinataire éligible.

Les compteurs persistés en base sont atomiques et partagés par les processus :

| Action | Limite IP | Limite secondaire | Refus |
| --- | --- | --- | --- |
| Demande de récupération | 20/heure | 3/heure/adresse | IP : 429 ; adresse : 202 générique sans nouvelle remise |
| Confirmation | 30/15 minutes | 10/15 minutes/uid | 429 avec Retry-After |
| Modification | 30/15 minutes | 5/15 minutes/compte | 429 avec Retry-After |

Les fenêtres commencent à la première tentative. Les refus métier comptent ; les fenêtres expirées sont
purgées lors des tentatives suivantes. Les clés IP/email/uid/compte utilisent un HMAC SHA-256 secret.
L’adresse client vient de `REMOTE_ADDR` ; les headers Forwarded/X-Forwarded-For ne sont pas crus directement.
Le proxy doit configurer correctement l’adresse client et appliquer ses propres limites globales.

Les API publiques exigent aussi CSRF, initialisé par `GET /api/session/` même si sa réponse est 403.
Les endpoints ne portent aucun token dans leur chemin ; réponses `Cache-Control: no-store`.
Frontend et API appliquent `Referrer-Policy: no-referrer`.
Les journaux reçoivent seulement méthode, code, nom d’opération et contexte autorisé.
Les erreurs SMTP sont comptées sans afficher l’exception, qui pourrait contenir un token ou une URL.
L’infrastructure ne doit pas journaliser les corps HTTP ni les contenus SMTP.
Les tests E2E de ces parcours désactivent les traces contenant des credentials fictifs.

## Contrat API / OpenAPI

Tous les champs sont obligatoires ; aucun champ supplémentaire n’est accepté.
Les serializers et le schéma marquent les saisies sensibles `writeOnly`.

| POST | JSON | Succès | Authentification |
| --- | --- | --- | --- |
| `/api/password/recovery/` | `email` | 202 `{detail: "Si un compte actif correspond à cette adresse, un lien vous sera envoyé."}` | publique + CSRF |
| `/api/password/reset/` | `uid, token, password, password_confirmation` | 204 sans corps | publique + CSRF |
| `/api/session/password/` | `current_password, password, password_confirmation` | 204 sans corps | session active + CSRF ; Basic refusé |

400 : champs, politique ou confirmation invalides ; lien invalide/expiré sous `detail` ; mot de passe
actuel incorrect sous `current_password`. 403 : CSRF refusé ou session requise absente/inactive.
429 : trop de tentatives, message générique et header `Retry-After` en secondes.
Aucune réponse ne contient le mot de passe, le token ni l’état d’un compte lié à l’email fourni.
`/api/schema/` décrit ces opérations ; `/api/docs/` reste accessible.

## Exploitation et migration

Appliquer `identities.0007` : compteurs de fréquence et file de remise seulement.
La migration ne modifie aucun utilisateur, rattachement, invitation ni session existants.
La file conserve l’email soumis et dates/compteurs nécessaires, jamais mot de passe ou token.
Le worker supprime les jobs après remise, inéligibilité, 15 minutes d’âge ou trois tentatives.
Les erreurs SMTP sont retentées après une minute. Un crash après remise mais avant suppression peut
produire un doublon d’email ; le premier changement réussi invalide tous les liens associés.
L’envoi réseau intervient hors du verrou d’écriture, avec réservation atomique du job.

En développement, `dev:backend` lance le worker et l’arrête avec le serveur.
Les emails Django sont écrits dans `backend/.mail/`, ignoré par Git, sans contenu dans le terminal.
Ce dossier contient des liens privés ; supprimer les fichiers locaux après usage et ne pas les publier.

En production, configurer `APP_BASE_URL` avec une URL publique HTTPS explicite, sans identifiants,
query ni fragment. Le lien n’utilise jamais Host ni les headers proxy de la requête.
Configurer SMTP : `EMAIL_HOST`, `EMAIL_PORT` (587), `EMAIL_USE_TLS` (true),
`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL` ; timeout réseau de dix secondes.
Superviser un worker avec les mêmes settings et la même base que l’API :

```powershell
python manage.py send_password_reset_emails --watch --settings=config.settings_production
```

Un ordonnanceur exécutant la commande sans `--watch` chaque minute est aussi possible.
Surveiller disponibilité du worker, âge de la file et compteurs de remise, sans exporter les emails.
SMTP et worker sont requis pour la remise effective ; aucune configuration externe n’est déployée par ce PBI.

## Preuves et revue documentaire

`test_password_recovery/reset/change/contract/concurrency` couvre non-énumération, absence de recherche
synchrone, expiration, usage unique/concurrent, fréquence concurrente, CSRF, sessions, rôles et secrets.
`PasswordForm/PasswordPages/passwords` couvre chargement, confirmation, refus, succès, renouvellement,
contrat JSON et retrait du fragment. `passwords.spec.ts` traverse un email local réel jusqu’à la
reconnexion, refuse le rejeu, vérifie deux sessions navigateur et les bornes mobiles.
Les suites existantes protègent invitations, organisations, rôles et préférences.

Revue : README, API, architecture, environnements, backlog, stratégie et inventaire fonctionnel.
Règles des agents, charte qualité et DoD restent applicables sans modification des seuils.
Références Django : [validation](https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#password-validation),
[sessions](https://docs.djangoproject.com/en/5.2/topics/auth/default/#session-invalidation-on-password-change).
