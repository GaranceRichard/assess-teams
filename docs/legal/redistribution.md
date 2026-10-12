# Licence, fork et redistribution

Assess Teams est distribué sous **Apache License 2.0**, identifiant SPDX `Apache-2.0`.
Le [texte intégral anglais](../../LICENSE) fait foi. Le [NOTICE](../../NOTICE) indique
l’origine du projet et son attribution : Copyright 2026 Assess Teams contributors ;
développement initial par Garance Richard, attesté par l’historique du dépôt.
Cette mention collective ne désigne pas un titulaire exclusif et ne transfère aucun droit.

## Périmètre et droits

La licence couvre les contributions originales du dépôt : code, documentation et ressources
originales. Les composants tiers et leurs ressources embarquées gardent leurs propres licences,
décrites dans l’[inventaire](third-party.md). Les données des organisations, les évaluations
renseignées et les données personnelles ne deviennent pas publiques par cette licence.

L’utilisation, la copie, la modification et la redistribution, gratuites ou commerciales,
sont permises selon les conditions de la licence. Les modifications peuvent rester privées :
il n’existe pas d’obligation générale de publier un fork ou de contribuer en retour.
La concession de brevets reste limitée aux contributions et soumise à la section 3.
Le logiciel est fourni sans garantie et avec les limites de responsabilité des sections 7–9.
La section 6 ne concède pas de droit général sur les marques et noms de produit.

## Créer un fork, notamment au MESS

1. Copier le dépôt avec `LICENSE`, `NOTICE` et la documentation de licence.
2. Conserver l’origine Assess Teams et les mentions applicables ; ajouter les attributions
   propres aux nouveaux auteurs sans remplacer les anciennes.
3. Signaler les changements dans chaque fichier modifié, par exemple dans un commentaire
   « Modifié par ORGANISME le AAAA-MM-JJ : description ». Pour un format sans commentaires,
   fournir une notice visible associée au fichier dans la documentation distribuée.
4. Adapter le nom, les coordonnées et l’identité du fork sans suggérer un soutien des auteurs.
5. Réexaminer les dépendances, ressources, versions et licences de ce fork avant sa diffusion.

La licence n’impose pas que les modifications soient sous Apache 2.0 ; des conditions propres
peuvent s’y ajouter dans le respect de la section 4 et des droits sur le code d’origine.
Aucune cession de propriété intellectuelle, convention avec le MESS ou modification des
licences tierces n’est réalisée par ce chantier.

## Préparer une redistribution source ou binaire

- Joindre le texte intégral `LICENSE` à toute copie distribuée et conserver les mentions
  de droits, brevets, marques et attribution pertinentes dans les sources dérivées.
- Reproduire les attributions pertinentes du `NOTICE` dans un fichier lisible, la documentation
  fournie ou l’affichage habituel des mentions. Le NOTICE n’ajoute aucune condition de licence.
- Inclure les textes de licence, disclaimers, copyrights et notices de chaque composant livré,
  y compris les dépendances transitives, ressources embarquées et runtimes éventuels.
- Construire le frontend normalement (`npm run build --prefix frontend`) ou la démo
  (`npm run build:demo`). Chaque sortie comprend `legal/` : licence originale, NOTICE,
  guide, inventaire des obligations et textes MIT complets des six composants frontend de production.
- Sur le poste de préparation backend, exporter les notices des versions réellement installées :
  `backend/.venv/Scripts/python.exe scripts/legal/python_inventory.py` sur Windows,
  `backend/.venv/bin/python scripts/legal/python_inventory.py` sur Linux.
  Le poste de préparation utilise `requirements-dev.txt` (analyse via `packaging`). Joindre
  l’archive `build/legal/python/notices.zip` obtenue au backend distribué. L’export inclut l’inventaire
  avec empreintes et tous les textes embarqués détectés, sans les réécrire.
- Si l’environnement de développement entier est redistribué, utiliser aussi `--include-dev`
  pour Python et `node scripts/legal/export-npm.mjs --include-dev` pour npm ; joindre
  `build/legal/npm/`. Les binaires et licences propres de Python, Node, SQLite, Chromium
  et du système restent à inventorier s’ils sont inclus dans le paquet livré.
- Vérifier le contenu du paquet final et l’accès hors ligne aux textes, sans se limiter
  aux identifiants SPDX ni aux liens internet. Les liens sources servent à la vérification.

L’export refuse un composant absent ou sans texte de licence. Le build frontend refuse aussi
une nouvelle licence de production hors de la liste permissive examinée ; ce refus appelle
une revue explicite, sans changer la licence du tiers ni contourner le contrôle.
L’export complet d’outillage n’est pas une attestation automatique de compatibilité.

## Maintenance et preuves

L’[inventaire tiers](third-party.md) précise les versions, limites et obligations particulières.
Les dépendances Python sont exprimées par plages : refaire l’inventaire à chaque distribution
et après chaque mise à jour. Les lockfiles npm identifient aussi les variantes optionnelles
propres aux plateformes ; seules les variantes effectivement installées sont exportées.
Les licences embarquées ne doivent pas être éditées pour les faire correspondre à Apache 2.0.

Les liens des mentions restent accessibles sans session, dans l’application et la démo avec
leur base de déploiement. Les tests couvrent l’accès et le refus d’une licence manquante ou
non examinée. La revue documentaire du job 1.6 vérifie README, règles agents, charte, DoD,
stratégie de tests, architecture et contrat API : aucune API ni migration n’est ajoutée.

Références : [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0),
[FAQ Apache](https://www.apache.org/foundation/license-faq.html),
[texte SPDX repris sans modification](https://github.com/spdx/license-list-data/blob/main/text/Apache-2.0.txt).
