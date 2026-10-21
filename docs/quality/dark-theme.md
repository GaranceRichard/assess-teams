# MEP-052 — Harmonisation ciblée du thème sombre

Audit du 2026-10-21, selon [F09](../backlog/source/mess/f09.md), le registre canonique et la
[DoD](definition-of-done.md). Ce rapport technique est distinct du cahier de recette UX MEP-067.
La couverture MEP-052 des [UX-02/03/04](ux-acceptance.md) combine matrices sombres,
comparaison du clair et tests existants de préférences, sans modifier ce cahier.

## Écarts reproduits et correction

Les champs Organisation, Équipes, Modèles/questions, Repères et Planification utilisaient la
bordure décorative `border` au lieu du rôle de contrôle `input-border`. Les mesures navigateur
avant correction donnent notamment 1,60–1,73:1 pour le renommage d’organisation et 1,43:1 pour
le sélecteur d’organisation des équipes. La piste du curseur de notation est également trop
peu visible (environ 1,43–1,55:1 selon la palette), alors que sa poignée et son focus sont lisibles.

`dark-appearance.css`, importé par `theme.css`, réutilise `input-border` pour ces seules bordures
et pour la piste native Chromium/Firefox. Le sélecteur des équipes utilise aussi `surface` et
`text`, comme les autres sélecteurs, au lieu des couleurs natives indépendantes de la palette.
La séparation décorative des cartes/tableaux reste inchangée. Les contrôles vérifiés atteignent
≥ 3:1 ; les textes mesurés atteignent ≥ 4,5:1. Les focus existants restent lisibles.

Aucun accent, mélange de surface, densité, ombre, série graphique, libellé, permission ou
préférence n’est modifié. Le thème clair est exclu par chaque sélecteur de correction.

## Vérification des dix palettes

Bleu, Indigo, Violet, Rose, Rouge, Orange, Ambre, Vert, Émeraude et Turquoise sont parcourus
par les tests existants et les matrices ajoutées, sur les composants réels et le backend isolé.

| Zone                                    | Vérification et résultat ciblé                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Dashboard et navigation ouverte/repliée | Textes ≥ 4,5:1 ; fonds et accents existants conservés                                      |
| Utilisateurs et Pilotage                | Textes des cellules, entêtes, actions et statuts ≥ 4,5:1                                   |
| Radar et Dans le temps                  | Textes ≥ 4,5:1 ; cinq séries et grilles ≥ 3:1 sur chaque fond                              |
| Restitutions détaillées                 | Textes, entêtes et liens de critères ≥ 4,5:1                                               |
| Journal/Logs                            | Textes des écrans et tableaux ≥ 4,5:1, traitements sémantiques sombres conservés           |
| Formulaires et dialogues                | Champs ≥ 4,5:1 ; bordures ≥ 3:1 et focus visibles sur les dix palettes                     |
| Repères d’appréciation                  | Champ multiligne et focus vérifiés ; refus des saisies vides conservé                      |
| Passation                               | Pixels de la piste ≥ 3:1 ; absence de note conservée, choix clavier et sauvegarde vérifiés |
| Clair                                   | Capture du dialogue Questions identique pixel à pixel avant/après dans les dix palettes    |

`frontend/e2e/dark-theme.spec.ts` reproduit les bordures insuffisantes avant correction et passe
après. Le vrai refus d’un nom vide reste vérifié, puis une saisie valide active l’enregistrement.
`dark-theme-screens.spec.ts` vérifie les écrans, les contrastes des graphiques et les pixels de la
piste native ; son test de piste échoue avant correction et passe après. Les captures stabilisées
des écrans représentatifs sont produites dans les résultats Playwright.

Les tests existants `theme-tokens`, `theme-surfaces`, `palettes`, `users-layout`, navigation,
Results et passation protègent les surfaces, interactions, préférences (reload/reconnexion,
clavier et rollback sur refus), tableaux et parcours concernés. Les comportements ne sont pas
réimplémentés pour cet audit. Les styles des cinq séries, formes et pointillés sont conservés.

## Validation et revue DoD

Le plan automatique `npm run quality:targeted` passe sur le candidat resynchronisé après MEP-067 :
statiques frontend, 32 tests dépendants, 69 E2E application et 10 E2E démo, zéro échec.
Les trois nouveaux tests ciblés passent, y compris les matrices Journal/Logs et cinq séries.
Le build démo passe. Les captures avant/après ont été inspectées : le contour du champ et la piste
sont nettement identifiables, sans changement de disposition. Les dix captures du dialogue clair
restent identiques pixel à pixel. Les relevés JSON attachés aux tests sont consultables dans le
rapport HTML Playwright (`--reporter=html`), exporté sur une base et des ports distincts.
Le pre-push puis la CI du SHA publié restent bloquants avant clôture canonique.
Aucune qualification MESS globale ni certification normative n’est revendiquée.

Revue documentaire : README préparé avant le code ; documentation des palettes ajustée.
Règles des agents, charte, DoD, stratégie de tests, fondamentaux et contrat API relus :
aucun changement d’architecture, d’API, de sécurité ou de règle qualité n’est nécessaire.
Migrations et nouveaux tests API/backend non applicables : seuls des styles CSS sont modifiés.
Les tests navigateur réutilisent les fixtures métier existantes. Aucun document de recette UX,
script de publication, hook, configuration CI ou fichier du chantier MEP-067 n’est modifié.
