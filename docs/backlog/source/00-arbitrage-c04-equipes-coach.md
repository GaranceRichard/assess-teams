# C04 — Consultation des équipes par le Coach

Décision produit du **2026-11-12**, attribuée au responsable produit par sa demande
« ARBITRAGE C04 — Périmètre de consultation des équipes par le Coach ».
La règle retenue et son application TEAM-002/003 sont autorisées par cette demande.
Cette décision complète les [concepts transverses](00-concepts-transverses.md)
et la [source Équipes](02-equipes.md), sans modifier les arbitrages Organisation.

## Règle retenue

Un Coach authentifié avec un compte actif peut consulter uniquement les équipes
auxquelles il est **actuellement affecté**, à condition d'appartenir actuellement
à leur organisation. Les trois conditions sont revérifiées à chaque requête.

Ce droit couvre les équipes actives et archivées tant que l'affectation courante
est conservée. Une ancienne affectation, une appartenance organisationnelle révolue
ou une assignation à une passation ne crée aucun droit de consultation d'équipe.
Aucun historique d'affectation ni accès historique n'est créé.

## Opérations et projection

- TEAM-002 : liste des équipes **actives** actuellement affectées, sans doublon ;
  résultat vide valide et état vide explicite dans le contexte Coach existant.
- TEAM-003 : consultation par identifiant d'une équipe actuellement affectée,
  active ou archivée ; exclusivement `id`, `name`, `organization_id`, `is_active`.
- TEAM-006 : future consultation **séparée** des archives, dans le même périmètre ;
  PBI distinct, sans réalisation ou clôture implicite.

Les lectures utilisent une permission dédiée. `CanManageOrganizations` reste
inchangée et ne donne aucun nouveau droit au Coach. La liste Coach retourne aussi
la projection minimale ; la liste Admin conserve son contrat enrichi existant.
`include_archived` reste un filtre Admin/Superadmin pour Logs : il n'élargit pas
la liste active Coach. Les variantes paginées conservent le même périmètre.
Une équipe inaccessible et une équipe inexistante produisent le même HTTP 404
et le même corps sans divulgation. Le refus d'une collection hors organisation
est également identique à celui d'une organisation inexistante.

## Frontières

Création, modification, archivage et réactivation restent Admin/Superadmin selon
leurs contrats respectifs ; aucune nouvelle opération de mutation n'est créée.
Viewer conserve les seules consultations d'équipes déjà autorisées dans Results.
Aucun nouveau rôle, historique, partage interorganisationnel, écran administratif,
ni changement des passations, résultats, planifications, C03 ou C05 n'est autorisé.
Les routes et menus administratifs existants sont conservés ; la consultation
organisationnelle Coach reste du ressort de C03.

## Application et clôtures

Formalisation puis adaptation des seules lectures TEAM-002 et TEAM-003, tests des
succès/refus et qualification complète. Après publication et CI verte du SHA exact,
soumettre **séparément** leurs clôtures canoniques. Les statuts, dates et indicateurs
ne changent pas avant approbation de chaque clôture. TEAM-006 reste distinct.
