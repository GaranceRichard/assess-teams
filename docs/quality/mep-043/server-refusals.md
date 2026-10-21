# MEP-043 — Refus serveur et chemin vert jetables

Preuve historique conservée : circuit PR retiré le 2026-10-21 ; aucune règle PR appliquée à main.

Essais D5 autorisés du 2026-10-20, avec le compte administrateur `GaranceRichard`.
Références exclusivement jetables ; aucun force-push ou DELETE de main effectué.

- Base initiale : `d24fb35e5fd012fcf10d29c166a9a7e84722e573`.
- Cible protégée : `mep-043-proof/base-20261020-143946`.
- Branche de PR rouge puis verte : `mep-043-proof/red-20261020-143946`.
- [Ruleset jetable 25482365](https://github.com/GaranceRichard/assess-teams/rules/25482365).
- [PR rouge puis verte #1](https://github.com/GaranceRichard/assess-teams/pull/1).
- [PR sans CI #2](https://github.com/GaranceRichard/assess-teams/pull/2).
- [Run rouge 39441319917](https://github.com/GaranceRichard/assess-teams/actions/runs/39441319917).
- [Run vert 39441629992](https://github.com/GaranceRichard/assess-teams/actions/runs/39441629992).

Les règles sont issues de la même fonction `protectionRules` que la cible main, avec nom/cible adaptés.
Le ruleset est actif, bypass vide, PR et branche à jour requises, check lié à GitHub Actions ID 15368,
suppression/force-push interdits. La relecture a révélé les méthodes GitHub par défaut ; la règle a
ensuite été resserrée sur `allowed_merge_methods: ["merge"]`, conformément à D4, avant la fusion verte.

## Refus constatés

Chaque refus est retourné par GitHub, sans hook local ; le SHA de cible a été relu inchangé après
les groupes d’essais. Les corps ci-dessous sont les messages réels, pas des conclusions de fixtures.

### Mise à jour de référence

`PATCH /git/refs/heads/mep-043-proof/base-20261020-143946` — HTTP 422

Date: Tue, 20 Oct 2026 14:39:50 GMT
X-Github-Request-Id: FAE8:39B3D0:25A347:78CE49:6AD77D36

```text
Repository rule violations found

Cannot force-push to this branch

Changes must be made through a pull request.
```

### Suppression de référence

`DELETE /git/refs/heads/mep-043-proof/base-20261020-143946` — HTTP 422

Date: Tue, 20 Oct 2026 14:39:53 GMT
X-Github-Request-Id: FAE9:657E9:255191:778703:6AD77D37

```text
Repository rule violations found

Cannot delete this branch
```

### Mise à jour de référence

`PATCH /git/refs/heads/mep-043-proof/base-20261020-143946` — HTTP 422

Date: Tue, 20 Oct 2026 14:39:56 GMT
X-Github-Request-Id: FAED:263D5F:267C7D:7A3CE8:6AD77D3C

```text
Repository rule violations found

Changes must be made through a pull request.

Required status check "Required impact gate" is expected.
```

### Fusion PR

`PUT /pulls/2/merge` — HTTP 405

Date: Tue, 20 Oct 2026 14:41:04 GMT
X-Github-Request-Id: FB03:131978:26F51F:7C5AB0:6AD77D7E

```text
Repository rule violations found

Required status check "Required impact gate" is expected.
```

### Fusion PR

`PUT /pulls/1/merge` — HTTP 405

Date: Tue, 20 Oct 2026 14:41:58 GMT
X-Github-Request-Id: DD71:FE7BA:2B2561:8A619D:6AD77DB4

```text
Repository rule violations found

Required status check "Required impact gate" is failing.
```

### Fusion PR

`PUT /pulls/2/merge` — HTTP 405

Date: Tue, 20 Oct 2026 14:42:22 GMT
X-Github-Request-Id: DD7C:36526B:2A76A0:884FF9:6AD77DCC

```text
Repository rule violations found

Required status check "Required impact gate" was not set by the expected GitHub app.
```

### Fusion PR

`PUT /pulls/1/merge` — HTTP 405

Date: Tue, 20 Oct 2026 14:46:30 GMT
X-Github-Request-Id: CFB1:23A9C1:325D92:9FF636:6AD77EC5

```text
Squash merges are not allowed on this repository.
```

## Chemin vert

Le run vert termine en succès : contrôle documentaire et `Required impact gate` réussis,
backend/frontend/E2E et full hors plan skipped. Le check Actions `118692984881` appartient à la
suite `106880262625` et au candidat vert `833a2d9dfc5f9cda157750be0e5c9a4fca0832ee`.
Après refus de squash, GitHub a accepté le commit de merge sous les mêmes règles actives :
`f6a3b8a27299e9310c4ee3ceeee45fe2ac62c23a`, relu comme nouveau SHA de la seule cible jetable.

Ces essais prouvent disponibilité effective des rulesets sur le dépôt public et refus administrateur,
CI absente/rouge, mauvais producteur et mauvaise méthode de fusion.
La configuration effective de main et sa livraison sont des preuves distinctes à enregistrer ensuite.
G05 reste incomplet ; cette preuve ne constitue pas un inventaire des credentials personnels.

## CI verte devenue obsolète

Les PR jetables [#3](https://github.com/GaranceRichard/assess-teams/pull/3) et
[#4](https://github.com/GaranceRichard/assess-teams/pull/4) partent de la même base.
Leurs runs [avance](https://github.com/GaranceRichard/assess-teams/actions/runs/39443148497) et
[ancienne CI verte](https://github.com/GaranceRichard/assess-teams/actions/runs/39443156556) réussissent.
Après fusion de #3 en `50489a1c013ea2fdbd2945f769f8d6b3bdcfb134`, #4 est relue `mergeable_state: behind`.
Sa tentative de fusion est refusée en HTTP 405 : le check est attendu sur le nouveau candidat.
Le SHA cible relu reste `50489a1c013ea2fdbd2945f769f8d6b3bdcfb134`, sans intégration de #4.

Date: Tue, 20 Oct 2026 14:55:42 GMT
X-Github-Request-Id: DCA8:23E327:4E3AC1:FAD276:6AD780EC

```text
Repository rule violations found

Required status check "Required impact gate" is expected.
```
