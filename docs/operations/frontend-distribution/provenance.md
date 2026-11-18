# MEP-058 — Provenance des octets préparés

[Contrat et reproduction](README.md) · [qualification](qualification.md).

## Entrées conservées

Référence inventaire : MEP-057 publié en `6aec11f95ba0255f9bf8643ce63a7959ccfb2d8f`.
L'application est construite avec ses manifests et verrous existants ; aucun paquet frontend n'est mis à jour.
Le manifeste de sortie enregistre le SHA exact de ses sources au build, leurs empreintes fichier,
la configuration Swagger de production et les scripts de préparation, sans confondre le SHA documentaire final avec les octets sources.
Les versions de préparation sont Windows 10.0.26200 AMD64, Node 24.20.0, npm 11.19.0 et Python 3.12.10.
Le résultat JavaScript/CSS est statique et ne dépend d'aucune ABI Python cible.

| Entrée | SHA-256 |
| --- | --- |
| frontend/package-lock.json | f248fa0f8e1e020d42b187ffb63992e2e2f779aedef031178bb0d6bc6ac9f724 |
| archive source Swagger 5.35.0 | d03263e1c65ad147f35c0deeadc937c42f387accef31455d744906b43b6b8a59 |
| package-lock Swagger upstream | 7c2b062a17b882712ea3a6ed32904a7a283ca777fd94144346b545ef0e942f46 |

## Reconstruction de Swagger et traitement de I02

Les configurations Webpack upstream compilent les sources avec les versions exactes du verrou.
La vérification source confronte chaque fichier extrait aux octets de l'archive hachée avant compilation.
Le collecteur rapproche les modules des rapports Webpack et les imports Sass du verrou et des neuf tables MEP-057.
Les archives de ces 114 composants sont vérifiées par SHA-256/SRI, puis leurs fichiers comparés à l'installation utilisée.
Les données `components.json` donnent chemin imbriqué, version, provenance, hash d'archive et hash de chaque notice.
La fermeture d'outillage reste celle du verrou upstream et de ses compléments MEP-057, pas celle du runtime cible.

Les trois composants problématiques du précompilé (@braintree/sanitize-url, stampit et traverse) sont absents du relevé reconstruit.
`neotraverse` est un autre composant, explicitement verrouillé et attribué ; aucun alias de version n'est inventé.
Les sept outils sans droit établi restent exclus, comme Scarf et tous les outils de compilation.
Les licences et notices intégrales sont conservées, y compris les quatre textes `LICENSES/` cités par les notices ApiDOM.
La distribution des fragments JSON Schema conserve leurs textes BSD/AFL d'origine ; la branche BSD permissive est disponible.
DOMPurify conserve son texte double et la branche Apache-2.0 disponible.

`format@0.2.2`, `toggle-selection@1.0.6` et `short-unique-id@5.3.2` déclarent leurs droits par référence.
Leurs README et package.json originaux conservent les auteurs/copyrights ; les termes MIT/Apache complets sont copiés,
sans réécriture, depuis les textes SPDX inclus dans l'archive ApiDOM vérifiée. Chaque complément nomme cette origine et son hash.
Aucun texte tiers n'est remplacé par la licence Assess Teams et aucune attribution nouvelle n'est déduite.

## Résultat de la répétition indépendante

Deux sorties distinctes, même source et même poste, donnent les mêmes empreintes ci-dessous.
La date de build intégrée est fixée au 1970-01-01 ; ce n'est pas une date de publication prétendue.
L'identité Git intégrée nomme le SHA-256 de l'archive source, sans emprunter le dépôt Assess Teams parent.

| Sortie de compilation | SHA-256 |
| --- | --- |
| swagger-ui-bundle.js | c2e4398b331abc9be29fc36fafb3282d0f46caeaa9cff32a5123dba598758721 |
| swagger-ui-standalone-preset.js | 5243d492e14505e0cab87ac8b0195d0e615943e651743b2b698450a46eb470be |
| swagger-ui.css avant retrait du lien map | 5ed08757e53da3e026d6cbecc61fe5d43585c9560b302d534ad56692519a273d |

Le preset et le CSS peuvent être identiques aux octets upstream après reconstruction : leur provenance est désormais démontrée.
Le bundle refusé `e6a89869…` n'est pas repris et le vérificateur le refuse aussi après recalcul des hashes du manifeste.
Les fichiers OAuth sont copiés depuis `dev-helpers/` par le plugin upstream ; le favicon provient de l'archive source contrôlée.
La CSS livrée retire seulement le lien à la map de préparation ; son empreinte finale reste celle du manifeste de remise.

## Frontend normal et remise

La commande normale produit `index.html`, un JavaScript, une CSS et les six mentions légales.
Le logo original est incorporé au bundle ; les polices sont celles du système, sans téléchargement.
Les adaptateurs `/api/session/login/` et `/api/session/logout/` sont présents ; la démo GitHub Pages n'est pas la source de sortie.
Les rapports, le manifeste et les preuves de navigateur accompagnent la remise locale hors du worktree nettoyé.
Le rapport final de publication fournit le lien durable de cette remise, ses empreintes et le SHA exact de la CI verte.
Cette archive frontend n'est pas le package autonome MEP-024 et ne contient ni runtime Python ni serveur Windows.

