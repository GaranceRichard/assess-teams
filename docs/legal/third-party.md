# Inventaire des licences tierces

Audit du **2026-10-11**, sur Windows x64 / Python 3.12 et les deux lockfiles npm.
Les versions Python ci-dessous sont celles installées depuis les plages de `requirements.txt` ;
elles ne constituent pas un verrouillage. Les fichiers upstream embarqués ont été examinés,
et les exports conservent leurs textes et attributions : [procédure de redistribution](redistribution.md).
Le code original est Apache-2.0 ; aucune dépendance tierce n’est relicenciée.

## Frontend de production, dépendances directes et transitives

| Composant | Version | Licence |
| --- | --- | --- |
| @kurkle/color | 0.3.4 | MIT |
| chart.js | 4.5.1 | MIT |
| react | 19.3.0 | MIT |
| react-chartjs-2 | 5.3.1 | MIT |
| react-dom | 19.3.0 | MIT |
| scheduler | 0.28.0 | MIT |

Le build et la démo fournissent les textes MIT complets, copyrights et disclaimers dans
`legal/THIRD-PARTY.txt`. Aucun composant de cette table n’est sous copyleft.

## Backend de production, fermeture transitive de requirements.txt

| Composant | Version | Licence |
| --- | --- | --- |
| asgiref | 3.12.1 | BSD-3-Clause |
| attrs | 26.1.0 | MIT |
| Django | 5.2.18 | BSD-3-Clause |
| djangorestframework | 3.16.1 | BSD-3-Clause |
| drf-spectacular | 0.28.0 | BSD-3-Clause |
| inflection | 0.5.1 | MIT |
| jsonschema | 4.26.0 | MIT |
| jsonschema-specifications | 2025.9.1 | MIT |
| PyYAML | 6.0.3 | MIT |
| referencing | 0.37.0 | MIT |
| rpds-py | 2026.9.1 | MIT |
| sqlparse | 0.6.0 | BSD-3-Clause |
| typing_extensions | 4.16.0 | PSF-2.0 |
| tzdata | 2026.5 | Apache-2.0 |
| uritemplate | 4.2.0 | BSD-3-Clause OR Apache-2.0 |

Les déclarations « BSD » de DRF et drf-spectacular et l’absence de déclaration de sqlparse
ont été précisées depuis leurs textes embarqués à trois clauses, sans les modifier.
Django inclut notamment LICENSE.python, les licences MIT de jQuery, Select2, XRegExp et
les notices des adaptateurs GIS BSD ; les bibliothèques natives GEOS/GDAL ne sont pas installées.
`typing_extensions` conserve l’ensemble de son texte historique Python ; tzdata conserve
son attribution et son texte Apache complet. L’export Python inclut tous ces fichiers,
ainsi que les fichiers AUTHORS et NOTICE présents, avec leur empreinte SHA-256.

## Outillage : inventaire distinct du logiciel distribué

- [npm racine](npm-root-tools-1.md) : lancement et orchestration.
- npm frontend : [partie 1](npm-frontend-tools-1.md), [partie 2](npm-frontend-tools-2.md),
  incluant les variantes optionnelles de plateforme.
- [Python de développement](python-tools.md) : tests, coverage, lint et préparation.

Ces outils ne sont pas inclus comme bibliothèques dans les bundles applicatifs. Si un paquet
livre leurs sources ou binaires, leurs conditions deviennent applicables à ces copies.
Les licences déclarées npm sont MIT, MIT-0, ISC, 0BSD, Apache-2.0, BSD-2/3-Clause,
CC0-1.0, BlueOak-1.0.0, MPL-2.0 et CC-BY-4.0. Aucune déclaration GPL/AGPL n’a été
repérée dans ces lockfiles ni les métadonnées Python examinées ; cela ne certifie pas
une future distribution incluant d’autres composants.

## Obligations et restrictions particulières

- MIT, ISC, BSD et BlueOak : conserver les mentions et conditions requises ; BSD-3-Clause
  interdit l’usage du nom des auteurs comme soutien promotionnel sans permission.
