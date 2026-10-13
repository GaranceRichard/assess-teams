# Validation proportionnée et coûts

## Audit au 13 octobre 2026

Le gate rapide exécutait Ruff/format, pytest `unit or functional` avec coverage,
ESLint/Prettier et toute la suite Vitest avec coverage, plus les tests des scripts.
Le commit pouvait rejouer des campagnes déjà exécutées pendant le PBI.
Le pre-push répétait ensuite les suites complètes et les E2E réels/démo.
La CI apportait une preuve indépendante Linux/Python 3.13, répartie sans doublons :
ce contrôle distinct est conservé. `test:all` reste la définition unique des suites.

Le bootstrap installe les runtimes par worktree avec caches de téléchargements
pip/npm. Partager les installations actives créerait des interférences ; les
runtimes physiques restent indépendants. Le post-checkout conserve son bootstrap
conditionnel. SQLite, rapports et caches restent locaux au worktree. Les wrappers imposent
`TMPDIR`, `TMP` et `TEMP` dans `.cache/tmp` pour isoler les ressources temporaires
et éviter la réutilisation de répertoires pytest appartenant à une autre session.
Les ports E2E fixes et les publications simultanées sont les collisions restantes.

## Niveaux et responsabilités

| Niveau | Commande | Moment et preuve |
| --- | --- | --- |
| Rapide | `npm run quality:quick` | Statiques et contraintes du dépôt, informatifs au commit ; sans tests/coverage |
| Ciblé | `npm run quality:targeted -- backend tests/test_example.py` | Tests explicites et statiques bloquants pendant le PBI |
| Complet | `npm run quality:full` | Tous les contrôles du dépôt, backend, frontend et E2E ; pre-push |
| Frais | `npm run quality:full -- --fresh` | Rejoue les scopes ; diagnostic indépendant |
| Distant | workflow Quality gate | Tous les jobs exhaustifs sans preuves locales ; chaque version intégrée |

Pour le ciblé frontend, fournir des chemins relatifs à `frontend`, par exemple
`src/Button.test.tsx`. Pour E2E : `e2e/results.spec.ts`. Une sélection vide,
inexistante, hors domaine ou ne désignant pas un test est refusée.
Backend : Ruff/format/migrations puis pytest sans couverture partielle.
Frontend : ESLint/Prettier/typecheck puis Vitest sans coverage.
E2E : parcours choisis avec les vrais services, aucun serveur existant réutilisé.
Le ciblé ne remplace pas les preuves complètes finales et ne produit aucun cache.

L’agent choisit les comportements affectés, leurs refus et les interactions.
Le ciblé bascule en complet si le diff comporte scripts, hooks, CI, identités,
permissions, authentification, sessions, mots de passe, modèles, services,
transactions, migrations, configurations, vues/sérialiseurs, contrats ou dépendances.
La garde conservative ne remplace pas la revue du risque : un contrat indirect
ou une dépendance transverse non détectée exige le complet.

## Réutilisation locale bornée

Chaque scope applicatif dispose d’une preuve uniquement après son succès complet.
Repository reste frais : 200 lignes, secrets, README, documentation et tests des
scripts sont toujours exécutés. Backend conserve Ruff, migrations, tous les
tests/contrats et coverage >= 90 %. Frontend conserve build/typecheck, lint/format,
tous les tests et les quatre seuils >= 90 %. E2E conserve les parcours réels et
la compilation/parcours de démo. Aucun contrôle n’est supprimé.

L’empreinte SHA-256 couvre tous les fichiers suivis/non ignorés hors `README.md`,
`AGENTS.md` et les Markdown de `docs/` hors `docs/legal/`, les `.env*` locaux,
les manifests npm installés,
Python/Node, `pip freeze --all`, OS/architecture et l’environnement d’exécution
(hors métadonnées de lifecycle npm et deux variables Git sans effet fonctionnel).
Les options `npm_config_*` et `NPM_CONFIG_*` restent dans l’empreinte : elles
peuvent modifier l’exécution des outils.
Ajout, suppression ou modification d’une entrée invalide les scopes applicatifs.
Le SHA de commit ne suffit pas : un rebase sans changement pertinent peut
réutiliser la preuve ; une intégration précédente changeant le code l’invalide.
Les documents juridiques sont des entrées du bundle frontend : leur changement
exige de nouveaux tests/builds, même sans modification de code.
La preuve expire après huit heures ; un horodatage futur est refusé.

Une preuve échouée, absente ou corrompue est refusée. L’ancienne preuve est retirée
avant une nouvelle exécution. Le gate bloque si ses entrées évoluent pendant les
tests. Aucun partage entre worktrees, machines ou CI. `CI` et `--fresh` forcent
l’exécution et ne produisent pas de preuve locale réutilisable.
Le cache est une aide de travail, pas une attestation de sécurité : les runtimes
restent gérés par les bootstraps et la CI demeure indépendante.
Toute évolution faisant lire des documents par une suite applicative doit les
inclure dans l’empreinte avant utilisation du cache.