## Candidat historique qualifié — ca962920b02f

SHA des sources et outils de préparation : `ca962920b02f22c16f841457d49fe7971502c3f7`.
La documentation de résultats publiée ensuite ne change aucune de ces entrées, vérifiées à nouveau avant remise.
Le sous-artefact contient 198 fichiers hachés, plus son manifeste : neuf frontend, onze Swagger/inventaire,
175 textes/notices/attributions et trois rapports de compilation. Le ZIP contient exactement ces 199 entrées.
Une relecture directe du ZIP a vérifié l'ensemble des hashes, indépendamment de la copie de travail.

| Pièce de remise | SHA-256 |
| --- | --- |
| frontend-resources.zip, 1 238 883 octets | e376f7d683373126f1372f7f4ab8db022ed7342fd9e87755ff0a2f4f9a157b89 |
| manifest.json, 110 256 octets | 9636be8563e78236bb751427dd1ab01007bd0af6597979fb9f806783477a57a4 |
| Liste canonique des 198 fichiers (`payloadSha256`) | 09d4110fadb2d3c94080451b95782564344602b1e17903d59b4058165ca4031c |

La remise est conservée hors checkout et worktree : `Assess-teams-artifacts/MEP-058/ca962920b02f/`,
avec l'arbre vérifié, le ZIP et les rapports d'audit/navigateur. Le lien physique exact est fourni à la livraison.
Les preuves de gates/publication y sont ajoutées après leur exécution ; elles ne modifient pas le ZIP.
La resynchronisation du 2026-11-16 reprend les publications documentaires `493246e` et `182d93f`,
dont les clôtures approuvées de MEP-054/057/022. Elle ne change aucun fichier technique du lot.
La reconstruction après cette resynchronisation conserve exactement les 198 fichiers du payload ;
seuls le SHA de provenance et les hashes de documents d'inventaire actualisés changent dans le manifeste.
La reprise sur `695f2be` conserve aussi le wheelhouse MEP-059 publié et ses contrôles.
Les sept fichiers de préparation frontend sont désormais explicites : les outils Python et leur cache
ne sont ni consommés comme code frontend ni parcourus comme fichiers de provenance.

## Préparation du changement — C2, réconciliation MEP-021 (2026-11-17)

- Périmètre : réconcilier les entrées frontend, Swagger et configuration de production, en conservant les octets et empreintes de la remise historique `ca962920b02f`.
- Objectif : identifier les fichiers effectivement consommés par le nouveau candidat et empêcher une provenance absente ou incompatible avec son SHA déclaré.
- Effets attendus : tracer le chargeur et le schéma MEP-021, contrôler la propreté de toutes les entrées déclarées et refuser un manifeste privé de provenance.
- Risques : préserver le build normal, les licences et les refus MEP-057/058 ; ne pas modifier le chargeur, le wheelhouse, les statuts ni le correctif C1.
- Vérification : contre-épreuves avant correction, deux reconstructions indépendantes avec entrées identiques, comparaison des 198 fichiers, refus sur copies et gates du dépôt ; navigateur uniquement après C1 publié avec CI verte.
- Fichier : `scripts/distribution/frontend-artifact.mjs`
- Fichier : `scripts/distribution/verify.mjs`
- Fichier : `scripts/distribution/verify.test.mjs`

La phase indépendante distingue explicitement l'archive historique qualifiée de tout candidat reconstruit.
La configuration privée temporaire du protocole C1 n'est jamais distribuée ni hachée comme source publique.
Le SHA applicatif désigne le dépôt complet ; les empreintes détaillent les entrées de préparation et de configuration,
sans prétendre que les fichiers backend deviennent un payload frontend. Aucune qualification intégrée n'est anticipée.


## Réconciliation C2 indépendante de C1 — 2026-11-17

La remise historique ci-dessus reste inchangée ; elle précède le chargement MEP-021.
Le nouveau candidat de phase 1 utilise les sources et outils committés en
`13cc0f505edf7f4cc5eee4e4c3d64fb31be5989b`, issus de `fa5822491ff5e5a41f33d34285eca35882d95850` incluant MEP-021.
Il reste en version **0.0.0** : 198 fichiers contrôlés, plus le manifeste, soit 199 entrées ZIP.
Les 485 entrées sources ajoutent 27 fichiers : configuration publique `backend/config/` complète
et exigence `backend/requirements.txt`. Seul `settings_production.py` change parmi les anciennes entrées.
La sélection des arbres publics frontend/configuration est conservatrice, sans prétendre tracer chaque import.
Les sept scripts de préparation sont nommés explicitement ; Python de préparation est désormais enregistré
avec Node/npm. Aucun document privé de configuration, secret, runtime ou wheelhouse n'entre dans le payload.

