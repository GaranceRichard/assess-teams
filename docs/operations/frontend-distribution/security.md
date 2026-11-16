# MEP-058 — Qualification npm de Swagger reconstruit

[Contrat et reproduction](README.md). Contrôle du 2026-11-15 : Node 24.20.0, npm 11.19.0,
source Swagger 5.35.0 et lock exacts de MEP-057, sans changement de dépendance.

## Résultat brut conservé

`npm audit --omit=dev --json` retourne 1 : quatre paquets signalés, un faible et trois modérés.
Deux avis directs : deepmerge et minimatch ; apidom-reference et swagger-client propagent leurs chaînes.
L'audit complet retourne 36 paquets signalés : trois faibles, 21 modérés et 12 élevés, aucun critique.
Ces codes non nuls ne sont pas présentés comme des audits verts ; les rapports JSON sont joints aux preuves.
Le rapprochement avec les 114 composants du relevé navigateur conserve deepmerge 4.3.1,
apidom-reference 1.14.0 et swagger-client 3.39.0 ; tous les autres paquets signalés sont absents du relevé.

## Minimatch — absence du navigateur démontrée

Chaîne exacte : Swagger UI 5.35.0 → swagger-client 3.39.0 → @swagger-api/apidom-reference 1.14.0
→ minimatch 10.2.6 (résolveur de fichiers Node). Avis
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249),
versions >=7 et <11.0.1, amplification de motifs à `optimizationLevel >= 2` ; correctif 11.0.1.
Le mapping `browser` d'apidom-reference remplace `index-node.mjs` par `index-browser.mjs` :
`canRead()` renvoie faux, et `read()` refuse l'usage du résolveur de fichiers dans le navigateur.
Les rapports Webpack ne contiennent pas minimatch ; ni son code ni son résolveur Node ne sont distribués.
Décision : avis non exposé dans ces assets. Aucun override majeur ni downgrade automatique de swagger-client.

## Deepmerge — dépendance présente, frontière du schéma contrôlée

Chaîne exacte : Swagger UI 5.35.0 → swagger-client 3.39.0 → deepmerge 4.3.1, MIT.
Avis [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4),
versions 4.2.0–4.3.1 ; aucune version corrigée publiée selon l'avis. Le downgrade suggéré par npm n'est pas retenu.
La vulnérabilité de la bibliothèque n'est pas niée : le scénario documenté de fusion sur une valeur nulle
peut produire une propriété héritée dans l'objet retourné. Le prototype global n'est pas l'objet de cette preuve.
Les imports incorporés de swagger-client l'emploient pour la fusion du document OpenAPI et des options structurées.

Dans cette intégration, le document vient exclusivement du générateur Django local, sans construction depuis une base,
une saisie métier ou une URL fournie par l'utilisateur. Le test de contrat parcourt le vrai schéma généré :
références internes uniquement et aucune clé `__proto__`, `prototype` ou `constructor`.
Spectacular fixe `url: "/api/schema/"` ; BaseLayout n'expose pas de sélecteur d'URL et
`queryConfigEnabled: false` est explicite en production. Le navigateur essaie réellement des paramètres
`url` et `configUrl` externes : le document reste local, aucun accès externe n'est tenté.
Les réponses des opérations sont affichées comme réponses HTTP ; elles ne deviennent pas un nouveau schéma configurable.

Décision : non-exploitabilité bornée au schéma contrôlé de cette application et aux chemins vérifiés,
sans acceptation de risque, sans prétendre corriger deepmerge ni qualifier un Swagger générique.
Un futur import de document arbitraire, une configuration par query string ou des références externes
invaliderait cette conclusion et exigerait correction/qualification avant distribution.

## Outillage de préparation

Les autres signalements concernent les chaînes Jest, ESLint, SVGR/SVGO, release-it, serve et outils associés
du verrou upstream ; les versions, chaînes `via`, plages et correctifs sont conservés dans `audit-all.json`.
Ils ne sont ni installés ni exécutés sur cible et aucun serveur npm upstream n'est lancé.
La préparation n'exécute que Webpack/Babel/Sass sur l'archive source contrôlée et les archives verrouillées ;
aucun test, serveur de prévisualisation, publication upstream ou script npm d'installation n'est exécuté.
Les fichiers SVG/Sass sont ceux de cette source, sans entrée utilisateur ou ressource distante variable.
Cette séparation est une qualification d'environnement ; elle n'autorise pas la redistribution de l'outillage.
Les sept outils aux droits non établis de MEP-057 sont absents du relevé et du sous-artefact.

Les avis déjà qualifiés pour l'outillage propre à Assess Teams restent ceux du
[rapport transversal](../../quality/ci-npm-20261106/README.md), sans nouvelle dérogation.
Risques acceptés par MEP-058 : **aucun**. Les conditions de non-exposition restent des réserves explicites.
