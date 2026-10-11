# Sécurisation de l'authentification — Job 1.1 / MEP-001

## Comportement

Les connexions produit `POST /api/session/login/`, HTTP Basic sur `POST /api/users/`
et le formulaire Django `/admin/login/` partagent les mêmes compteurs d'échecs.
L'authentification Django, les sessions, CSRF et les permissions existantes sont conservés.
Les parcours de mot de passe et d'invitation conservent leurs limites dédiées.

Par défaut, le cinquième échec d'un identifiant ou le trentième d'une origine déclenche
une restriction jusqu'à la fin des quinze minutes commencées au premier échec.
Une origine cumule plusieurs identifiants ; un identifiant cumule plusieurs origines.
La restriction empêche aussi une connexion avec le bon mot de passe pendant cette fenêtre.
Les refus pendant la restriction n'allongent pas le délai, n'incrémentent pas les compteurs
et ne créent aucun compteur supplémentaire. Les sessions déjà ouvertes restent utilisables.

Un succès avant restriction efface les échecs de cet identifiant, mais conserve ceux de l'origine.
Après expiration, la tentative suivante retrouve le comportement normal sans intervention
administrative. Les compteurs expirés sont purgés au prochain appel.

Les identifiants sont regroupés en NFKC et sans distinction de casse pour les compteurs uniquement.
La vérification Django des identifiants et du mot de passe reste inchangée.
Comptes inconnus, inactifs et en attente suivent les mêmes limites et refus.
Aucune recherche préalable d'existence ne détermine la réponse de limitation.

## Contrat HTTP et interface

- `200` : session produit ouverte, représentation et rôles existants.
- `400` : corps invalide, avant vérification des credentials.
- `401` : échec, `{"detail": "Identifiant ou mot de passe invalide."}`.
- `403` : CSRF absent ou invalide ; aucune tentative de mot de passe comptée.
- `429` : objet `detail` générique et `Retry-After` en secondes, correspondant au plus long
  délai restant parmi les compteurs qui bloquent.
- `500` : erreur interne générique suivant le [contrat commun](sqlite-transactions.md#erreurs-et-diagnostic) ;
  une erreur dans la transaction des compteurs annule ses écritures.

React affiche « Trop de tentatives de connexion. Réessayez dans N secondes. » et permet
une nouvelle tentative. Le serveur reste l'autorité du délai. Django admin affiche l'attente
dans son formulaire, avec son statut HTTP habituel. OpenAPI décrit `429` et `Retry-After`.

## Persistance et concurrence

`identities.application.login_limits` réutilise `PasswordRateLimit`, avec des clés HMAC-SHA256
dédiées par scope ; aucun identifiant, adresse IP ou mot de passe brut n'y est stocké.
Aucun modèle ni migration supplémentaire. Les compteurs survivent au redémarrage et sont
partagés entre workers utilisant la même base SQLite. Le secret Django doit rester stable
entre workers et redémarrages ; sa rotation change les clés des compteurs.

La transaction acquiert le verrou d'écriture SQLite avant lecture, vérification et comptabilisation.
Le test avec quatre connexions concurrentes vérifie les seuils par compte et par origine.
La vérification du hash tient ce verrou : ce choix privilégie l'exactitude sur le socle SQLite.
Une évolution de base devra réévaluer le verrouillage et ses performances.
Les throttles DRF standards utilisent des opérations de cache non atomiques :
[documentation DRF](https://www.django-rest-framework.org/api-guide/throttling/).

## Installation on-premise et proxy

Variables d'environnement communes au développement et à la production :

| Variable | Défaut | Effet |
| --- | --- | --- |
| `LOGIN_ACCOUNT_LIMIT` | `5` | Échecs par identifiant |
| `LOGIN_ORIGIN_LIMIT` | `30` | Échecs cumulés par origine |
| `LOGIN_LIMIT_SECONDS` | `900` | Fenêtre en secondes |
| `LOGIN_TRUSTED_PROXIES` | vide | IP ou CIDR fiables, séparés par virgules |

Les seuils doivent être des entiers strictement positifs et les CIDR valides, sinon le démarrage échoue.
Sans proxy fiable déclaré, seule `REMOTE_ADDR` compte ; `X-Forwarded-For` est ignoré.
Avec un pair fiable, la chaîne est parcourue de droite à gauche jusqu'au premier saut non fiable.
Les adresses ajoutées à sa gauche ne changent pas l'origine. IPv4 et IPv6 sont normalisées.
Une chaîne invalide ou supérieure à 4096 caractères revient à l'adresse du pair.

Déclarer uniquement les IP ou réseaux réellement maîtrisés, jamais un CIDR universel.
Le proxy doit écraser ou compléter correctement `X-Forwarded-For` à partir de son pair réel ;
l'accès direct au backend doit être limité conformément à l'installation.
Exemple pour un proxy local maîtrisé : `LOGIN_TRUSTED_PROXIES=127.0.0.1/32,::1/128`.
Sans ce réglage, les utilisateurs derrière le proxy partagent son compteur d'origine.
Un NAT d'entreprise partage également ce compteur : ajuster le seuil d'origine à l'usage.

## Preuves et revue documentaire

`test_login_limits`, `test_login_origins`, `test_login_surfaces` et `test_login_concurrency`
couvrent succès, restrictions, expiration, non-énumération, CSRF, Basic/admin, proxies et concurrence.
Les tests de sessions et permissions existants vérifient les rôles. React couvre le message
et les en-têtes inutilisables ; Playwright `login-restriction.spec.ts` exerce le parcours réel
jusqu'au retour au dashboard après expiration du compteur du compte synthétique.

README, API, fondamentaux, environnements, stratégie et couverture fonctionnelle mis à jour.
Règles des agents, charte qualité et Definition of Done relues : obligations conservées.
MFA, permissions métier, refonte de l'authentification et configuration HTTPS restent hors périmètre.
