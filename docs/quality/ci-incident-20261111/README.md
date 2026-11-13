# Qualification de l’échec CI du 11 novembre 2026

Audit initial au SHA `ec4c3a535065c54e3c25abea8f52b722f5bef5be`, puis traitement
limité approuvé par le GO utilisateur du 12 novembre 2026.
Base de correction : `2fedab80cdcff42325c6c1bfc06f5650c702c2ae`, dernier `origin/main`.
Branche `audit/ci-20261111`, worktree `C:\Users\garan\Desktop\Projets\Assess-teams-ci-20261111`.

## Verdicts conservés et éléments nouveaux

| Sujet | Conclusion |
| --- | --- |
| Playwright du 11 | Incident d’infrastructure démontré : résolution du miroir Ubuntu impossible pendant APT ; aucun E2E exécuté. Cause DNS profonde inconnue. |
| SQLite du 11 | Cause historique indéterminée ; aucun défaut applicatif démontré. La fragilité temporelle du test a été reproduite séparément. |
| Gate global du 11 | Conséquence des installations et du backend rouges ; aucune preuve de qualification émise. |
| Qualification du 12 | Run `43254284873` exhaustif vert, avec artefact exact pour `2fedab80…`, sans correction de ce test ni changement Playwright. |
| Correction autorisée | Synchronisation du scénario positif par événements ; aucune hausse de timeout, reprise automatique ou modification produit. Preuve rouge/verte sur les deux environnements. |

Le succès du 12 démontre une nouvelle campagne réussie et le retour de l’installation E2E
à cette date. Il ne prouve ni correction du mécanisme SQLite ni cause historique du refus.
Il porte sur un SHA différent : aucune assimilation à un rerun de `ec4c3a5`.

## Preuves et traitement

- [Campagnes et matrice des 16 jobs historiques](campagnes.md), [comparaison du même SHA](comparaison.md).
- [Campagne exhaustive verte du 12 novembre](qualification-20261112.md).
- [Installation Playwright et gate global](playwright.md), [analyse historique SQLite](sqlite.md).
- [Protocole initial](experiences.md), [environnement](environnement.md).
- [Vingt répétitions initiales](repetitions.md), [six chronologies initiales](chronologies.md).
- [Provenance et extraits](provenance.md), [intégrité des sources de l’audit initial](sources.md).
- [Décision approuvée et périmètre](decision.md), [correction et preuve rouge/verte](correction.md).
- [Contrôles et livraison](validation.md), [publication et CI du correctif](publication.md), [clôture](cloture.md).

Les pages historiques décrivent la phase avant GO. Le traitement courant est décrit dans
`correction.md` et `validation.md`. Les scripts exploratoires restent des recettes documentaires ;
archives, bases et logs complets sont conservés sous `.cache/ci-incident-20261111/` avant nettoyage.
Le README racine a été modifié avant le premier changement technique de cette phase.

Aucun workflow Playwright, comportement applicatif, contrat SQLite, seuil, statut PBI ou décision
MESS n’est modifié. TEAM-003 et les autres chantiers sont conservés. Aucun défaut applicatif
corrigé ni GO MESS n’est revendiqué. La CI du correctif publié est verte ; la [clôture](cloture.md) conserve les limites du verdict.
