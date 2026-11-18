# C1 — Compatibilité du protocole hors ligne avec MEP-021

## Préparation du changement — 2026-11-17

- Périmètre : adapter le harnais de qualification MEP-058 et ses seuls tests de régression aux settings de production acquis.
- Objectif : remplacer les variables concurrentes et la surcharge SQLite par un document complet conforme au contrat de configuration v1.
- Effets attendus : générer une instance temporaire avec clé privée hors sources, migrer sa seule base et produire les pages Django/Spectacular réelles.
- Risques : préserver les validations de démarrage, les données existantes, les contrôles Chromium et le nettoyage lors des refus ou erreurs.
- Vérification : reproduire le refus initial, tester le succès et les configurations absente, invalide et concurrente avant effet, puis exercer le navigateur et les gates applicables.
- Fichier : `scripts/distribution/offline-test.mjs`
- Fichier : `scripts/distribution/offline-test.test.mjs`

La préparation précède les modifications techniques. Le générateur de fixtures existant
`backend/tests/installation_helpers.py` fournit le document complet depuis l'exemple canonique,
la clé générée hors sources et le nettoyage des deux répertoires isolés. Le harnais fermera
les connexions avant ce nettoyage, y compris lors des erreurs. Les tests exerceront le
programme Python réellement embarqué et le point d'entrée complet sur le sous-artefact existant.
Le périmètre propriétaire des autres chantiers et les statuts canoniques restent réservés.

## Reproduction initiale

Base vérifiée `fa5822491ff5e5a41f33d34285eca35882d95850`, sommet de `origin/main` au départ.
Copie isolée du sous-artefact existant `MEP-058/ca962920b02f/artifact` dans le build C1.
`node scripts/distribution/verify.mjs build/mep-058/artifact` accepte ses 198 fichiers,
avec payload `09d4110fadb2d3c94080451b95782564344602b1e17903d59b4058165ca4031c`.
`node scripts/distribution/offline-test.mjs build/mep-058/artifact` échoue avant correction
avec `ImproperlyConfigured` exigeant le chemin absolu `ASSESS_CONFIG_FILE`.
L'ancien code injecte trois variables concurrentes et surcharge la base après import des settings.
La revalidation de démarrage interdit également cette surcharge directe.

## Résultats ciblés et revue de contenu

`node --test scripts/distribution/offline-test.test.mjs` réussit les dix cas.
Le test de schéma de production a échoué sur l'ancien programme avant correction.
Les cas positifs contrôlent le document sélectionné, la base réellement migrée et les tables,
le schéma OpenAPI et le rendu Swagger, avec variables historiques héritées neutralisées.
Les six refus contrôlent sélecteur absent, document introuvable, expéditeur invalide,
clé privée invalide, source concurrente et surcharge SQLite après chargement.
Une sentinelle refuse SQLite, réseau et mutations de fichiers pendant le démarrage.
Les diagnostics restent exempts du marqueur privé, et aucune base n'est créée au refus.
Le nettoyage est contrôlé après succès, chaque refus et erreur de rendu après migration.
Le refus de lancement Chromium vérifie aussi la sortie du processus et la fermeture du serveur.

`node scripts/distribution/offline-test.mjs build/mep-058/artifact` réussit sur les octets
existants vérifiés ci-dessus. Chromium `153.0.8010.12` consulte 26 URL, les routes anonymes,
les ressources locales et Swagger avec son schéma réel. Les ressources absentes renvoient 404,
les paramètres de configuration Swagger distants restent désactivés. Aucune requête externe,
erreur JavaScript ou requête échouée. La preuve générée conserve le même digest de payload.

La préparation réellement écrite avant le code convient au harnais de qualification concerné.
Le générateur MEP-021 est réutilisé dans ce test développeur, avec fermeture des connexions
avant suppression des fixtures. Les validations applicatives restent celles de production.
Le README, les règles agents, la charte, la DoD, la stratégie, les fondamentaux et le contrat API
ont été revus. Ce correctif de harnais est documenté ici, avec les preuves historiques conservées.

Le premier lancement qualité a été interrompu après avoir placé son journal à la racine,
ce qui empêchait son ouverture par le scanner. Le journal a été déplacé sous `.cache`, puis
le verrou de ce seul processus arrêté a été vérifié et retiré. Le gate documentaire a ensuite
traité le nom initial du rapport contenant « configuration » comme un fichier technique.
Le rapport a été renommé pour refléter la compatibilité du harnais, avec son contenu préalable conservé.

## Gates locaux avant publication

Le plan exhaustif `npm run quality:targeted` réussit ses quatre domaines.
Le gate dépôt contrôle lignes, secrets, documentation et suites d'outillage.
Le backend réussit 1 758 tests avec couverture globale de 97 %, lint, format et migrations conformes.
Le frontend réussit 499 tests dans 120 fichiers, lint, format, typage et build conformes.
Ses couvertures sont 94,97 % statements, 93,55 % branches, 96,47 % fonctions et 95,81 % lignes.
Playwright réussit les 155 E2E applicatifs puis les 10 E2E de démonstration.
Les fichiers techniques du lot comptent 187 et 173 lignes.

Un second passage des dix tests ciblés et du protocole complet réussit avec TMPDIR/TMP/TEMP
redirigés sous `.cache/tmp` du worktree. Les clés privées restent hors sources et package,
le nettoyage est vérifié, les 198 fichiers sont toujours acceptés et les 26 URL restent hors ligne.
Le rapport de livraison fournit le SHA effectivement publié et le lien CI indépendant correspondant.
