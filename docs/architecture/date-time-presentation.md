# Présentation des dates et heures

Les interfaces affichent `JJ/MM/AAAA`, `HH:mm` (24 heures) ou `JJ/MM/AAAA - HH:mm`.
Aucune seconde n’est visible. Le formatage n’arrondit pas les minutes et ne modifie pas les données.

## Utilitaires et fuseaux

`frontend/src/dateTime.ts` centralise date, heure et date-heure. Les timestamps utilisent
le fuseau du navigateur déjà appliqué auparavant ; les dates calendaires ISO sont réordonnées
sans conversion UTC susceptible de changer leur jour. Une valeur absente ou un timestamp invalide affiche `—`.
`completionDate` délègue à cet utilitaire pour les composants produit et les adaptateurs DEMO.

Django utilise `config.formats.fr.formats` avec la langue existante `fr-fr`.
Ces formats de présentation servent aux notifications et aux champs read-only de l’admin Django.
Le fuseau serveur existant `America/Toronto`, les formats de parsing et DRF restent inchangés.

## Audit des surfaces

| Surface examinée | Correction ou constat |
| --- | --- |
| Dashboard personnel et Superadmin | Dates des complétions/révisions via `DashboardActivity`. |
| Passations, tableaux et provenance | Complétion et révision via `completionDate`, sans secondes. |
| Résultats : sélection, radar/détails | Dates dans les libellés de sélection et en-têtes détaillés. Le radar ne contient pas de dates. |
| Résultats dans le temps | Tableau `ResultsHistoryTable`, titre/libellé d’infobulle et graduations ; les coordonnées gardent les timestamps exacts. |
| Pilotage | Dernières complétions formatées ; référence et échéances restent des dates seules. |
| Journal d’activité | Titres journaliers numériques et heures `HH:mm` ; regroupement local conservé. |
| Logs | Lignes et détails développés identiques, sans secondes. |
| Planification et modale d’édition | Saisie `JJ/MM/AAAA` validée, valeur ISO et minimum existant conservés. |
| Filtres Journal et Logs | Saisies date/date-heure explicites, indépendantes de la langue du navigateur. |
| Utilisateurs, organisations, équipes, modèles | Aucun autre affichage de date dans ces pages, listes, sélecteurs ou dialogues. |
| Profil, authentification, mots de passe, messages | Aucun libellé daté ; les liens techniques restent intacts. |
| Administration Django | Dates des identités en lecture seule et historique admin via les formats Django partagés. |
| Notifications | Confirmation de planification en `JJ/MM/AAAA` ; les autres e-mails ne présentent pas de date. |
| Démo publique | Réutilise les mêmes composants et formatages, y compris les fixtures et nouvelles passations. Les aperçus administratifs ne présentent pas de date. |
| Exports utilisateur | Aucun export de présentation humaine implémenté dans le produit actuel. |

## Saisies et exceptions techniques

Les trois familles de contrôles natifs date/date-heure dépendaient de la locale du navigateur.
`DateInput` affiche et valide le format demandé, y compris calendrier, années bissextiles et bornes.
Les dates invalides empêchent la soumission native du formulaire. Le style des champs existants est conservé.
Une date-heure préchargée garde ses secondes et fractions tant que sa minute visible n’est pas modifiée.
Les filtres conservent leur conversion existante vers ISO ; la précision des événements persistés n’est pas touchée.

Les attributs HTML `dateTime`, données fictives, requêtes/réponses API, JSON/OpenAPI, timestamps ORM,
liens de récupération, traces techniques et sorties des outils de développement restent machine-readable.
Ces valeurs invisibles dans les libellés conservent ISO, secondes et fractions selon leur contrat.
Les messages métier et techniques ne sont pas réinterprétés comme des timestamps.
Aucune migration, modification de permissions, de calcul, de CSS, de palette ou de mode sombre.

## Vérification et revue documentaire

Vitest couvre formats, minuit/midi, heures à un chiffre, fuseau local, UTC/Toronto/Tokyo,
changements de jour et heure d’été/hiver, précision, refus de saisie et composants.
`DateFormattingAudit.test.ts` recherche les formatages localisés dispersés, contrôles natifs
et dates brutes connues dans les sources produit et démo ; les exceptions techniques sont examinées ci-dessus.
Les tests de notifications vérifient présentation et maintien de la date ISO dans la réponse API.
Les tests Django vérifient les formats, le rendu local des templates, l’admin read-only et son refus d’accès.
Playwright vérifie la démo en navigateur anglais, dashboard/résultats/historique/Pilotage/jour-nuit,
une nouvelle passation avec secondes et les graduations graphiques avec leurs contrôles de géométrie.

README, règles agents, charte qualité, DoD, stratégie de tests, architecture fondamentale,
contrat API et documentation de démo ont été revus. Les gates et contrats restent inchangés.
