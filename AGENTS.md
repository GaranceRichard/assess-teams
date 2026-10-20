# Règles permanentes des agents

Ce fichier est l'autorité d'entrée pour toute contribution au dépôt **Assess teams**. Les règles détaillées de
qualité, de tests, de documentation et de livraison restent obligatoires dans
[`docs/quality/agent-rules.md`](docs/quality/agent-rules.md).

## Isolation obligatoire

- Tout chantier part du dernier état pertinent de `origin/main`.
- Il utilise une branche dédiée et un worktree dédié créé hors du dépôt principal.
- L'agent annonce au démarrage le nom de la branche et le chemin physique du worktree.
- Aucun chantier ne modifie directement le checkout principal ouvert dans VS Code.
- Le checkout principal reste stable : ni workspace multi-root, ni changement de dossier VS Code,
  ni ouverture manuelle du worktree, qui est interne à l'agent et annoncé pour traçabilité.
- Sa seule mutation finale autorisée est le fast-forward sûr de `main` vers `origin/main` après fusion.

## Intégration asynchrone par PR

- La publication utilise `npm run publish` : verrou local commun conservé jusqu'à la fin de l'intégration,
  resynchronisation, pré-push proportionné, branche distante, PR, CI obligatoire, fusion, synchronisation locale.
- Le premier PBI prêt n'attend pas les autres. Il récupère le dernier `origin/main`, resynchronise sa branche,
  résout ses conflits et valide exactement son candidat avant de publier sa propre branche distante.
- Une branche déjà publiée est resynchronisée par merge de main puis push fast-forward, sans réécriture.
- Chaque PBI retardataire repart du nouveau `origin/main` et répète contrôles et CI sur sa PR à jour.
- Le push direct vers `main` est interdit. La fusion utilise un commit de merge et le HEAD attendu,
  après `Required impact gate` réussi, conversations résolues et vérification des règles actives sans bypass.
- Le `pre-push` et la CI restent les gates bloquants d'Assess teams. Ils ne sont jamais contournés.
- Ne jamais utiliser `--admin`, `--no-verify`, un force-push ou une désactivation de protection pour publier.
- Après fusion, confirmer le SHA intégré, sa CI verte et sa présence dans `origin/main`.
- Vérifier que le checkout principal est propre, sur main et non divergent, puis l'avancer exclusivement
  en fast-forward ; aucune donnée n'est écrasée.
- Un travail ne prend jamais fin tant que son `main` local est en retard sur `origin/main`, même d'un commit.
- Si ce rattrapage sûr est impossible ou si la CI échoue, la livraison reste non terminée.
- Nettoyer uniquement le worktree et les branches locale/distante du PBI terminé, après vérification.
  Ne jamais modifier, déplacer ou supprimer les ressources d'un autre chantier.

## Règles de livraison

- Séquence : travail → validations ciblées → commit → resynchronisation → pré-push proportionné →
  branche distante → PR → CI obligatoire → fusion protégée → CI du SHA intégré → synchronisation locale.
- `npm run publish -- -Prepare` publie et valide la PR sans fusion : préparation de transition ou revue.
  Ce mode ne désactive aucune protection et ne constitue jamais une livraison terminée.
- La première migration MEP-043 active le ruleset après validation du nouveau circuit et avant sa fusion ;
  aucun dernier push direct ni bypass temporaire.
- Toute règle qualité existante demeure applicable : limite de 200 lignes, tests, couvertures, lint,
  formatage, sécurité, migrations et revue documentaire.

## Validation selon l'impact

- Pendant le développement, `npm run quality:targeted` calcule le plan local ; les tests explicites restent disponibles.
- Le pré-push vérifie les références annoncées par Git et tout le diff main→candidat, pas le seul dernier
  incrément de la branche. Une création distante est autorisée ; suppression et réécriture sont refusées.
- Prose/backlog audités : contrôles documentaires seuls, aucun test backend/frontend/E2E.
- SQLite/sécurité internes : backend complet renforcé ; contrats utilisateur : frontend/E2E requis ;
  transverse ou inconnu : exhaustif conservateur.
- Les preuves restent valides sans expiration si leurs entrées et sélections exactes sont inchangées.
- `Required impact gate` est obligatoire avant fusion, produit par GitHub Actions ; la CI est indépendante.
- `Full quality gate` reste le rapport exhaustif, requis quand le plan est exhaustif et pour MESS ;
  il n'est pas exigé sur une PR documentaire qui saute ces domaines.
- Nightly quotidienne et `quality:qualify` restent exhaustifs ; promotion liée au SHA exact qualifié.
- [Matrice, commandes et preuves](docs/quality/validation-costs.md) ; [protections et limites CI](docs/quality/ci.md).
