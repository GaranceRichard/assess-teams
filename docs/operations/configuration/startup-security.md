# MEP-009 — Configuration sûre au démarrage

Contrat courant du 2026-10-15, fondé sur l'[inventaire MEP-036](README.md), notamment R01–R03/R05–R06.
[Preuves et DoD](startup-validation.md) ; [fiche canonique](../../backlog/source/mess/f01.md).
SQLite, le transport HTTP MEP-002 et les workers existants sont conservés.
Ce contrôle n'ajoute ni chargeur `.env`, ni contrat unique F10, ni dépendance d'exploitation.

## Sélection et refus

`manage.py` utilise l'alias production ; WSGI/ASGI sélectionnent directement la production.
Un `DJANGO_SETTINGS_MODULE` externe reste respecté : le service MESS doit sélectionner
`config.settings_production` (ou son alias `config.settings`), jamais les réglages locaux.
`ENVIRONMENT` est une constante de settings, pas une variable d'environnement consommée.
Seuls les modes explicites `development` et `test` exemptent les contrôles de production ;
pytest et les scripts locaux conservent leur sélection development et HTTP local.

L'import des réglages refuse clé, origine et SMTP invalides. `ConfigurationConfig.ready()`
contrôle ensuite les **settings effectifs**, y compris une surcharge par un module dérivé,
avant les requêtes et commandes/workers, sans connexion réseau ni accès à la base.
DEBUG doit être exactement False ; les variables `DEBUG`/`DJANGO_DEBUG` ne le configurent pas.
Un environnement inconnu est refusé. Aucune erreur ne provoque un repli vers development.
Les diagnostics `ImproperlyConfigured` nomment le paramètre et la correction, jamais sa valeur ;
les erreurs de conversion et de parsing ne propagent pas leur exception contenant l'entrée.

## Paramètres contrôlés

| Paramètre / combinaison | Exigence de production |
| --- | --- |
| `DJANGO_SECRET_KEY` | Secret externe obligatoire, unique à l'instance, aléatoire, >=50 caractères, >=8 caractères distincts |
| qualité des secrets | Sans espaces, motif périodique répété, caractère majoritaire ou marqueur connu de développement (`django-insecure`, `development`, `assessteams-local`, `changeme`, `change-me`, `placeholder`, `example`, `test-key`, `password`, `replace-me`) |
| `SECRET_KEY` / `SECRET_KEY_FALLBACKS` | Clé effective identique à l'entrée externe ; aucun fallback embarqué ou ancien secret accepté |
| `APP_BASE_URL`, hôtes, origines, TLS, cookies | Parseurs et protections [MEP-002](../../architecture/http-security.md) réutilisés ; une surcharge affaiblissant les valeurs de production est refusée |
| middlewares | Frontière HTTP présente avant SecurityMiddleware, sessions et CSRF, tous obligatoires |
| `DJANGO_TRUSTED_PROXIES` / `LOGIN_TRUSTED_PROXIES` | IP/CIDR stricts, entrées non vides, aucun `/0` ; chaque réseau de pairs HTTP couvert par un réseau LOGIN de même famille |
| chaînes de proxys | LOGIN peut inclure les intermédiaires en amont ; sans proxy HTTP, LOGIN est vide ; les deux listes sont vides en HTTPS direct |
| `EMAIL_HOST` / `EMAIL_PORT` | Relais sans credentials ni URL ; hôte non vide ; port entier 1–65535, défauts localhost/587 conservés |
| `EMAIL_USE_TLS` / `EMAIL_USE_SSL` | Uniquement true/false (casse indifférente), modes exclusifs ; SSL défaut false, STARTTLS défaut inverse de SSL |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Les deux ou aucun ; identifiant non blanc ; secret externe >=16 caractères avec les mêmes contrôles structurels |
| TLS SMTP | Obligatoire pour tout relais distant et toute authentification ; SMTP sans TLS permis uniquement sans credentials sur localhost, 127.0.0.1 ou ::1 |
| `DEFAULT_FROM_EMAIL` | Une adresse explicite valide, nom d'affichage permis, sans suffixe .local ni injection d'en-tête ; aucun défaut de développement |
| backend mail / seed | SMTP Django obligatoire ; application development_data interdite |

