# Scoring global et contrôle de cohérence

Cette synthèse applique les formules de la [gouvernance](../governance.md) aux [sources détaillées](../README.md#source-fonctionnelle-détaillée) et au [registre canonique](../tracking/pbis.md).

## Indicateurs

| Indicateur | Valeur |
| --- | ---: |
| Nombre d’Epics | 9 |
| Nombre de Features | 35 |
| Features raffinées | 4 |
| Features non raffinées | 31 |
| Nombre total de PBIs raffinés | 7 |
| PBIs ouverts | 7 |
| PBIs réalisés | 0 |
| Avancement global des PBIs raffinés | 0 % |

## Formules appliquées

- Epics et Features : comptage de leurs identifiants uniques dans la source détaillée.
- Feature raffinée : Feature ayant au moins un PBI détaillé rattaché.
- Feature non raffinée : nombre de Features moins nombre de Features raffinées.
- PBIs raffinés : comptage des identifiants PBI uniques détaillés.
- PBIs ouverts : statuts explicites `Ouvert`, `En cours` ou `Bloqué` dans le registre.
- PBIs réalisés : statut explicite `Réalisé` dans le registre.
- Avancement global : `PBIs réalisés / PBIs raffinés × 100`, arrondi à l’entier le plus proche ; `N/A` si aucun PBI n’est raffiné.

## Contrôle de cohérence

Contrôle effectué sur le présent état documentaire :

- aucun identifiant d’Epic, de Feature ou de PBI absent ou dupliqué ;
- aucune Feature sans Epic et aucun PBI sans Feature ;
- les sept champs `Feature parente` correspondent à l’imbrication de la source détaillée ;
- aucune dépendance vers un identifiant inexistant, auto-dépendance ou dépendance circulaire ;
- aucun doublon fonctionnel évident détecté ;
- aucune divergence entre la source détaillée, le registre et les synthèses ;
- aucune taille, aucun modèle Codex, statut ou date présent uniquement dans une synthèse.

Le champ `Identifiant` répété dans chaque PBI confirme son titre et ne constitue pas une seconde déclaration. L’audit documentaire ne remplace pas un futur arbitrage produit sur d’éventuels recouvrements sémantiques.