## Isolation et publication

Le wrapper complet/ciblé dérive trois ports locaux distincts du chemin du worktree.
`ASSESS_E2E_BACKEND_PORT`, `ASSESS_E2E_FRONTEND_PORT` et `ASSESS_E2E_DEMO_PORT`
remplacent un port occupé ou une collision de hachage ; Playwright échoue sans
réutiliser un serveur existant. `ASSESS_E2E_DB` désigne par défaut la base jetable
`backend/.cache/e2e.sqlite3`, commune aux services et fixtures du même worktree.
Elle est réinitialisée avant chaque campagne E2E exécutée. Une base explicitement
fournie est préservée et impose une campagne E2E fraîche. Le développement normal
reste sur `backend/db.sqlite3` ; la production n’utilise pas cet override.
SQLite E2E reste à un worker ; les transactions applicatives ne changent pas.

Deux validations complètes dans le même worktree sont refusées. Après un arrêt
brutal, vérifier que le PID de `.cache/quality/running.lock` est terminé avant
de retirer uniquement ce fichier du chantier et de recommencer.

Après le commit, `npm run publish` prend un verrou OS dans le Git commun puis
vérifie les checkouts, fetch/rebase, pousse la branche dédiée vers main avec le
pre-push obligatoire, confirme le candidat distant et avance le main principal
uniquement en fast-forward. Le premier PBI prêt publie immédiatement ; un second
éditeur local reçoit un diagnostic et réessaie après libération du verrou.
Le verrou est libéré à la fin/arrêt du processus ; son fichier reste en place
pour éviter une course entre fichiers/verrous différents.

Un autre ordinateur n’est pas couvert : Git refuse un push non fast-forward,
sans force. Refaire fetch/rebase/validation via `publish`. Un conflit de rebase
conserve le chantier pour résolution et bloque le push. Un checkout principal
sale/divergent bloque sans écraser les données. Après confirmation, nettoyer
uniquement le worktree et la branche terminés.

## Mesure avant/après et limites

`.cache/quality/metrics.jsonl` conserve par scope durée, statut, réutilisation et
horodatage, sans variables d’environnement ni credentials. Les diagnostics des
outils restent visibles ; les scopes s’arrêtent au premier échec exploitable.
Comparer même machine/version/dépendances et états chaud/froid sur plusieurs PBI.
Compter campagnes exécutées/réutilisées, temps Codex d’attente, temps muraux et
somme des durées CI, distincte du chemin critique. Ne pas assimiler minutes de
runners et facturation sans connaître le tarif.

| Scénario | Avant | Après |
| --- | --- | --- |
| 3 commits après tests ciblés | 3 pytest partiels + 3 Vitest complets avec coverage | 0 campagne applicative au commit |
| Retry sans entrée changée | Backend/frontend/E2E à nouveau | Repository frais ; scopes réussis réutilisés |
| Rebase/documents seuls, preuve récente | Campagne locale complète | Repository frais ; preuve applicative identique réutilisée |
| Rebase ajoutant code/configuration | Campagne complète | Campagne complète, aucune preuve invalide réutilisée |
| Version sur main | Tous les jobs CI | Tous les jobs CI indépendants conservés |

Les mesures historiques et variations de runners sont dans [CI](ci.md).
Le découpage CI trois backend / deux E2E conserve le gate distant exhaustif ;
son gain mural et son coût runner sont évalués dans [le bilan CI](ci-performance.md).
Le gain attendu vient des commits et répétitions locales évités.
Mesure du prototype Windows avec runtimes chauds : statiques backend 1,09 s et
frontend 24,70 s. L'ancien quick sélectionnait 725 tests backend sur 915, plus
toute la suite frontend avec couverture. Trois commits évitent donc 2 175
exécutions backend et trois campagnes frontend ; il s'agit d'un décompte,
pas d'une mesure de temps économisé. La collecte seule prenait 2,03 s.
Les tests de preuve/ciblage/isolation et de publication sur dépôts temporaires
vérifient succès, refus, expiration, corruption, invalidation et gates bloquants.

En CI, le shard E2E est transmis aux campagnes réelle et démo du scope existant.
Les deux runners ont des bases, ports, temporaires et rapports distincts ; aucun
cache de preuve local n’est consulté. Le gate final consolide les résultats sans
réexécuter de suite. Sans variable de shard, les validations locales complètes
et le pre-push continuent d’exécuter tous les parcours.
Une preuve locale partielle est refusée : le wrapper n’accepte le shard que
pour `-Scope e2e` avec `CI` actif, sans cache de preuve. La suite globale
`test:all` refuse également cette variable pour prévenir une campagne incomplète.
