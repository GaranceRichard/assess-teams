# MEP-048 — exécution complémentaire du 2026-11-02

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

Auteur : Codex. SHA `826cc51063ab1120ddc052f2a01bb4b77479c4b0`.
Retour : [matrice et décision](rapport.md).
Aucune modification de code applicatif, de test versionné ou de calcul métier.

## Environnement et stabilisation

- Windows ; Node 24.20.0 ; Python 3.12.10 ; Django 5.2.18 ; Playwright 1.63.0.
- Chromium **153.0.8010.12**, contexte navigateur fuseau `America/Toronto`, palette Vert.
- Backend réel 127.0.0.1:8148, frontend réel 127.0.0.1:5248 ; aucun mock API, aucune démo.
- Base dédiée : `.cache/mep-048/complement/recette.sqlite3`, copie SQLite de J1–J3.
- Avant capture : polices prêtes, animations finies et zéro `.transition-outgoing`.
  Aucun CSS modifié, aucune animation désactivée pour embellir le résultat.
- Les captures de composants servent aux textes ; les défauts de cadrage sont vérifiés par
  captures de page entière et géométrie réelle après interactions clavier/molette.
- Sorties dans `.cache/mep-048/complement/`, conservées localement ; aucune donnée de production.
- Le service navigateur interactif restait indisponible. La recette utilise le Chromium de test
  existant du dépôt avec le vrai écran de connexion et les API réelles.

## Sélection précise, sans répétition des acquis

`node .cache/mep-048/complement/browser-recette.mjs` : Q1 aux huit combinaisons
(1280×720, 1920×1080, 1280×480, 390×844 × clair/sombre), Q2 et Q3.
Les suites pytest/Vitest/E2E existantes n’ont pas été relancées.

La première tentative a rencontré des erreurs de harnais : baseURL absente pour les appels API
relatifs, sélecteurs getByLabel exacts ne retrouvant pas les combobox.
Ce ne sont pas des refus applicatifs conformes, ni des régressions imputées au produit.
`browser-recette-r2.mjs` corrige seulement le harnais en cache : baseURL explicite et rôles combobox.
Il conserve les 12 cellules déjà acquises et reprend les 15 interrompues.
Les deux sorties et les observations r1 restent conservées.

Résultat brut final : **27 cellules d’assertions techniques satisfaites**.
Ce nombre n’est ni une nouvelle suite versionnée ni un verdict d’acceptation visuelle.
La revue des captures/géométries refuse la clôture sur B01/B02, malgré ces assertions vertes.

| Sélection | Action / attendu | Observé |
| --- | --- | --- |
| Q1, huit combinaisons | Lire les cinq cartes, D et définitions ouvertes ; comparer J1 | 4/2/2/2 et 31/10/2026 10:00 ; D=02/11 ; définitions intégrales, pas de superposition. Contrôle document scrollWidth=clientWidth insuffisant pour B01 |
| Q2 A1 | Depuis Pilotage, focus du lien puis Entrée | URL org/famille/équipe 1 ; A1 cochée, v1, run 1 ; complétion 30/10 10:00, notes [0,0] après révision du 01/11 |
| Q2 A2 | Même navigation réelle | A2 seule cochée, v1, run 2 ; complétion 31/10 10:00, notes [7,3] |
| Q2 ancienne seulement | Cliquer source v1 alors que seule l’autre équipe a un résultat v2 courant | v2 affichée, message « L’équipe demandée n’a pas de résultat exploitable sur la version radar courante. Choisissez une équipe disponible. » ; zéro case cochée |
| Q2 étranger | Admin MEP048 demande Steering org4 et Results famille2/v1 ; puis ouvre URL Results forgée | Deux 404. L’interface impose MEP048, aucun modèle sélectionné, aucune équipe étrangère ; invitation à sélectionner un modèle. Pas de faux message de succès |
| Q3 J2 | Organisation sans équipe, clair/sombre, définitions ouvertes | Comptes 0 ; « Aucune complétion », « Aucune équipe active dans cette organisation » ; aucun lien d’équipe |
| Q3 J3 | Une équipe sans complétion, clair/sombre | Comptes 1/0/1/0 ; « Aucune complétion » ; modèle/version/échéance/Coach absents explicités dans le DOM ; défaut de lecture de la ligne avec définitions ouvertes : B02 |
| Q3 Admin | Dashboard clair/sombre | Complétion/révision et auteurs distincts ; organisation propre ; aucune assignation personnelle à réaliser |
| Q3 Coach | Dashboard clair/sombre, A2 réassignée à un autre Coach fictif | A2 absente de l’activité ; A1 et archive accessibles selon assignation ; 2 attentes personnelles, pas un total de retards |
| Q3 Viewer | Dashboard clair/sombre | Auteurs masqués ; pending_assignments=null et aucun compteur rendu ; aucun lien Pilotage |
| Q3 Superadmin | Dashboard clair/sombre | Activité globale, organisation par événement ; pas d’organisation personnelle ni compteur d’assignations |
| Q3 refus Pilotage | Coach puis Viewer ouvrent /steering et son API | Page « non autorisée » et HTTP 403 sans projection |
| Q3 choix Superadmin | Choisir MEP048 puis MEP048-old | Données de la seule organisation sélectionnée ; A1 disparaît au changement |

Le jeu « ancienne seulement » est une organisation séparée : deux équipes, même famille, v1/v2.
Aucune équipe ou version n’est présentée implicitement comme le résultat de l’équipe source absente.
L’API 404 et l’écran imposant le contexte propre sont deux observations distinctes, conservées comme telles.

## Lecture visuelle réellement effectuée

Captures examinées : définitions aux huit combinaisons ; cartes et note mobile sombre ;
les quatre Dashboard dans chaque thème ; sources A1 et ancienne version ; contexte étranger ;
refus Viewer ; messages/absences J2/J3 ; pages mobiles avant/après clavier dans les deux thèmes ;
comparaison desktop définitions ouvertes/fermées et après molette.
La source A2, le refus Coach et les valeurs restantes sont appuyés par les observations navigateur
et leurs captures conservées, sans prétendre à une recette esthétique indépendante de chaque pixel.

Les définitions isolées sont lisibles, y compris les bornes strictes et la distinction révision/date initiale.
Le mobile initial montre la note entière ; après Tab vers A1, elle est complètement hors cadre.
La capture ancienne superposée était transitoire ; **B01 n’est pas une transition** (zéro calque sortant).
À 1280×720, définitions ouvertes, la zone de collection ne laisse que 72 px sous un en-tête de 91 px :
la ligne sans résultat n’est pas lisible. La molette déplace le contenu mais n’établit pas une lecture
simultanée de la ligne et des définitions. Voir les mesures et captures dans [les écarts](ecarts-residuels.md).

Zoom réel 200 %, toutes les palettes, accessibilité exhaustive et PV cible MESS restent hors de
cette sélection complémentaire ; aucune certification supplémentaire n’en est déduite.