| Pièce réelle du candidat de phase 1 | SHA-256 |
| --- | --- |
| ZIP, 1258997 octets | 67765f0c97b5dc6ef0cde29af0fe9f25ab4440e1512d42d08edd5d60fd5a8699 |
| manifest.json | 3d8d1869990cb7097a5b7cb2a245790509891313a577ea414fbb9046abf0701d |
| Liste des 198 fichiers (`payloadSha256`) | e04d6f519fed99409fd43ca8d66f807d83725bb383562d74c685af93bd405562 |

Deux reconstructions distinctes vérifient les mêmes entrées, versions et outils : Node 24.20.0,
npm 11.19.0 et Python 3.12.10 sur Windows x64. Les neuf fichiers frontend, les ressources Swagger,
les notices et `components.json` sont identiques entre répétitions et à la remise historique.
Les 114 archives de composants sont contrôlées par SHA-256/SRI et comparées aux fichiers installés,
notices incluses ; aucune version, licence ou attribution n'est substituée.

Deux rapports Webpack (`bundle-stats.json`, `standalone-stats.json`) varient uniquement sur
`issuer`, `issuerName` et `issuerPath` : le premier importeur observé dépend de l'ordonnancement
parallèle de Webpack. Une comparaison récursive sans ces seuls diagnostics donne des rapports identiques ;
les modules, assets et diagnostics restants sont conservés intégralement dans les sorties livrées.
Le rapport stylesheets est identique. Les empreintes de compilation historiques ci-dessus sont retrouvées.
Le second payload vaut `f09351d0270af1cdfccf5548c9954a5d31101266f99aa33f837808f4a7798a15` ; **les ZIP/payloads complets ne sont pas identiques**.
Cette divergence de preuve est identifiée, pas effacée par réécriture des rapports ou du code tiers.
Le ZIP de remise utilise des dates fixes au 1980-01-01 et une compression Deflate de niveau neuf ;
sa relecture contrôle chaque entrée, taille et empreinte, manifeste compris.

Ce candidat n'a pas encore de qualification navigateur après MEP-021 : le correctif C1 n'est pas publié
au moment de cette preuve. La convergence exige son intégration avec CI verte, reconstruction et protocole
hors ligne corrigé. L'ancienne preuve navigateur ne vaut jamais qualification de ce nouveau manifeste.


## Remise C2 resynchronisée — qualification intégrée en attente

Sources de remise : `5850929cac8852bdbfcc54e227ec8a3184257588`, après intégration documentaire C3
`b4c07af045ff3e00419712bb500c24e1ad0e8ded`. Le candidat contient MEP-021 ; C1 reste absent.
Le frontend et les manifestes sont reconstruits sur ce SHA. Les entrées applicatives, les sept outils
et les neuf tables consommées pour Swagger sont inchangés, vérifiés par diff et empreintes :
les deux compilations Swagger indépendantes restent valides, sans réécriture de leurs rapports.

Le manifeste enregistre 491 sources et sept scripts. Les six documents publics C3 supplémentaires
et la mise à jour de runtime.md font évoluer les seules métadonnées d'inventaire conservatrices ;
aucun runtime Python, outil npm/Node, code de compilation ni configuration privée n'est distribué.
La composition reste 198 fichiers : neuf frontend, 186 statiques/inventaire/notices et trois rapports,
plus le manifeste, soit exactement 199 entrées dans chacun des deux ZIP relus.

| Pièce réelle de remise resynchronisée | SHA-256 |
| --- | --- |
| ZIP, 1259307 octets | 408b274481efd91fda2ac45bee23c1c1328d14254bc462fa7045d155101648f9 |
| manifest.json | 2d8dbd43a05ef367c820ab4bca7583790249e3646d079ffbe460fabda6f8492f |
| Liste canonique des 198 fichiers (`payloadSha256`) | e04d6f519fed99409fd43ca8d66f807d83725bb383562d74c685af93bd405562 |

Les dix-sept acceptations/refus passent à nouveau sur ce candidat. Les ressources exécutables et notices
restent identiques ; les seuls diagnostics d'importeurs des deux rapports Webpack expliquent les payloads
et ZIP différents entre répétitions. Le rapport de comparaison conserve leurs empreintes complètes.
Remise réelle hors checkout : `Assess-teams-artifacts/MEP-058/5850929cac88/`, avec arbre, deux ZIP,
manifestes, contrôles directs, sources de préparation de la preuve et résultats des gates/publication.
**Cette remise reste indépendante : aucun protocole navigateur corrigé C1 n'a été exécuté.**
Sa convergence exige C1 publié avec CI verte, reconstruction et protocole hors ligne sur le nouveau candidat.


## Convergence après C1

La [réconciliation intégrée C2](reconciliation-c2.md) conserve séparément la nouvelle qualification,
les sources réellement consommées par C1 et la remise reconstruite après sa CI verte.
