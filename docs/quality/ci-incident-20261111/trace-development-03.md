# Trace trace-development-03

Fin UTC : `2026-11-12T13:27:26.224462+00:00` ; durée externe : 4.146 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 231144462631, "pid": 155, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 234009632224, "pid": 158, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 234126383126, "pid": 158, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 234126670168, "pid": 155, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 234385831432, "pid": 159, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 234476980384, "pid": 159, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 234477330516, "pid": 155, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 234477504668, "pid": 155, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 234477707018, "pid": 158, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 234480854358, "pid": 158, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 234480972873, "pid": 158, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 234481185538, "pid": 158, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 234481249841, "pid": 158, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 234481414409, "pid": 155, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 234481425465, "pid": 158, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 234484780465, "pid": 158, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 234485211075, "pid": 158, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 234486301922, "pid": 158, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 234486518334, "pid": 158, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 234487034868, "pid": 158, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 234487283356, "pid": 155, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 234487443370, "pid": 155, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 234487694574, "pid": 159, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 234490049660, "pid": 159, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 234490147746, "pid": 159, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 234490309324, "pid": 159, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 234490359740, "pid": 159, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 234490567380, "pid": 155, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 234520978791, "pid": 155, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 234521597719, "pid": 158, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 234521813931, "pid": 158, "process": "SpawnProcess-1", "event": "deschedule_start", "seconds": 0.15}
{"ns": 234592207041, "pid": 159, "process": "SpawnProcess-2", "event": "sql_error", "kind": "UPDATE", "error": "OperationalError", "code": 5}
{"ns": 234598708905, "pid": 159, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 234672189831, "pid": 158, "process": "SpawnProcess-1", "event": "deschedule_end"}
{"ns": 234674533920, "pid": 158, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 234688996899, "pid": 158, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 234690883377, "pid": 158, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 234691346970, "pid": 158, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 234700357882, "pid": 159, "process": "SpawnProcess-2", "event": "sql_error", "kind": "INSERT", "error": "OperationalError", "code": 5}
{"ns": 234703497526, "pid": 158, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.22566549999999097}
{"ns": 234703837674, "pid": 158, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 234704537602, "pid": 159, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.21668748199999754}
{"ns": 234704744686, "pid": 159, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 500}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `c8f3a704931f609d400c3b826176e0857bf439e63841ff3eb84a8ae931a40c81`.

```text
1: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=b4497413-80fd-4fe2-b241-9faba1584695
10: sqlite3.OperationalError: database is locked
62: django.db.utils.OperationalError: database is locked
71: sqlite3.OperationalError: database is locked
168: django.db.utils.OperationalError: database is locked
177:   File "/audit/backend/tests/sqlite_contention_cases.py", line 29, in apis
178:     assert result(second)[0] == 201
180: AssertionError
```
