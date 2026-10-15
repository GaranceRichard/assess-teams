# MEP-009 — Preuves et revue de livraison

[Contrat et rotation](startup-security.md), [registre canonique](../../backlog/tracking/mess-e01.md).
Date de validation : 2026-10-15. Toutes les entrées de test sont synthétiques ; les clés
acceptées sont générées en mémoire, sans lecture d'une configuration ou d'un secret MESS réel.

| Critère / usage | Preuve |
| --- | --- |
| CU01, configuration valide | Sous-processus Django, alias, WSGI, ASGI et commande worker --help ; HTTPS direct et chaîne proxy IPv4/IPv6 |
| CU02, absent/faible/développement | Absence, vide, trop court, uniforme, périodique, caractère majoritaire, préfixe Django de développement et clé locale refusés |
| CU03, DEBUG | Surcharge effective DEBUG=True refusée pendant django.setup(), avant service |
| CU04, HTTP/TLS/proxys | Réutilisation des parseurs HTTP et tests MEP-002 ; refus des surcharges cookies/redirect/HSTS/proxy, des origines et de la confiance LOGIN incohérente ou universelle |
| SMTP, inventaire R02 | STARTTLS, SSL et relais loopback non authentifié acceptés ; ports, booléens, modes simultanés, credentials incomplets/faibles/locaux connus, expéditeur local, injection d'en-tête et authentification sans TLS refusés |
| CU05, développement | Démarrage development sans clé de production, modes locaux explicites ; suites seed, E2E et crash SQLite conservées |
| CU06, confidentialité | Vérification stdout/stderr des sous-processus, erreurs de parsing port/email/proxy sans entrée ni chaîne d'exception ; surcharge de credential externe refusée sans valeur |
| CU07, livraison | README mis à jour avant code ; tests, revue documentaire, registre et vues dérivées ; publication canonique, pre-push et CI bloquants |

Suites nouvelles : `test_startup_secrets.py`, `test_startup_email.py`, `test_startup_security.py`.
Suites ajustées : configuration HTTP, identités development et crash SQLite, uniquement pour
fournir les entrées de production désormais requises, sans retirer leurs assertions métier.

## Non-régression démontrée

Sur le code production de `origin/main` avant modification (`f536ca1`), un chargement isolé
accepte une clé de développement ainsi que SSL et STARTTLS simultanés : les attentes de refus
échouent. Les mêmes configurations sont refusées après correction (aucune valeur affichée).
Les tests permanents couvrent ces deux refus et leurs cas valides.

## Revue documentaire et limites de qualification

README, règles agents, charte, DoD, stratégie et inventaire fonctionnel de tests, fondamentaux,
API/OpenAPI, HTTP, connexion, notifications, mots de passe, environnements et gouvernance relus.
Les documents de contrat courant concernés sont actualisés. L'inventaire MEP-036 demeure
un instantané historique ; ses risques résolus sont reliés au présent contrat.
Les règles qualité, contrats API, modèles, migrations et dépendances ne changent pas.
Aucun endpoint ni parcours UI nouveau : tests API/contrat/E2E existants constituent la
non-régression ; les démarrages réels sont vérifiés en sous-processus plutôt qu'au navigateur.

Les contrôles ne prouvent pas l'installation autonome future, les ACL effectives, les certificats
ou le fonctionnement du relais réel MESS. Les exigences de protection/rotation sont documentées ;
la recette d'infrastructure et le package autonome restent F11–F20. Aucun secret installé ne
peut être déduit de cette livraison. SQLite reste inchangé.

## Résultats

- Validation ciblée finale : **124 tests réussis**, suites startup, HTTP configuration, development et crash SQLite ; les 26 cas SMTP incluent le credential local connu et les expéditeurs nommés.
- `manage.py check --deploy` sur configuration production synthétique : réussi ; seuls les avertissements HSTS intentionnels `security.W005` et `security.W021` de MEP-002 subsistent, sans fuite de clé.
- Archive source de l'index vérifiée : pas d'environnement privé, base SQLite, courriels, cache ou runtime inclus. Le package autonome futur reste à qualifier dans F12.
- Liens locaux des deux pages MEP-009 vérifiés ; cohérence canonique : 96 PBI actifs, 27 Réalisés, 68 Ouverts et 1 Bloqué ; 23 PBI prêts, aucun changement d'archive historique.
- Livraison conditionnée au pre-push `quality:full` réussi sur le candidat resynchronisé : repository, backend/frontend >=90 %, lint/format, migrations, build/typecheck et E2E exhaustifs ; aucune exemption.
- Preuve distante : workflow [Quality gate](https://github.com/GaranceRichard/assess-teams/actions/workflows/quality.yml) du commit livré, avec agrégation bloquante `Full quality gate`. La publication utilise `npm run publish`, puis vérifie le fast-forward du main principal et nettoie uniquement ce chantier.
