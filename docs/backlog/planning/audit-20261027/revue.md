# Revue documentaire et contrôle de la proposition

Audit commencé le 2026-10-27, repris et contrôlé le 2026-10-28.
[Livrables](README.md), base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
Ce compte rendu porte sur le dossier de proposition ; il ne clôt aucun PBI produit ou MESS.

## Impact et DoD applicable

| Domaine relu | Conclusion d’impact |
| --- | --- |
| AGENTS.md et agent-rules.md | Branche/worktree dédiés ; fichiers du checkout principal conservés. Préparation documentaire demandée : ni publication ni nettoyage du worktree de revue. |
| README racine | État produit inchangé ; pas de changement technique nécessitant son annonce préalable selon agent-rules. Le point d’entrée de cette proposition est son README local. Aucune modification artificielle du README racine. |
| Gouvernance, sources, suivi et synthèse | Autorités préservées ; aucun statut/date/parent/décision modifié. Les corrections proposées restent locales, hors des sources canoniques. |
| Charte qualité, DoD et stratégie de tests | Limite de 200 lignes, critères/refus et preuves nécessaires conservés ; aucune baisse de seuil ou de gate. |
| Vision, architecture et contrats API/OpenAPI | Confrontés à la proposition ; aucun endpoint, contrat, modèle ou règle d’autorisation modifié. Les contradictions de cible/livré sont consignées, pas corrigées implicitement. |
| Cahiers fonctionnel et UX | Restent des cahiers, pas des PV cible. Viewports/zoom/contrastes existants repris sans seuil supplémentaire inventé. |
| Tests, couvertures, lint/build/typecheck applicatifs, migrations et génération OpenAPI | Non applicables au diff exclusivement documentaire ; aucune campagne métier nouvelle exécutée ou revendiquée. Les obligations des futurs changements demeurent. |
| Pre-push et CI | Non exécutés : aucun push autorisé à ce stade de revue. Aucun gate contourné, aucune PR créée. Une publication ultérieure utilisera npm run publish et attendra la CI du SHA exact. |
| Données et sécurité | Seulement IDs de backlog, chemins suivis et jeux fictifs cités ; aucun secret réel ou donnée de production ajouté. |
| Esthétique | Lecture de deux captures MEP-013 historiques ; aucune certification globale ou acceptation esthétique sur simple suite verte. |

## Contrôles documentaires

Contrôles exécutés le 2026-10-28 :

- 96 IDs uniques identiques entre les cinq registres, les sources actives, les 96 lignes de matrice
  et les 96 dossiers ; parents, statuts et dates concordants. Aucun ID actif omis ou ajouté.
- 52 fiches A–G = 51 non réalisés + USER-001 ; trois scénarios GIVEN/WHEN/THEN/SHOULD BE
  par fiche, dont le vrai refus ; aucun autre réalisé réécrit en fiche de développement.
- 45 Réalisés, 48 Ouverts, 3 Bloqués ; catégories 47/20/22/2/5/0, total 96.
- Graphe des champs de dépendances PBI actifs : aucune référence inconnue ni cycle détecté ;
  prérequis MEP-001–008 reconnus comme acquis historiques, pas comme PBI actifs ajoutés.
- 105 documents, maximum 188 lignes ; 1 006 liens locaux/ancres résolus, aucun absent.
  UTF-8 sans caractère de remplacement, aucune fin de ligne avec espaces superflus.
- Aucune modification de fichier suivi : seuls les 105 fichiers de ce dossier sont ajoutés localement.
  Contrôle `git diff --check` conforme ; espaces des fichiers nouveaux vérifiés séparément.
- `npm run quality:targeted` : scope documentaire seul, zéro échec ; limite de lignes, secrets,
  structure et workflow documentaire conformes. Backend/frontend/E2E explicitement non sélectionnés.
- Checkout principal propre ; `main...origin/main` = 0/0 à la vérification finale,
  tous deux à `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`. Aucun fast-forward nécessaire.

Le contrôle de cohérence est ponctuel et local ; aucun script, test métier ou workflow n’est ajouté au dépôt.

## Provenance vérifiée

- `git fetch origin main` à la reprise : référence distante inchangée, worktree à 0 commit d’écart de la base.
- [Rapprochement Git et entrées](preuves-reutilisation.md) : douze SHAs cités au registre résolus,
  tous ancêtres de la base. Cela prouve l’intégration, pas une CI courante verte.
- MEP-013 : 19/26 entrées identiques, sept modifiées ; aucune transposition complète de la campagne historique.
- Les [96 diagnostics](matrice.md) renvoient aux sources et aux groupes de preuves.
- Les catégories d’audit restent distinctes des 45 réalisations, 48 ouvertures et 3 blocages canoniques.

## Conservation pour revue

Le seul ajout autorisé est ce dossier Markdown dans le worktree dédié.
Aucune intégration canonique, aucun commit de publication ni push ne sont réalisés.
L’absence de publication est l’application de la demande utilisateur « Présenter d’abord la matrice
contradictoire et les propositions de restructuration » et « Aucune publication prématurée ».
Le travail d’analyse est remis pour revue ; les décisions indiquées restent à rendre par leurs responsables.

## Revue de consolidation distincte

Les résultats des contrôles ci-dessus concernent les 105 documents de la première phase.
La [revue de consolidation](consolidation-revue.md) et son [contrôle documentaire](consolidation-controles.md)
consignent les ajouts/corrections de cette mission, sans annuler les résultats historiques.
Aucune qualification applicative ou acceptation visuelle n’est produite par un gate de documentation.
