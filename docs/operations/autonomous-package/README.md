# MEP-024 — Assemblage autonome REF-WIN-01

## Préparation du changement — 2026-11-19

- Périmètre : prolonger les outils de distribution pour assembler le backend public, le frontend normal MEP-058, les quinze wheels MEP-059, Caddy et leurs notices depuis un SHA propre.
- Objectif : produire un artefact réel vérifiable après copie, sans inventer un runtime corrigé ni une installation déjà qualifiée.
- Effets attendus : générer un candidat incomplet marqué REFUSED, un manifeste exhaustif et une archive ; refuser sa remise comme distribution installable tant que I01 reste ouverte.
- Risques : préserver les acquis et droits tiers, exclure données privées et secrets, refuser provenance divergente, démo, ressources externes, runtime non qualifié et fichiers altérés.
- Vérification : tests ciblés sur vrais candidats jetables, contrats des sous-artefacts, rapprochement des entrées de production et vérification indépendante PowerShell ; gates du dépôt et CI exacts.
- Fichier : `scripts/distribution/package_common.py`
- Fichier : `scripts/distribution/package_sources.py`
- Fichier : `scripts/distribution/package_inputs.py`
- Fichier : `scripts/distribution/package_caddy.py`
- Fichier : `scripts/distribution/package_verify.py`
- Fichier : `scripts/distribution/package_components.py`
- Fichier : `scripts/distribution/package_assemble.py`
- Fichier : `scripts/distribution/verify-package.ps1`
- Fichier : `scripts/distribution/test_package.py`
- Fichier : `scripts/distribution/test_package_refusals.py`
- Fichier : `scripts/distribution/test_python_wheelhouse.py`

Ce préalable est écrit avant le code. Les statuts et dates canoniques restent inchangés.
Aucun moteur de sélection CI, outil d'installation, service ou compilation CPython n'entre dans ce lot.

## Plan de validation par impact

Le domaine modifié est l'assemblage. Ses entrées démontrées sont le backend public MEP-021,
le frontend et Swagger MEP-058, les wheels et notices MEP-059, Caddy MEP-057 et LICENSE/NOTICE.
Tests du composant : assemblage réel, intégrité après copie, mutations rescellées, sources sales
et refus du runtime. Intégrations : vérificateurs MEP-058/059 réutilisés, schéma/migrations/commandes
rapprochés du Git source, notices Caddy contrôlées. Aucun contrat HTTP, modèle ou parcours métier
n'est modifié ; pas de nouveau test E2E métier nécessaire au feedback. Le navigateur MEP-058 est
rejoué si ses entrées effectives changent. Le plan obligatoire du pré-push reste indépendant,
conservateur pour ces nouveaux scripts ; ses validations et la CI ne sont jamais dispensées.

## Contrat de sécurité

I01 reste un refus bloquant, suivant le rapport C3 et sa recherche actualisée.
L'assemblage partiel n'inclut aucun Python 3.13.17, archive source présentée comme exécutable,
pip de préparation ou interpréteur système. Il ne possède aucune option d'acceptation implicite.
Les fichiers applicatifs proviennent des blobs Git du SHA déclaré ; les arbres frontend et
wheelhouse sont vérifiés par les outils propriétaires avant inclusion et de nouveau après copie.
Les chemins de sortie doivent être absents ; liens, secrets évidents, données et fichiers privés
sont refusés. Un manifeste authentifié par son SHA-256 externe est nécessaire après transport :
des hashes autoportés ne constituent pas une signature ou une preuve d'auteur.

Le frontend est reconstruit par `frontend-artifact.mjs` depuis le même SHA, en réutilisant les
sorties Swagger qualifiées sans relancer leur compilation si leurs entrées sont identiques.
Les empreintes détaillées des entrées de ce sous-artefact doivent correspondre au checkout propre.
Caddy est conservé avec son SBOM, les 148 notices originales de modules et la licence Go.

## Limites

L'archive REFUSED est un ensemble réutilisable pour préparation, jamais un package installable.
La qualification Windows Server/MESS (I03), les services, l'installation, SQLite initiale et la
reprise restent aux PBI propriétaires. I02 est traitée exclusivement pour les octets Swagger
reconstruits ; le précompilé historique reste refusé.

## Ajustement préalable après le premier assemblage réel

Le premier candidat a été refusé par le scanner : trois package.json sont les preuves
juridiques MEP-058 conservées dans legal/, et quatre libellés UI Swagger ressemblent à
des affectations dans le JavaScript minifié. Avant correction de package_common.py et
extension de test_package.py : distinguer une propriété/affectation d'un libellé cité,
et autoriser uniquement les métadonnées sous les notices frontend déjà vérifiées.
Vérification : régression des libellés publics, metadata légale et vraie affectation
secrète fictive ; fichiers privés et package.json hors legal restent refusés.

[Reconstruction et vérification](protocol.md) · [Preuves, critères et limites](qualification.md).

## Préparation du durcissement final des reçus

La revue du manifeste demande un rapprochement explicite des deux reçus inclus et du
payload frontend, ainsi que des URLs Caddy avec les tables canoniques. package_verify.py
et package_caddy.py seront renforcés avant publication ; test_package_refusals.py exercera
un reçu divergent et une origine Caddy inventée sur copies rescellées du candidat réel.
Le SHA externe demeure l'ancre de confiance après transport, sans risque accepté.