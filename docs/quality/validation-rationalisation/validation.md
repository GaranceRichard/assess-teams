# Validation et revue du candidat

## Politique elle-même

Avant correction, les six tests de `proportionality.test.mjs` ont échoué sur les défauts reproduits :
test démo devenu exhaustif, config/helpers Playwright transversaux, PNG inconnu, empreinte PNG,
journal Chromium et exécution ciblée de démo absente.
CSS et spec applicative isolés étaient déjà proportionnés ; leur garantie est préservée.

Après correction : tests de plans, refus et preuve dans `proportionality*.test.mjs`,
`impact*.test.mjs`, `sensitive-impact.test.mjs`, `evidence-regression.test.mjs`,
`validation*.test.mjs`, `runtime-inputs.test.mjs` et `installed-cache.test.mjs`.
Le gate repository inclut explicitement les nouveaux tests et le test de scopes vérifie cette inclusion.
La fixture de scopes exige aussi un échec du gate documentaire si l'audit des preuves échoue.
`frontend/src/browserGates.test.ts` ajoute neuf vrais contrats de configuration : chargement app/démo/merge,
local/CI/shards, sorties collectables, refus de shard invalide et diagnostics hors binaires.
`quality:targeted -- frontend src/browserGates.test.ts` a validé lint, format, typage et neuf tests (1,81 s Vitest),
puis les bornes de lanceur ont été renforcées et les neuf tests revalidés en 2,06 s ; la campagne complète suit.
La matrice exige ce fichier pour l'outillage navigateur ; une fixture de rapport simulé seule ne le remplace pas.

| Invariant demandé | Preuve de test |
| --- | --- |
| Animation CSS sans backend automatique | `proportionality` : CSS/UI partagée garde S+V+E, aucun B |
| Sélecteur E2E sans SQLite | Specs app/démo, union sans doublon et démo construite avant spec sélectionnée |
| Capture sans invalidation applicative | Clés B/F/E identiques après PNG inventorié ; ressource distribuée et politique les invalident |
| Log Chromium sans invalidation binaire | `debug.log` racine ignoré ; exécutable, bibliothèque, sous-dossier et fichier ordinaire hors navigateur restent sensibles |
| API sensible | `impact` et `sensitive-impact` : B+F+E, même dans un nom de fichier anodin |
| Permissions | Rôles/refus/sessions : backend complet ; contrat produit ajoute consommateurs |
| Migration | Exhaustif dans `impact`, `validation-policy` ; aucune exception nouvelle |
| Moteur transverse | Quatre domaines, options exhaustives et refus des skips CI |
| Preuve obsolète/incomplète/incompatible | Version/provenance/scope/clé/sélection/runtime/horodatages, échecs et mutation durant/après contrôle refusés |
| MESS indépendant | `impact-execution` refuse preuve locale/partielle/autre workflow/SHA/run ; qualification locale impose frais ; CI exhaustive conservée |

## Campagne du chantier

Ce chantier modifie des scripts communs : **repository + backend + frontend + E2E complets restent requis**
par l'ancienne politique comme par la nouvelle. Aucune exception n'est utilisée pour qualifier son moteur.
Commande canonique : `npm run quality:targeted`, diff réel depuis `029857a`.

