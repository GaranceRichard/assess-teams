# Trace trace-development-02

Fin UTC : `2026-11-12T13:27:22.078021+00:00` ; durée externe : 4.497 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 226619764228, "pid": 147, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 229711137753, "pid": 151, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 229839907315, "pid": 151, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 229840437344, "pid": 147, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 230147172901, "pid": 152, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 230328057586, "pid": 152, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 230328531949, "pid": 147, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 230328840866, "pid": 147, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 230329157980, "pid": 151, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 230332589997, "pid": 151, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 230332723040, "pid": 151, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 230332903865, "pid": 151, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 230332949662, "pid": 151, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 230333150424, "pid": 151, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 230333155068, "pid": 147, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 230335467273, "pid": 151, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 230335711979, "pid": 151, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 230336845437, "pid": 151, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 230337057260, "pid": 151, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 230337549567, "pid": 151, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 230337759992, "pid": 147, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 230337914136, "pid": 147, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 230338192290, "pid": 152, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 230341217267, "pid": 152, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 230341308261, "pid": 152, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 230341445402, "pid": 152, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 230341484045, "pid": 152, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 230341636049, "pid": 147, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 230371965068, "pid": 147, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 230372537602, "pid": 151, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 230372722745, "pid": 151, "process": "SpawnProcess-1", "event": "deschedule_start", "seconds": 0.15}
{"ns": 230443484890, "pid": 152, "process": "SpawnProcess-2", "event": "sql_error", "kind": "UPDATE", "error": "OperationalError", "code": 5}
{"ns": 230450085102, "pid": 152, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 230522997120, "pid": 151, "process": "SpawnProcess-1", "event": "deschedule_end"}
{"ns": 230524680944, "pid": 151, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 230538072532, "pid": 151, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 230540503640, "pid": 151, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 230541339340, "pid": 151, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 230551505898, "pid": 152, "process": "SpawnProcess-2", "event": "sql_error", "kind": "INSERT", "error": "OperationalError", "code": 5}
{"ns": 230553576825, "pid": 151, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.22423950399999626}
{"ns": 230553850446, "pid": 151, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 230557946898, "pid": 152, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.21958306100000868}
{"ns": 230558094388, "pid": 152, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 500}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `a0d634f830a9fc779ea3b94caca27221ada784ce08c6956a36562f4220b367dc`.

```text
1: sqlite_contention operation=http outcome=non_replayable attempt=1 elapsed_ms=0 sqlite_code=5 correlation_id=1a9c8c4c-b3e0-42a0-9250-c80f8fda7a01
10: sqlite3.OperationalError: database is locked
62: django.db.utils.OperationalError: database is locked
71: sqlite3.OperationalError: database is locked
168: django.db.utils.OperationalError: database is locked
177:   File "/audit/backend/tests/sqlite_contention_cases.py", line 29, in apis
178:     assert result(second)[0] == 201
180: AssertionError
```
