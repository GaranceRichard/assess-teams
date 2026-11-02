# MEP-047 — conservation et disponibilité des preuves

Retour à la [clôture approuvée](README.md). Contrôle documentaire de présence et d’intégrité le 2026-11-01.
Les 152 pièces du manifeste ont été vérifiées dans l’archive et dans le dossier source ; aucun élément indispensable absent.

## Pièces publiées dans le dépôt

- [Synthèse de clôture et sept verdicts](README.md), décision explicite de l’utilisateur et limites.
- [Transcription du rapport initial](rapport-initial.md), avec liens locaux normalisés et statut historique conservé.
- [Extraits des exécutions](executions.md), inventaires réellement exécutés : 54 backend, 35 React, 7 E2E.
- [Extraits HTTP et observations](observations.md), données uniquement fictives, résultats et captures décrits.
- [Inventaire original](manifest-original.md), noms, tailles et SHA-256 des 152 pièces brutes.

## Originaux locaux vérifiés, non publiés

Le dossier local historique est `<worktree-audit-local>/.cache/mep-047/`.
Le chemin physique figure dans le rapport remis dans la conversation, sans l’imposer aux lecteurs du dépôt.
La disponibilité est constatée à cette date sur le poste de qualification ; aucun accès distant,
stockage pérenne externe ou téléchargement des originaux n’est prétendu. Les extraits ci-dessus sont pérennes dans Git.

Archive locale : `MEP-047-qualification-2d9b6c3-20261101.zip`, **12 083 245 octets**.
SHA-256 : `897f1c2bda1115fdb539189c71cf4aeba5c5bdc3640a96ead22c6ee6ded09c53`.
ZIP lu et contrôlé sans erreur ; les 152 empreintes vérifiées correspondent également aux fichiers sources.
Le manifeste lui-même s’ajoute aux 152 pièces, soit 153 entrées ZIP.
L’archive, les PNG, les bases et les environnements ne sont pas incorporés à cette publication documentaire.

| Original local sélectionné | SHA-256 vérifié |
| --- | --- |
| `rapport-qualification-MEP-047.md` | `0e7259fe22670fbd35d8c3727f0bec631ca4b735813784b67c5b052bc983f67c` |
| `manifest-sha256.csv` | `2c17643b2f898f550e390ee22c5a7129e53c5a01306a341296c38bc432a6411e` |
| `backend.log` | `f0f749f780257d7700470b66d73acfd7998219b10b1d9b3a2269de3958132ef2` |
| `backend.xml` | `e27ddf05ac044a7f69db4eb3ad22f276876af51ba5a8ce3e601c3265304645eb` |
| `react.log` | `b460bd2959a7b74923c6d8e89478d4e57d7a17585bbf5a0629ac4131acb4d7c5` |
| `react-complement.log` | `2b8ba1369394b2ef5a9f527ca6ac6cdcb67afa5dc6cf8102f3564f95ca00fe1b` |
| `e2e-direct.log` | `6f2cd9d057afe049e2ebb44879594ba075d4208abd2c5cf1461d742329d603da` |
| `e2e-direct.json` | `19d1ab25f3d9a1ab79036222cea258667c52b9079162babc863f2f6333f0ed4c` |
| `observations.json` | `2680aa5327599ed4b06c3e499672e1b5ad4e638dd63a80b7ecef84bd48f13170` |
| `r2-observations.json` | `9bf42a3bad353467b50b812259344b7b860b3f8fdcc802c5a755899ab6cc97ca` |
| `context-switch.json` | `574d87a9c882d9611c9af4d44834164e14972d7ae306d7e9fb1448eba1b3b0c9` |
| `ux09.log` | `2d3ef7f21efa415059280f4a9eeb59b40f748ae46e9d1f0fa586cbc3e0076dd7` |
| `ux09.json` | `0897082edf14ed6eaedc11dffd55d1ada05b1c0cdf41c2696411b049fff22292` |
| `ux09-green/measurements.jsonl` | `aac9af6c81b2a2ba604567e4692c6f2f89ecf8dbcf55ccb44f16bfc079e2ee59` |
| `green-stable-observations.json` | `57c0d4acbc1adfc479067bc4e1ec3f5bad9e19ea4feac4a9202d2796fcb9a9fb` |
| `ci-run.json` | `bca8ba74f6a3637c51d1f5ccc469c71d732d79c60c3c93be3feb9323928176b4` |
| `environment.json` | `347e80cbf97eb3ae9bb69a774a428c2464e759b4539258641f331e8e6f3a00f6` |

## CI distante exhaustive du SHA qualifié

[Run 41315798380](https://github.com/GaranceRichard/assess-teams/actions/runs/41315798380) :
`headSha=2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`, `status=completed`, `conclusion=success`.
Création UTC : `2026-11-01T14:21:33Z` ; mise à jour : `2026-11-01T14:30:42Z`.
La copie API locale ci-dessus contient les jobs et étapes, dont les huit partitions backend,
la couverture globale, les deux partitions E2E, le frontend et le gate exhaustif.
Cette CI technique n’atteste aucun PV MESS ni nouvelle exécution lors de la clôture.

## Confidentialité et limites de réutilisation

Aucun cookie, jeton, mot de passe, base ou donnée réelle publié. Identités et IDs des extraits sont fictifs.
Les copies locales n’ont pas été présentées comme des artefacts hébergés ; aucun lien vers une pièce absente.
Les empreintes identifient les pièces, sans remplacer leur contenu ni certifier des observations non exécutées.
Toute réutilisation dépend du scénario, du candidat, de l’environnement et des entrées exactes.
Aucune preuve de cache qualité versionnée ou promotion MESS n’est déduite de ces inventaires.
