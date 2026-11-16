# MEP-058 — Critères, refus et DoD

[Contrat](README.md) · [provenance](provenance.md) · [sécurité](security.md) ·
[source canonique F12](../../backlog/source/mess/f12.md).

## Preuves par critère

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
