# MEP-012 — Audit des protections GitHub et des gates CI

Audit du **2026-10-20**, collecte GitHub de 12:30 à 12:33 UTC (08:30 à 08:33 Toronto).
Base examinée : `c81d131da0985e6665666a6cd6919edfbc95bdb5`, dernier `origin/main` au démarrage.
Branche `audit/mep-012-protections-ci`, worktree `C:\Users\garan\Desktop\Projets\Assess-teams-mep-012`.

**Verdict : audit documenté, conformité distante refusée ; MEP-012 reste Bloqué, date N/A.**
Les exigences de la [source F04](../../backlog/source/mess/f04.md) et de la
[DoD](../definition-of-done.md) ne permettent pas de confondre CI verte et protection distante.
Aucune protection, workflow ou commande de publication modifiée ; aucun essai de force-push/suppression.

## Preuves et portée

- [R — réponses API datées, règles et acteurs](remote-evidence.md) : GET, HTTP, Date GitHub,
  Request-Id et corps projetés ; listes complètes sans lien de pagination.
- [C — runs, jobs, artefacts et extraits des tests existants](ci-evidence.md) : lectures seules,
  SHA et identifiants immuables des exécutions. Les preuves décrivent un état daté, pas une garantie future.
- [Circuit CI et limite actuelle](../ci.md), [politique proportionnée](../validation-costs.md),
  [mesures existantes](../validation-measurements.md) : acquis conservés.

Le 404 « Branch not protected » est corroboré par `protected:false`, les droits admin vérifiés
et deux listes vides en 200. Il démontre ici une absence de règle ; un 403 n’aurait pas cette valeur.
Le refus 403 de l’inventaire Apps constitue au contraire une preuve manquante, jamais une liste vide.

## Matrice de conformité

Conforme signifie exigence démontrée ; Écart signifie exigence non satisfaite ; Non vérifié signifie preuve absente.

| Exigence / objet | État réellement appliqué | Verdict et preuve | Risque / suite MEP-043 |
| --- | --- | --- | --- |
| Branch protection de `main` | API protection : 404 `Branch not protected` ; `protected:false` | Écart — R, Branche main / Protection classique | G01 : aucun contrôle serveur préalable |
| Rulesets, y compris hérités | `includes_parents=true` : `[]` ; règles actives main : `[]` | Écart — R, Rulesets / Règles actives | G01 : aucune règle active ou en évaluation inventée |
| Check obligatoire avant intégration | `enforcement_level:off`, `contexts:[]`, `checks:[]` | Écart — R, Branche main | G02 : push possible sans CI préalable |
| `Required impact gate` | Agrégateur ordinaire présent et réussi, sans exigence distante | CI conforme à son rôle, protection en écart — C, CI documentaire / exhaustive | G02 : rendre obligatoire seulement dans un circuit compatible |
| `Full quality gate` | Rapport exhaustif imbriqué ; absent du plan documentaire | CI conforme à son rôle, obligation de la source non satisfaite — C | G02 : son nom seul comme check obligatoire bloquerait la prose |
| Interdiction du force-push | Aucune règle de refus serveur ; acteur admin avec push | Écart — R ; conclusion de configuration, sans essai destructif | G03 : réécriture de l’historique possible avec un autre client |
| Interdiction de suppression | Aucune règle de suppression ; `main` est la branche par défaut | Écart de protection — R ; restriction GitHub par défaut distincte | G03 : la restriction par défaut cesse si un admin change cette branche |
| Administrateurs et bypass | Pas de règle : ni `enforce_admins`, ni liste de bypass applicable | Écart — R ; aucune valeur `false` fictive attribuée à un objet absent | G04 : l’admin peut pousser et reconfigurer ; pas de barrière anti-contournement |
| Acteurs humains | Un seul collaborateur listé, propriétaire `GaranceRichard`, rôle admin, push/maintain/pull/triage vrais | Inventaire visible vérifié — R | G04 : publication avec privilèges plus larges que nécessaires |
| Clés de déploiement | Liste complète vide en 200 | Vérifié — R, Clés de déploiement | Ne prouve pas l’absence de jetons/SSH personnels |
| GitHub Actions | Défaut read ; approbation PR interdite ; workflows qualité `contents:read` | Vérifié — R et sources au SHA audité | G04 : conserver le moindre privilège |
| Applications et autres credentials | `/user/installations` : 403, jeton non autorisé à une GitHub App | Non vérifié — R, Installations | G05 : inventaire exhaustif des Apps/jetons effectifs non acquis |
| Circuit `npm run publish` actuel | Source branche dédiée, destination main ; hooks puis CI du SHA après push | Compatible avec l’absence actuelle de règles — C et scripts | G01/G02 : compatibilité technique ne vaut pas conformité |
| Tests de refus des gates | Échecs/annulations/absences requis refusés ; skips hors plan autorisés | Vérifié sur fixtures, pas une protection GitHub — C, extraits | Aucun test destructif distant nécessaire à cet audit |

