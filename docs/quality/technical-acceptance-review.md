# MEP-031 — Qualification préalable, revue DoD et livraison préparatoire

[Cahier](technical-acceptance.md) · [Matrice](technical-acceptance-dependencies.md).
Revue documentaire du 2026-11-12 ; base fraîche `origin/main` :
`ec4c3a535065c54e3c25abea8f52b722f5bef5be`.
Branche `docs/mep-031-technical-acceptance`, worktree interne
`C:\Users\garan\AppData\Local\Temp\assess-teams-mep-031`.

## Diagnostic confirmé avant rédaction

Recherche des fichiers de recette, références MEP-031 et nomenclature TEC : aucun cahier technique existant.
F17, fiche d'audit et registres concordent : socle partiel, livrable cible absent ; MEP-031 Ouvert/N/A,
MEP-022 Ouvert, MEP-055 Bloqué, MEP-039 Réalisé. Les anciennes lignes de `mess-historique.md`
ne remplacent pas les registres actifs. MEP-030 et MEP-067 restent réalisés, sans PV MESS.

Structure définie : index, protocole commun/commandes/jeux, six domaines de fiches TEC,
matrice de traçabilité/dépendances/décisions et présente revue. Aucun composant applicatif modifié.

## Inventaire des contrats et preuves de développement acquises

« Couvert » ci-dessous qualifie le socle documenté/testé ; **toutes les preuves de recette MESS restent à produire**.
Les historiques cités décrivent leurs propres entrées et campagnes ; aucune nouvelle campagne revendiquée ici.

| Couverture initiale | Contrat et preuve disponibles | Écart cible / scénario |
| --- | --- | --- |
| Partielle : installation/autonomie | [MEP-055 : matrice et écarts](../operations/installation-prerequisites-validation.md), inventaire configuration, builds développeur | Package/préflight/pose/services absents ; CDN Swagger à traiter ; TEC-01/02 |
| Couverte en développement : HTTP/secrets | [MEP-002](../architecture/http-security.md), [MEP-009 et preuves](../operations/configuration/startup-validation.md) ; tests `test_http_security_configuration/transport/sessions`, `test_startup_security/secrets/email` | PKI/proxy/ACL/chargeur unique cible non prouvés ; TEC-03/04/05 |
| Couverte en développement : droits/isolation | [MEP-011](../architecture/organization-isolation-validation.md), [MEP-037](../architecture/role-permissions-validation.md), [MEP-038](../architecture/indirect-access-validation.md) ; sessions/API réels et E2E cités, aucun export métier livré | Observations sur candidat/profil MESS nécessaires ; TEC-06/07 |
| Couverte en développement : SQLite | [MEP-039 : 126 mesures](../operations/sqlite/measurements.md), [MEP-010 : 22 cas multiprocessus](../operations/sqlite/contention-validation.md), [MEP-040 : 42 cas](../operations/sqlite/critical-conflicts-validation.md) | Transposition des barrières et vérification cible, sans assimiler select_for_update à un verrou ; TEC-08/09 |
| Absente : capacité MESS mesurée | Limites et matériel local explicités dans MEP-039 ; aucun volume/SLA MESS approuvé | C11 et protocole/générateur cible MEP-071 ; TEC-10 |
| Couverte en développement : SMTP | [MEP-004](../architecture/email-notifications.md) ; tests `test_email_queue/business/admin/smtp/concurrency/migration`, SMTP local réel, claims SQLite et récupération | Relais, pannes injectées, journaux et responsabilités MESS ; TEC-11 |
| Partielle : services | Workers et génération d'échéances présents, cycle de connexion [MEP-039](../operations/sqlite/README.md) | Services/supervision/arrêt OS MEP-063 et D09 absents ; TEC-12 |
| Couverte en développement : journaux | [MEP-042](../operations/configuration/journal-retention-validation.md), [MEP-020](../operations/journal-purge-validation.md) ; configuration, refus, intégrité, reçus et reprise | Durées/autorités, préparation historique du clone, tâches/ACL/backups cible ; TEC-13 |
| Absente : reprise outillée MESS | SQLite, migrations et atomicité présentes ; [F15](../backlog/source/mess/f15.md) décrit les outils à livrer | Backup/restore/rollback MEP-064/027/065, upgrade 026, C11 ; TEC-14/15/16 |
| Couverte pour contribution : gates | [CI](ci.md), [validation](validation-costs.md), scripts de publication/qualification/promotion présents | Qualification exhaustive SHA exact du futur candidat et PV distincts ; TEC-17 |

Commandes confrontées à `package.json`, manage.py et commandes Django, scripts de qualification/publish,
routes API et procédures d'exploitation. Le [catalogue](technical-acceptance-protocol.md#commandes-présentes)
ne propose aucun installateur, service, backup ou générateur de charge inexistant.
Les suites citées existent dans `backend/tests/` ; leurs procédures restent des appuis de développement,
pas une instruction d'exécuter les fixtures destructives sur cible.

## Revue des critères du préparatoire

