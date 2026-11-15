# MEP-057 — Qualification, acceptation et limites

[Index et transmission](README.md) · [protocole reproductible](validation.md) ·
[source canonique F12](../../backlog/source/mess/f12.md).

## Résultats vérifiables du 2026-11-15

Base d’exécution initiale : `9d8cc6f` ; resynchronisation sur `9abde71` (MEP-054) avant qualification.
Aucun fichier de MEP-054, manifest, lock ou source applicative modifié. Les statuts canoniques restent inchangés.

| Contrôle exécuté | Résultat et portée exacte |
| --- | --- |
| SHA-256 des agrégats | PASS ; archives Python, Caddy, Swagger et SBOM, source et lock Swagger ; tables artifacts.md |
| Wheels / PyPI | PASS ; 16 archives contrôlées contre PyPI, dont 15 actives pour Windows/3.13 ; typing_extensions reste préparation 3.12 |
| Fermeture Python | PASS ; quatre racines, quinze distributions, Requires-Python, marqueurs et contraintes transitives vérifiés ; aucun extra optionnel |
| ABI native | PASS ; tags PyYAML/rpds cp313-cp313-win_amd64 ; rejet explicite du tag cp312 ; aucune wheel native manquante identifiée |
| Sonde réelle CPython | PASS ; 3.13.17, AMD64, MSC v.1944 ; SQLite 3.50.4, OpenSSL 3.5.9, Expat 2.8.5, zlib 1.3.1 |
| Chargement isolé | PASS ; imports Django 5.2.19, DRF, Spectacular, PyYAML natif, rpds, jsonschema, referencing, attrs, asgiref, sqlparse, uritemplate, inflection, Waitress ; ZoneInfo America/Toronto |
| Portée du chargement | Archives décompressées dans un répertoire de contrôle et ajoutées au sys.path de la sonde privée ; aucune installation pip, aucun wheelhouse livré et aucun test MEP-059 prétendu acquis |
| DLL natives | PASS ; 33 PE examinés, imports fournis par le ZIP privé ou Windows/UCRT ; notices natives dans native-evidence.md |
| Caddy | PASS ; version 2.11.9, Go 1.27.3 ; ZIP conforme aux checksums ; build-info et SBOM rapprochés ; 148 h1 recalculés sur les archives Go et textes de licence hachés |
| Frontend acquis | PASS ; six dépendances de production et notices MIT présentes ; lock inchangé, sources/assets originaux identifiés ; aucun build MEP-058 exécuté |
| Statiques | PASS documentaire ; 135 fichiers Django et 36 DRF dans les wheels exacts et leurs RECORD ; Swagger inventorié séparément |
| Swagger source | PASS ; source et lock 5.35.0 hachés ; 201 entrées non-dev avec SHA-256 d’archive vérifié contre SRI npm ; versions imbriquées distinguées |
| Swagger précompilé | REFUS CONFORME ; les source maps nomment 95 paquets, dont trois absents du lock source de la même version ; aucune version transitive inventée |
| Outillage Swagger | PASS documentaire ; 2126 entrées de lock, 201 non-dev et 1925 dev ; 801 compléments de champs absents relevés au registre par version ; sept droits d’outils non établis entraînent leur exclusion du package |
| Protocole versionné | PASS ; quinze wheels, 201 entrées Swagger, 148 modules Go, agrégats et cinq refus contrôlés |

La sonde effective a renvoyé : `PASS imports CPython 3.13.17 Django 5.2.19 YAML native True Toronto America/Toronto`.
Le code de [validation.md](validation.md) est extrait sans modification dans un fichier temporaire, puis exécuté avec
`backend/.venv/Scripts/python.exe <script> .cache/mep-057` ; il ne dépend pas d’un générateur non versionné.
Pour reproduire la sonde d’import, décompresser les quinze wheels dans un répertoire jetable, ajouter son chemin
au sys.path du CPython privé contrôlé, puis importer les modules nommés dans la table. Ne pas modifier son installation ni une base.
Les empreintes/version/ABI restent attachées aux octets contrôlés, pas à la seule date ou à un `pip freeze` développeur.

## Critères d’acceptation et vrais cas de refus

| Exigence canonique | Preuve ou refus réel |
| --- | --- |
| Inventaire fermé REF-WIN-01, directs/transitifs | python.md, frontend.md, caddy-modules.md, swagger-components-1/2.md et liens aux locks exacts ; aucun composant runtime découvert ne reste implicitement accepté |
| Runtime/OS/CPU/ABI | runtime.md : référence Windows 2022 Standard 10.0.20348.5873 / AMD64 / CPython cp313 ; ABI et sous-composants mesurés, différence avec le poste 10.0.26200 explicite |
| Serveur/frontal | Waitress 3.0.2 ZPL-2.1 ; Caddy 2.11.9 Apache-2.0 et toutes ses transitives ; aucune nouvelle pile introduite |
| Swagger, statiques, assets | frontend.md, swagger.md, empreintes des entrées et textes ; statiques Django/DRF identifiés dans leurs wheels, aucune dépendance CDN acceptée |
| Workers et ordonnanceur | workers.md : commandes existantes, runtime partagé, Planificateur fourni par l’OS ; aucun broker ou wrapper inventé |
| Versions, provenance, empreintes et licences | Tables d’archives/sources, h1/SRI/SHA-256 et textes embarqués ; licences par référence signalées avec termes et attributions à conserver |
| Build et cible séparés | build.md, tables de préparation distinctes ; Node/npm/Go/pytest/Playwright exclus de la cible ; seules les quinze pins Python cible sont transmises |
| Compatibilité ou incompatibilité précise | Vérifications ci-dessus et réserves I01–I03 ci-dessous ; aucun site MESS qualifié |
| Composant obligatoire omis | REFUS CONFORME ; retrait de PyYAML : dépendance de drf-spectacular absente, contrôle du graphe échoué |
| Résolution non reproductible | REFUS CONFORME ; pin Django remplacé par >=5.2 : version non exacte rejetée ; les plages historiques ne servent pas de verrou cible |
| Version/ABI incompatible | REFUS CONFORME ; wheel PyYAML cp312 substituée au cp313 refusée ; I01 traite aussi le correctif Python manquant au binaire |
| Droits de redistribution non établis | REFUS CONFORME ; absence de pièce de licence Waitress rejetée ; sept outils sans déclaration ne sont jamais autorisés dans le package |
| Artefact altéré | REFUS CONFORME ; octet ajouté à la wheel Waitress détecté par SHA-256 |
| Accord MESS | N’est pas une entrée technique ; ni approbation externe ajoutée, ni qualification de site supposée |

