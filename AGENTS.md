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

- La publication utilise `npm run publish` : verrou local, resynchronisation, pre-push, push et fast-forward sûr.
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

## Interdiction du circuit PR

- Aucune PR dans le processus de développement et de publication d’Assess Teams, sauf demande explicite de l’utilisateur.
- Aucune création automatique de PR, demande d’approbation ou fusion via GitHub.
- Le seul circuit est `npm run publish` : push direct depuis le worktree dédié vers main,
  pré-push bloquant, CI après intégration sur le SHA publié et synchronisation locale sûre.
- Aucun nouveau circuit ou changement d’architecture de publication sans accord explicite.

## Règles de livraison

- Préparer tout changement technique dans son document propriétaire selon la [politique documentaire](docs/quality/documentation-policy.md).
  Le README est la vitrine produit ; sa modification dépend de l’impact public réel, pas de la seule présence de code.
- La séquence normale est `travail → validations ciblées → commit → resynchronisation → pre-push proportionné → push → CI du SHA exact`.
- Le push de publication utilise la branche dédiée comme source et `main` comme destination.
- Toute règle qualité existante d'Assess teams demeure applicable, notamment la limite de 200 lignes, les tests,
  les couvertures, le lint, le formatage, la sécurité, les migrations et la revue documentaire.
- Les détails techniques propres à un autre dépôt ne sont pas transposés sans équivalent dans Assess teams.

## Validation selon l'impact

Chaque agent doit minimiser le coût des validations tout au long de son intervention, selon l'impact réel
du changement, en conservant toutes les obligations de qualité et de livraison.

### Plan préalable et feedback pendant le développement

- Avant toute exécution de validation, établir un plan identifiant le composant ou domaine modifié,
  ses dépendances directes et transitives démontrées, les tests du composant concernés, les intégrations
  nécessaires et les parcours E2E concernés ; justifier les niveaux non applicables.
- L'appartenance au même dépôt ne démontre aucune dépendance entre composants.
- `npm run quality:targeted` calcule le plan local ; privilégier les commandes explicites ciblées lorsque
  sa sélection automatique dépasse le besoin du diagnostic immédiat.

Exécuter progressivement les validations applicables :

1. Tests du composant modifié.
2. Tests d'intégration des dépendances concernées.
3. E2E ciblés lorsque le comportement utilisateur est impacté.

- Ne pas lancer par précaution les suites complètes backend, frontend ou E2E étrangères au changement.
- Exemple : une modification exclusivement visuelle du radar React privilégie les tests Radar,
  les intégrations concernées et les parcours Results ; aucun test backend d'identification sans dépendance démontrée.

### Extension justifiée du périmètre

- Toute extension à un autre domaine doit être motivée par une dépendance ou un risque identifié ; ajuster le plan.
- Sécurité, authentification, permissions, contrats API, transactions, configuration et infrastructure transverse
  conservent les validations renforcées applicables de la matrice, notamment pour la sécurité des sessions.
- SQLite/sécurité internes : backend complet renforcé ; contrats utilisateur : frontend/E2E requis ;
  transverse, inconnu ou dépendance non maîtrisée : exhaustif conservateur.

### Gates de livraison et réutilisation des preuves

- Les tests de feedback pendant le développement ne remplacent jamais le plan obligatoire du pré-push,
  la CI indépendante, la nightly exhaustive ou la qualification MESS.
- Le pré-push utilise le diff réel annoncé par Git et bloque tout échec requis, même si son périmètre
  dépasse les tests ciblés déjà exécutés.
- Aucun contournement de hook, seuil, couverture ou contrôle obligatoire ; jamais de `--no-verify`.
- Prose/backlog audités : contrôles documentaires seuls, aucun test backend/frontend/E2E.
- Ne pas répéter une campagne réussie si ses entrées effectives, son environnement et sa sélection vérifiée
  sont inchangés et si sa preuve est réutilisable selon la politique existante. Les preuves versionnées
  restent valides sans expiration temporelle dans ces conditions, y compris après resynchronisation.
  Les contrôles obligatoirement frais restent exécutés.
- La CI sélective est indépendante ; le push direct n'a pas de barrière CI distante avant intégration.
- `publish` attend sa réussite avant succès de livraison. Une CI rouge reste un échec même après le push.
- Nightly quotidienne et `quality:qualify` restent exhaustifs ; promotion MESS liée au SHA exact qualifié.
- [Matrice, commandes et preuves](docs/quality/validation-costs.md) ; [protections et limites CI](docs/quality/ci.md).

### Économie de temps et de tokens

- Éviter les campagnes redondantes et les lancements simultanés inutiles.
- Ne pas surveiller les journaux par interrogations répétitives sans décision à prendre.
- Communiquer les jalons significatifs, blocages et résultats, plutôt que chaque progression de tests.
- Présenter une synthèse finale des tests exécutés, de ceux non exécutés et de la justification des extensions éventuelles.
