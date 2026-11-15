# MEP-022 — Qualification du contrat et revue DoD

[Contrat](operations.md) · [fiche canonique](../backlog/source/mess/f11.md).
Revue documentaire du 2026-11-15, initialement sur `9d8cc6f` puis confrontée à `9abde71` (MEP-054).
Le statut canonique reste Ouvert / N/A ; aucune clôture n'est appliquée par ce lot.
Les parcours ci-dessous vérifient une **définition de procédures**, sans prétendre les exécuter sur cible.

## Critères d'acceptation et preuve de couverture

| Critère canonique | Preuve livrée et résultat de revue |
| --- | --- |
| Déclencheur, rôle requis, entrées, sortie observable, diagnostic et conduite sur échec pour chaque opération | O01–O06 dans [cycle](operations-lifecycle.md), O07/O08 dans [continuité](operations-continuity.md) ; huit fiches avec les six champs, dont le geste explicite |
| Démarrage/arrêt, supervision, SMTP, purge et maintenance | Ordre des producteurs, état attendu et échecs traités ; commandes SMTP/purge réutilisées, distinction processus/health/état métier |
| Sauvegarde/reprise, méthode et limites | API backup SQLite, copie isolée, contenu/provenance et compatibilité, refus avant remplacement, vérification des effets externes ; aucun outil futur annoncé livré |
| Mesures de durée et point récupéré | REP-REF-01 : bornes monotones/UTC, trois répétitions, jalons A/B/U et commits concurrents, données absentes recensées, incertitudes d'horloge explicites |
| Protocole de charge reproductible et profil projet | CHG-REF-01 : REF-WIN-01, jeux FON/TEC réutilisés, extension déterministe, mix, cadence, 1/2/4 clients, fenêtres 60/300 s, trois répétitions, instruments/formules et arrêt sur échec |
| Aucun SLA/RPO/RTO MESS supposé convenu | Contrat et protocoles séparent conventions/mesures du banc et engagements réels ; absence d'engagement externe sans blocage de définition ou d'essai |

Le script ci-dessous vérifie mécaniquement champs, fichiers et liens ; les tables de revue vérifient
leur sens. Un contrôle de structure ne certifie ni faisabilité sur cible ni acceptation humaine.

## Parcours nominaux et vrais refus examinés

Méthode : appliquer chaque entrée au texte de la fiche, suivre les sorties et la branche d'échec,
puis confronter aux sources acquises. Résultats = revue du contrat ; aucun PV TEC ne change de verdict.

| Cas | Nominal couvert | Refus réel et conduite vérifiée dans le contrat |
| --- | --- | --- |
| O01 | Configuration valide, service et données contrôlés avant ouverture | Configuration refusée, TLS/ACL/port/health KO : ne pas ouvrir, arrêter le démarrage partiel et diagnostiquer |
| O02 | Entrées fermées, tâches suspendues, passes terminées et processus absents | Processus/transaction résiduel : pas d'arrêt propre annoncé ni copie à froid ; récupération SQLite et état SMTP contrôlés après arrêt forcé |
| O03 | Probes horodatées et observations processus/files/tâches | Health/tâche KO ou file vieillissante : incident, isolation de la cause et reprise contrôlée ; lacune de mesure visible |
| O04 | Mise en file puis acceptation observée, état métier conservé | Refus SMTP ou remise incertaine : reprise bornée, vérification relais avant action dédiée, aucun renvoi aveugle ni rejeu métier |
| O05 | Simulation puis exécution autorisée, reçu et code contrôlés | Geste destructif sans autorisation réelle, keep, gel, périmètre métier ou intégrité KO : refus/suspension ; reçu suspendu repris sans falsification |
| O06 | Changement autorisé avec sauvegarde et couple compatible | Migration/compatibilité KO, sauvegarde absente ou perte non autorisée : arrêt sûr et conservation de l'état |
| O07 | Snapshot cohérent vérifié puis restauré en essai | Copie brute active, corruption, manque d'espace/ACL, interruption ou secret exposé : aucune qualification, original préservé |
| O08 | Point explicitement choisi, clone distinct et comparaison des jalons | Perte acceptée implicitement, backup altéré/incomplet ou mauvais schéma/point : refus avant écrasement ; aucune perte réelle autorisée par le banc |
| Hors ligne | Runtime/outils/certificats locaux et SMTP interne | Dépendance Internet obligatoire : protocole non conforme, préparer localement ; aucune étape d'exploitation ne demande un téléchargement |
| Engagements externes | Convention et mesure du banc possibles sans SLA | Absence d'engagement externe : aucun blocage artificiel ; aucune garantie MESS déclarée |

Ces refus sont ceux du PBI ou leurs manifestations opératoires concrètes ; aucun seuil de performance,
arbitrage de conservation, droit de destruction ou nouvel accord organisationnel n'est créé.

## Acquis et confrontation aux sources

- MEP-042 : [politique](configuration/journal-retention.md) et [preuves](configuration/journal-retention-validation.md),
  dont tests configuration/démarrage et protection métier ; dépendance satisfaite, aucune réimplémentation.
