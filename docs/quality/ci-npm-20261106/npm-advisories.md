# Avis npm : exposition et décision

Chaque lien est l’avis GitHub consulté, avec correctif fournisseur et préconditions.
Le code renvoie à la [chaîne complète et aux versions](npm-inventory.md).
La production livre Django et des assets statiques ; ces bibliothèques Node sont toutes de développement.
L’absence de dépendance runtime ne supprime pas un risque de poste, de build ou de runner.

## Correctifs appliqués

| Code / avis | Sévérité de l’avis | Condition et impact | Exposition examinée | Correctif disponible / décision |
| --- | --- | --- | --- | --- |
| S / [GHSA-pqg4-j6r4-53mv](https://github.com/advisories/GHSA-pqg4-j6r4-53mv) | critique | quote reçoit un token commentaire suivi d’une chaîne contenant un retour ligne ; injection de commande shell | concurrently emploie quote pour les arguments additionnels ; dev:all contient des commandes fixes sans placeholders ni tokens commentaires externes. Précondition absente dans le script courant, risque pour d’autres appels outillage | shell-quote >=1.11.0 ; concurrently 9.2.5 impose 1.12.0 : corrigé |
| A / [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | élevée | sourcemap indexée malveillante avec décalage de section énorme ; blocage synchrone | outils CSS/build/coverage consomment des sources et maps du dépôt/dépendances ; aucune ingestion de map utilisateur dans l’API ou React. Entrée hostile reste concevable dans la chaîne de build | source-map-js >=1.2.2 ; installé 1.2.2 : corrigé |
| Z / [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | élevée | validation d’une collection hostile volumineuse ; accumulation d’erreurs et épuisement mémoire | zod vient des règles React Hooks/validation de configuration ESLint, pas des formulaires métier ; configuration du lint versionnée, aucune collection utilisateur transmise à ce Zod | zod >=4.6.6 ; installé 4.6.7 : corrigé |
| T1 / [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) | modérée | enregistrement de mock manuel sur WebSocket du dev-server ; source JavaScript injectée | tests jsdom exécutés avec vitest run ; pas de Vitest browser mode ni d’interceptorPlugin exposé dans la configuration. Poste Windows concerné si un tel serveur est ouvert ultérieurement | mocker >=5.0.3 ; Vitest, coverage et mocker 5.0.3 : corrigé |
| T2 / [GHSA-xp26-3454-mjgp](https://github.com/advisories/GHSA-xp26-3454-mjgp) | modérée | redirect de mock contenant un antislash sous Windows ; lecture hors allowlist | même outillage que T1, Windows local applicable mais endpoint browser de mock non activé ; pas d’endpoint de production | mocker >=5.0.3 ; installé 5.0.3 : corrigé |

## Huit avis undici

Même chaîne `jsdom → undici`, ancienne version 7.29.1, en D/C tests.
Aucun import undici dans l’application, pas de client Node de production ; la configuration Vitest
emploie jsdom sans chargement volontaire de ressources distantes. Les réponses API sont simulées dans
les tests. Cela borne l’exposition observée sans promettre l’innocuité de tout futur test réseau.
Chaque ligne a son prérequis distinct ; tous sont corrigés par undici >=7.30.1, installé 7.30.2,
compatible avec ^7.25.0 du consommateur jsdom et avec Node 22/24.

| Code / avis | Sévérité | Prérequis et effet | Exposition réelle / décision |
| --- | --- | --- | --- |
| U1 / [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) | modérée | EventSource connecté à un serveur SSE hostile ; état du parseur sans borne mémoire | aucun EventSource undici configuré ; corrigé |
| U2 / [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) | modérée | fetch avec métadonnée SRI d’algorithme en casse non minuscule ; intégrité ignorée | aucun fetch undici avec integrity configuré ; fetch du navigateur distinct ; corrigé |
| U3 / [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) | élevée | serveur hostile renvoyant plus de cinq encodages puis fermant tôt ; exception fatale | pas de pair HTTP externe identifié dans les tests jsdom ; risque conditionnel du runner supprimé : corrigé |
| U4 / [GHSA-4w7w-5xrc-9h26](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) | élevée | Agent sans origine composant redirect puis cache partagé ; confusion inter-origines et divulgation | aucune composition de ces interceptors trouvée ; corrigé |
| U5 / [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) | élevée | Agent perd un callback TLS personnalisé pendant un clonage JSON ; validation personnalisée contournée | aucun Agent/TLS personnalisé trouvé dans la configuration applicative/tests ; corrigé |
| U6 / [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) | élevée | pair TLS 1.2 changeant de certificat lors d’une renégociation ; assertion fatale | pas de connexion TLS externe jsdom identifiée ; corrigé |
| U7 / [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) | modérée | WebSocket hostile envoyant des PING sans lire les PONG ; file mémoire sans borne | aucun WebSocket undici configuré ; le WebSocket du navigateur/Playwright relève d’un autre runtime ; corrigé |
| U8 / [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) | modérée | interceptor decompress et handler levant une exception après décompression ; arrêt du processus | aucun interceptor decompress/dump configuré ; corrigé |

L’audit de cette dépendance npm ne qualifie pas la copie d’undici éventuellement embarquée dans Node.
Elle relève de la maintenance du runtime, distincte de ce lockfile ; aucun risque accepté implicitement.

## Six avis Vite

Vite 8.3.0 est un outil D/B/C, jamais le serveur de production. Les configurations réelle et démo
fixent `server.host` à 127.0.0.1 ; le bootstrap et les webServers Playwright restent locaux.
La démo utilise un hook de transformation HTML de plugin, pas un serveur custom passant une URL brute
à server.transformIndexHtml. Aucun middlewareMode/appType custom n’est défini.
Le build seul ne met pas les endpoints de dev-server à disposition d’utilisateurs.
Tous les avis ci-dessous sont corrigés par Vite 8.3.3, installé explicitement, même majeure 8.

| Code / avis | Sévérité | Prérequis et effet | Exposition réelle / décision |
| --- | --- | --- | --- |
| V1 / [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | modérée | Windows, chemin hostile et variable d’environnement/flux NTFS contrôlé ; injection de commande à l’ouverture éditeur | poste Windows concerné, chemins/éditeur non contrôlés par un contrat API métier ; défense de poste utile : corrigé |
| V2 / [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | modérée | chemin interprété en option par certains éditeurs, notamment WSL ; commandes ou écriture de fichiers | aucune ouverture d’éditeur pilotée par données métier ; endpoint dev uniquement, préconditions externes non exclues sur un poste : corrigé |
| V3 / [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | élevée | suffixe de chemin spécial Windows contourne le contrôle d’existence ; combinaison avec V1 | système local Windows concerné ; une fausse inexistence de fichier ne justifie donc pas de classer V1 inoffensif : corrigé |
| V4 / [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | faible | serveur custom transformant l’URL brute, module inline et données/actions sensibles ; script inter-origines | mode custom/middleware non configuré, précondition absente dans l’usage audité ; corrigé quand même |
| V5 / [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | modérée | dev-server exposé et import dont le chemin relatif correspond à un chemin système ; lecture hors racine sur OS non Windows | configuration locale loopback, pas d’import système correspondant identifié ; exposition future possible si --host changé : corrigé |
| V6 / [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) | modérée | requête wasm spéciale sous Node/Deno ; divulgation des quatre premiers octets hors autorisation | Node utilisé en développement/CI, accès réseau limité au loopback ; sensibilité des premiers octets non présumée nulle : corrigé |

## Avis restant qualifié, sans acceptation

M / [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), modérée :
minimatch >=7.0.0 <11.0.1, version installée 10.2.6. Amplification de globparts dans la première phase
pour `optimizationLevel >= 2`, puis comparaisons quadratiques : déni de service sur pattern hostile.
Correctif fournisseur : 11.0.1. Les consommateurs demandent ^10.2.5 (eslint), ^10.2.4 (config-array)
et ^10.2.2 (typescript-estree) : aucun patch 10 compatible publié lors de l’examen.

Les appels examinés utilisent `{ dot: true }` sans optimizationLevel : valeur effective par défaut 1,
confirmée avec `new Minimatch('**/*.{ts,tsx}', {dot:true})`. Aucun `optimizationLevel` dans ces trois
consommateurs ; le code installé de minimatch (dist/commonjs/index.js) fixe explicitement le défaut à 1.
Les globs proviennent d’eslint.config.js et de fichiers de configuration versionnés,
pas d’entrées HTTP ou de collections utilisateur. Le lint CI porte sur le dépôt contrôlé.
**Non exploitable par ce chemin examiné**, sans généralisation à une configuration modifiée ou à un dépôt hostile.
L’avis reste valide et produit 10 signalements npm propagés ; il n’est ni supprimé ni masqué.

Décision technique : conserver 10.2.6 et les consommateurs actuels, documenter l’écart.
Les suggestions npm de downgrade ESLint 9.39.5 / typescript-eslint 8.36.0 sortent des bornes déclarées ;
elles ne démontrent pas une compatibilité et sont refusées. Un override minimatch 11 contournerait aussi
les contrats amont : non appliqué. Une évolution nécessitant ces ruptures attend une décision explicite.
Le registre a aussi été vérifié pour les derniers consommateurs compatibles : ESLint 10.14.0
reste sur ^10.2.6, @eslint/config-array 0.23.5 sur ^10.2.4 et typescript-estree 8.72.1 sur ^10.2.2.
Les actualiser ne corrigerait donc pas M ; aucune mise à jour opportuniste effectuée.
Risque accepté : aucun ; disparition de l’avis et qualification d’une évolution majeure restent ouvertes.
