# MEP-058 — Critères, refus et DoD

[Contrat](README.md) · [provenance](provenance.md) · [sécurité](security.md) ·
[source canonique F12](../../backlog/source/mess/f12.md).

Les tableaux et campagnes initiaux ci-dessous qualifient exclusivement la remise historique
`ca962920b02f` ; les résultats C2 sont distingués dans la section de réconciliation.

## Preuves historiques par critère

| Exigence canonique | Preuve exécutée |
| --- | --- |
| Build normal sur poste de préparation | `npm run build --prefix frontend` : TypeScript et Vite réussis ; neuf sorties, adaptateurs API réels conservés |
| Routes et assets inclus | Manifeste des routes ; Chromium sur chaque route fixe, invitation paramétrée, mentions légales et Swagger ; 26 URL locales chargées |
| Intégrable au serveur cible | Arbres frontend/static séparés ; contrat SPA/API/admin et chemins locaux ; vraie vue Spectacular de production rendue avec ces ressources |
| Empreintes et version enregistrées | Version 0.0.0, SHA source, entrées et SHA-256 de chaque sortie dans manifest.json ; vérification complète après copie |
| Réserve I02 traitée | Source reconstruite deux fois, modules/archives/notices rapprochés, trois composants non traçables absents et précompilé refusé |
| Usage sans compilation sur cible | Sous-artefact statique dépourvu de sources de compilation, npm et Node ; navigateur utilisant uniquement ses fichiers et le schéma Django local |

La sonde de navigateur bloque tout réseau externe et ne lance ni Vite ni npm pour servir les fichiers.
La configuration Swagger est celle du module de production réel, pas un HTML de démonstration.
Le schéma et la réponse de session anonyme proviennent de Django, avec migrations sur SQLite en mémoire pour la sonde.
Les pages métier protégées chargent l'entrée de connexion : cela qualifie leurs routes/assets en accès anonyme,
pas leur parcours authentifié sur un hôte MESS. Les E2E applicatifs du dépôt restent requis séparément.
Le test d'invitation vérifie son formulaire ; il ne crée ni n'envoie une invitation.

## Vrais refus exécutés sur des copies

`node --test scripts/distribution/verify.test.mjs` : dix tests réussis.

| Cas | Résultat |
| --- | --- |
| Candidat complet réel | Accepté, tous les fichiers et notices vérifiés |
| Asset JavaScript produit supprimé | Refus : ensemble de fichiers incomplet |
| JavaScript Swagger altéré | Refus : taille/empreinte divergente |
| NOTICE Swagger supprimé | Refus : notice obligatoire absente |
| Vrai build GitHub Pages substitué au frontend | Refus : fichiers et empreintes du produit différents |
| Entrée TSX source à la place du JavaScript compilé | Refus : artefact incomplet et sources à compiler |
| Script CDN ajouté, hashes recalculés | Refus : référence de ressource non locale |
| Vrai précompilé Swagger MEP-057 substitué, hashes recalculés | Refus explicite I02 |
| Sous-ressource OAuth Swagger supprimée | Refus : fichier obligatoire absent |
| Licence de composant effacée, hashes recalculés | Refus : composant sans droit identifié |

Trois tests backend réussissent : rendu production local, POST documentation refusé 405,
schéma sans référence externe ni clé de contrôle de prototype. Le test du rendu local a échoué sur le défaut CDN initial.
Le navigateur confirme aussi le refus des ressources/API absentes en 404, sans fallback HTML pour ces préfixes.
Les paramètres `url` et `configUrl` externes ne changent pas le document local et ne déclenchent aucune requête externe.
Les [avis npm](security.md) restent visibles et bornés ; audit non nul n'est pas assimilé à vulnérabilité exploitable ni masqué.

## Réserves conservées

- I01 de MEP-057 concerne le runtime Python corrigé, absent de ce sous-artefact ; aucune solution n'est inventée ici.
- I02 est traitée pour ces octets reconstruits et attribués ; le précompilé initial reste refusé.
- I03 : aucun banc Windows Server 2022 ni site MESS qualifié ; routage/TLS, collecte des statiques Django et services restent à éprouver en intégration.
- La non-exposition de deepmerge dépend du schéma contrôlé et du refus des sources arbitraires ; toute évolution de cette frontière exige requalification.
- L'avertissement Vite de chunk supérieur à 500 kB reste informatif ; ni échec de build ni découpage artificiel dans ce PBI.

## Revue documentaire et DoD

La préparation propriétaire a été écrite avant les scripts et avant la modification du rendu production.
Son extension aux tables consommées a précédé le changement de la matrice d'impact ; aucune trace historique n'est fabriquée.
Les domaines exploitation et qualité portent les responsabilités réelles, fichiers explicitement rattachés et contrôles distincts.
README produit, AGENTS/règles, charte, DoD, stratégie de tests, fondamentaux et contrat API ont été relus.
Le README produit reste pertinent : aucune nouvelle installation publique ou capacité métier n'est annoncée.
L'index documentaire et le contrat Swagger reçoivent les liens ; aucune réécriture des preuves MEP-057 ni du registre canonique.
Les neuf tables consommées comme entrées perdent leur exemption prose dans la matrice et ses tests.
Les notices restent intégrales ; aucun secret, cache, binaire ni artefact local n'est versionné.
Modèles/migrations métier : non applicables, aucun modèle modifié ; le contrôle de migrations reste requis par le gate.
Contrats utilisateur et permissions : inchangés, protégés par les campagnes exhaustives.

