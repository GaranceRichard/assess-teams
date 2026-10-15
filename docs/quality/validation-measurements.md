# Audit et mesures du pipeline — 15 octobre 2026

## Référence avant modification technique

Aucun historique `.cache/quality/metrics.jsonl` n'était présent dans le checkout principal.
Une campagne fraîche complète a donc été mesurée sur `a699981b73ee9708836c2a57b7e83c913138804f`,
dans le worktree isolé, avant de modifier ses scripts. Seule l'annonce préalable du README a été
ajoutée pendant les tests, après le contrôle du dépôt ; aucune entrée applicative n'a changé.
Windows x64, Node 24.20.0, Python 3.12.10 ; runtimes installés et chauds, hors temps de bootstrap.
La [référence JSON](validation-baseline.json) conserve les quatre métriques brutes, le SHA et les comptes.

| Scope initial | Durée | Tests applicatifs |
| --- | --- | --- |
| Repository | 64,959 s | 0 ; tests outillage/bootstrap inclus |
| Backend | 567,164 s | 1 026 |
| Frontend | 51,395 s | 393 |
| E2E réels et démo | 413,138 s | 73 |
| Total mural | **1 097,063 s — 18 min 17 s** | **1 492** |

La CI de référence [38801566219](https://github.com/GaranceRichard/assess-teams/actions/runs/38801566219)
a pris 275 s (4 min 35 s). Le temps runner cumulé reste distinct du temps mural et d'une facture.

## Causes constatées

- Le pré-push lançait toujours repository/backend/frontend/E2E, même pour le backlog.
- Repository rejouait environ 65 s de tests des scripts et du bootstrap sans changement d'outillage.
- Le ciblage explicite basculait automatiquement en complet pour les scripts ou fichiers sensibles,
  y compris pendant les itérations sur le pipeline lui-même.
- Chaque empreinte couvrait presque tout le dépôt ; une modification de domaine indépendant invalidait les preuves.
- Une sélection ciblée ne produisait pas de preuve réutilisable par le pré-push.
- La CI exécutait toutes ses campagnes à chaque push. Ses shards et consolidations étaient déjà utiles,
  sans second passage global : ils sont conservés pour l'exhaustif.
- Les caches pip/npm accéléraient les téléchargements, pas les campagnes de tests ; les installations
  par worktree restent nécessaires à l'isolation. Aucun runtime actif n'est partagé.

## Comparaison mesurée

Le banc `quality:benchmark` simule les chemins du diff pour chaque classe puis exécute réellement
les contrôles sélectionnés sur le worktree. Il n'édite pas le code métier pour provoquer un scénario.
Les [résultats JSON](validation-benchmarks.json) identifient l'empreinte des sources mesurées.
Ces mesures ne sont pas une moyenne statistique ni une mesure du bootstrap ou de toute une session Codex.

| Scénario | Ancien gate frais | Nouveau gate local | Gain mural | Tests backend / frontend / E2E |
| --- | --- | --- | --- | --- |
| Backlog seul | 1 097,063 s | **5,512 s** | **99,5 %** | **0 / 0 / 0** |
| Documentation pure | 1 097,063 s | **5,472 s** | **99,5 %** | **0 / 0 / 0** |
| Backend local : filtres journaux | 1 097,063 s | **48,443 s** | **95,6 %** | **46 / 0 / 0** |
| Frontend local : dateInputValue | 1 097,063 s | **29,530 s** | **97,3 %** | **0 / 103 / 0** |
| Backend identique, reprise | 1 097,063 s | **8,653 s** | **99,2 %** | 0 ; 2 preuves réutilisées |
| Frontend identique, reprise | 1 097,063 s | **8,584 s** | **99,2 %** | 0 ; 2 preuves réutilisées |
| Authentification/SQLite sensible | Exhaustif | Exhaustif | Aucun gain artificiel revendiqué | Tous |
| Transverse ou inconnu | Exhaustif | Exhaustif | Aucun gain artificiel revendiqué | Tous |
| Nightly | Pas de workflow dédié | Exhaustif indépendant | Coût assumé quotidiennement | Tous |
| Candidat MESS | Pas de gate de promotion explicite | Qualification exhaustive SHA exact | Coût assumé par candidat | Tous |

Sur ces exemples, le nombre de tests sans rapport passe de 1 492 à zéro pour la prose,
à 46 pour le backend et à 103 pour le frontend. Aucune suppression de test ni baisse de seuil.
Les contraintes du dépôt restent fraîches dans les reprises ; empreintes et dépendances sont revérifiées.
Les cartes prudentes peuvent sélectionner davantage de tests : un Python non cartographié conserve tout le backend,
un parcours inconnu conserve tous les E2E, et une modification des scripts conserve l'exhaustif.

L'objectif de -50 % et la cible locale de deux minutes sont dépassés sur les quatre scénarios simples mesurés.
Cela ne garantit pas deux minutes pour tout changement qualifié de « petit » : risque et dépendances prévalent.
Le pré-push ajoute sa garde Git et le calcul du diff. `publish` attend aussi une CI indépendante après push ;
ce délai de livraison ne doit pas être confondu avec le temps local de validation.

## Reproduction et preuves

```powershell
npm run quality:benchmark
npm run quality:benchmark -- documentation
npm run quality:benchmark -- backlog
npm run quality:benchmark -- backend
npm run quality:benchmark -- frontend
# Répéter backend/frontend sans changer les entrées pour mesurer REUSE.
Get-Content .cache/quality/metrics.jsonl
Get-Content .cache/quality/scenarios.jsonl
```

La première commande décrit aussi les plans sensible, transverse, nightly et MESS sans les exécuter.
Pour une campagne fraîche indépendante : `npm run quality:full -- --fresh`.
Pour le candidat production : `npm run quality:qualify -- SHA_COMPLET`, puis la qualification GitHub
et le gate de promotion décrits dans [CI](ci.md).

Les tests automatisés couvrent classification, union des sélections, skips CI justifiés, échecs bloquants,
suppression/corruption/expiration des preuves, sélecteurs et environnements, modifications en cours de gate,
publication refusée et cohérence du candidat. Un vrai rebase Git documentaire conserve l'empreinte,
un rebase apportant une dépendance l'invalide. Les tests YAML préservent déclencheurs, SHA, shards et rapports.
Les exécutions distantes de livraison sont consultables dans Actions ; un résultat rouge reste bloquant.
Les limites de protection du push direct et de remise MESS hors dépôt sont explicites dans [CI](ci.md).

## Publication réelle du pipeline

Le commit `22c0bfaa3bdf649da93822eff0a78a85dca2d500` a passé le pré-push exhaustif :
1 029 tests backend (97,27 % de couverture), 393 frontend et 73 E2E, avec tous les statiques.
La [CI indépendante 38809104099](https://github.com/GaranceRichard/assess-teams/actions/runs/38809104099)
a réussi sur ce même SHA, y compris les fusions backend/E2E et le required impact gate.
Cette campagne transversale a pris 308 s murales et 1157 s cumulées de jobs, contre 275 s et 1 264 s initialement.
Aucun gain n'est revendiqué pour l'exhaustif : le plan et l'identification du candidat ajoutent des étapes,
et les durées des runners varient. Les économies viennent de la sélection des changements ordinaires.
L'ajout documentaire de ce compte rendu sert aussi de publication réelle sans tests applicatifs.
Le déclenchement manuel du workflow exhaustif et le gate de promotion sont vérifiés séparément sur le SHA final.
