# Trace trace-production-02

Fin UTC : `2026-11-12T13:27:34.139419+00:00` ; durée externe : 4.060 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 239128322023, "pid": 164, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 241886079921, "pid": 166, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 241998109762, "pid": 166, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 241998620259, "pid": 164, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 242283342216, "pid": 167, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 242401138687, "pid": 167, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 242401631309, "pid": 164, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 242401853823, "pid": 164, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 242402155753, "pid": 166, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 242405530294, "pid": 166, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 242405654461, "pid": 166, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 242405863729, "pid": 166, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 242405918784, "pid": 166, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 242406125843, "pid": 164, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 242406125868, "pid": 166, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 242408677494, "pid": 166, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 242409066795, "pid": 166, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 242410031832, "pid": 166, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 242410266729, "pid": 166, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 242410704693, "pid": 166, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 242410960294, "pid": 164, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 242411135958, "pid": 164, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 242411426276, "pid": 167, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 242414171050, "pid": 167, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 242414251303, "pid": 167, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 242414387101, "pid": 167, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 242414426336, "pid": 167, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 242414565876, "pid": 164, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 242444866015, "pid": 164, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 242445362119, "pid": 166, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 242445550768, "pid": 166, "process": "SpawnProcess-1", "event": "deschedule_start", "seconds": 0.15}
{"ns": 242516179555, "pid": 167, "process": "SpawnProcess-2", "event": "sql_error", "kind": "UPDATE", "error": "OperationalError", "code": 5}
{"ns": 242521216450, "pid": 167, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 242595792489, "pid": 166, "process": "SpawnProcess-1", "event": "deschedule_end"}
{"ns": 242597454182, "pid": 166, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 242612184889, "pid": 166, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 242614503211, "pid": 166, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 242614920155, "pid": 166, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 242622996541, "pid": 167, "process": "SpawnProcess-2", "event": "sql_error", "kind": "INSERT", "error": "OperationalError", "code": 5}
{"ns": 242625529006, "pid": 166, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.22320130599999288}
{"ns": 242625815601, "pid": 166, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 242627171758, "pid": 167, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.21557539799999859}
{"ns": 242627364074, "pid": 167, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 500}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `b5fb515623a6689a5904bef2cc812cdf52638c0f975fb9a9ef7c3010273744f5`.

```text
1: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=820e7c27-0f8d-42ca-affa-0f0ca28e22ea
10: sqlite3.OperationalError: database is locked
59: django.db.utils.OperationalError: database is locked
68: sqlite3.OperationalError: database is locked
162: django.db.utils.OperationalError: database is locked
170:   File "/audit/backend/tests/sqlite_contention_cases.py", line 29, in apis
171:     assert result(second)[0] == 201
173: AssertionError
```
