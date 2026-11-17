# C3 — Décision sur la réserve runtime I01

Date effective : **2026-11-17**, America/Toronto. Base du chantier : `fa5822491ff5e5a41f33d34285eca35882d95850`.
[Contrat REF-WIN-01](../installation-prerequisites.md) · [inventaire historique](runtime.md) ·
[pièces](runtime-i01-sources.md) · [sécurité](runtime-i01-security.md) ·
[protocole réutilisable](runtime-i01-protocol.md) · [résultats exécutés](runtime-i01-evidence.md).

## Verdict B — I01 reste ouverte

Aucun runtime **standard Windows x64 cp313 corrigé et redistribuable** n’est pleinement démontré.
Python 3.13.18 est la dernière publication 3.13 identifiée ; elle fournit des sources, sans binaire Windows.
Les canaux Windows examinés plafonnent à 3.13.17. Ce constat est borné aux publications consultées,
pas une affirmation d’impossibilité universelle. Les correctifs des bibliothèques doivent aussi être actualisés.
Aucun risque accepté, binaire de distribution ou nouveau profil ne résulte de C3.

## Candidats et refus motivés

| Candidat / voie | Constat vérifié | Décision |
| --- | --- | --- |
| Installateur officiel 3.13.17 x64 | Dernier binaire 3.13 de la page Windows ; correctifs 3.13.18 absents | REFUS sécurité ; la signature PSF ne change pas ce verdict |
| ZIP standard du gestionnaire 3.13.17 | Index PythonCore x64, tag `3.13-64`, SHA-256 publié `b26ca4b4ee51e157836049934d2b8eabd55939be296f3130254251b6df96ec2f` | REFUS sécurité avant téléchargement ; hash publié, non recalculé sur ce ZIP |
| NuGet officiel `python` | Historique JSON 3.13 jusqu’à 3.13.17 ; aucune 3.13.18 identifiée | Aucun candidat corrigé ; ne pas confondre absence de page et absence d’index |
| Source officielle 3.13.18 | XZ obtenue, hash conforme, Sigstore vérifié ; aucun `python.exe` dans l’archive | REFUS comme distribution binaire Windows ; source conservée comme référence |
| ZIP embarquable 3.13.17 | Octets historiques retrouvés ; banc réel x64/cp313, sans venv | REFUS sécurité et absence de démonstration du mode standard ; usage de banc seulement |
| Microsoft Store | Voie officielle documentée, avec redirections de données et contraintes d’identité | Aucun package corrigé autonome, droits et exploitation service établis ici ; aucun usage Store requis sur cible |
| CPython 3.14.10 / 3.15.2 | Publications corrigées avec binaires identifiées | REFUS du contrat 3.13/cp313 ; ne pas recycler PyYAML/rpds cp313 ni changer de profil tacitement |
| Variantes free-threaded, ARM64, x86 | Tags et architectures distincts dans les index | REFUS du contrat GIL standard x64 ; aucune substitution |
| Construction propre de 3.13.18 | Recette source appelle aussi des dépendances et binaires externes ; composants encore à revoir | Aucun candidat construit : chaîne, droits des outils, correctifs, provenance et double build reproductible non établis |
| Distribution tierce / DLL remplacées à la main | Aucun artefact complet avec chaîne, notices et conformité démontrées | Non retenu ; ni marque tierce ni compatibilité ABI ne valent qualification |

Le [calendrier PEP 719](https://peps.python.org/pep-0719/) confirme les sorties sécurité source-only.
Sa date de fin de support est octobre 2029 ; la page de release 3.13.18 mentionne encore octobre 2028.
Cette divergence de prose est consignée, sans incidence sur l’absence de binaires constatée.
Le gestionnaire 26.4 est un outil d’acquisition : sa version ne corrige pas les octets du runtime 3.13.17.

## Preuves obtenues et limites

- Source 3.13.18 : 23 243 936 octets, SHA-256 et licence source établis ; Sigstore 4.5.1,
  identité `thomas@python.org`, issuer Google, code 0. Aucun ABI Windows mesuré pour cette source.
- Banc refusé 3.13.17 : archive 11 441 267 octets, SHA-256 identique à MEP-057,
  Authenticode de `python.exe` **Valid**, éditeur PSF et horodatage Microsoft.
- Mesures : AMD64, 64 bits, GIL standard, `SOABI=cp313-win_amd64`, MSC v.1944 ;
  OpenSSL 3.5.9, SQLite 3.50.4, Expat 2.8.5, zlib 1.3.1. Ce sont les mesures du banc refusé.
- Installation pip locale réelle : quinze distributions exactes, fermeture/notices vérifiées,
  PyYAML natif et rpds chargés ; sonde standard SSL/SQLite/Waitress réussie, audit réseau à zéro.
- Huit refus runtime/source réellement exercés et dix tests MEP-059 passés ; refus pip cp313
  sous le vrai Python 3.12.10 avec code 1 et aucune tentative réseau.
- Aucun runtime corrigé installé ; aucune négociation TLS ni recette serveur/service du candidat final.
  Pas de VM sans Internet ni capture réseau globale : l’audit borne les processus Python testés.
  Windows de contrôle 10.0.26200 ; Windows Server 2022/site MESS restent non qualifiés, I03 conservée.

Les notices existantes ne sont pas réattribuées au futur candidat. Les droits source PSF n’attestent
ni un nouveau binaire, ni les dépendances de son fabricant. Les empreintes complètes sont dans les pièces.
Les journaux utiles sont transcrits dans les preuves ; les archives et outils restent en cache jetable,
sans secret, runtime volumineux, certificat privé ou matériel MESS ajouté à Git.

## Condition minimale de levée et conséquence pour MEP-024

Obtenir un **ensemble binaire complet CPython standard 3.13 x64/cp313**, authentifié et corrigé
pour Python et ses composants à la date de qualification, avec manifeste et droits de redistribution.
Il peut provenir d’une publication officielle vérifiée ou d’une construction explicitement attribuée
à son fabricant et démontrée reproductible. Puis exécuter toutes les étapes du protocole lié,
avec le wheelhouse inchangé et le mode d’exploitation retenu. La présence des octets précède la recette.

MEP-024 peut préparer son assemblage/manifeste et réutiliser les quinze wheels acquises ;
il ne peut accepter ni distribuer le banc 3.13.17 comme runtime corrigé ni déclarer le package prêt.
Un changement de série/provenance exige une décision explicite du profil et la reprise des qualifications
consommatrices ; aucune wheel n’est modifiée en anticipation. I02, I03, MEP-021, MEP-058,
l’inventaire historique MEP-057 et les statuts canoniques restent préservés.

## Revue documentaire et DoD

Préparation réelle dans runtime.md avant essais/contrôles, puis extension explicite aux preuves.
Document propriétaire exploitation/distribution adapté ; exemples manuels extractibles testés,
aucun outil produit, dépendance, pipeline ou nouvelle architecture de publication.
README produit, AGENTS/règles agents, charte, DoD, stratégie de tests, architecture et API/OpenAPI,
profil, inventaire Python, qualification/protocole MEP-059 et source F12 relus.
Aucun changement de capacité, contrat API, modèle, migration, installation exposée ou règle qualité.
Aucun changement du README produit requis ; l’entrée spécialisée est liée depuis runtime.md.
Le verdict B est le résultat attendu en indisponibilité, sans clôture fictive d’I01.
Les suites applicatives/couvertures/E2E sont non applicables à ce lot documentaire ;
les contrôles manuels C3, le plan documentaire, le pré-push et la CI du SHA publié restent requis.
