# MEP-022 — Contrat des opérations de référence

[Source canonique F11](../backlog/source/mess/f11.md) ·
[Profil REF-WIN-01](installation-prerequisites.md) ·
[Qualification documentaire](operations-validation.md).

## Préparation du changement — 2026-11-15

- Périmètre : définir les gestes d’exploitation sur le profil de référence, sans développer leur automatisation.
- Objectif : fournir déclencheurs, rôles, entrées, contrôles et conduites sur échec aux PBI consommateurs.
- Effets attendus : procédures consultables et protocoles de charge et de reprise reproductibles, sans engagement MESS implicite.
- Risques : présenter des services futurs comme livrés, autoriser une destruction ou confondre mesure technique et garantie externe.
- Vérification : confronter les procédures au code et aux acquis, parcourir les cas nominaux et les vrais refus, puis appliquer les gates documentaires.

Préparation écrite avant rédaction des procédures. Aucun fichier technique prévu ni modifié.
Documents prévus : ce contrat, `operations-lifecycle.md`, `operations-continuity.md`,
`operations-load-protocol.md` et `operations-validation.md`, tous dans `docs/operations/`.
Le README public et le statut canonique restent inchangés ; la découverte publique du contrat relève de MEP-023.

## Portée et lecture

Ce contrat définit les opérations du [profil REF-WIN-01](installation-prerequisites.md).
Il ne livre ni service Windows, ni ordonnanceur, ni outil de sauvegarde/restauration, ni recette sur cible.
Les commandes métier déjà livrées restent utilisables ; les gestes de service sont des séquences à
réaliser avec MEP-063. Les protocoles sont exécutables en recette lorsque leurs consommateurs sont livrés.
Aucun accès au site MESS, aucune installation ou homologation n'est attesté.

| Procédure | Opérations et sorties |
| --- | --- |
| [Cycle et surveillance](operations-lifecycle.md) | Démarrer, arrêter, superviser, traiter SMTP, purger et maintenir |
| [Continuité](operations-continuity.md) | Sauvegarder, restaurer, mesurer durée et point récupéré |
| [Charge de référence](operations-load-protocol.md) | Jeux, paliers, répétitions, instruments et invariants |
| [Qualification](operations-validation.md) | Critères, vrais refus, preuves et revue DoD du présent lot |

## Rôles opératoires

Les rôles ci-dessous définissent des capacités requises, pas une affectation de personnes ni un RACI MESS.

| Rôle requis | Responsabilité et limites |
| --- | --- |
| Exploitant habilité | Surveille et intervient sur l'instance ; droits OS limités aux chemins/services concernés ; collecte diagnostics expurgés |
| Compte de service | Exécute API, workers et tâches sans privilège administrateur ; même configuration et même SQLite locale |
| Installateur habilité | Pose le package/runtime, ACL, certificats, services et migrations selon les procédures de leurs PBI |
| Autorité habilitée pour l'opération | Autorise explicitement destruction, point de restauration et éventuelle perte identifiée ; décision référencée dans le suivi protégé |
| Superadmin technique | Consulte et traite les files dans Django admin selon les droits existants ; aucun droit OS ou de destruction déduit |
| Vérificateur de recette | Prépare les clones fictifs, observe intégrité et mesures, publie résultats et limites du banc |

L'identité de l'autorité et des intervenants du site réel reste à attribuer avant son exploitation.
L'exploitant n'invente pas une autorisation métier. [ARB-ORG-005](../backlog/source/00-arbitrages-organisations.md#arb-org-005--états-et-cycle-de-vie-dune-organisation)
est décidé depuis le 2026-11-14 : option A et R01–R09 approuvées, R03 sous les politiques de conservation existantes.
ORG-004 est réalisé techniquement et publié ; sa clôture fonctionnelle reste ouverte,
selon le [registre canonique](../backlog/tracking/pbis.md).
Le rôle Admin produit ne donne accès ni à la base ni aux files globales.

## Entrées et trace communes à chaque intervention

Avant un geste, relever instance et environnement, SHA/package, profil/version, chemins absolus réellement
consommés, module settings, compte et périmètre d'accès, déclencheur, exécutant et décision requise.
Sur REF-WIN-01 : un hôte, SQLite locale en DELETE/FULL ; aucun partage SMB/NFS ou dossier synchronisé.
Les chemins du profil sont paramétrables ; aujourd'hui la base est fixée sous `backend`.
Leur déplacement et le chargement commun relèvent de MEP-021, pas de ce contrat.

Conserver dans un suivi protégé : référence d'intervention, début/fin UTC, durée monotone, actions,
résultats observés, codes/états, diagnostic sûr, refus, reprise décidée et liens aux preuves.
Ne jamais capturer secrets, valeurs d'environnement, mots de passe, corps HTTP/SMTP, liens ou tokens.
Les références privées de configuration et de sauvegarde sont protégées ; aucune durée de conservation
nouvelle n'est imposée. Une commande réussie ne remplace pas le contrôle de sa sortie métier.

## Conventions d'essai et limites de service

Les fréquences du profil (workers chaque minute sans `--watch` ; échéances à 02:00 America/Toronto)
sont des conventions de banc, paramétrables, sans chevauchement ni rattrapage en rafale.
Elles ne sont pas des SLA. Purge et sauvegarde n'acquièrent aucune fréquence MESS par défaut :
pour un exercice, les déclencher aux étapes définies dans les protocoles ; en exploitation, consigner
fréquence/conservation et autorisations avant activation, sans supprimer implicitement des copies.

Les durées observées, latences, interruptions et points récupérés décrivent le banc exact.
Aucun RPO/RTO, taux de disponibilité ou capacité MESS n'est convenu ni déduit.
L'absence de ces engagements ne bloque ni ce contrat ni ses essais de référence.
Aucune étape d'exploitation ne requiert Internet, Node/npm ou Docker : runtime, assets, confiance TLS,
package et outils de mesure doivent être préparés localement ; SMTP peut être interne.
La CI et les outils de contribution restent distincts de la cible hors ligne.

## Sorties disponibles et indépendance

- MEP-063/026 : séquences de cycle et maintenance, observations et arrêt sûr sur échec.
- MEP-064/027/065 : méthode cohérente, choix explicite du point, contrôles et format des mesures.
- MEP-031 puis recettes techniques/stabilité : profil de charge et matrice nominal/refus.
- MEP-023/056 : contrat et preuves à référencer lors de leur mise à jour documentaire.

Les sources [F14](../backlog/source/mess/f14.md), [F15](../backlog/source/mess/f15.md) et
[F17](../backlog/source/mess/f17.md) conservent les critères propres à ces consommateurs.
MEP-054 et MEP-057 restent indépendants : aucun de leurs fichiers ni de leurs statuts n'est modifié.
Le contrat s'appuie sur les conventions existantes et le [schéma MEP-054](configuration/unique-contract.md) intégré ; avec les paramètres/manifeste,
les consommateurs renseignent les valeurs effectives avant essai, sans refaire le raffinement.
