# MEP-048 — catalogue des preuves complémentaires

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

SHA `826cc51063ab1120ddc052f2a01bb4b77479c4b0`, 2026-11-02, Codex.
Racine locale : `.cache/mep-048/complement/` dans le worktree conservé.
Aucun cookie/jeton, mot de passe, compte réel ou donnée de production dans les pièces de résultats.
Les recettes contiennent uniquement l’identifiant d’essai déjà défini par les helpers du dépôt.
Aucune preuve n’est présentée comme intégrée à Git ou hébergée : aucun commit/push autorisé.

## Résultats structurés

| Pièce | Usage |
| --- | --- |
| inputs.json (`.cache/mep-048/complement/inputs.json`) | Jeux et réponses API avant lecture ; D, SHA, IDs v1/v2 |
| observations.json (`.cache/mep-048/complement/observations.json`) | 27 cellules d’assertions brutes ; revue visuelle à lire séparément |
| http.json (`.cache/mep-048/complement/http.json`) | Réponses GET réelles de la reprise ; sans en-têtes de session |
| http-r1.json (`.cache/mep-048/complement/http-r1.json`) | Réponses de la première passe, dont Q1/J2/J3 |
| environment.json (`.cache/mep-048/complement/environment.json`) | Version Chromium, SHA, date UTC, formats, thème/palette, aucun mock |
| mobile-diagnostic.json (`.cache/mep-048/complement/mobile-diagnostic.json`) | Positions avant/après clavier dans les deux thèmes |
| collection-diagnostic.json (`.cache/mep-048/complement/collection-diagnostic.json`) | Conteneur parent effectivement défilé, B01 |
| desktop-diagnostic.json (`.cache/mep-048/complement/desktop-diagnostic.json`) | Dimensions aide ouverte/fermée, B02 |
| desktop-wheel.json (`.cache/mep-048/complement/desktop-wheel.json`) | État après vraie molette dans la collection, B02 |
| manifest-sha256.csv (`.cache/mep-048/complement/manifest-sha256.csv`) | Empreintes des pièces locales ; intégrité, pas preuve qualité v3 |

Les erreurs initiales de harnais figurent dans browser.log et observations-r1.json.
browser-r2.log reprend seulement les cellules interrompues ; les réussites initiales ne sont pas rejouées.
Les scripts .mjs et prepare.txt sont des recettes ponctuelles en cache, pas une modification des tests du dépôt.

## Captures discriminantes

| Critère | Pièces locales |
| --- | --- |
| Q1 | q1-{day,night}-{1280x720,1920x1080,1280x480,390x844}-{cards,definitions,note,table}.png |
| B01 avant/après | clair initial (`.cache/mep-048/complement/mobile-day-initial.png`), clair après clavier (`.cache/mep-048/complement/mobile-day-keyboard-link.png`), sombre initial (`.cache/mep-048/complement/mobile-night-initial.png`), sombre après clavier (`.cache/mep-048/complement/mobile-night-keyboard-link.png`) |
| B02 | aide ouverte après molette (`.cache/mep-048/complement/desktop-definitions-open-wheel.png`), aide fermée (`.cache/mep-048/complement/desktop-definitions-closed.png`) |
| Sources | A1 (`.cache/mep-048/complement/q2-source-A1.png`), A2 (`.cache/mep-048/complement/q2-source-A2.png`) |
| Source absente | ancienne seulement sur v2 (`.cache/mep-048/complement/q2-old-version-absence.png`) |
| Scope étranger | contexte imposé (`.cache/mep-048/complement/q2-foreign-access.png`), réponses 404 dans observations.json |
| J2 | q3-empty-{day,night}-{cards,definitions,message}.png |
| J3 | q3-uncompleted-{day,night}-{cards,definitions,message}.png ; limites B02 ci-dessus |
| Dashboard par rôle | q3-dashboard-{Admin,Coach,Viewer,Superadmin}-{day,night}.png |
| Refus de route | q3-denied-Coach.png ; q3-denied-Viewer.png |
| Superadmin | q3-superadmin-selected.png ; q3-superadmin-switched.png |

Les motifs avec accolades désignent des noms réellement produits, inventoriés dans le manifeste.
Les captures isolées de composants ne remplacent pas le diagnostic en contexte de page.

## Comparaison aux acquis

`git diff 2d9b6c3..826cc51 -- backend` : aucun changement.
Dashboard, SteeringSummary/Teams/Page, useSteering, useResultSelection, tests initiaux et shell
n’ont pas changé. Les modifications applicatives du radar sont identifiées par le diff de candidats ;
les parcours Q2 sont exécutés sur le nouveau radar réel.
Les dépendances/lockfiles n’ont pas changé ; aucune prétention d’empreinte transitive complète.
Les suites initiales ne sont pas réexécutées ni présentées comme un run du nouveau SHA.

Contrôle documentaire du lot final : `npm.cmd run quality:targeted`,
sortie `.cache/mep-048/complement/documentation.txt`.
Les artefacts générés restent en cache ignoré ; seuls les rapports Markdown constituent le lot local.
Limite 200 lignes appliquée aux fichiers manuels ; aucun README préalable requis pour ce lot de prose.
Pas de pre-push/CI de publication, ni de coverage global nouveau : interdits ou hors sélection.
La conformité du contrôle documentaire ne lève pas B01/B02 et ne vaut pas acceptation MESS.
