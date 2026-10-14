# EPIC-011 — Sécurité et robustesse

Repère cible **E01**. Epic du [périmètre de préparation MESS](../07-pre-mep.md).

**Enjeu stratégique :** Protéger les données, garantir la stabilité d’exploitation et maîtriser la traçabilité.

Cette Epic ne remplace aucune Epic du backlog fonctionnel général. Les concepts et les arbitrages
restent définis par les [sources transverses](../00-concepts-transverses.md) et le
[registre Organisation](../00-arbitrages-organisations.md). Priorité P1.
Les dépendances précises, acteurs, critères et refus sont portés par les Features liées.
Le [registre canonique](../../tracking/mess-e01.md) porte les tailles, statuts et dates.

| Repère | Feature et capacité | Enjeu |
| --- | --- | --- |
| F01 | [FEAT-049 — Sécurité de production](f01.md) | Prévenir les défauts de configuration, l’exposition des secrets et les accès non autorisés. |
| F02 | [FEAT-050 — SQLite en exploitation](f02.md) | Préserver l’intégrité et la disponibilité en situation concurrente, en conservant SQLite comme base permanente. |
| F03 | [FEAT-051 — Journalisation et conservation](f03.md) | Garantir une traçabilité exploitable sans accumulation incontrôlée. |
| F04 | [FEAT-052 — Gouvernance Git et intégration continue](f04.md) | Sécuriser l’intégration et maîtriser les publications. |

Après audit : 12 PBI actifs dans cette Epic ; total MESS 62. Voir l’[audit](../../planning/mess-audit.md).
03.01 demeure un acquis référencé de F03, hors du dénominateur actif ; aucun travail réalisé n’est rouvert.
