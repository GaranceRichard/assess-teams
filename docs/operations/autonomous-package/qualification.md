# MEP-024 — Preuves et limites du candidat partiel

[Préparation réelle](README.md) · [Reconstruction et contrôle](protocol.md).

## Résultat fonctionnel

**MEP-024 non conforme / bloqué par I01 : aucun runtime standard Windows x64 cp313
corrigé et qualifié n'est disponible parmi les entrées examinées.**
Le code livré assemble et vérifie les parties indépendantes ; il refuse toujours une
remise installable. Aucun statut ou date canonique n'est modifié, aucune clôture déduite.

Premier ZIP corrigé réel : source `85038b624d818dfb8ccd9fb3fc60de09c405247a`,
637 fichiers hachés plus manifeste, 48 178 529 octets.
SHA-256 ZIP : `667247fc0ebda89003fc6338368beee6cd193f855c4cee3102d7e8bdaf9829e8`.
SHA-256 manifeste : `b262796e709b7a432e7b4117d5fc8f1a8e2bc703cbd5a85c0d564d1be6a4cb32`.
Cette pièce intermédiaire reste distinguée du réassemblage final après resynchronisation.
Le reçu et rapport externes de remise identifient exactement son SHA final, ZIP et manifeste.

## Critères et composition

| Critère | Preuve et limite |
| --- | --- |
| AC1 complet | Non satisfait : runtime absent, archive explicitement REFUSED. Backend public, schéma unique, migrations, frontend normal, wheels, entrées et notices présents |
| AC2 provenance | Sources et modes Git, arbre/SHA, version 0.0.0, 19 composants de premier niveau, sous-inventaires frontend/Python/Caddy, SHA-256 de chaque fichier et manifeste externe |
| AC3 hors ligne | Sous-artefacts acquis sans build cible/résolution, preuve pip MEP-059 réutilisée ; aucune installation finale exercée sans runtime acceptable |
| AC4 intégrité | Suppressions, altérations, notices, faux SHA et manifestes incomplets refusés sur copies réelles ; contrôle PowerShell indépendant après copie |
| AC5 continuité | WSGI, manage.py, schéma JSON, migrations et quatre commandes réellement livrées repris depuis les blobs Git ; aucun bootstrap développeur |
| AC6 évolution | Découverte des commandes et scripts d'exploitation suivis au nouveau SHA, ressources inconnues refusées ; test d'extension sans livrer un futur service |

Backend : tous les modules publics de production, migrations et ressources nécessaires.
Les tests, development_data, settings développement, dépendances développeur, caches et données
ne sont pas copiés. Les documents et LICENSE/NOTICE proviennent également du SHA déclaré.
API : config.wsgi:application, serveur Waitress 3.0.2 fourni par sa wheel originale.
Commandes : send_pending_notifications, send_password_reset_emails,
send_due_evaluation_notifications et purge_journals. Aucun service/tâche automatique ajouté.

Frontend : 198 fichiers MEP-058 inchangés, build normal refait par son générateur ;
payload `b346cf4d27d542f689cb6bdd0aaf930b8aa5b880deceeb59d76c5f3908402cb7`.
Les entrées source et huit outils sont identiques à la remise qualifiée c14e60c :
preuve navigateur C1 réutilisable, aucun rejeu navigateur redondant nécessaire.
Les quinze wheels MEP-059, leurs 26 notices et pins/hashes restent inchangés.
Les statiques Django/admin/DRF sont conservés dans les wheels, sans collectstatic ni base créée.

Caddy : binaire 2.11.9 sondé, ZIP/checksums/SBOM contrôlés, Go 1.27.3 et 148 modules
rapprochés de leurs h1 et notices originales. Une seconde préparation sans collecte depuis
le cache complet produit tous les mêmes fichiers. Aucun compilateur Go n'est redistribué.
SQLite viendra du runtime encore absent ; le Planificateur est fourni par l'hôte.

## Refus et contrôles nouveaux

Vingt tests portables passent : dix tests wheels existants et dix tests du composant.
Ils restent rattachés au contrôle repository existant, sans modification du moteur CI.
Quinze tests d'intégration passent sur les copies du premier candidat réel : positif
d'intégrité partielle, refus final I01, migration supprimée, source altérée même rescellée,
manifeste incomplet, faux SHA, wheel absente/cp312/altérée, licence Waitress retirée du ZIP,
runtime déclaré qualifié sans preuve, notice Caddy supprimée, exigence npm/Docker/Internet,
fichier privé ou credential fictif, CDN rescellé et vraie démo Pages substituée.
Le test PowerShell accepte seulement l'intégrité partielle puis refuse la remise finale
et le retrait de NOTICE. La référence et les artefacts MEP-058/059 restent inchangés.

Les contrôles de copie comparent ensemble exact des chemins, tailles, SHA-256 et provenance ;
la confiance requiert le SHA externe du manifeste et une copie fiable du vérificateur.
Aucune signature d'éditeur n'est inventée. Le scanner complète la sélection Git publique,
sans prétendre prouver l'absence universelle de secrets par recherche de motifs seulement.
Il distingue les métadonnées de licence et libellés UI des affectations de credentials ;
un unique message public de validation mot de passe est reconnu par sa valeur exacte.

## Réserves et preuves réutilisées

- I01 ouverte : captures officielles du 19 novembre, NuGet et chaîne complète Windows
  plafonnant à 3.13.17 ; release 3.13.18 source seulement. Aucun binaire ancien, source
  prétendument exécutable, runtime tiers incertain ou changement de profil inclus.
- I02 traitée pour les octets Swagger reconstruits et attribués de MEP-058 ; le précompilé
  refusé conserve son refus. Entrées et payload comparés exactement, licences préservées.
- I03 ouverte : poste Windows 10.0.26200, aucune VM Server 2022 ni recette MESS, TLS,
  ACL, ordonnanceur ou service qualifié. Aucun transfert/installateur final ni GO MESS.

MEP-059 fournit les preuves ABI/imports natifs et installation pip sans réseau sur son banc
3.13.17 refusé ; elles ne qualifient pas un runtime final. C3 reste le protocole de reprise
sécurité/versions/empreintes/DLL/licences/compatibilité, sans compiler CPython dans ce lot.
L'intégration d'un runtime effectivement admis et ses essais demeure le travail technique
restant avant acceptation. Installation, initialisation, services et reprise gardent leurs PBI.

## Revue documentaire et DoD

La préparation propriétaire précède le code ; l'ajustement du scanner suit le premier
refus réel et sa trace préalable. Les responsabilités sont exploitation/distribution,
avec fichiers techniques explicitement rattachés ; aucun remplissage artificiel.
README produit, règles agents, charte, DoD, stratégie de tests, fondamentaux et API ont
été relus : pas de capacité publique, modèle, contrat HTTP ou installation complète ajouté.
Le README produit reste pertinent ; l'index documentaire reçoit le lien spécialisé.
L'inventaire historique, les verrous, droits et statuts canoniques restent préservés.

Lint et format des nouveaux scripts, lignes, secrets et préparation documentaire passent.
Le plan obligatoire classe les scripts distribution en transverse : repository, backend,
frontend et E2E complets seront imposés par le pré-push, malgré le feedback ciblé.
L'élargissement vient de la politique effective, sans modification du moteur dans MEP-024.
Le rapport externe conserve les résultats des gates, couvertures, publication et CI du
SHA exact après leur exécution ; aucun succès anticipé ni qualification MESS déduite.
La DoD fonctionnelle demeure non satisfaite pour le package complet à cause de I01.
