# MEP-043 — Preuves de nettoyage et livraison directe

Décision utilisateur du 2026-10-21 : aucune nouvelle PR, aucun force-push, main conservé.
La PR #5 a été examinée : son candidat `57f25edf115a48b73e287168cb87069cab132649`
imposait le circuit PR. Il n’a pas été fusionné ; seules preuves et protections compatibles sont reprises.
Ses commits et ceux des essais sont archivés localement avant toute suppression distante :
tag `archive/mep-043-pr-withdrawn-20261021`, références `refs/archive/mep-043-proof/*`,
bundle vérifié `.cache/mep-043/withdrawn-work-20261021.bundle`, historique complet.

## PR fermées sans fusion

| PR | Branche | État relu |
| --- | --- | --- |
| [2](https://github.com/GaranceRichard/assess-teams/pull/2) | `mep-043-proof/missing-20261020-143946` | closed, merged=false |
| [4](https://github.com/GaranceRichard/assess-teams/pull/4) | `mep-043-proof/stale-20261020-143946` | closed, merged=false |
| [5](https://github.com/GaranceRichard/assess-teams/pull/5) | `codex/mep-043-protections` | closed, merged=false |

## Ressources d’essai supprimées après archivage

Ruleset `25482365` supprimé ; il ciblait uniquement la branche d’essai.
Chaque SHA distant a été comparé à son archive avant suppression, sans force-push.

- `mep-043-proof/base-20261020-143946`.
- `mep-043-proof/red-20261020-143946`.
- `mep-043-proof/missing-20261020-143946`.
- `mep-043-proof/advance-20261020-143946`.
- `mep-043-proof/stale-20261020-143946`.

Aucune branche de travail locale utilisée n’a été supprimée.
La branche distante `codex/mep-043-protections` a été supprimée après intégration directe
et CI verte de `7c00603` ; le tag, le bundle, la branche locale et le worktree utilisés sont conservés.

## Ruleset conservé sur main

Création GitHub en HTTP 201 ; réponse projetée, sans credential :

Date: Wed, 21 Oct 2026 12:00:28 GMT
X-Github-Request-Id: F170:3D6872:2B4AC8:8CB33E:6AD8A95C

```json
{
  "id": 25544011,
  "name": "Assess teams - main direct push",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "refs/heads/main"
      ]
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    }
  ]
}
```

La lecture des règles actives confirme exactement `deletion` et `non_fast_forward`.
Le vérificateur réel du publisher a accepté ce ruleset : push direct autorisé, bypass vide.
Aucune règle de PR, approbation, merge queue ou check préalable n’est active.
Les refus historiques de suppression/force-push restent conservés dans `server-refusals.md` ;
aucune tentative destructive sur main ni nouvel essai PR n’a été effectué.

## Validations

Huit tests ciblés réussis : publication directe et fast-forward, pré-push refusé, principal sale/divergent,
verrou concurrent, ancien mode `-Prepare` refusé et protections directes compatibles/incompatibles.
Aucun fichier maintenu ne dépasse 200 lignes ; `git diff --check` passe.
Les contrôles GitHub courants du module sont des GET en lecture seule ; aucune mutation automatique de règle.
Le pré-push a exécuté le plan exhaustif frais, sans réutilisation de preuve :

| Scope | Résultat | Durée |
| --- | --- | --- |
| repository | 0 / succès, incluant tests positifs et refus des gates | 70,865 s |
| backend | 1 434 réussis ; couverture 97,48 % | 1 245,873 s |
| frontend | 428 réussis ; quatre couvertures > 90 %, build/typecheck/lint/format verts | 123,053 s |
| e2e | 66 produit et 10 démo réussis, build démo inclus | 464,184 s |

Les métriques JSONL locales relient chaque verdict à la base
`d24fb35e5fd012fcf10d29c166a9a7e84722e573` et au candidat
`7c00603ec67419f0b4aafd7142fc714e46e3b8bc`, `reused=false` et `status=0`.
Les tests ciblés incluent le wrapper npm réel sans argument, après correction du défaut
Windows PowerShell de résolution du Root lors de la liaison des paramètres.
Aucun test backend/frontend n’est ajouté : aucune capacité applicative n’est modifiée.

## Première publication directe

`npm run publish` a poussé normalement `codex/mep-043-protections:main` :
`d24fb35` → `7c00603`. Aucun force-push, PR ou fusion GitHub.
Les commits utiles sont `dffd979` et `7c00603` ; le dernier corrige le démarrage sans argument.
Le principal a été avancé exclusivement en fast-forward et vérifié propre,
`main == origin/main == 7c00603ec67419f0b4aafd7142fc714e46e3b8bc`.
Le test d’ascendance du candidat PR retiré `57f25ed` vers main retourne 1 :
son historique technique PR n’est pas intégré.

La [CI du SHA publié](https://github.com/GaranceRichard/assess-teams/actions/runs/39601964143)
est terminée avec `conclusion=success`, relue par API avant suppression de la branche de #5.
Les huit partitions backend, les deux partitions E2E et leur fusion sont vertes.
`Required impact gate` et `full / quality / Full quality gate` : succès.
Les skips des jobs sélectifs sont justifiés par l’exécution du workflow exhaustif.
La CI est indépendante et postérieure au push, elle ne constitue pas un verrou avant intégration.
Les règles de qualification/promotion MESS exhaustive restent inchangées ; aucune promotion revendiquée.

## Inventaire G05 toujours incomplet

Nouvelle lecture autorisée `GET /user/installations`, sans changement des credentials :
HTTP 403, Date: Wed, 21 Oct 2026 12:12:16 GMT,
X-Github-Request-Id: DCD9:10A7A:14BED6D:437F2B3:6AD8AC1F.
Le serveur exige un token autorisé à une GitHub App pour cette liste.
Ce refus n’est ni une liste vide ni une preuve d’absence d’acteurs.
Les lectures de collaborateurs, clés de déploiement, webhooks et permissions Actions sont
conservées dans `remote-evidence.md` ; elles n’inventorient pas tous les Apps/PAT/OAuth/SSH.
MEP-043 reste Bloqué pour la barrière CI préalable absente et G05 non vérifié.

## Contrôle distant après nettoyage

Aucune PR ouverte ; #2, #4 et #5 relues `closed`, `merged=false`.
La liste distante des branches ne contient que `main` ; seul ruleset : `25544011`.
Réponses GitHub datées, corps projetés précédemment et ressources exactes ci-dessous :

| Requête (sous /repos/GaranceRichard/assess-teams/) | HTTP | Date GitHub | Request-Id |
| --- | --- | --- | --- |
| DELETE git/refs/heads/mep-043-proof/base-20261020-143946 | 204 | Wed, 21 Oct 2026 12:00:31 GMT | F175:2B2FF9:2A77FD:8AA53D:6AD8A95E |
| DELETE rulesets/25482365 | 204 | Wed, 21 Oct 2026 12:00:30 GMT | F173:3A23A3:2DD00F:94B0D1:6AD8A95D |
| DELETE git/refs/heads/mep-043-proof/red-20261020-143946 | 204 | Wed, 21 Oct 2026 12:00:32 GMT | F177:3A23A3:2DE13D:94E919:6AD8A95F |
| DELETE git/refs/heads/mep-043-proof/missing-20261020-143946 | 204 | Wed, 21 Oct 2026 12:00:33 GMT | F179:E04C8:2CB66D:91DDE1:6AD8A961 |
| DELETE git/refs/heads/mep-043-proof/advance-20261020-143946 | 204 | Wed, 21 Oct 2026 12:00:35 GMT | F17B:33D85D:2C4733:901BE3:6AD8A962 |
| DELETE git/refs/heads/mep-043-proof/stale-20261020-143946 | 204 | Wed, 21 Oct 2026 12:00:37 GMT | F17D:1D3FCC:2DF3F0:953085:6AD8A964 |
| DELETE git/refs/heads/codex/mep-043-protections | 204 | Wed, 21 Oct 2026 12:50:16 GMT | C33E:6FA4B:7BA8F9:192A4FD:6AD8B507 |
| GET branches?per_page=100 | 200 | Wed, 21 Oct 2026 12:50:18 GMT | C347:354C70:887F8E:1BE1206:6AD8B50A |

Les mutations sont limitées aux ressources autorisées ; aucune opération destructive sur main.
Le relevé documentaire suivant est publié par le même circuit direct et son plan documentaire ;
sa CI exacte doit être verte avant le compte rendu final. Aucun nouveau circuit ni nouvelle PR.
