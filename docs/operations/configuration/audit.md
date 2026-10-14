# MEP-036 — Risques, refus et preuves

[Inventaire et conventions](README.md). Analyse statique sur le socle `fd6a533`, 2026-10-14.
Le statut/date fait autorité dans [le registre canonique](../../backlog/tracking/mess-e01.md).
Un inventaire achevé ne signifie ni production sécurisée ni GO MESS.

## Risques et incohérences constatés

| ID | Constat prouvé / conséquence | Source / suite |
| --- | --- | --- |
| R01 | P lit DJANGO_SECRET_KEY sans défaut, mais accepte à l'import une clé faible ou fictive ; pas de validation de longueur/entropie ni procédure de rotation/approvisionnement/droits | settings_production ; MEP-009 |
| R02 | SMTP conserve localhost et expéditeur .local ; parse booléen seulement lower()==true, aucune validation explicite plage port/credentials/combinaisons à l'import ; double TLS/SSL refusé plus tard par Django | settings_production et backend SMTP local ; MEP-009 |
| R03 | DJANGO_TRUSTED_PROXIES et LOGIN_TRUSTED_PROXIES répondent à deux usages ; aucune cohérence croisée contrôlée ; LOGIN accepte /0, interdit par HTTP ; les deux parseurs sont stricts sur les bits d'hôte ; mauvais choix expose spoofing ou limites par proxy au lieu de client | login_security, http_security, adapter client_origin ; MEP-009, sans annuler MEP-001/002 |
| R04 | D donne 5173 à FRONTEND_URL mais 5180 à origine CSRF E2E ; Playwright direct donne 5180 ; gate fournit port commun calculé. APP_BASE_URL seule ne modifie pas la liste CSRF D | settings_development, urls, isolation ; aucun changement demandé ; contrat unique MEP-054 |
| R05 | Pas de chargeur .env Django ; les variables doivent arriver au processus. Les noms SECRET_KEY/DEBUG/ENVIRONMENT/EMAIL_TIMEOUT ne sont pas des overrides environnement. Sélection externe DJANGO_SETTINGS_MODULE respectée par setdefault ; dev-backend impose D | settings/entrypoints/dev-backend, validation-inputs ; MEP-009 et MEP-054/021 |
| R06 | Documentation locale disait manage/ASGI/WSGI sélectionnent tous l'alias ; ASGI/WSGI sélectionnent directement P. « Aucune confiance proxy en D » ne vaut que par défaut : LOGIN_TRUSTED_PROXIES reste commun | entrypoints, settings_base/login_security ; formulation documentaire clarifiée, pas de correction applicative |
| R07 | SQLite et fichiers mail sous backend, pas de chemin DB production externalisé, OPTIONS vide ; pas de mode WAL ni timeout explicite ; aucune inspection d'état réel. Base/backups sensibles, aucune purge globale automatique | settings_base, N/R ; MEP-039, MEP-042/020, MEP-054, MEP-064 |
| R08 | Aucun installateur/service/proxy/certificat frontal/STATIC_ROOT/backup MESS configurable livré ; bootstrap installe dépendances dev depuis registres et runserver/Node ne correspondent pas à cible hors ligne | scripts/bootstrap/dev, settings, architecture ; MEP-055/022/057–065 et recettes F18/F20 |

Les protections existantes HTTPS, host, origine CSRF, /0 HTTP, cookies, limites positives,
refus du seed hors développement et diagnostics de remise contrôlés sont conservées.
R01/R02/R03/R05 ne sont pas corrigés dans ce PBI : MEP-009 dispose des noms, sources,
conditions et comportements actuels pour raffiner ses contrôles sans reprendre le recensement.
R07/R08 constatent une frontière de capacités, sans présumer un défaut d'infrastructure MESS inconnue.

## Matrice des critères et des vrais refus

