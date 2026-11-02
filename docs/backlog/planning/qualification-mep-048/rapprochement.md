# MEP-048 — rapprochement des worktrees

Demandé explicitement le 2026-11-02 ; auteur Codex.
Le chantier de correction reçoit les travaux locaux du chantier d’audit, sans fusion de code étranger.

| Worktree / branche | État de départ | Contenu rapproché |
| --- | --- | --- |
| Assess-teams-mep-048 / audit/mep-048-indicateurs-20261101 | Base 826cc51 ; aucun diff suivi, sept rapports non suivis | Qualification initiale, complémentaire, jeux, matrice, deux écarts et références de preuves |
| assess-teams-mep-048-fix-20261102 / fix/mep-048-indicateurs-20261102 | Base 0096963 issue du dernier origin/main | README préalable, trois règles CSS, quatre non-régressions et bilan de correction |

Les sept rapports ont d’abord été copiés et comparés par SHA-256 à leurs originaux : identiques.
Les preuves locales .cache/mep-048 ont aussi été rapprochées ; leurs SHA d’observation restent historiques.
Les rapports d’origine avant normalisation des liens sont conservés dans l’archive locale des preuves.
Le rapport complémentaire avant correction est conservé en rapport-complementaire.md ;
le rapport courant devient le point d’entrée consolidé.

Les liens vers des fichiers ignorés de cache ont été remplacés par leurs références textuelles :
ces pièces sont des originaux locaux, pas des fichiers prétendument intégrés à Git.
Les originaux sont archivés hors des worktrees avant leur nettoyage, avec manifeste et vérification.
Aucun runtime, base de données ou cookie réel n’est publié dans Git.

Le rapprochement ne copie ni .git, ni node_modules, ni venv, ni les fichiers d’un autre PBI.
MEP-016, MEP-047 et leurs statuts gardent les versions intégrées par leurs propres publications.
Aucune perte d’historique Git : les commits de base des branches 048 sont contenus dans main.
Le principal reste réservé au fast-forward sûr effectué par npm run publish.

Après publication confirmée et CI verte, le nettoyage concerne uniquement les deux worktrees
et branches 048 dont les travaux sont ainsi rapprochés. Aucun autre chantier n’est nettoyé.
Les emplacements et empreintes des originaux conservés sont décrits dans preuves-correction.md.
