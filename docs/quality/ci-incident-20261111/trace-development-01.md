# Trace trace-development-01

Fin UTC : `2026-11-12T13:27:17.580357+00:00` ; durée externe : 4.374 s.

Instrumentation seulement ; aucune modification des sources applicatives ou tests.
Intégrité : `ok` ; clés étrangères : `[]` ; équipes = activités : `True`.

```jsonl
{"ns": 222260800621, "pid": 138, "process": "MainProcess", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 225391143554, "pid": 142, "process": "SpawnProcess-1", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 225516371089, "pid": 142, "process": "SpawnProcess-1", "event": "send", "signal": "ready"}
{"ns": 225516679050, "pid": 138, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 225821237910, "pid": 143, "process": "SpawnProcess-2", "event": "connection", "busy_timeout": 5000, "journal_mode": "delete", "synchronous": 2, "mode": "DEFERRED"}
{"ns": 225938319929, "pid": 143, "process": "SpawnProcess-2", "event": "send", "signal": "ready"}
{"ns": 225938671337, "pid": 138, "process": "MainProcess", "event": "recv", "signal": "ready"}
{"ns": 225938791616, "pid": 138, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 225938970647, "pid": 142, "process": "SpawnProcess-1", "event": "recv", "signal": "go"}
{"ns": 225941111411, "pid": 142, "process": "SpawnProcess-1", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 225941240847, "pid": 142, "process": "SpawnProcess-1", "event": "sql_end", "kind": "BEGIN"}
{"ns": 225941571707, "pid": 142, "process": "SpawnProcess-1", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 225941669443, "pid": 142, "process": "SpawnProcess-1", "event": "send", "signal": "write_attempt"}
{"ns": 225941900453, "pid": 138, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 225941940288, "pid": 142, "process": "SpawnProcess-1", "event": "sql_end", "kind": "UPDATE"}
{"ns": 225944579942, "pid": 142, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 225944849566, "pid": 142, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 225945708751, "pid": 142, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 225945885647, "pid": 142, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 225946314123, "pid": 142, "process": "SpawnProcess-1", "event": "send", "signal": "written"}
{"ns": 225946511338, "pid": 138, "process": "MainProcess", "event": "recv", "signal": "written"}
{"ns": 225946659971, "pid": 138, "process": "MainProcess", "event": "send", "signal": "go"}
{"ns": 225946895399, "pid": 143, "process": "SpawnProcess-2", "event": "recv", "signal": "go"}
{"ns": 225948853486, "pid": 143, "process": "SpawnProcess-2", "event": "sql_start", "kind": "BEGIN", "atomic": false}
{"ns": 225948925253, "pid": 143, "process": "SpawnProcess-2", "event": "sql_end", "kind": "BEGIN"}
{"ns": 225949063396, "pid": 143, "process": "SpawnProcess-2", "event": "sql_start", "kind": "UPDATE", "atomic": true}
{"ns": 225949104173, "pid": 143, "process": "SpawnProcess-2", "event": "send", "signal": "write_attempt"}
{"ns": 225949241224, "pid": 138, "process": "MainProcess", "event": "recv", "signal": "write_attempt"}
{"ns": 225979501301, "pid": 138, "process": "MainProcess", "event": "send", "signal": "continue"}
{"ns": 225979920224, "pid": 142, "process": "SpawnProcess-1", "event": "recv", "signal": "continue"}
{"ns": 225981085902, "pid": 142, "process": "SpawnProcess-1", "event": "commit_start"}
{"ns": 226003706269, "pid": 142, "process": "SpawnProcess-1", "event": "commit_end"}
{"ns": 226005243224, "pid": 142, "process": "SpawnProcess-1", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 226005693050, "pid": 142, "process": "SpawnProcess-1", "event": "sql_end", "kind": "INSERT"}
{"ns": 226023529997, "pid": 142, "process": "SpawnProcess-1", "event": "send", "signal": "elapsed", "seconds": 0.08444851999999514}
{"ns": 226024493225, "pid": 142, "process": "SpawnProcess-1", "event": "send", "signal": "result", "status": 201}
{"ns": 226028480885, "pid": 143, "process": "SpawnProcess-2", "event": "sql_end", "kind": "UPDATE"}
{"ns": 226032222977, "pid": 143, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 226032594765, "pid": 143, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 226033765353, "pid": 143, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": true}
{"ns": 226034055154, "pid": 143, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 226035482842, "pid": 143, "process": "SpawnProcess-2", "event": "commit_start"}
{"ns": 226055479559, "pid": 143, "process": "SpawnProcess-2", "event": "commit_end"}
{"ns": 226056810502, "pid": 143, "process": "SpawnProcess-2", "event": "sql_start", "kind": "INSERT", "atomic": false}
{"ns": 226057288462, "pid": 143, "process": "SpawnProcess-2", "event": "sql_end", "kind": "INSERT"}
{"ns": 226074846931, "pid": 143, "process": "SpawnProcess-2", "event": "send", "signal": "elapsed", "seconds": 0.12784405700000434}
{"ns": 226075175627, "pid": 143, "process": "SpawnProcess-2", "event": "send", "signal": "result", "status": 201}
```

## Extraits de la sortie du scénario

Sortie complète conservée en cache ; SHA-256 : `b695bb9b9495f3e36b51c89e04f338bff4884b019acc4a38341f6ab78d0ce116`.

```text
1: qualified apis_release
```