Le contenu satisfait les critères et vrais refus du PBI. La DoD de livraison exige les gates exhaustifs,
le pre-push obligatoire, le push direct par `npm run publish`, la CI verte du SHA exact et le fast-forward propre du principal.
Le rapport de publication fournit ces preuves finales sans commit circulaire de son propre SHA.
La clôture fonctionnelle sera proposée uniquement avec ces preuves ; le statut canonique attend l'approbation utilisateur.

## Campagnes locales complètes du 2026-11-16

| Contrôle | Résultat vérifié |
| --- | --- |
| Dépôt et outillage | Lignes, secrets, préparation, intégrité, bootstrap, scopes, licences et matrice conformes |
| Backend | 1 607 tests ; couverture 97,53 % ; lint, format, migrations et contrats OpenAPI conformes |
| Frontend | 120 fichiers, 499 tests ; statements 94,97 %, branches 93,55 %, fonctions 96,47 %, lignes 95,81 % |
| Build frontend | Typage et build normaux conformes ; avertissement de taille de chunk informatif |
| E2E complet | 155 parcours applicatifs puis dix parcours de démo réussis, sans exclusion |
| Sous-artefact | Dix tests d'acceptation/refus ; 26 URL locales Chromium, aucune requête externe ni erreur JavaScript |

La première tentative E2E n'a pas démarré son backend faute de droit d'installation des hooks partagés.
Elle n'est pas une preuve de réussite ; la relance avec le bootstrap autorisé produit le verdict complet ci-dessus.
Les preuves locales restent celles de leurs sélections et entrées ; le pre-push les réévalue, sans exception ni contournement.


## Réconciliation C2 — phase indépendante (2026-11-17)

La préparation de C2 dans `provenance.md` a réellement précédé les modifications techniques.
Trois défauts de provenance sont démontrés : configuration importée MEP-021 non détaillée,
entrées de préparation/inventaire ou sources non suivies acceptées avant compilation,
et manifeste dépourvu de SHA/liste d'entrées accepté par le vérificateur.
Sept contre-épreuves échouent avant correction et passent après ; dix-sept tests passent ensuite
sur l'archive historique et sur le nouveau candidat complet. La génération réelle constitue
le positif des nouvelles gardes, avec contrôle direct des 485 sources et sept scripts de préparation.
Les vrais refus historiques restent exécutés : fichier absent/altéré, notices, démo réelle,
compilation sur cible, script CDN même rescellé, précompilé I02, OAuth et licence non attribuée.

Deux reconstructions du frontend normal et de Swagger contrôlent l'égalité des octets exécutables,
notices et inventaires. La variation des seuls diagnostics d'importeurs Webpack est exposée dans
la [provenance C2](provenance.md), avec les empreintes distinctes des deux payloads ; aucune
reproductibilité binaire de l'archive complète n'est revendiquée.

C1 est encore absent de main lors de cette phase. Aucun nouveau résultat navigateur n'est annoncé,
aucune preuve historique n'est promue et la qualification intégrée reste à exécuter après sa CI verte.
Le sous-artefact contient des octets statiques, sans sources de compilation, npm ni runtime Node ;
l'absence effective de besoin de réseau/CDN sera reconfirmée par le protocole C1 sur le candidat convergent.
Les réserves I01 (runtime Python), I02 (précompilé refusé, reconstruction attribuée) et I03
(Windows Server 2022/site MESS non qualifiés) restent bornées comme ci-dessus.

Revue de contenu C2 : les documents d'exploitation portent la provenance et ses limites réelles.
README produit, règles agents, charte, DoD, stratégie de tests, fondamentaux et API ont été relus ;
aucun changement de capacité publique, contrat HTTP, modèle ou migration n'appelle leur modification.
Aucun fichier C1, chargeur, wheelhouse, runtime C3 ou statut canonique n'est modifié.
Les gates et la CI du SHA publié seront joints à la remise après leur exécution ; aucun succès anticipé.
MEP-058 reste soumis à une décision fonctionnelle explicite, sans clôture par cet audit.


## Gates C2 indépendants — sources 13cc0f5

`npm run quality:targeted` calcule et réussit le plan exhaustif : repository, backend, frontend et E2E.
Backend : 1 758 tests, couverture 97,41 %, lint/format et migrations conformes.
Frontend : 120 fichiers, 499 tests ; statements 94,97 %, branches 93,55 %, fonctions 96,47 %, lignes 95,81 %.
Build normal/typecheck conformes ; 155 parcours applicatifs et dix parcours de démonstration réussis.
Les dix-sept tests du sous-artefact et la comparaison des deux reconstructions restent joints aux preuves.
Cette campagne ne constitue pas le protocole hors ligne corrigé C1, toujours absent du main retenu à cette étape.
Le pré-push réévalue ses entrées après resynchronisation ; la CI du SHA publié reste requise.
La pré-remise indépendante est conservée hors checkout sous `Assess-teams-artifacts/MEP-058/13cc0f505edf/`,
avec le bundle Git borné de ses sources, les deux ZIP et les comparaisons, sans promotion de qualification.
