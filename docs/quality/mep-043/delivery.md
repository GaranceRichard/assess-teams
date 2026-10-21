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
La branche distante `codex/mep-043-protections` sera supprimée après intégration directe des travaux utiles.

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
L’outillage étant transverse, le pré-push exécutera le plan exhaustif requis avant l’intégration.
La CI distante ne peut être déclarée verte qu’après ce push et pour son SHA exact.
MEP-043 reste Bloqué pour la barrière CI préalable absente et G05 non vérifié.