GitHub interdit la suppression de sa branche par défaut tant qu’elle conserve ce rôle :
[documentation branches](https://docs.github.com/en/pull-requests/how-tos/commit-changes/managing-branches-within-your-repository).
L’absence de règle dédiée ne signifie donc pas qu’un DELETE de `main` réussirait actuellement.
Les garanties de protection/bypass et de ruleset sont décrites par
[GitHub, branches protégées](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
et [règles disponibles](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
(consultées le 2026-10-20).

## Avant intégration et après push

| Moment | Contrôle effectif | Garantie / limite |
| --- | --- | --- |
| Développement | `quality:targeted` calcule le diff local | Feedback ciblé, pas un contrôle GitHub |
| Commit | `pre-commit`, gate rapide informatif | Ne bloque pas les commits intermédiaires |
| Publication avant push | `publish.ps1` : verrou OS, propreté, fetch/rebase ; `.githooks/pre-push` : garde de contribution puis plan réel annoncé par Git | Bloque ce client coopératif ; jamais une règle serveur |
| Intégration | `git push origin branche:main`, sans force | `main` distant contient déjà le candidat avant sa nouvelle CI |
| Après push | Fetch, preuve d’ascendance, fast-forward sûr du main principal | Aucun écrasement de données ni rollback distant automatique |
| Livraison | `wait-ci.mjs` attend le workflow `quality.yml`, événement push, SHA exact, conclusion success | Refuse rouge/annulé/skipped/absent ou délai dépassé ; n’annule pas l’intégration déjà faite |

Sources : [`publish.ps1`](../../../scripts/publish.ps1), [pré-push](../../../.githooks/pre-push),
[garde](../../../scripts/quality/check-contribution-workflow.ps1), [attente CI](../../../scripts/quality/wait-ci.mjs).
Un autre client peut ignorer les hooks locaux ; un résultat CI vert ne démontre donc aucun refus serveur.

`Required impact gate` (`quality.yml`, `always()`) exige les jobs requis par le plan et des skips justifiés
pour les autres. Il est le candidat cohérent à une future exigence de statut ordinaire.
`Full quality gate` (`exhaustive-report.yml`) vérifie les quatre domaines exhaustifs et leurs fusions,
puis produit la preuve de qualification ; le check distant porte notamment le nom imbriqué
`full / quality / Full quality gate` dans le run exhaustif intégré, pas simplement le libellé de la source.
Il n’est pas un check universel : la preuve documentaire montre `full:skipped`, agrégateur ordinaire réussi.
La nightly est indépendante ; sa preuve ne qualifie que son propre SHA, jamais un candidat différent.

## Réutilisation des acquis et permissions techniques

Le [run 39322649741](https://github.com/GaranceRichard/assess-teams/actions/runs/39322649741)
(`28a78ac0d38dd488c260547cb31494185fb9b789`, push du 2026-10-19) prouve :
8 partitions backend et fusion de couverture, frontend complet, 2 E2E, rapport exhaustif et agrégateur verts.
Les logs du job `118300526652` prouvent les tests existants de publication nominale, checkout sale/divergent,
verrou concurrent et pré-push refusé, ainsi que les refus des agrégateurs et du mauvais SHA.
Ces tests utilisent des dépôts temporaires locaux : aucune règle GitHub n’y est simulée comme preuve distante.
`git diff 28a78ac0..c81d131 -- scripts .github .githooks` est vide : leurs entrées versionnées sont inchangées.
Aucune campagne backend/frontend/E2E ni test d’outillage supplémentaire n’est nécessaire pour cet audit de prose.

Le [run documentaire 39325023007](https://github.com/GaranceRichard/assess-teams/actions/runs/39325023007)
prouve le chemin sélectif ; la [nightly 39271887078](https://github.com/GaranceRichard/assess-teams/actions/runs/39271887078)
prouve le chemin indépendant et l’existence de l’artefact `qualification` non expiré à la collecte.
Ce constat de métadonnées ne prétend pas effectuer une promotion MESS ni qualifier le SHA de cet audit.
Les checks consultés identifient leur producteur GitHub Actions dans C ; aucune App source n’est exigée
par une règle distante actuellement absente.

Les workflows qualité/promotion déclarent `contents:read` ; Pages accorde seulement `pages:write` et
`id-token:write` au job deploy. Aucun de ces droits déclarés n’accorde `contents:write` pour pousser main.
Les acteurs des deux runs intégrés sont `GaranceRichard`. Les scopes du compte de publication ne sont
pas un inventaire des PAT/OAuth/SSH/Apps : leurs détenteurs et droits effectifs restent à rapprocher.
La [documentation de l’API installations](https://docs.github.com/en/rest/apps/installations#list-app-installations-accessible-to-the-user-access-token)
confirme que la lecture refusée requiert un jeton autorisé à une GitHub App.

## Corrections proposées pour MEP-043, non exécutées

| Écart | Proposition concrète | Compatibilité / preuve à exiger |
| --- | --- | --- |
| G01 — aucune règle main | Ruleset actif ciblant `refs/heads/main`, restrictions explicitement inventoriées | Nouvelle lecture des règles actives, pas simple capture de l’éditeur |
| G02 — aucun check obligatoire | Décider explicitement du circuit PR/branche à jour ou merge queue ; exiger `Required impact gate` avec producteur GitHub Actions observé | Les hooks et publish actuels interdisent la publication intermédiaire ; migration à autoriser et tester avant activation. `merge_group` absent actuellement |
| G02 — libellé Full dans F04 | Faire arbitrer la correspondance entre exigence historique et agrégateur sélectif ; conserver le Full pour exhaustif/qualification | Ne pas rendre Full obligatoire sur un plan qui le saute ; aucune réécriture des critères dans cet audit |
| G03 — force/suppression | Activer block force pushes et restrict deletions, sans acteur de bypass ; cible main explicite | Compatible en principe avec le push fast-forward actuel ; lecture serveur puis refus sur environnement jetable autorisé, jamais essai destructif ici |
| G04 — admin sans garde | Règles appliquées aux admins/automates, bypass vide ; revue du compte/token de publication au moindre privilège | Un bypass permanent pour maintenir publish annulerait la barrière CI ; les admins restent capables de changer la configuration |
| G05 — inventaire incomplet | Obtenir une vue administrateur autorisée des Apps installées et de leurs permissions sur ce dépôt ; rapprocher PAT/OAuth/SSH utilisés par les contributeurs | Conserver date, acteur, périmètre et preuve de chaque accès ; ne pas collecter les secrets |

Une exigence de check avant intégration sans bypass est incompatible avec le circuit actuel :
la branche candidate n’est pas publiée et `quality.yml` ne traite les push que sur main.
Une PR obligatoire le bloquerait également. G03 seul peut renforcer le circuit actuel, mais ne résout pas G02.
Ces propositions nécessitent une mission distincte ; aucune autorisation de modifier les protections n’est déduite de l’audit.

## Clôture et DoD

- Vérifications des règles lisibles et matrice réalisées ; G01–G04 constatés, G05 incomplet.
- MEP-012 reste Bloqué : protections/check obligatoire absents et inventaire des Apps non vérifié.
  Date de réalisation N/A ; FEAT-052 reste à 0/2. Une livraison documentaire réussie ne clôt pas ce PBI.
- MEP-043 conserve sa dépendance source à MEP-012. Si la clôture de 012 exige les corrections de 043,
  le responsable doit décider explicitement du traitement de cette dépendance ; préparation des corrections possible,
  aucune dépendance supprimée et aucune conformité supposée pour contourner ce blocage.
- Revue documentaire : README, AGENTS/règles, charte, DoD, stratégie de tests, architecture et API consultés.
  Mise à jour limitée aux liens d’audit, preuves et suivi ; aucun endpoint, modèle, migration, contrat ou parcours modifié.
- Tests fonctionnels nouveaux, couverture, lint applicatif, build/typecheck et E2E : non applicables au diff documentaire.
  Les acquis ci-dessus sont référencés ; les contrôles documentaires restent frais au pré-push et en CI.
- Contrôle local du 2026-10-20 : `npm run quality:targeted` réussi, scope documentation seul ;
  lignes (200 maximum), secrets, structure, README et règles documentaires vérifiés.
- Livraison du rapport : `quality:targeted`, commit, `npm run publish`, pré-push documentaire et CI du SHA exact
  requis ; succès à vérifier dans le compte rendu de livraison, sans prétendre que le SHA antérieur le remplace.