Les refus portent sur les pièces réellement obligatoires de cette nomenclature ; ils ne créent pas un validateur produit.
Les tests de livraison des PBI suivants devront contrôler leur propre candidat et l’ensemble de ses notices hors ligne.

## Réserves explicites, sans risque accepté

- **I01 — Python corrigé :** le binaire officiel 3.13.17 est inventorié et testé pour son ABI, mais refusé pour une distribution corrigée.
  La version 3.13.18 corrige notamment CVE-2026-115557 (SSL), CVE-2026-77214/CVE-2026-102633 (Expat),
  CVE-2024-3220 (mimetypes Windows) et CVE-2026-114583 (tarfile). Sa source est hachée ; aucun binaire Windows officiel n’est publié.
  Il faut une entrée runtime corrigée identifiée, ses sous-composants/empreintes et une vérification du nouveau candidat avant packaging ;
  aucun changement de série Python, compilateur ou provenance n’est décidé dans ce PBI.
- **I02 — Swagger précompilé :** les trois composants non rapprochables sont précisément @braintree/sanitize-url, stampit et traverse.
  Le précompilé examiné ne satisfait pas la fermeture versionnée requise et est exclu ; les entrées source fermées sont disponibles.
  MEP-058 produira les assets retenus et leurs preuves ; aucune méthode de reconstruction n’est imposée ni capacité voisine déclarée livrée.
- **I03 — Hôte/integration :** aucun banc Windows Server 2022 ni site MESS effectivement disponible ici.
  Les sondes sur Windows 10.0.26200 et les tags ne prouvent ni installation sur Server, ni ACL, ni routage TLS/CSRF, ni ordonnancement réel.
  L’OS et ses outils ne sont pas redistribués ; leurs empreintes réelles restent celles du relevé du futur hôte.

Ces réserves empêchent d’affirmer le candidat concerné prêt à distribuer. Elles ne sont pas dissimulées sous une affirmation
« installation hors ligne réussie ». Le critère MEP-057 autorise le signalement précis des incompatibilités ;
sa clôture éventuelle concerne l’inventaire et ses refus, jamais le package ou l’exploitation.

## Revue documentaire et verdict DoD

Préparation écrite dans README.md du dossier avant création des tables/protocoles ; aucune modification technique.
Document propriétaire adapté : exploitation/distribution. Tables séparées selon leurs responsabilités, sans compaction pour franchir 200 lignes.
README produit, AGENTS, règles agents, charte, DoD, stratégie de tests, architecture fondamentale, contrat API/OpenAPI,
politique documentaire et profil d’installation ont été revus. Aucun changement produit, API, modèle, installation exposée ou règle qualité.
Ils restent valides ; seul docs/README.md reçoit le lien d’entrée spécialisé. Les inventaires juridiques historiques restent préservés.
Les droits supplémentaires sont consignés ici, sans réécrire LICENSE/NOTICE ni reprendre MEP-006.
Pas de secret, d’identifiant privé, de certificat, de binaire ou de cache versionné ; seulement documentation et protocole lisible.

Tests applicatifs, couvertures backend/frontend, migrations, typecheck/build frontend et E2E : non applicables à ce lot documentaire,
aucune entrée applicative modifiée. Les contrôles de l’inventaire, lignes, secrets, liens, conflits et cohérence documentaire sont applicables.
Le plan et le pré-push du dépôt restent bloquants ; aucun --no-verify, aucune PR, aucune modification du processus de publication.
La CI du SHA exact et la synchronisation propre de main doivent être confirmées avant tout succès de livraison.
Le rapport de publication fournit SHA, run et état final sans créer un commit circulaire de preuve de son propre SHA.

Verdict de contenu : critères d’inventaire et vrais refus couverts, réserves I01–I03 explicites, sans capacité aval anticipée.
La conformité finale à la DoD exige également les gates locaux et la CI de publication verts.
Clôture fonctionnelle proposée à l’utilisateur après ces gates ; aucun statut canonique modifié sans son approbation explicite.

## Gates locaux avant publication

`npm.cmd run quality:targeted` : PASS, scope documentation, zéro échec ; aucun test applicatif sélectionné.
Lignes (maximum du dossier : 164), scanner de secrets, structure, intégrité, préparation et workflow documentaire conformes.
Revue complémentaire : PASS liens locaux, identité archive source/lock Swagger, 801 compléments du lock et export MEP-006 des six notices npm.
Les évolutions documentaires MEP-022 présentes sur origin/main seront conservées par resynchronisation ;
aucune entrée applicative ni pièce d’inventaire n’est modifiée par ce lot.
