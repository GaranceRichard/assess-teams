# MEP-013 — Curseur et sélection

Audit du 2026-10-23, précisé et repris le 2026-10-26 par Codex, depuis `origin/main` à `4492dc8`, selon
[F05](../../backlog/source/mess/f05.md), [UX-07](../ux-acceptance.md) et la
[DoD](../definition-of-done.md). Branche `feat/mep-013-notation-ergonomie`, worktree isolé
`C:\Users\garan\Desktop\Projets\Assess-teams-mep-013`.
Chromium/Windows, Coach fictif de `taking-fixture.ts`, palette Vert, deux thèmes.

## Audit et correction proportionnée

| Capacité             | Constat sur la référence                                                                                                               | Décision                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Sélection explicite  | `null` distinct de 0/5, mais Entrée/Espace choisissent 5 et l'aide « Entrée : 5 » l'annonce                                            | Supprimer ce choix et cette aide ; focus/Entrée/Espace sans écriture ; Enregistrer reste désactivé sans réponse                 |
| Valeurs numériques   | Aucun nombre permanent au-dessus de la piste                                                                                           | Afficher onze choix 0–10 centrés sur les positions du range ; clic/toucher, état choisi souligné, renforcé et accessible        |
| Focus de navigation  | Suivant sur la dernière question ou Précédent sur la première supprime/désactive le contrôle actif ; le repli revient au titre général | Focaliser le titre de la nouvelle question après changement effectif ; Tab rejoint le curseur sans réponse implicite            |
| Focus du curseur     | Anneau clavier sur la poignée ; piste signalée sans note ; aucun déplacement de géométrie                                              | Conserver les styles MEP-044 et le contrôle natif                                                                               |
| Souris et tactile    | Aucun survol indispensable ; 0/5/10 et reprise déjà acquis                                                                             | Compléter le parcours existant avec les onze notes au clic/toucher et leur valeur serveur                                       |
| Progression          | Suivant peut sauter une question sans réponse                                                                                          | Désactiver Suivant sans note explicite ; conserver la reprise sur la première absence et les notes déjà enregistrées            |
| Géométrie            | Copies inertes et un seul corps défilant, actions fixes                                                                                | Inclure la ligne numérique dans les copies, reprendre l'espace des marges et conserver le seuil Linux <600 px                   |
| Refus sans repères   | Le candidat intermédiaire `3cee9e5` gagne 24 px sur un refus mobile ; pied de dialogue déplacé de 12 px                                | Réserver la taille intrinsèque des messages réels dans la zone de statut et les copies, sans changer leur texte ou leur annonce |
| Repères et snapshots | Borne inférieure explicite, points passifs et version historique                                                                       | Réutiliser les tests de repères, d'échelle et de versionnement                                                                  |

La correction reste dans Notation : `EvaluationScoreInput`, `EvaluationTakingDialog`,
`useEvaluationTaking`, `TakingContentSizing`, `TakingStatusSizing` et leurs deux feuilles de style.
Le titre de la nouvelle question reçoit le focus ; l'ouverture conserve celui de la modale.
Les nombres utilisent la même sélection et la même file de sauvegarde que le range natif.
Ils ne multiplient pas les arrêts Tab : le range conserve toutes les commandes clavier,
et un clic/toucher sur un nombre lui rend le focus. Aucun point de repère ne devient interactif.
Une sauvegarde ou un changement de note conserve le focus du curseur ; l'effet ne dépend
que de l'identifiant de question. Aucun composant partagé de dialogue n'est modifié.

## Non-régression et refus

Avant correction, les assertions ajoutées aux tests existants échouent :
`EvaluationTakingNavigation` et `TakingFocus` attendent le titre de question mais reçoivent
le titre général ; `evaluation-rating-focus` échoue sur les trois viewports 1366×768,
1920×1080 et 375×667. Les captures avant/après conservent le même jeu et le même viewport.
Après correction, ces mêmes assertions passent ; navigation aller/retour, Tab vers le range,
absence de sélection au focus et maintien du focus pendant la sauvegarde sont vérifiés.
Les deux nouvelles anomalies ont aussi été reproduites avant correction : cinq tests sur dix
échouent dans `EvaluationScoreInput` et `EvaluationTakingNavigation` (nombres absents,
attribution de 5 par Entrée, Suivant actif sans réponse). Les vingt tests React ciblés passent
après correction. La campagne navigateur initiale corrigée compte 26 tests passés.
Le contrôle complémentaire de refus sans repères a arrêté la première publication avant push.
Le test versionné `evaluation-rating-refusal` échoue avant la réserve de statut : dialogue
516,71875 → 540,71875 px, pied déplacé de 12 px et bouton de note de 24 px à 390×844.
Après correction, les 34 scénarios UX passent ; le bouton de note et le pied de dialogue
restent en place, en passation et révision, dans les deux thèmes et aux deux tailles mobiles.
Les messages invisibles sont inertes et exclus de l'accessibilité ; le statut actif garde son
rôle et son contenu. La hauteur résulte des textes, sans hauteur fixe ajoutée au dialogue.

