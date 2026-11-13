# Trace trace-production-03

Fin UTC : `2026-11-12T13:27:38.185832+00:00` ; durée externe : 4.047 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 243177287571, "pid": 168, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 245938324820, "pid": 170, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 246047104030, "pid": 170, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 246047470287, "pid": 168, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 246354490856, "pid": 171, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 246471552474, "pid": 171, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 246472165431, "pid": 168, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 246472380600, "pid": 168, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 246472817141, "pid": 170, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 246475866951, "pid": 170, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 246475978493, "pid": 170, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 246476238959, "pid": 170, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 246476295416, "pid": 170, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 246476454384, "pid": 168, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 246476489105, "pid": 170, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 246479152194, "pid": 170, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 246479408511, "pid": 170, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 246480165232, "pid": 170, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 246480357718, "pid": 170, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 246480789229, "pid": 170, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 246480981626, "pid": 168, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 246481102185, "pid": 168, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 246481318286, "pid": 171, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 246483827963, "pid": 171, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 246483909237, "pid": 171, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 246484105160, "pid": 171, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 246484188810, "pid": 171, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 246484372730, "pid": 168, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 246514727442, "pid": 168, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 246515197451, "pid": 170, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 246515394386, "pid": 170, "process": "SpawnProcess-1", "event": "deschedule_start", "seconds": 0.15}
{"ns": 246585964389, "pid": 171, "process": "SpawnProcess-2", "event": "sql_error", "kind": "UPDATE", "error": "OperationalError", "code": 5}
{"ns": 246590930411, "pid": 171, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 246665708446, "pid": 170, "process": "SpawnProcess-1", "event": "deschedule_end"}
{"ns": 246667868080, "pid": 170, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 246680489631, "pid": 170, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 246682171632, "pid": 170, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 246682504556, "pid": 170, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 246692477266, "pid": 171, "process": "SpawnProcess-2", "event": "sql_error", "kind": "INSERT", "error": "OperationalError", "code": 5}
{"ns": 246693795380, "pid": 170, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.22078009099999463}
{"ns": 246694055945, "pid": 170, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 246696426531, "pid": 171, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.21495188800000165}
{"ns": 246696595152, "pid": 171, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 500}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `5016563478da7e99b606986a3f21606ef34ccf1734f221d28a258301b922e3d8`.

```text
1: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=2f0e55c0-839a-43d5-9ab8-103c4e20a8de
10: sqlite3.OperationalError: database is locked
59: django.db.utils.OperationalError: database is locked
68: sqlite3.OperationalError: database is locked
162: django.db.utils.OperationalError: database is locked
170:   File "/audit/backend/tests/sqlite_contention_cases.py", line 29, in apis
171:     assert result(second)[0] == 201
173: AssertionError
```