- Apache-2.0 : fournir la licence et les NOTICE applicables, préserver les attributions,
  signaler les fichiers modifiés ; les clauses de brevets restent applicables.
- Python/PSF : conserver les textes historiques et mentions fournies ; les conditions sur
  les versions dérivées doivent aussi être respectées si ces composants sont modifiés.
- **Lightning CSS 1.33.0 et ses binaires (MPL-2.0)** : s’ils sont redistribués, conserver les
  notices et rendre le code source couvert accessible, y compris ses modifications,
  en informant les destinataires. La MPL porte sur les fichiers concernés, pas sur l’ensemble
  du code original Assess Teams. [FAQ officielle Mozilla](https://www.mozilla.org/en-US/MPL/2.0/FAQ/).
- **caniuse-lite 1.0.30001810 (CC-BY-4.0)** : si les données sont redistribuées, conserver
  l’attribution, la référence de licence et l’indication des changements ; ne pas ajouter de
  restriction incompatible. [Conditions Creative Commons](https://creativecommons.org/licenses/by/4.0/).
- **GPL-2.0-only** : incompatible avec Apache 2.0 ; un ajout nécessite une revue et ne peut
  être assimilé automatiquement à Apache. GPLv3 peut imposer ses propres conditions sur
  une œuvre combinée. [Position Apache](https://www.apache.org/licenses/GPL-compatibility.html).

## Ressources externes de la documentation API

`drf-spectacular` référence Swagger UI et ReDoc depuis jsDelivr via `@latest`.
Ils ne sont pas inclus dans les six composants du frontend ni dans l’archive Python.
Les projets upstream déclarent respectivement [Apache-2.0](https://github.com/swagger-api/swagger-ui/blob/main/LICENSE)
et [MIT](https://github.com/Redocly/redoc/blob/main/LICENSE) ; Swagger UI fournit aussi
un [NOTICE SmartBear](https://github.com/swagger-api/swagger-ui/blob/main/NOTICE).
Les versions servies ne sont pas figées : cette déclaration upstream ne certifie pas les
ressources qu’un CDN servira ultérieurement. Avant de les mettre en cache ou de les inclure
dans un paquet hors ligne, figer les versions exactes et préserver leurs licences, NOTICE,
attributions et celles de leurs sous-composants. Ce job ne modifie pas leur chargement.

## Textes absents de certains paquets d’outillage

Les paquets suivants ne fournissent pas de fichier LICENSE/COPYING dédié dans l’installation
examinée. Certains comportent des mentions dans README ou leurs sources ; une déclaration
SPDX seule ne suffit pas pour préparer un paquet redistribuable complet.

| Paquet | Version | Déclaration |
| --- | --- | --- |
| @humanfs/types | 0.15.0 | Apache-2.0 |
| @rolldown/binding-win32-x64-msvc | 1.2.9 | MIT |
| esrecurse | 4.3.0 | BSD-2-Clause |
| imurmurhash | 0.1.4 | MIT |
| natural-compare | 1.4.0 | MIT |
| saxes | 6.0.0 | ISC |
| stackback | 0.0.2 | MIT |

L’export npm avec `--include-dev` refuse cet état dès le premier texte absent.
Avant de livrer ces outils, récupérer les textes et attributions upstream correspondant
aux versions exactes et les joindre à la distribution, puis refaire la revue. Ce point
ne bloque pas la distribution du frontend de production : ses six textes MIT sont présents.

## Limites du périmètre vérifié

Les ressources du dépôt comprennent le SVG de marque du projet ; aucune police téléchargée
n’est embarquée (polices système). Les ressources tierces distribuées dans Django sont incluses
dans l’export. Aucun droit de marque général n’est accordé par la licence Apache.
L’audit ne couvre pas un futur installeur hors ligne, un runtime Python/Node/SQLite/Chromium,
une image de système, une bibliothèque native ou des données ajoutées par un fork.
Inventorier ces éléments et leurs sous-composants sur le paquet cible lorsqu’ils sont livrés ;
les jobs de packaging et de transfert MESS restent distincts.