- MEP-020 : [commande/reçus/périmètre/reprise](journal-purge.md) et [preuves](journal-purge-validation.md).
- MEP-004 : [états, droits et reprises](../architecture/email-notifications.md),
  [inventaire SMTP](configuration/email.md), commandes et `backend/tests/test_email_admin.py` ;
  un code nul de passe n'est pas une garantie de remise.
- Health : `backend/health/views.py` et `backend/config/urls.py` ; SELECT 1, réponse et route
  confrontées aux contrôles O01/O03 ; aucune promesse de contrôle d'intégrité par le health.
- SQLite : [référence](sqlite/README.md), [mesures](sqlite/measurements.md),
  [contention](sqlite/contention.md) et [conflits](sqlite/critical-conflicts-matrix.md) réutilisés.
- MEP-054 intégré indépendamment : [schéma](configuration/unique-contract.md) et
  [exemples](configuration/unique-examples.md) ; mêmes chemins/settings/API/workers, fréquence paramétrable,
  sauvegardes null sans activation/destruction, durées journaux sans autorisation de purge.
  Le chargement reste MEP-021. Aucun fichier du chantier MEP-054 ou MEP-057 n'est modifié.

## Reproduction des contrôles documentaires

Depuis la racine, extraire ce bloc dans un fichier Python temporaire hors sources, puis exécuter
avec le Python local préparé. Il ne touche ni service ni base ni réseau.

```python
import re
from pathlib import Path
from urllib.parse import unquote

root = Path.cwd()
folder = root / "docs/operations"
names = ["operations.md", "operations-lifecycle.md", "operations-continuity.md",
         "operations-load-protocol.md", "operations-validation.md"]
texts = {name: (folder / name).read_text(encoding="utf-8-sig") for name in names}
links = 0
for name, text in texts.items():
    assert len(text.splitlines()) <= 200, name
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if re.match(r"[a-z]+://", target):
            continue
        path = unquote(target.split("#")[0])
        assert (folder / path).is_file(), (name, target)
        links += 1
fields = ["Déclencheur", "Rôle requis", "Entrées", "Geste",
          "Sortie observable", "Diagnostic et échec"]
count = 0
for name in ("operations-lifecycle.md", "operations-continuity.md"):
    for part in re.split(r"(?m)^## ", texts[name])[1:]:
        if not re.match(r"O\d{2} — ", part):
            continue
        for field in fields:
            assert f"**{field} :**" in part, (name, field)
        count += 1
assert count == 8, count
print(f"PASS: {len(names)} documents, {count} operations, {links} liens locaux")
```

Compléter par `git diff --check` et `npm run quality:targeted` ; le pre-push recalcule le diff final,
puis `npm run publish` attend la CI indépendante du SHA publié. Les résultats locaux et la livraison
sont consignés ci-dessous ; Git et GitHub Actions portent la preuve finale de publication.

## Revue de contenu, applicabilité et DoD

La préparation a été écrite dans le document propriétaire avant la rédaction des procédures.
Aucun travail technique ni écart de chronologie ; séparation contrat/cycle/continuité/charge/preuves
adaptée aux responsabilités, aucune automatisation future développée. Revue de contenu effectuée
par l'agent, sans la présenter comme une approbation humaine ni une qualification de site.

README, AGENTS/règles, charte, DoD, stratégie de tests, fondamentaux et API/OpenAPI relus pour impact.
Aucun changement public d'installation ou d'usage livré : README et architecture restent à actualiser
par MEP-023 ; les liens utiles sont portés par ce contrat propriétaire. F11, dépendances, jeux FON/TEC,
installation, configuration, SMTP et purge confrontés ; sources, statuts et historiques préservés.

Diff exclusivement documentaire : tests applicatifs nouveaux, backend/frontend/E2E, coverage,
build/typecheck, lint applicatif, migrations et génération OpenAPI non applicables selon la matrice
du dépôt ; aucun code, endpoint, modèle, dépendance, permission ou contrat produit modifié.
Les seuils restent inchangés. Les contrôles documentaires, lignes, secrets, pre-push et CI restent requis.

Les livrables du PBI sont définis et contrôlés ; les essais futurs restent aux consommateurs.
Limites : aucune mesure nouvelle de banc, aucun service/package/backup livré, aucune installation,
homologation, SLA ou qualification MESS réelle. Ces limites sont conformes au périmètre de définition,
sans écart fonctionnel résiduel identifié. Clôture fonctionnelle proposée après livraison qualifiée,
sous approbation explicite ; aucun statut canonique modifié.

## Résultats locaux et livraison

- Contrôle reproductible ci-dessus : PASS, cinq documents, huit opérations et 50 liens locaux résolus.
- `npm run quality:targeted` : scope documentaire seul, zéro échec ; limite de lignes, secrets,
  structure, intégrité des preuves et workflow documentaire conformes. Aucun test applicatif déclenché.
- La preuve finale du diff commité, le pre-push et la CI indépendante restent dans les journaux
  de publication et GitHub Actions du SHA exact, cités dans le rapport de livraison à l'utilisateur.
- La qualification du contrat ne modifie aucun verdict de recette TEC ni statut canonique.
