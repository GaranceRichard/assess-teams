# MEP-014 — Hiérarchie visuelle des résultats

Recette du 2026-10-22 par Codex, selon [F06](../backlog/source/mess/f06.md),
[UX-01/02/03/05/09](ux-acceptance.md), [MEP-053](typography.md) et la [DoD](definition-of-done.md).
Référence avant : `f327f71`. Sources du candidat : [empreintes](mep-014/sources.csv).
Clôture en attente du pre-push et de la CI du SHA publié.

## Audit et périmètre corrigé

| Repère | Avant | Après |
| --- | --- | --- |
| Contexte | Organisation et modèle isolés de la version, paragraphe de version au même niveau que le contenu | Région nommée « Contexte des résultats » regroupant filtres et référence radar ; valeur de version en gras et aide secondaire |
| Équipes | Liste sans regroupement visuel de chaque source ; date seule | Carte par équipe, nom principal, date et passation secondaires ; sélection par case cochée et bordure, focus clavier visible |
| Analyse / Restitution | Contrôles sans séparation commune du contenu | Séparation légère sous les contrôles ; empilement mobile et retour à la ligne préservés |
| Données radar | Date dans l’en-tête, source non identifiable | Source autorisée à côté de la date, scores inchangés avec chiffres tabulaires |
| Données temporelles | Version uniquement dans le title de l’observation | Version exacte et passation visibles sous chaque score/date ; title et tooltip existants conservés |

Les styles sont limités à `results-hierarchy.css` et aux composants Résultats.
Le shell, les tokens, les dix palettes et les rôles typographiques de MEP-053 restent inchangés :
texte des champs 16 px/400 ; labels 14 px/600 ; métadonnées 13 px/400 et interligne 19,5 px.
La démo partage les corrections des équipes et restitutions, et conserve son contexte synthétique
compact ; ses observations restent explicitement fictives.

Un premier candidat a comprimé le graphique temporel à 65,69 px en faible hauteur,
sous le minimum existant de 70 px. Le contexte regroupe maintenant les filtres existants,
sans répéter organisation/modèle dans un second bandeau. Le test de géométrie existant passe.
Aucun seuil ni dessin de graphique n’a été changé.
Le padding du séparateur est supprimé en faible hauteur pour préserver l’espace des graphiques.
Le test de géométrie de la démo a également reproduit 57,30 px avec un contexte trop volumineux ;
le contexte fictif compact existant est conservé, sans ajouter de nouvelle couche de métadonnées.
Le même test passe après correction, sans affaiblir ses seuils.
Le canvas temporel de l’application atteint finalement 92,89 px à 1280 × 480 dans les deux thèmes.

MEP-046 (explication des scores), MEP-015 (présentation du radar) et MEP-047
(règles de comparaison) restent ouverts ; aucune de leurs capacités n’est revendiquée.

## Contexte et droits

Le contexte provient exclusivement des listes Results déjà filtrées par le serveur.
La provenance affichée est `run_id`, `completed_at` et la version exacte de l’observation,
déjà présents dans les réponses autorisées. Aucun nom d’auteur, assigné, révision ou donnée
administrative n’est demandé, reconstruit ou exposé. La version en tête reste explicitement
la **version radar**, y compris en analyse temporelle ; les observations conservent leur propre version.

Aucun appel API, contrat, scope, calcul, filtre, tri, agrégation, série ni règle métier ne change.
Les cellules historiques restent triées indépendamment par équipe ; les absences restent vides,
et les vrais zéros restent mesurés. Aucun lien vers une passation administrative n’est ajouté.
Sur refus de chargement, aucune version ni provenance de résultat n’est affichée.

## Comparaisons visuelles et mesures

Même fixture fictive `seedResultsContext(true)` : Results E2E, Radar E2E v1/v2, équipes A/B.
Chromium fourni par Playwright, Windows, Admin ; dates stabilisées par la fixture, zoom 100 %.
Les noms de fichiers identiques permettent une comparaison directe entre
[`baseline/`](mep-014/baseline/) et [`final/`](mep-014/final/).
Les passations et leurs identifiants sont stables dans ces deux exécutions isolées.

104 états par campagne : les quatre combinaisons Analyse/Restitution dans les vingt apparences
à 1280 × 720, puis en Vert dans les deux thèmes à 1920 × 1080, 1280 × 480 et 390 × 844.
Chaque état vérifie largeur du document ≤ largeur disponible et contraste des nouveaux rôles ≥ 4,5:1
sur le fond réellement calculé. Les [mesures avant](mep-014/baseline/measurements.jsonl) et
[après](mep-014/final/measurements.jsonl) donnent une ligne par combinaison : texte, styles,
couleurs, géométrie et hauteur du canvas. Aucun redimensionnement n’est présenté comme un zoom.
La [synthèse des vingt apparences](mep-014/appearance-summary.csv) donne un contraste minimal
mesuré de 5,66:1 (seuil 4,5:1) et aucun débordement horizontal.

