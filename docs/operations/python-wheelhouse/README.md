# MEP-059 — Dépendances Python hors ligne

## Préparation du changement — 2026-11-15

- Périmètre : livrer les quinze wheels exacts de MEP-057 pour Windows AMD64 CPython standard 3.13, leur verrou et les contrôles locaux ; aucun assemblage MEP-024 ni travail frontend ou configuration.
- Objectif : transformer les pièces inventoriées au commit 6aec11f en un wheelhouse versionné et démontrer une véritable installation sans téléchargement ni résolution réseau.
- Effets attendus : vérifier les octets, versions, tags, Requires-Python, fermeture transitive et notices avant installation locale dans un répertoire jetable avec pip du poste de préparation.
- Risques : préserver les notices intégrales, refuser artefacts absents, altérés ou incompatibles, et ne jamais présenter Python 3.13.17 refusé par I01 comme runtime de distribution accepté.
- Vérification : exécuter les contrôles positifs et vrais refus sur les archives livrées, installer avec réseau interdit dans un interpréteur Windows cp313 contrôlé, puis importer les bibliothèques natives et vérifier les versions installées.
- Fichier : `distribution/python/ref-win-01/requirements.txt`
- Fichier : `scripts/distribution/python_wheelhouse.py`
- Fichier : `scripts/distribution/wheel_metadata.py`
- Fichier : `scripts/distribution/offline_pip.py`
- Fichier : `scripts/distribution/probe_installed.py`
- Fichier : `scripts/distribution/test_python_wheelhouse.py`

Les wheels seront conservés inchangés sous `distribution/python/ref-win-01/wheels/` :
les quinze noms, URLs et SHA-256 sont ceux de [MEP-057](../distribution-inventory/python.md).
Les licences et leurs textes restent ceux de [python-notices.md](../distribution-inventory/python-notices.md), inclus dans les archives.
Les [imports PE](../distribution-inventory/native-evidence.md) sont réutilisés sans inventer une nouvelle ABI.
Le runtime de banc est une pièce privée de qualification, exclue du wheelhouse et de toute distribution.
La réserve [I01](../distribution-inventory/qualification.md) reste ouverte : nouvelle qualification obligatoire sur le runtime corrigé final.
README produit inchangé : aucune nouvelle procédure d’installation du produit ni promesse de package autonome.
Aucun statut canonique ne change ; la clôture éventuelle sera seulement proposée à l’utilisateur.

## Livrables et lecture des preuves

- [Protocole reproductible](protocol.md) : commandes, fermeture, installation et refus.
- [Qualification par critère et verdict DoD](qualification.md) : distinction wheels / runtime final.
- [Journal de l’installation locale](installation.log) : sortie réelle, chemins du worktree normalisés seulement.
- [Contrôle durable dans les gates](../../quality/mep-059.md).

La préparation livre des wheels ; l’acceptation d’un runtime corrigé et le package autonome ne sont pas acquis.
