# Règles permanentes des agents

Ce fichier est l'autorité d'entrée pour toute contribution au dépôt **Assess teams**. Les règles détaillées de
qualité, de tests, de documentation et de livraison restent obligatoires dans
[`docs/quality/agent-rules.md`](docs/quality/agent-rules.md).

## Isolation obligatoire

- Tout chantier part du dernier état pertinent de `origin/main`.
- Il utilise une branche dédiée et un worktree dédié créé hors du dépôt principal.
- L'agent annonce au démarrage le nom de la branche et le chemin physique du worktree.
- Aucun chantier ne modifie directement le checkout principal ouvert dans VS Code.
- Le checkout principal reste stable pendant le chantier : ne demander ni workspace multi-root, ni changement de dossier VS Code,
  ni ouverture manuelle d'un worktree.
- La seule mutation finale autorisée dans ce checkout principal est le fast-forward sûr de sa branche locale
  `main` vers `origin/main` après publication.
- Un worktree de chantier est un espace interne à l'agent ; son chemin n'est communiqué que pour traçabilité.

## Intégration asynchrone

- Le premier PBI prêt n'attend pas les autres. Il récupère le dernier `origin/main`, resynchronise sa branche,
  résout les conflits éventuels et valide exactement l'état destiné à `main`.
- Il pousse immédiatement cet état sur `main`, sans publier sa branche de travail comme étape intermédiaire.
- Chaque PBI retardataire répète la même séquence depuis le nouveau `origin/main` : resynchronisation, résolution
  des conflits, validations finales, intégration et push sur `main`.
- Le `pre-push` et la CI restent les gates bloquants d'Assess teams. Ils ne sont jamais contournés.
- Un travail ne prend jamais fin tant que la branche locale `main` du checkout principal est en retard sur
  `origin/main`, même d'un seul commit.
- Après confirmation du push, l'agent vérifie que ce checkout est propre et non divergent, puis avance son
  `main` local exclusivement en fast-forward. Si ce rattrapage sûr est impossible, il n'écrase aucune donnée et
  le travail reste non terminé jusqu'à résolution du blocage.
- Après confirmation du push, l'agent supprime uniquement le worktree et la branche du PBI terminé. Il ne
  nettoie, ne déplace et ne modifie jamais le worktree ou la branche d'un autre chantier.

## Règles de livraison

- La séquence normale est `travail → validations ciblées → commit → resynchronisation → pre-push complet → push`.
- Le push de publication utilise la branche dédiée comme source et `main` comme destination.
- Toute règle qualité existante d'Assess teams demeure applicable, notamment la limite de 200 lignes, les tests,
  les couvertures, le lint, le formatage, la sécurité, les migrations et la revue documentaire.
- Les détails techniques propres à un autre dépôt ne sont pas transposés sans équivalent dans Assess teams.
