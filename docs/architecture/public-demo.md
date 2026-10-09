# Démo publique interactive

La [démo GitHub Pages](https://GaranceRichard.github.io/assess-teams/) présente le produit selon son principe :
**mesurer pour accompagner, pas pour surveiller**. Le bandeau annonce les données fictives et guide librement la découverte.

## Composition et isolation

`vite.demo.config.ts` reprend la configuration Vite, remplace l’entrée HTML avant traitement et sélectionne
uniquement pour ce build les adaptateurs locaux auth/dashboard/evaluationRuns/results/steering/productHref.
Le build normal conserve `main.tsx`, `App`, Django, les appels HTTP et ses contrôles d’accès.
Aucun endpoint, modèle, permission ou migration backend ne change.

Le mode DEMO compose le véritable `ProductShell`, `ProductSidebar`, logo SVG, `ThemeToggle`, tokens CSS et dix palettes.
Il réutilise `DashboardPage`, `PalettePicker`, `TeamList`, `EvaluationList`, `QuestionPanel`, `NameDialog`, `EvaluationDeleteDialog`,
`EvaluationTakingPage`, son tableau/dialogue/hook, `ResultsViews`, `ResultsRadar`/`ResultsDetails`, `ResultTeamSelection`, `ResultsHistory`,
`SteeringPage`, ses indicateurs et drill-down. Les slots optionnels du shell restent soumis à son autorisation de route.
Le mapper de liens conserve les chemins applicatifs et fournit des fragments dans la démo, y compris pour les liens copiés.

## Parcours et données

- Tableau de bord : Camille, profil fictif Admin de l’Atelier Horizon ; activité, apparence et raccourcis réels.
- Équipes : Aurore (Produit), Boréal (Services), Canopée (Plateforme), avec contexte et Coach fictif.
- Modèles : brouillon v2 préchargé, édition/ajout/suppression avec dialogues existants.
  Le réordonnancement est une commande locale de démonstration, pas une capacité de production annoncée.
- Évaluations : une passation préparée par équipe sur la v1 validée. Notes entières 0–10, reprise dans la même ouverture,
  confirmation des notes et finalisation complètes selon le hook existant. Une réponse invalide ou incomplète est refusée.
- Résultats : même modèle, trois équipes présélectionnées, sélecteurs Analyse et Restitution accessibles et sélections communes,
  radar et longitudinal dimensionnés dans la hauteur disponible, tableaux à scroll interne
  et clic sur un critère vers Dans le temps / Graphique ; courbe ou tableau historiques exclusifs,
  avec critère conservé entre restitutions et retour par le select natif contrôlé Analyse.
  Le tableau temporel partage `ResultsHistoryTable` : une colonne par équipe, observations chronologiques
  `SCORE/10 (JJ/MM/AAAA - HH:mm)` et cellules restantes vides, sans alignement de dates communes.
  Les trois observations préchargées sont étiquetées
  « simulation » ; la passation du visiteur est étiquetée « votre passation », avec ses vrais scores et sa date.
- Pilotage : équipes actives, couverture, complétions et retards ; les mêmes passations alimentent les projections.
  La date du scénario est le 8 octobre 2026. Aucun score global ni classement individuel n’est ajouté.

Le brouillon éditable reste distinct de la v1 validée : modifier ses questions ne réécrit ni snapshots ni résultats.
Les menus Utilisateurs, Organisation, Planification, Journal et Logs sont des aperçus explicites sans opérations simulées.
Validation/versionnement, révision des scores, invitations, notifications et administration ne sont pas simulés.

Toutes les données sont en mémoire dans `src/demo/store.ts`, sans compte, e-mail, cookie, serveur ou requête API.
Le rafraîchissement recharge les fixtures tout en conservant la route ; `Réinitialiser la démo` restaure données,
questions, thème, palette et tableau de bord. Aucun état de démo n’est écrit dans le stockage de l’application normale.

## Commandes et publication

Depuis la racine, après installation des dépendances frontend :

```powershell
npm run dev:demo
npm run build:demo
npm run preview:demo --prefix frontend
npm run test:e2e:demo --prefix frontend
npm run quality:full
```

Le build DEMO produit `build/demo` ; le build applicatif continue à produire `frontend/dist`.
La base par défaut est `/assess-teams/`, personnalisable par `DEMO_BASE` pour un autre dépôt.
La navigation `#/dashboard`, `#/results`, etc. fonctionne au premier chargement, après refresh et retour navigateur,
sans réécriture serveur ni copie de secours de l’application en 404.

Le workflow `demo-pages.yml` attend un `workflow_run` réussi de **Quality gate** issu d’un push sur main,
checkout le SHA validé, compile avec la base du nom de dépôt puis publie uniquement l’artefact DEMO.
Il utilise l’environnement `github-pages` et les permissions Pages/OIDC limitées au job de déploiement.
La source Pages du dépôt doit être **GitHub Actions** (`build_type: workflow`).
La CI existante garde ses scopes et son agrégation ; le scope E2E inclut build et parcours statiques sans Django.

Voir les guides officiels [Vite](https://vite.dev/guide/static-deploy.html#github-pages) et
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Validation et revue documentaire

Vitest couvre données partagées, limites 0/10, refus hors bornes/incomplets/IDs forgés, brouillon/snapshots,
réordonnancement et bornes, provenance, reset, thème, navigation et compositions React.
Playwright teste le build statique avec toutes les requêtes API bloquées : parcours complet, vrais scores dans le radar
et l’historique, Pilotage, reset, liens profonds des onze menus, refresh, retour, dix palettes/deux modes et mobile.
`sidebar-layout.spec.ts` réutilise les assertions de géométrie applicatives : bouton ancré en bas,
absence de débordement horizontal, icônes centrées et scroll de navigation à faible hauteur.
Le test longitudinal partage ses mesures avec l’application : six viewports desktop (jusqu’à 1280×480),
textes dessinés entièrement dans le canvas, dates sans chevauchement, légende et contrôles contenus,
redimensionnement, mises à jour jour/nuit, aller-retour d’onglets, retour radar, scroll unique du tableau et flux mobile.
`results-analysis.spec.ts` vérifie les quatre combinaisons depuis Analyse, le clavier natif et le critère conservé.
Le parcours de passation vérifie aussi les historiques de longueurs différentes et les cellules vides.
Les captures dashboard clair/sombre, radar, longitudinal, sidebar et mobile permettent la revue visuelle.
Les tests du scope qualité vérifient l’inclusion du build/E2E démo et le blocage si l’un échoue.

README, règles agents, charte, DoD, stratégie, architecture, contrat API et documentation CI ont été revus.
Les règles qualité et le contrat backend restent applicables et inchangés ; seules stratégie/architecture/CI
et leurs liens documentaires évoluent pour ce build autonome.

## Repères d’appréciation fictifs

Clarté des objectifs et Communication proposent des repères libres à certains niveaux.
Le brouillon v2 permet leur édition locale dans la section repliable partagée ; la v1 conserve ses textes.
La passation réutilise l’échelle accessible et les infobulles au-dessus des niveaux ; sélection persistante,
clavier/mobile et reset sont testés sans API. [Contrat fonctionnel](appreciation-markers.md).
