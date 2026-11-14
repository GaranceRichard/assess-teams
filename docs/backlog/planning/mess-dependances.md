# Dépendances et disponibilité du backlog

État courant du 2026-11-14 ; [ordre par valeur](pre-mep.md), [sources](../README.md#source-fonctionnelle-détaillée)
et [registre canonique](../tracking/pbis.md). Cette vue couvre les **38 PBI non réalisés** ; les 58 réalisés
restent acquis, avec leurs critères, preuves et dates. Les attentes documentaires des anciens audits ne
s’ajoutent pas aux champs Dépendances des sources. « Prêt » est une aptitude de planification.

## Relations corrigées et contraintes conservées

| Relation / sujet | Nature | Effet courant |
| --- | --- | --- |
| D01–D09 → développement MESS | Approbations externes artificielles supprimées | Axes d’analyse conservés ; [REF-WIN-01](../../operations/installation-prerequisites.md) fournit la convention de référence ; site réel non qualifié |
| MEP-054 → MEP-055 | Dépendance de clôture supprimée | Schéma paramétrable après inventaire 036 ; pas besoin des valeurs réelles d’un site |
| MEP-057 → MEP-055/054 | Dépendances supprimées | Inventorier/figer runtime, ABI, serveur et droits après 006 ; aucune dépendance à la forme du futur chargeur |
| MEP-022 → MEP-055/054 | Dépendances supprimées | Définir opérations, rôles et mesures sur référence après 042 ; pas de SLA externe imposé |
| MEP-064 → MEP-025 | Attente d’installateur supprimée ; entrée remplacée par 021 | Sauvegarde sur vraie SQLite de référence après configuration 021 et opérations 022 ; PV cible en 072 |
| MEP-028/066 → MEP-023 | Attente entre documents supprimée | Guides consomment les commandes livrées ; alignement README dans la DoD, pas un verrou technique |
| MEP-024 → services futurs | Cycle logique évité dans les critères | Assemble les outils livrés au SHA ; réassemblage final avec 063/065, aucun outil absent présumé présent |
| MEP-031 → tous les outils futurs | Aucun arc ajouté | Cahier après 022/039 ; procédures exactes finalisées avant essai par leur consommateur |
| MEP-034 → MEP-043 | Retrait antérieur conservé | Qualification applicative indépendante de la gouvernance Git ; F04 au GO selon décision acquise |
| MEP-012 / C06 | Décision de suivi réellement requise | Dossier publié déjà disponible, Bloqué/N/A conservé ; ni PR, barrière CI distante, nouvel audit ou réserve G05 réouverte |
| C12 / MEP-056 | Option de restructuration, aucun blocage | Conserver son contrôle de cohérence après 021/022 ; absorption seulement sur décision explicite |
| UX → installation entière | Ordre recommandé, pas dépendance | Les 17 PBI UX réalisés ne sont pas relancés ; CI sélective et qualification exhaustive restent distinctes |

Les sources F10–F17 et les vues dérivées portent les mêmes prérequis. Les versions/ABI, l’intégrité SQLite,
la sécurité, la distribution hors Internet, les commandes réellement livrées et les PV restent obligatoires.
Un site absent est un obstacle réel pour sa recette et son GO, pas pour développer le profil de référence.

## Aptitude de chacun des 38 PBI non réalisés

Chaque lien renvoie à la fiche qui porte résultat observable, périmètre, critères et vrais refus. La preuve
attendue permet une **proposition** de clôture ; aucun document seul ni code présent ne vaut acceptation.
Les dépendances réalisées restent dans la source ; la colonne suivante cite les entrées encore manquantes.

| PBI / capacité | Aptitude actuelle / entrée manquante réelle | Preuve de sortie attendue |
| --- | --- | --- |
| [USER-002 — Consultation](../source/01-identites.md) | Non prêt : C01/C02 sur identité et droits ; liste livrée conservée | Détail/champs et refus par rôle, API/UI/OpenAPI après décision |
| [USER-003 — Modification](../source/01-identites.md) | Non prêt : C02 et delta USER-002 ; critères divergents explicitement proposés | Champs approuvés, atomiques, absence d’élévation et régression API/UI |
| [ORG-002 — Consultation](../source/05-organisations.md) | Non prêt : projection Coach C03 ; Admin/Superadmin livrés | Projection décidée et refus, sans serializer administratif divulgué |
| [ORG-004 — Suppression](../source/05-organisations.md) | Ouvert : A/R01–R09 décidées le 2026-11-14 par le responsable produit ; réalisation autorisée | [S01–S11 et preuves](realisation-org-004/preuves.md), protection effective et clôture fonctionnelle explicite attendue ; aucun repli D |
| [TEAM-006 — Archives](../source/02-equipes.md) | Prêt : TEAM-005 et C04 satisfaits | Archives exclusives par scope, vide UI, archivage→liste→détail, Logs conservés |
| [TEAM-007 — Réactivation](../source/02-equipes.md) | Non prêt : effets de reprise C05 ; TEAM-005 acquis | Même identité/historique, listes correctes et scénarios de reprise décidés |
| [MEP-012 — Conformité Git/CI](../source/mess/f04.md) | Bloqué : décision C06 sur dossier déjà publié | Verdict/date explicitement approuvés, critères révisés reliés aux preuves acquises |
| [MEP-054 — Contrat configuration](../source/mess/f10.md) | Prêt : 036 acquis, paramètres de référence disponibles | Schéma typé/précédence et exemples nominal/refus sans secret |
| [MEP-021 — Chargeur commun](../source/mess/f10.md) | Non prêt : 054 ; 009 acquis | Même source/base API/workers/scripts ; valeurs invalides refusées avant effet |
| [MEP-055 — Prérequis](../source/mess/f11.md) | Prêt : requalification Ouvert/N/A explicitement approuvée le 2026-11-14 ; aucune attente d’accord MESS | Cohérence/refus du profil et limites de compatibilité ; clôture distincte |
| [MEP-022 — Opérations](../source/mess/f11.md) | Prêt : 042 acquis, conventions du projet suffisantes | Gestes, rôles, diagnostic et protocoles mesurables, aucun SLA prétendu convenu |
| [MEP-023 — Entrées README/architecture](../source/mess/f11.md) | Non prêt : 021/022 | Liens et information exacte sur les capacités effectivement livrées |
| [MEP-056 — Cohérence du suivi](../source/mess/f11.md) | Non prêt : 021/022 ; C12 n’est pas un prérequis | Sources/registre/synthèse alignés dans les documents existants, pas de rapport autonome |
| [MEP-057 — Inventaire distribution](../source/mess/f12.md) | Prêt : 006 acquis et référence définie | Versions/provenance/empreintes/licences/ABI fermées, incompatibilités nommées |
| [MEP-058 — Build frontend](../source/mess/f12.md) | Non prêt : 057 | Build normal, routes et assets locaux dont Swagger, empreintes/version |
| [MEP-059 — Wheels Python](../source/mess/f12.md) | Non prêt : 057 | Installation des dépendances exactes sans réseau, refus wheel absente/altérée/incompatible |
| [MEP-024 — Package](../source/mess/f12.md) | Non prêt : 058/059/021/022 | Assemblage reproductible SHA/manifeste/notices et refus d’altération, puis réassemblage final |
| [MEP-060 — Préflight](../source/mess/f13.md) | Non prêt : 024/021 | Profil/ACL/chemins/empreintes vérifiés et relance sans destruction |
| [MEP-061 — Pose composants](../source/mess/f13.md) | Non prêt : 060 | Pose locale et relance, absence de faux succès/résolution réseau |
| [MEP-062 — SQLite/bootstrap](../source/mess/f13.md) | Non prêt : 061 | Migrations/bootstrap explicites sans doublon ni perte, base persistante protégée |
| [MEP-025 — Diagnostic installation](../source/mess/f13.md) | Non prêt : 062 | Health/API/assets/commandes workers, diagnostic expurgé et codes non nuls sur échec |
| [MEP-063 — Services](../source/mess/f14.md) | Non prêt : 025 ; 004 acquis | Start/stop/restart surveillés, absence de worker doublé et transaction abandonnée |
| [MEP-026 — Upgrade](../source/mess/f14.md) | Non prêt : 063/064 | Package/backup avant migration, persistance, arrêt sûr sur erreur |
| [MEP-064 — Sauvegarde](../source/mess/f15.md) | Non prêt : 021/022 ; n’attend plus 025 | Point cohérent sous écritures, manifeste/version/schéma/intégrité et refus destination |
| [MEP-027 — Restauration](../source/mess/f15.md) | Non prêt : 064/063 | Clone restauré au point choisi, provenance, durée et refus sans écrasement |
| [MEP-065 — Rollback](../source/mess/f15.md) | Non prêt : 026/027 | Couple code/configuration/schéma/données rétabli, pertes du clone mesurées et incompatibilité refusée |
| [MEP-028 — Guide installation](../source/mess/f16.md) | Non prêt : 025 ; n’attend plus 023 | Commandes réellement rejouables et diagnostics, aucun téléchargement cible |
| [MEP-066 — Guide exploitation](../source/mess/f16.md) | Non prêt : 026/065 ; 020 acquis ; n’attend plus 023 | Gestes/commandes réels, contrôles et reprise exercés, rôles explicités |
| [MEP-029 — Fork/transfert](../source/mess/f16.md) | Non prêt : 024 ; 006 acquis | Reconstruction du package et droits/notices, aucune migration d’hébergement imposée |
| [MEP-031 — Cahier technique](../source/mess/f17.md) | Non prêt : 022 ; 039 acquis | Scénarios/refus/invariants/mesures reproductibles, aucun PV anticipé |
| [MEP-032 — Installation vierge](../source/mess/f18.md) | Non prêt : 025/028/031 et environnement vierge disponible | PV du package exact sur profil/hôte identifiés, pas d’adaptation improvisée |
| [MEP-068 — Usage hors Internet](../source/mess/f18.md) | Non prêt : 032/063 et environnement ; 030 acquis | Parcours/assets/commandes sans sortie Internet, SMTP interne distingué |
| [MEP-033 — Recette administration](../source/mess/f19.md) | Non prêt : 068/environnement et politique destructive ARB-ORG-005 réellement appliquée | PV par rôle, intégrité et refus ; aucun contournement par masquage de scénario |
| [MEP-069 — Recette notation](../source/mess/f19.md) | Non prêt : 068/environnement ; autres prérequis acquis | Planification→passation→révision, saisie, versions/provenance et UX sur candidat |
| [MEP-070 — Recette résultats](../source/mess/f19.md) | Non prêt : 068/environnement ; autres prérequis acquis | PV Results/Pilotage par rôle, compatible et contextualisé sans fuite |
| [MEP-034 — Recette sécurité](../source/mess/f20.md) | Non prêt : 068/031 et environnement ; acquis sécurité conservés | TLS/CSRF/secrets/scopes/SMTP/purge et refus sans effet sur candidat |
| [MEP-071 — Recette SQLite](../source/mess/f20.md) | Non prêt : 068/031/063 et environnement ; 010/040 acquis | Protocole de référence, invariants sous charge et limites mesurées, aucune capacité MESS présumée |
| [MEP-072 — Exercice reprise](../source/mess/f20.md) | Non prêt : 068/031/064/027/065 et clone isolé | Incident/upgrade/reprise exacts, intégrité/provenance et mesures ; aucun RPO/RTO réel accepté implicitement |

## Gouvernance et décisions réservées

Les décisions produit précises et options restent dans le [plan](pre-mep.md#décisions-qui-restent-réellement-nécessaires).
C01/C02/C03/C05 et C06 ne sont pas résolus par une convention technique. ARB-ORG-005 a été décidé
séparément par le responsable produit le 2026-11-14, sans validation externe MESS, sous rétentions existantes.
La recette 033/034 et le GO vérifient la politique réellement protégée sur leur candidat ; aucune clôture implicite.
C04 est décidé, TEAM-002/003/005 réalisés ; aucune qualification supplémentaire de ces PBI n’est relancée.
C21 reste une acceptation visuelle distincte ; aucune inclusion ou exclusion au candidat déduite de CI.

MEP-043 conserve sa clôture du 2026-10-21 et la réserve G05 acceptée. La publication directe, les gates
locaux, CI indépendante après intégration et qualification exhaustive du SHA exact restent acquis.
Une migration Azure DevOps Server n’est pas une dépendance de construction/installation ; le transfert
réel, s’il est demandé, exigera destination et droits propres sans nouveau circuit PR/CI implicite.
GO MESS attend les preuves du site réellement destiné à l’exploitation et ses responsabilités ; aucune
approbation externe supplémentaire n’est créée. Le jalon MEP-035 reste Ouvert, sans décision rendue.