La première passe s'est arrêtée au repository sur README 202 lignes ; aucun backend n'a été lancé.
Le résumé qualité existant a été remplacé : README 200 lignes, périmètre annoncé avant le développement.
Les tests du repository étaient verts ; la campagne complète a ensuite été relancée.
Ce passage a validé le backend en 1 177,873 s (gate, empreintes incluses), puis les assertions frontend.
L'ajout du test reproduisant les métadonnées d'appel a modifié les entrées communes pendant le frontend :
le gate a correctement refusé sa preuve. Cet échec n'est pas converti en succès ni réutilisé.
Le nouveau test d'environnement a échoué avant correction puis passe, y compris les refus de réutilisation
sur changement de PATH et de capacité réseau. La revue des dépendances a ensuite trouvé un consommateur
Vite/std-env de THREAD_ID : la campagne intermédiaire a été arrêtée, et ce champ reste intégralement haché.
Le test exige aussi une nouvelle exécution si THREAD_ID disparaît. Aucune preuve du gate arrêté n'est
acceptée pour l'état modifié. La campagne complète du moteur définitif est relancée.
Les événements Windows Kernel-Power 506/507 confirment des périodes de veille moderne pendant
ce dernier passage : entrée 13:38:57, reprise 14:39:33 ; entrée 14:40:05, reprise 15:51:52
(America/Toronto). Les durées murales de ce passage ne sont donc pas un benchmark de calcul actif.
Une [requête Windows temporaire d'activité](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-setthreadexecutionstate)
est tenue pendant les validations/revue, sans modifier les réglages d'alimentation, puis libérée.
La revue des chargeurs a aussi fait interrompre ce passage pour imposer les tests des configurations
réelles : la réduction de l'outillage navigateur n'est pas justifiée par de seuls rapports simulés.
Le passage après ces neuf contrats a validé 1 456 tests backend (gate 1 158,422 s) et 452 frontend.
Les dernières assertions sur le lanceur effectif ont ensuite changé le seul fichier de test frontend :
reprise frontend/E2E, backend complet réutilisé sur sa clé exacte inchangée (9,891 s, deux empreintes,
hors revérification finale commune). Le moteur conserve les quatre scopes requis, sans bypass.
Le plan final se termine avec code 0, y compris la revérification de toutes les clés après E2E.

| Contrôle | Résultat final | Coût de scope observé |
| --- | --- | --- |
| Repository | 129 tests JavaScript + tests PowerShell/bootstrap, structure, secrets, documentation verts | 76,716 s, toujours frais |
| Backend complet | 1 456 tests, couverture 97,50 %, Ruff et migrations verts | 1 158,422 s dont pytest 1 144,24 s ; réutilisation ultérieure 9,891 s |
| Frontend complet | 452 tests ; statements 94,42 %, branches 93,04 %, fonctions 95,81 %, lignes 95,31 % ; lint/format/typage/build verts | 61,646 s après les dernières assertions |
| Navigateurs complets | 109 app verts (17,0 min), 10 démo verts (41,5 s), build démo | 1 084,412 s, empreintes avant/après comprises |

Les métriques de scope incluent les deux premières empreintes ; la revérification commune finale
est supplémentaire. Les passages interrompus et les périodes de veille décrits ci-dessus ne sont
pas transformés en benchmarks. Aucun gain de délai de livraison n'est déduit de ces points isolés.

## Coût mesuré des empreintes

Une observation à chaud par scope, Windows x64, Node 24.20.0, le 2026-10-29 à 21:00 UTC.
Aucun test lancé pour cette mesure, aucune valeur d'environnement enregistrée. Arrondis à la milliseconde.

| Clé | Outils + octets installés | Hachage des entrées du dépôt | Total |
| --- | ---: | ---: | ---: |
| Backend | 4 197 ms | 231 ms | 4 429 ms |
| Frontend | 3 212 ms | 214 ms | 3 426 ms |
| E2E | 7 006 ms | 249 ms | 7 255 ms |

Les lectures et interrogations des runtimes dominent ce point de mesure. Elles restent complètes,
sans cache de mtime ni suppression de binaires/bibliothèques. Trois barrières par contrôle réutilisable
restent nécessaires avec la politique actuelle ; ce coût n'est pas nul même lorsqu'aucun test n'est rejoué.

## Exécution du nouveau sélecteur de démo

Plan simulé pour `frontend/demo-e2e/date-presentation.spec.ts`, commandes réellement exécutées,
fichiers source inchangés : documentation + statiques frontend + typecheck/build démo + un scénario.
Résultat : code 0, **33,006 s** au total, un test passé (3,4 s Playwright).
La taille et la date de modification de la base E2E backend sont identiques avant/après :
aucune réinitialisation ni écriture du backend par ce mode. Ce feedback ciblé n'est pas une qualification MESS.

## Revue documentaire

Reprise du 30 octobre : le passage complet sur le commit `a5f481b` a aussi terminé vert
le 29 octobre : 1 456 pytest (1 112,77 s, couverture 97,50 %), 452 Vitest, 109 app et 10 démo.
Il ne constitue pas un pré-push correctement invoqué : le wrapper npm PowerShell a absorbé l'option
fournie par pipeline, comme décrit dans le diagnostic. Le hook réel appelle Node directement.
Le plan corrigé `node scripts/quality/selective.mjs --pre-push --plan` confirme le candidat commité
et les mêmes quatre scopes que cette campagne complète. La garde de contribution est conforme.
Les seuls changements suivants concernent ce compte rendu. Les contrôles repository ont été rejoués
le 30 octobre : code 0, 129 tests JavaScript et contrôles PowerShell verts. Le vrai pré-push et la CI
du SHA publié restent obligatoires après accord de publication.

- README : annonce initiale puis résumé et lien vers cette revue.
- `validation-costs.md` : matrice, preuves inventoriées, empreinte v5 et journal Chromium exact.
- `agent-rules.md` et `ci.md` : frontières auditées ; obligations de livraison/sécurité/CI préservées.
- Charte, DoD, stratégie de tests, fondamentaux et contrat API relus : ils renvoient à la matrice,
  aucun seuil, comportement applicatif, contrat API, rôle, migration ni stockage modifié.
- Documents UX originaux conservés comme sources historiques, sans réécrire leurs résultats.

## Risques résiduels et suite autorisable

La carte UI reste prudente : composants partagés et CSS globaux conservent tous les E2E.
Les preuves démo ciblées gardent encore l'empreinte E2E conservatrice des deux runtimes.
Les lectures complètes de dépendances restent répétées ; aucun cache mtime n'affaiblit leurs barrières.
Les contrôles de signatures/liens ne remplacent ni décodage complet ni acceptation visuelle de la recette.
La garde de consommateur explicite ne démontre pas l'absence de tout import dynamique futur :
nouvelle ressource distribuée/fixture ou nouveau chargeur impose revue de l'inventaire et de ses tests.
La politique 5 invalide une fois les anciennes clés ; les preuves suivantes restent sans expiration d'âge.
L'audit historique ne permet pas de rejouer les environnements disparus ou de chiffrer un délai CI économisé.
La CI sélective actuelle utilise un job E2E non shardé, l'exhaustive en utilise deux. Le reclassement
vers la CI sélective peut donc allonger sa partie navigateur tout en retirant les runners backend ;
aucun gain de délai CI n'est promis avant mesure sur le SHA publié. Les workflows ne sont pas remaniés ici.

Après validation explicite de l'utilisateur seulement : fetch/rebase, contrôle du candidat exact,
`npm run publish`, pré-push bloquant, push direct sur main, CI indépendante du SHA, synchronisation sûre
et nettoyage du seul chantier terminé. Aucune CI distante du nouveau SHA ne peut être annoncée avant publication.
