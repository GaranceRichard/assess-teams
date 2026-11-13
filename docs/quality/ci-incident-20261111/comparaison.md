# Comparaison contradictoire à SHA identique

> État de la phase d’audit initiale avant GO. Voir la [qualification du 12 novembre](qualification-20261112.md) et la [correction approuvée](correction.md) pour la suite.

[Identités, résultats et artefacts](campagnes.md) ; [provenance](provenance.md).

| Entrée / résultat | 9 novembre | 10 novembre | 11 novembre |
| --- | --- | --- | --- |
| SHA candidat | `ec4c3a535065c54e3c25abea8f52b722f5bef5be` | Identique | Identique |
| Workflow / événement / tentative | `exhaustive.yml` / schedule / 1 | Identique | Identique |
| Image des jobs shard 4 et E2E | Ubuntu 24.04.5, `20261101.360.1` | Identique | Identique |
| Runner / provisioner | `2.338.2` / `20261028.624` | Identique | Identique |
| Python effectif | 3.13.18 | Identique | Identique |
| Django / DRF | 5.2.19 / 3.16.1 | Identique | Identique |
| pytest / pytest-django / coverage | 8.4.2 / 4.14.0 / 7.17.2 | Identique | Identique |
| Autres dépendances Python installées | [Liste effective](environnement.md) | Liste identique au shard 4 | Liste identique au shard 4 |
| Node E2E | 22.23.4 | Identique | Identique |
| Playwright issu du lockfile | 1.63.0 | Identique | Identique |
| Backend shard 4 | 104 passés, 1357 non sélectionnés, 171,61 s | 104 passés, 1357 non sélectionnés, 184,32 s | 103 passés, 1 échec, 1357 non sélectionnés, 153,10 s |
| Couverture backend globale | Gate vert, TOTAL affiché 97 % | Identique | Gate non exécuté après échec shard 4 |
| E2E applicatifs | 75 + 75 passés | 75 + 75 passés | Aucun exécuté |
| E2E démo | 5 + 5 passés | 5 + 5 passés | Aucun exécuté |
| Chromium headless | 153.0.8010.12, révision 1243 téléchargée | Identique | Téléchargement non atteint |
| Artefact `qualification` | Présent, SHA exact | Présent, SHA exact | Absent |

Les versions ci-dessus sont lues dans les journaux des trois jobs pertinents de chaque
campagne et dans le lockfile immuable, pas déduites des seuls sélecteurs `ubuntu-latest`/`3.13`.
Les actions checkout/setup-python/upload-artifact résolvent les mêmes SHAs dans le shard 4
sur les trois campagnes. Les workflows réutilisables annoncent le même SHA candidat.
Les contraintes Python du dépôt sont des plages ; pour cette comparaison, les listes
effectivement installées sont identiques. Cela ne constitue pas un lockfile pérenne.

## Différences observables d’hôte

| Job | 9 novembre | 10 novembre | 11 novembre |
| --- | --- | --- | --- |
| Backend 4/8, région Azure | westcentralus | eastus2 | eastus2 |
| E2E 1/2, région Azure | centralus | northcentralus | southcentralus |
| E2E 2/2, région Azure | westus3 | centralus | westus |

Les Worker IDs diffèrent. Les runners sont des instances différentes, malgré la même image.
La région `eastus2` accueille à la fois le succès du 10 et l’échec backend du 11 ; elle
n’explique donc pas à elle seule l’incident. Les deux échecs APT touchent deux régions.
Les durées de partition ne prouvent ni saturation CPU ni ralentissement local du commit.
Le run backend rouge est même globalement plus court que les deux verts.

La version SQLite chargée, les latences disque, la pression CPU, les décisions de scheduler,
les captures DNS et les durées des verrous ne sont pas mesurées dans le run historique.
Les versions APT disponibles et la connectivité restent des entrées externes variables.
Aucun changement de code entre les trois runs n’est donc présumé ; aucune identité complète
de toutes les conditions d’exécution n’est revendiquée.

## Portée de la CI de publication

[Run 42622603260](https://github.com/GaranceRichard/assess-teams/actions/runs/42622603260) :
`Quality gate`, push du 9 novembre, plan `exhaustive=false`, changements documentaires seuls.
Jobs `plan`, `repository`, `Required impact gate` verts ; backend/frontend/E2E/full non requis.
L’artefact `impact-plan` confirme cette sélection. Ce succès n’est pas une preuve supplémentaire
de passage du scénario SQLite ni des parcours ; les nightly des 9 et 10 le sont.
