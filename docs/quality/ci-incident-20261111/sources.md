# Intégrité des sources expérimentales

Comparaison octet par octet de tous les fichiers du backend extraits par
`git archive ec4c3a535065c54e3c25abea8f52b722f5bef5be backend` avec les fichiers
du conteneur après les 27 exécutions. Les fichiers générés supplémentaires ne font
pas partie de cette comparaison.

```json
{
  "checked_files": 401,
  "changed": [],
  "sha256": {
    "backend/tests/test_sqlite_contention_operational.py": "8b26e914b3400622a0aa01b84f55742aaadb50876e49f4f326512e4f2ab3f813",
    "backend/tests/sqlite_contention_cases.py": "7c6bc34282249779353defbe5f78e81382cc4b944560788b9a5400aebf474262",
    "backend/tests/sqlite_contention_harness.py": "9d8b83d446486367b7159a6b0ce19d772f64093bbc71725ef73b2f21d0893f7f",
    "backend/tests/sqlite_contention_process.py": "0f2476cd512ddfdda97fa7a191a210622adb1bbe25301dff376cfdb48745991f",
    "backend/tests/sqlite_contention_api.py": "78577becabeaec25444453bd55be10bf6747afa22cc4c2e68198841cd76ed97c",
    "backend/config/settings_base.py": "0a70250fa33da44cbfdeb92a62ee23b6c236d925e6c796ae0589c2bc352a30a8",
    "backend/config/sqlite_contention.py": "9ce7e1134153689b628c5bc23f0c840ff7f34c819c4c6d34458c1ac4c47db118",
    "backend/teams/adapters/api/views.py": "b79f3681d8201af48b973b7c8c8d791c28243ce230390f6c1be0b457f404d628",
    "backend/identities/application/lifecycle.py": "51aa7947bd5a0cac4787921ee205205cb524833f1103da5aefad910bc4c9e7c5"
  }
}
```
