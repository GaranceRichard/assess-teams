# Transitions douces et cohérentes

## Périmètre

Chantier du 2026-10-27, branche `feat/ux-smooth-transitions-20261027`,
worktree isolé depuis `713acd1`. Les deux autres worktrees présents sont laissés intacts.
README annoncé avant le code ; aucun fichier Git/CI, dépendance ou backend modifié.

- Questions : entrée horizontale de 12 px avec fondu, 230 ms `ease-out` ; sens inverse au retour.
- Rubriques : viewport existant indexé par chemin, fondu et translation verticale de 6 px, 180 ms.
- Dialogues : même entrée verticale de 6 px, 180 ms, dans les deux présentations natives existantes.

Aucune sortie différée : le contenu, les commandes et le focus sont disponibles immédiatement.
Les animations ne sont déclarées que sous `prefers-reduced-motion: no-preference`.
En réduction des animations, aucun mouvement ni fondu, y compris si la préférence change à chaud.
Les transforms n'ont aucun mode de remplissage persistant, aucune hauteur n'est animée.

## Stabilité et périmètre métier

Le cadre, le titre général, les métadonnées, l'action de sauvegarde et le pied de passation
ne suivent pas le mouvement horizontal des questions. Les copies intrinsèques MEP-013/044
restent responsables du dimensionnement. Le focus rejoint toujours le titre de question.
La direction vient de la position effectivement affichée, après les gardes de navigation ;
aucune animation sur sélection de note, sauvegarde, refus ou nouvelle tentative.
L'ouverture ne rejoue pas en même temps l'animation de question.
La sidebar et le header restent hors du viewport animé ; une actualisation de données
ne remonte pas ce viewport. Historique navigateur et contrôles d'accès inchangés.

Les règles 0–10 explicites, snapshots, repères, erreurs, sauvegardes, finalisation et révision
restent celles de MEP-013/044. `useModalFocus`, Échap et protections de saisie sont conservés.
Aucun contrat, calcul, droit, API ou migration ne change.

## Recette et preuves

`transitions.spec.ts` observe `animationstart` puis échantillonne chaque frame réellement rendue
par `requestAnimationFrame` jusqu'à la fin naturelle de l'animation CSS, sans la ralentir ni la recréer.
Les assertions vérifient progression temporelle, opacité, direction, position finale et géométrie
immobile du shell ou du cadre/titre/actions. Des vidéos WebM sont enregistrées par Chromium.
Les deux thèmes et dix palettes sont parcourus sur desktop et mobile. La préférence reduce
contrôle l'absence effective d'événements et de transforms avec focus et historique conservés.

La [vidéo Chromium à 200 %](zoom-200.webm) dure 6,28 s et montre les ouvertures,
les changements de question et les rubriques dans les deux thèmes, à vitesse réelle.
Le profil de recette utilise le zoom natif de Chromium : DPR 2, viewport CSS au plus 720 px,
zoom CSS 1 et échelle de pincement 1, avec une fenêtre de 1440 × 1000 pixels.
Le réglage de partition suit le [code source Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/chrome/browser/ui/zoom/chrome_zoom_level_prefs.cc).
Les actions sont dans le viewport et utilisables au clavier ; le dialogue reste borné en hauteur.
La vérification visuelle de frames décodées complète les mesures et les captures finales.

Les 11 scénarios ciblés passent : six de géométrie, deux matrices de transitions,
un parcours reduce/historique, un parcours refus/révision/dialogues et un zoom natif.
Les 21 tests React ciblés initiaux passent, dont deux nouveaux cas de direction et refus.
Le backend complet passe : 1 444 tests, couverture 97,49 %. Le frontend complet passe :
438 tests ; statements 96,44 %, branches 94,84 %, fonctions 96,54 %, lignes 97,30 %.
La première campagne E2E globale a révélé quatre mesures initiales prises pendant
l'ouverture du dialogue dans `evaluation-rating-refusal`. Les deux helpers de géométrie
(refus et layout) attendent maintenant la fin de l'animation propre au dialogue ;
les égalités strictes et les mesures pendant la navigation restent inchangées.
Cette campagne a été arrêtée pour resynchronisation après publication du chantier curseur.
Après resynchronisation, les huit refus et les cinq scénarios de mouvement passent.
Les [mesures finales](mesures.md) couvrent 238 transitions réelles, quarante combinaisons
thème/palette/format, le zoom natif, les erreurs et la réduction des animations.
Le pré-push canonique exécute ensuite le plan exhaustif ; la livraison exige sa réussite
et la CI verte du SHA publié, sans contournement ni modification du circuit.

## Revue documentaire

README, règles agents, charte, DoD, stratégie de tests, fondamentaux et contrat API relus.
Les contrats de layout, passation et dialogues référencent ce comportement ; les exigences
qualité, API et sécurité restent exactes. Nouveaux tests backend et migrations non applicables.
La publication doit utiliser `npm run publish` et attendre la CI du SHA exact.

## Coordination

Un chantier `fix/passation-disabled-cursor` est apparu pendant la recette. Lecture seule de son
diff : curseur `default` des boutons désactivés, test E2E et documentation. Les modifications
CSS portent sur une autre règle ; aucun worktree ou fichier de ce chantier n'est modifié.
`npm run publish` assure la resynchronisation sur le dernier main et le verrou d'intégration.

Le correctif curseur `e957c09` est intégré à main pendant la campagne : resynchronisation
avant validation finale ; ses styles et preuves sont conservés.