Les vrais refus restent ceux des parcours existants : finalisation incomplète désactivée et
HTTP 400, notes inchangées ; sauvegarde 400 conserve la saisie et protège les actions.
Les notes 0/5 et leur reprise sont relues côté serveur. Les onze valeurs sont choisies sur
la ligne numérique, sans survol, dans huit combinaisons thème × souris/tactile × avec/sans repères.
Les états 0/5/7/10 sont aussi vérifiés en révision ; les données serveur restent inchangées
avant validation atomique, puis les notes révisées sont relues. Une révision réelle commence
avec les notes d'une évaluation complète, donc sans absence artificiellement introduite.
Les confirmations d'enregistrement restent inchangées et appartiennent à MEP-045.

## Preuves et validations

Le [compte rendu UX](executions.md) associe scénarios, états, captures et mesures.
Les [commandes et résultats](validations.md) distinguent reproduction initiale et candidat.
Les [empreintes des entrées](sources.md) identifient exactement le code et les tests des preuves.
Le zoom utilise `frontend/audits/taking-zoom.audit.ts`, sur le modèle de la sonde native existante :
extension Chromium locale `chrome.tabs.setZoom/getZoom`, fenêtre 1280×720 à 100 %, puis
640×360 et DPR 2 à 200 %, retour à 100 %. Les profils restent hors du répertoire frontend
surveillé par Vite. Aucun redimensionnement CSS ni changement Git/CI n'est utilisé.
Cette sonde locale reste hors de la collecte E2E habituelle, sans skip ajouté à la CI.

## Coordination MEP-046 et périmètre conservé

Lecture seule du worktree `Assess-teams-mep-046`, branche `feat/mep-046-scores-indicateurs` :
ses fichiers applicatifs sont exclusivement Résultats ; aucun recouvrement avec Notation.
MEP-013 ne modifie ni les styles communs, ni `useModalFocus`, ni les composants Résultats.
Les fichiers communs indispensables sont documentaires : paragraphe Notation du README,
ligne MEP-013 du registre et synthèses dérivées. Les lignes/contenus MEP-046 sont conservés
à la resynchronisation. `npm run publish` sérialise l'intégration, puis chaque candidat
est validé et sa CI exacte attendue ; aucun chantier n'attend l'autre pour publier.

Échelle métier, persistance, file de sauvegarde, validation métier, API/OpenAPI, permissions, calculs,
snapshots et repères passifs sont inchangés. Les acquis MEP-044 restent couverts par leurs
tests et leurs preuves historiques ; les présentes captures qualifient le nouveau candidat.
MEP-045, la recette cible MEP-069 et le GO MESS restent distincts.

## Revue documentaire et DoD

README annoncé avant la correction. AGENTS, règles détaillées, charte qualité, DoD,
stratégie de tests, fondamentaux, contrat API, passation, repères et cahier UX relus.
La description du focus dans l'architecture passation est actualisée ; les contrats voisins
ne nécessitent aucune évolution. Les preuves et le suivi canonique sont propres à MEP-013.
Nouveaux tests backend/API et migrations non applicables : aucune modification de ces contrats.
Les validations calculées par le dépôt restent bloquantes, avec les seuils de couverture
des campagnes complètes, lint, formatage, typecheck, build, sécurité et limite de 200 lignes.
La livraison reste en cours jusqu'au pre-push, au push direct et à la CI verte du SHA publié.

Le premier SHA publié `d0e37c0` a passé tous les gates locaux mais échoué en CI Linux
sur la hauteur desktop et un défilement induit par le focus mobile. Les marges locales
sont ajustées, sans réduction des contrôles ni assouplissement de la recette ; voir les
[mesures de polices](font-metrics.json) et le détail dans [validations.md](validations.md).
La clôture attend la CI verte du correctif publié.
