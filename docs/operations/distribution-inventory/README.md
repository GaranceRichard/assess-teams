# MEP-057 — Inventaire de distribution REF-WIN-01

## Préparation du changement — 2026-11-15

- Périmètre : inventorier les composants directs et transitifs nécessaires à REF-WIN-01, leurs versions, provenances, empreintes et droits ; séparer préparation et cible.
- Objectif : fournir les entrées fermées consommables par MEP-058 et MEP-059 depuis les acquis de MEP-006 et les manifests actuels.
- Effets attendus : rendre vérifiables la fermeture des dépendances, les compatibilités annoncées et les incompatibilités constatées avant tout packaging.
- Risques : ne pas confondre le poste de préparation avec Windows Server 2022 ni transformer l’inventaire en build, wheelhouse, configuration ou qualification MESS.
- Vérification : rapprocher les métadonnées et licences des artefacts exacts, recalculer leurs empreintes et vérifier les vrais refus de la fiche canonique.

Lot documentaire uniquement ; aucun fichier technique ni dépendance du produit ne sera modifié.
MEP-054 reste indépendant ; aucun statut canonique ne sera modifié sans approbation explicite.
La source courante [F12](../../backlog/source/mess/f12.md) prévaut sur les fiches d’audit historiques.

## Livraison de l’inventaire

État source examiné : `9abde71`, après intégration documentaire MEP-054, sans modifier ses fichiers.
L’inventaire ferme la nomenclature et les entrées identifiées pour REF-WIN-01 ; il ne déclare pas un package installable.
Les incompatibilités sont des résultats du PBI, autorisés par son critère d’acceptation ; elles refusent le packaging du candidat concerné.
Aucun risque de sécurité n’est accepté, aucun accord MESS n’est une entrée technique et aucun site n’est qualifié.

- [Python : 15 pins cible, wheels, provenance, versions et graphe](python.md).
- [Textes et attributions Python, empreintes des notices](python-notices.md).
- [OS, CPU, ABI, CPython et sous-composants natifs](runtime.md).
- [Notices natives et imports DLL des PE contrôlés](native-evidence.md).
- [Artefacts agrégés : URLs exactes et SHA-256](artifacts.md).
- [Caddy : 148 modules incorporés et leurs droits](caddy-modules.md).
- [Frontend normal, six bibliothèques et assets Django/DRF](frontend.md).
- [Swagger local : sources, droits, assets attendus et précompilé refusé](swagger.md).
- Dépendances Swagger non-dev : [1/2](swagger-components-1.md), [2/2](swagger-components-2.md).
- [Préparation : runtimes et fermetures des outils, séparés de la cible](build.md).
- Compléments du verrou Swagger pour l’outillage : [1](swagger-build-1.md), [2](swagger-build-2.md),
  [3](swagger-build-3.md), [4](swagger-build-4.md), [5](swagger-build-5.md), [6](swagger-build-6.md), [7](swagger-build-7.md).
- [Entrées serveur, workers, ordonnanceur et identité du code](workers.md).
- [Contrôle reproductible et vrais refus](validation.md).
- [Résultats, acceptation, réserves, revue documentaire et DoD](qualification.md).

Les empreintes portent sur des entrées identifiées : archive, source, licence, module Go ou arbre Git.
Une empreinte de source n’est jamais présentée comme celle d’un bundle ou d’un exécutable encore à produire.
Les archives de contrôle restent temporaires ; les tables et le protocole sont les preuves versionnées.
Les URLs permettent de reprendre la collecte sur un poste de préparation, puis de vérifier les octets hors réseau.
Les textes et notices devront être joints au candidat distribué ; des liens Internet seuls ne suffisent pas.

## Transmission

MEP-058 reçoit les six dépendances frontend verrouillées, les sources/assets propres, les statiques des wheels,
la nomenclature Swagger et ses entrées source fermées. Le précompilé Swagger examiné n’est pas accepté par raccourci.
MEP-059 reçoit les quinze pins et leurs hashes, les noms exacts de wheels, les marqueurs Windows/3.13,
les notices et les incompatibilités du runtime. Le téléchargement de pièces de contrôle ne livre pas son wheelhouse.
Les deux PBI produiront leurs propres artefacts et preuves ; aucun de leurs critères n’est déclaré satisfait ici.
La disponibilité d’un binaire Python corrigé et sa nouvelle empreinte restent une limite explicite avant packaging.

Clôture fonctionnelle proposée seulement après publication et CI verte du SHA exact ; statut canonique inchangé.
