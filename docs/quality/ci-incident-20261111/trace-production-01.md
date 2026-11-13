# Trace trace-production-01

Fin UTC : `2026-11-12T13:27:30.079556+00:00` ; durée externe : 3.855 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 235278341658, "pid": 160, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 237997263774, "pid": 162, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 238104607595, "pid": 162, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 238105003303, "pid": 160, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 238376739652, "pid": 163, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 238488856665, "pid": 163, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 238489340531, "pid": 160, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 238489521496, "pid": 160, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 238489799340, "pid": 162, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 238492760961, "pid": 162, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 238492838929, "pid": 162, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 238493077634, "pid": 162, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 238493130093, "pid": 162, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 238493303133, "pid": 162, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 238493326703, "pid": 160, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 238496111541, "pid": 162, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 238496509599, "pid": 162, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 238497261942, "pid": 162, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 238497495557, "pid": 162, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 238497902221, "pid": 162, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 238498104201, "pid": 160, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 238498245700, "pid": 160, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 238498518174, "pid": 163, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 238500967890, "pid": 163, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 238501030139, "pid": 163, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 238501158734, "pid": 163, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 238501207998, "pid": 163, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 238501400389, "pid": 160, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 238531724844, "pid": 160, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 238532170839, "pid": 162, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 238533840839, "pid": 162, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 238546542099, "pid": 162, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 238548851708, "pid": 162, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 238549360787, "pid": 162, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 238559752183, "pid": 162, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.06977255000001037}
{"ns": 238559955841, "pid": 162, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 238580516430, "pid": 163, "process": "SpawnProcess-2", "event": "sql_end", "kind": "UPDATE"}
{"ns": 238583766209, "pid": 163, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 238584146724, "pid": 163, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 238584862757, "pid": 163, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 238585033212, "pid": 163, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 238586036542, "pid": 163, "process": "SpawnProcess-2", "event": "commit_start"}
{"ns": 238597577533, "pid": 163, "process": "SpawnProcess-2", "event": "commit_end"}
{"ns": 238598827584, "pid": 163, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 238599194388, "pid": 163, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 238609943794, "pid": 163, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.11127699700000449}
{"ns": 238610198940, "pid": 163, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 201}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `b695bb9b9495f3e36b51c89e04f338bff4884b019acc4a38341f6ab78d0ce116`.

```text
1: qualified apis_release
```
