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

## Candidat de remise qualifié

SHA des sources et outils de préparation : `6c758207fdf9fba6fc9e6eee3024d1c73c6b39e9`.
La documentation de résultats publiée ensuite ne change aucune de ces entrées, vérifiées à nouveau avant remise.
Le sous-artefact contient 198 fichiers hachés, plus son manifeste : neuf frontend, onze Swagger/inventaire,
175 textes/notices/attributions et trois rapports de compilation. Le ZIP contient exactement ces 199 entrées.
Une relecture directe du ZIP a vérifié l'ensemble des hashes, indépendamment de la copie de travail.

| Pièce de remise | SHA-256 |
| --- | --- |
| frontend-resources.zip, 1 238 888 octets | b830570f73d4726dba2bf71033694e3a74a3dbe755a01ebd883c759d447e41ab |
| manifest.json, 110 256 octets | 65362c4260fd2b14c6130ef33d6e4075f015629f060691bd6391078cdc773dfc |
| Liste canonique des 198 fichiers (`payloadSha256`) | 09d4110fadb2d3c94080451b95782564344602b1e17903d59b4058165ca4031c |

La remise est conservée hors checkout et worktree : `Assess-teams-artifacts/MEP-058/6c758207fdf9/`,
avec l'arbre vérifié, le ZIP et les rapports d'audit/navigateur. Le lien physique exact est fourni à la livraison.
Les preuves de gates/publication y sont ajoutées après leur exécution ; elles ne modifient pas le ZIP.
La resynchronisation du 2026-11-16 reprend les publications documentaires `493246e` et `182d93f`,
dont les clôtures approuvées de MEP-054/057/022. Elle ne change aucun fichier technique du lot.
La reconstruction après cette resynchronisation conserve exactement les 198 fichiers du payload ;
seuls le SHA de provenance et les hashes de documents d'inventaire actualisés changent dans le manifeste.