La qualité structurelle ne prouve pas l'entropie : générer les secrets avec un générateur
cryptographique, ne jamais composer une phrase ou adapter une valeur d'exemple.
Un relais SMTP imposant un credential faible doit être reprovisionné ; ne pas assouplir le contrôle.
Les certificats/CA du frontal et de SMTP sont à provisionner dans le système MESS : Django conserve
la vérification TLS standard, sans désactivation de certificat. Le démarrage ne sonde ni DNS,
ni disponibilité SMTP, ni certificats du frontal ; ces preuves relèvent de la recette cible.

## Approvisionnement et protection

1. Générer une clé par instance et par environnement dans un outil d'administration privé,
   puis la remettre par un canal approuvé à l'exploitant. Ne jamais la coller dans ce dépôt,
   un ticket, un exemple, un test, un argument de commande ou une sortie console.
2. Conserver clé et credential SMTP hors des sources **et du package distribué**, dans le
   stockage privé du service/de l'OS. Injecter leurs variables dans le processus de l'API
   et des workers. Django ne lit pas de fichier `.env` automatiquement.
3. Restreindre lecture/écriture au compte du service et aux administrateurs habilités :
   ACL Windows sans groupes Users/Everyone ; sous Unix fichier 0600 et répertoire 0700.
   Appliquer la même protection aux sauvegardes, à SQLite et aux fichiers mail privés.
4. Ne pas exposer l'environnement, `diffsettings`, les dumps processus ou les traces avec
   variables locales dans les journaux, diagnostics de support ou rapports de tests.
   Journaliser seulement nom du paramètre, résultat du contrôle, date et responsable.
5. Vérifier avant livraison sources suivies, archive et artefacts avec le scanner canonique
   et une revue de contenu ; `.gitignore` ne protège pas un fichier déjà suivi.
   Les réglages/fixtures publics locaux ne sont jamais des secrets de production.

## Rotation et révocation

1. Inventorier les consommateurs (API, ASGI/WSGI, workers, ordonnanceur) et planifier une
   interruption coordonnée ; préparer un nouveau secret aléatoire dans le stockage privé.
2. Arrêter les consommateurs, remplacer `DJANGO_SECRET_KEY` dans toutes leurs injections,
   puis les redémarrer sur la même clé. Aucun `SECRET_KEY_FALLBACKS` n'est activé : l'ancienne
   clé est révoquée immédiatement. Ne pas conserver une clé compromise pour faciliter un retour.
3. Prévoir la reconnexion des utilisateurs : les sessions et liens signés d'invitation/
   récupération émis avec l'ancienne clé deviennent invalides. Réémettre les liens nécessaires ;
   les mots de passe hachés et l'historique SQLite sont conservés.
4. Pour SMTP, créer/remplacer le credential côté relais et dans le stockage externe,
   redémarrer les deux workers, vérifier une remise contrôlée, puis révoquer l'ancien credential.
   En cas de compromission, révoquer sans attendre et accepter la mise en attente des courriels.
5. Exécuter les contrôles de démarrage et `manage.py check --deploy` avec l'injection privée,
   puis vérifier HTTPS/session et remise SMTP sur l'instance cible. Ne pas joindre de valeurs
   aux preuves ; consigner date, responsable, référence de version et succès/refus seulement.
6. Supprimer les anciennes copies selon la politique de rétention des secrets et sauvegardes.
   Un retour de version applicative conserve les nouveaux secrets compatibles.

Références : [checklist Django 5.2](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/),
[rotation de SECRET_KEY](https://docs.djangoproject.com/en/5.2/ref/settings/#secret-key-fallbacks)
et [initialisation AppConfig](https://docs.djangoproject.com/en/5.2/ref/applications/#django.apps.AppConfig.ready).
