# MEP-043 — Protections et circuit PR approuvés

Préparation du 2026-10-20 sur `origin/main` : `f123f77461ff43a80914864f249231dc9489d5b0`.
Branche `codex/mep-043-protections`, worktree `C:\Users\garan\Desktop\Projets\Assess-teams-mep-043`.

**Accord explicite D1–D5 reçu le 2026-10-20. Mise en œuvre en cours ; clôture bloquée par G05.**
Le recadrage utilisateur du 2026-10-20 fait autorité : MEP-012 est clôturée et ses preuves sont des acquis.
Son statut, ses critères historiques et son dossier d’audit ne sont pas modifiés par cette préparation.
Seule MEP-043 pourra être clôturée après conformité démontrée et satisfaction de la DoD.
Les constats historiques de l’audit ne sont pas une décision de suivi prise dans ce chantier.

## Décisions approuvées

| Décision | Proposition | Conséquence explicite |
| --- | --- | --- |
| D1 — Circuit | `npm run publish` publie sa branche distante, ouvre/réutilise une PR vers main, attend la CI obligatoire, fusionne, vérifie la CI du SHA intégré et synchronise main local | Remplace les obligations de push direct des règles agents et leurs gardes, après accord uniquement |
| D2 — Protection | Ruleset actif sur `refs/heads/main`, PR obligatoire, branche à jour, force-push/suppression interdits, liste de bypass vide | S’applique aussi au propriétaire/admin et aux automates ; aucun mode de publication directe conservé |
| D3 — Contrôles | `Required impact gate`, produit par GitHub Actions observé, obligatoire sur toute PR ; `Full quality gate` pour plans exhaustifs, nightly et qualification MESS | Correspondance de l’exigence historique Full explicitement décidée pour MEP-043 ; aucun renommage trompeur ni réécriture de l’audit MEP-012 |
| D4 — Fusion/revue | Commit de fusion, branche strictement à jour, conversations résolues, zéro approbation humaine obligatoire | Le dépôt n’expose qu’un contributeur ; exiger une approbation indépendante nécessite d’abord un second relecteur autorisé. Aucun `--admin` |
| D5 — Preuves/refus | Branches jetables `mep-043-proof/*` dans ce dépôt, protégées par une copie équivalente du ruleset ; refus serveur puis PR verte exercés | Autorise les ressources de preuve dédiées ; aucun essai destructif sur main. Nettoyage limité aux ressources de preuve après conservation des traces |

D1 conserve worktrees dédiés, verrou commun de publication séquentielle, validations proportionnées,
pré-push bloquant et fast-forward sûr du checkout principal. La merge queue n’est pas retenue :
elle ajouterait un événement et un SHA à qualifier alors que le circuit strict satisfait le besoin actuel.
Après publication initiale de la branche, intégrer le nouveau main par merge puis push fast-forward de
la branche candidate ; aucun force-push nécessaire pour resynchroniser une PR en retard.
La fusion est demandée avec le HEAD attendu ; toute modification relance l’attente de la nouvelle CI.

## Règles proposées, sans application distante

Ce corps REST est un exemple à relire et tester après accord, jamais une preuve d’application.
L’App `github-actions`, ID `15368`, a été observée sur le check du SHA de référence.
Revalider son identité avant activation. Ne pas activer `update`, qui interdirait aussi les fusions sans bypass.

```json
{
  "name": "Assess teams — main via PR et impact gate",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": { "include": ["refs/heads/main"], "exclude": [] }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "allowed_merge_methods": ["merge"],
        "required_approving_review_count": 0,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          { "context": "Required impact gate", "integration_id": 15368 }
        ],
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false
      }
    }
  ]
}
```

Les règles couvrent G01–G04. L’absence de bypass ne supprime pas la faculté administrative de
reconfigurer un dépôt appartenant à un compte personnel : distinguer configuration et droit d’intégration.
Le script doit relire les règles actives et refuser une protection manquante ou affaiblie avant fusion.
Le workflow qualité conserve `contents:read` ; ses permissions ne servent pas à fusionner les PR.

## G05 — Acteurs autorisés et preuves manquantes

[Les lectures distantes](remote-evidence.md) confirment le seul collaborateur visible `GaranceRichard`
(admin), aucune clé de déploiement et des permissions Actions par défaut en lecture, sans approbation PR.
Le jeton CLI courant permet la configuration mais `/user/installations` refuse son inventaire (403).
La liste exhaustive des Apps, PAT, autorisations OAuth et clés SSH utilisables n’est donc pas acquise.

Après accord, rechercher les vues administrateur accessibles et rapprocher chaque acteur/credential :
identité, propriétaire, dépôt accessible, droits de branche/PR/checks/administration, usage, date et preuve.
Ne jamais collecter les valeurs de secrets. Une preuve d’absence doit couvrir explicitement son périmètre.
La cible est une identité de publication avec droits nécessaires aux branches et PR, sans administration ;
la configuration initiale reste une opération administrative séparée. Le choix du credential doit être
approuvé s’il nécessite une création, une révocation ou une réduction de droits ; aucune mutation implicite.
Sans accès ou attestation propriétaire suffisamment précise, G05 reste non vérifié et MEP-043 non clôturée.

## Preuves et état d’exécution

- [Mise en œuvre, validations et blocage G05](implementation.md).
- [Refus serveur datés et chemin vert jetables](server-refusals.md).
- [Lectures préparatoires et acteur visible](remote-evidence.md).

## Suite après accord

[Plan de transition et matrice des tests](transition.md). Aucune dépendance ni donnée de backlog modifiée.
La source F04 et les règles de livraison seront mises à jour uniquement dans le périmètre autorisé,
en préservant le statut MEP-012. L’accord D1–D5 autorise la mise en œuvre et les essais jetables ; aucune réserve ajoutée.

Sources GitHub consultées le 2026-10-20 :
[règles disponibles](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets),
[API rulesets](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset).
Ces sources décrivent les possibilités ; seules les futures preuves serveur démontreront leur application.