- Radar clair : [avant](mep-014/baseline/day-green-1280-720-radar-chart.png) / [après](mep-014/final/day-green-1280-720-radar-chart.png).
- Détails radar sombre : [avant](mep-014/baseline/night-green-1280-720-radar-details.png) / [après](mep-014/final/night-green-1280-720-radar-details.png).
- Historique faible hauteur : [avant](mep-014/baseline/day-green-1280-480-history-chart.png) / [après](mep-014/final/day-green-1280-480-history-chart.png).
- Historique mobile sombre : [avant](mep-014/baseline/night-green-390-844-history-details.png) / [après](mep-014/final/night-green-390-844-history-details.png).

Revue visuelle : le contexte se lit comme un groupe unique, les équipes sélectionnées se repèrent
par la case et le conteneur, les dates/sources restent secondaires face aux noms et aux scores.
La version historique est lisible sans survol. Le mobile empile les contrôles et garde le tableau
dans sa région ; les labels longs restent consultables dans le tableau/sélecteur existants.
Les captures sont des preuves de rendu relues, pas des assertions d’esthétique automatiques.

Le [contrôle de zoom natif](mep-014/final/zoom/measurements.jsonl) utilise une extension
Chromium locale de test (`chrome.tabs.setZoom/getZoom`), pas du zoom CSS ni une émulation de DPR.
Fenêtre donnant exactement 1280 × 720 à 100 %, puis 640 × 360/DPR 2 à 200 % ;
retour à 100 % vérifié. Les quatre restitutions sont parcourues dans les deux thèmes,
avec contrôle de sélection conservée, focus de l’onglet et action entièrement dans le viewport.
Les 24 mesures et 16 captures distinctes sont dans `final/zoom/`.
La sonde reproductible est `frontend/audits/results-hierarchy-zoom.audit.ts` : elle utilise
Chromium complet local et une configuration Playwright temporaire héritant de la configuration
existante avec `testDir: "../audits"`, `testMatch: "**/*.audit.ts"` depuis `frontend/.cache/`.
Elle reste hors de la collecte E2E de la CI, qui installe seulement le headless shell ; aucun skip
ni changement de configuration CI n’est ajouté. Les captures retiennent le framebuffer rendu.

## Non-régression, validation et DoD

Le nouveau scénario de contexte échoue sur la référence (région et provenance absentes),
puis passe sur le candidat. `ResultsProvenance` vérifie source/date autorisées, version historique
visible, absence de source d’équipe non sélectionnée et absence de version substituée.
Les deux assertions de source échouent sur les composants de référence puis passent corrigées :
[sortie de reproduction](mep-014/baseline/provenance-regression.txt).
`ResultsPageErrors` vérifie l’absence de provenance après refus réel du chargement.
Les tests existants protègent sélection 0/1/N, navigation clavier, restitution unique,
réponses obsolètes, scores/dates, zéros/absences et refus Viewer/hors organisation.
Les assertions de cellules ont été adaptées au texte de provenance ajouté ; les valeurs,
dates, ordre et cellules vides restent vérifiés.

Plan `quality:plan` : exhaustif conservateur (preuves non classifiables et adaptation de la démo).
Les validations ciblées précèdent la campagne obligatoire `quality:targeted`, le commit puis
`npm run publish`. Aucun changement de Git, hooks, scripts qualité ou CI ; aucune PR.
Frontend final : 431 tests passants ; statements 96,42 %, branches 94,80 %, fonctions 96,63 %,
lignes 97,30 %. Lint, formatage, typecheck et build passent. Le test démo de géométrie passe.
La première campagne backend passe ses 1 434 tests (97,48 %), mais son empreinte est refusée
après actualisation des captures pendant l’exécution. Cette preuve n’est pas réutilisée :
le pre-push doit revalider le commit figé et resynchronisé avant toute livraison.
Le pre-push du 2026-10-22 valide ensuite 1 434 tests backend, 431 frontend et 79 E2E
application ; il refuse la démo sur une assertion de cellule restée au format antérieur.
Le 2026-10-23, cette assertion vérifie séparément le score/date exact et la provenance v1,
sans modifier l’affichage, les données ni les calculs. Publication et clôture restent conditionnées
au succès de tous les contrôles requis et de la CI du SHA publié.

Revue documentaire : README annoncé avant code ; contrat de présentation Results actualisé.
Règles des agents, charte, DoD, stratégie de tests, fondamentaux, contrat API/OpenAPI et cahier UX relus.
Aucune migration ni modification d’API : nouveaux tests de contrat non applicables ; contrats existants
et sécurité restent vérifiés par la campagne conservatrice. Fichiers maintenus ≤ 200 lignes.

Coordination MEP-044 : worktree de notation inspecté en lecture seule ; aucun composant applicatif commun.
README et registre sont les seuls chevauchements documentaires prévus ; resynchronisation avant publication.
Le verrou de `publish` sérialise les intégrations sans attendre l’autre PBI.
Cette recette ne clôture aucun PBI voisin, aucune recette cible MESS et ne constitue aucun GO global.