| Critère | Vérification |
| --- | --- |
| Dix domaines canoniques | TEC-01 à 16 couvrent installation/hors Internet, TLS/CSRF, secrets, droits/isolation, SQLite, charge, SMTP, services, journaux et reprise ; TEC-17 complète les gates |
| Reproductibilité | P0 identifie candidat/configuration/rôles/état ; G spécifie jeux ; chaque fiche décrit procédure/injection/attendu/seuil/refus/preuves/R0 ; commandes futures et protocoles à approuver explicitement bloqués |
| Mesurabilité sans invention | Paramètres C11 détaillés avec valeur attendue, décideur, usage et effet bloquant ; D01–D09 rattachées à leur matrice ; constantes techniques existantes distinguées des objectifs MESS |
| Refus techniques réels | Configuration dangereuse, TLS/origine/proxy, droits/scope, BUSY/rollback, SMTP, restart, purge, restore/rollback et gate rouge ; absence d'effet interdit exigée par variante |
| Contrats conservés | 500 BUSY documenté distingué de 500 inattendu ; copies compatibles/idempotence préservées ; succès métier distinct de SMTP ; activity keep ; aucun changement de contrat ou de gouvernance |
| Traçabilité | Index + références/risques/refus/preuves/consommateurs des fiches + matrice par scénario ; dépendances canoniques séparées des recommandations et besoins de procédure |
| Absence d'exécution | Chaque verdict TEC Non exécuté ; aucun résultat local ou CI transformé en PV MESS ; aucun incident destructif injecté par ce chantier |
| Dépendances et clôture | MEP-031 reste Ouvert/N/A, aucune clôture ni indicateur recalculé ; finalisation ultérieure soumise au responsable produit après contrats/décisions |
| Incident indépendant | Investigation CI du 11 novembre citée sans conclusion ; aucun test/workflow/critère ajusté à une hypothèse, aucun accès au worktree CI ou TEAM-003 |

Le préparatoire n'est pas le cahier final : les commandes/protocoles manquants sont des blocages explicites,
pas une promesse de reproductibilité complète avant livraison des outils et décisions.

## DoD applicable au lot documentaire

Revue d'impact : README racine, AGENTS/règles détaillées, charte qualité, DoD, stratégie de tests,
fondamentaux, API/OpenAPI, configuration, contrats sécurité/SQLite/SMTP/journaux, sources et registres relus.
README inchangé conformément au périmètre exclusivement documentaire et à la demande explicite ;
aucune annonce technique artificielle. Seuls le cahier, ses compagnons et deux liens sources/suivi évoluent.

Tests nouveaux/backend/frontend/E2E, coverage, lint/formatage applicatifs, build/typecheck, migrations,
génération OpenAPI et qualification exhaustive : **non applicables à ce lot de prose auditée** ;
le plan d'impact confirme leur exclusion. Aucune fonctionnalité ni correction de bug à tester ici.
Les scénarios futurs ne constituent pas des tests exécutés par la rédaction. Aucun secret ni donnée réelle requis.
Limite 200 lignes, structure documentaire, détection des secrets, liens, diff propre, pre-push et CI exacte
restent applicables ; tout gate requis en échec empêche le succès de livraison.

## Contrôles et preuves de publication

`npm run quality:targeted` réussi : scope documentaire seul, zéro échec ; lignes, secrets, structure,
frontière des preuves, README non applicable et règles documentaires conformes. Aucun test applicatif lancé.
`git diff --check` réussi ; les champs obligatoires et verdicts Non exécuté des 17 scénarios sont vérifiés.
Revue des 12 fichiers du lot : 202 liens locaux (fichiers et ancres) résolus, aucun absent ; tous sous 200 lignes.
Publication initiale observée : `bbcd245b7f095069fe8ca07334e453201c1f136b`, par `npm run publish`.
Resynchronisation sans conflit, pre-push documentaire réussi, push direct confirmé puis main avancé en fast-forward.
La [CI indépendante du SHA exact](https://github.com/GaranceRichard/assess-teams/actions/runs/43229257129)
est terminée en succès : plan, repository et Required impact gate verts ; backend/frontend/E2E/full non requis.
Après ce succès, main principal vérifié propre et égal à origin/main (`0 0` de divergence).
Le présent ajout de preuve est soumis à sa propre publication et CI exacte ; son résultat final et le nettoyage
du seul chantier MEP-031 sont attestés dans le compte rendu de livraison, sans changer les verdicts TEC.
La publication obligatoire utilise `npm run publish` : verrou, fetch/rebase sur dernier origin/main,
pre-push bloquant, push branche dédiée → main, fast-forward sûr du checkout principal et attente CI exacte.
Une CI rouge reste un échec après push ; aucun contournement ni intervention sur l'investigation autonome.
Après succès : vérifier main propre, égal à origin/main et sans retard ; supprimer seulement le worktree
et la branche MEP-031. Les autres worktrees restent intacts. Ce bilan ne vaut aucun PV de recette.