| Usage / critère | Vérification / preuve |
| --- | --- |
| CU01, couverture settings/env/scripts/SMTP/SQLite/TLS/proxy | Relecture des sources suivies et dépendances locales ; rapprochement des noms AST settings/imports/retours H et variables nommées vers les tableaux ; aucun nom manquant |
| CU02, absence de secrets réels | Aucune lecture env runtime/.env privé/DB/.mail ; secrets documentés par nom et absence/défaut masqué ; relecture du diff et scanner de secrets canonique |
| CU03, obligatoires et développement incompatibles | Colonnes Production distinguent requis, fixe, défaut et conditionnel ; modules D, seed, mail fichier, serveurs Vite/runserver, DB E2E interdits ; R01–R08 documentés |
| CU04, reprise MEP-009 | Sources relatives, defaults, parseurs, validation actuelle et risques R01–R06 ; aucune nouvelle règle applicative anticipée |
| Refus : paramètre sensible omis | Liste des noms source confrontée aux tables, notamment SECRET_KEY, SMTP_PASSWORD, proxies, cookies/tokens, DB/backups et TLS ; retirer un nom de la copie de contrôle doit produire un manque |
| Refus : secret réel publié | Refus de toute valeur réelle, même masquée partiellement ; seulement descriptions de secrets. Fixture synthétique du scanner hors inventaire doit être refusée sans afficher son contenu |
| CU05, validations/intégration | Résultats ciblés et full quality gate, pre-push, CI et intégration tracés dans la livraison Git ; statut Réalisé uniquement avec gates satisfaits |

## Vérifications et Definition of Done

- Revue documentaire : README, règles agents, charte, DoD, stratégie de tests, fondamentaux,
  API/OpenAPI, HTTP, login, SMTP, mots de passe, environnements, index et gouvernance/backlog.
  Mise à jour des entrées d'inventaire, clarifications D/entrypoints et suivi dérivé dans ce lot.
- Aucun fichier applicatif, test, migration, modèle, contrat API ou dépendance modifié.
  Nouveau test applicatif/non-régression non applicable : livraison documentaire sans nouveau comportement.
  Les tests fonctionnels existants prouvent succès/refus des mécanismes inventoriés.
- Tests ciblés : configuration HTTP, transport/session, comptes development, configuration E2E,
  origine/limites de connexion et SMTP réel ; exécutés sur fixtures fictives uniquement.
- Contrôles applicables : liens relatifs, exhaustivité des noms, relecture manuelle,
  refus documentaire sur copie incomplète, refus scanner sur fixture synthétique,
  limite 200 lignes, secrets, whitespace et cohérence de suivi.
- Full quality gate canonique requis : repository, backend, frontend et E2E,
  coverage >=90 %, lint, format, migrations, build/typecheck ; aucune exemption ajoutée.
- Les certificats, services réels MESS, secrets installés et recettes d'infrastructure ne sont
  pas validés par cet audit documentaire ; ils appartiennent aux PBI de contrat et recette.

Les résultats mesurés sont enregistrés ci-dessous après exécution, sans données sensibles.

## Résultats locaux du 2026-10-14

- Rapprochement statique : **91 noms** settings/env explicites (affectations/imports AST,
  clés HTTP, accès environnement et ports générés) présents dans les tables ; aucun manque.
  Les variables, constantes et conditions supplémentaires recensées manuellement complètent ce contrôle.
- Refus documentaire : copie en mémoire sans DJANGO_SECRET_KEY détectée comme incomplète.
- Scanner canonique : fixture synthétique privée refusée (code 1), valeur absente de la sortie ;
  scan du lot réel réussi (code 0). Fixture supprimée ; aucune valeur sensible réelle utilisée.
- Six pages d'inventaire : liens relatifs existants, longueur <=200 lignes chacune.
- `npm run quality:targeted -- backend` avec les huit suites HTTP configuration/transport/sessions,
  development_accounts, e2e_configuration, login_origins/limits et email_smtp : **106 tests réussis**,
  Ruff lint/format et cohérence migrations réussis. Leurs succès et vrais refus préexistants sont réutilisés.
- `npm run quality:full` : **réussi**, zéro échec ; 922 tests backend (98,57 %),
  393 tests frontend (lignes 97,30 %, branches 94,78 %, fonctions 96,63 %, statements 96,42 %),
  64 parcours E2E réels + 9 démo réussis ; lint, format, migrations, build/typecheck et repository réussis.
  Le premier contrôle a signalé le dépassement du README ; son résumé CI a été déporté vers
  les références existantes, puis la limite et le gate complet ont réussi sans exemption.
- Livraison : `npm run publish` impose resynchronisation, garde de contribution et pre-push complet ;
  la CI `Quality gate` du commit publié constitue la preuve distante, avec son job `Full quality gate`.

- Cohérence backlog : 96 PBI actifs, 26 Réalisés, 69 Ouverts et 1 Bloqué ;
  dates/statuts et vue détaillée concordants, 24 PBI prêts ; MEP-009 prêt, MEP-036 réalisé.
