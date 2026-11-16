"""Exercise installed distributions and native extensions in the private bench."""

import importlib
import importlib.metadata
import json
import pathlib
import sys
from zoneinfo import ZoneInfo

destination = pathlib.Path(sys.argv[1]).resolve()
sys.path.insert(0, str(destination))
modules = [
    "django",
    "rest_framework",
    "drf_spectacular",
    "asgiref",
    "attrs",
    "inflection",
    "jsonschema",
    "jsonschema_specifications",
    "referencing",
    "rpds",
    "sqlparse",
    "tzdata",
    "uritemplate",
    "waitress",
    "yaml",
    "yaml._yaml",
    "rpds.rpds",
]
for name in modules:
    module = importlib.import_module(name)
    if not pathlib.Path(module.__file__).resolve().is_relative_to(destination):
        raise ValueError("Import escaped isolated installation: " + name)
import yaml
from jsonschema import validate
from rpds import HashTrieMap

if not yaml.__with_libyaml__ or yaml.safe_load("offline: true") != {"offline": True}:
    raise ValueError("Native YAML unavailable")
if HashTrieMap({"offline": True})["offline"] is not True:
    raise ValueError("Native rpds unavailable")
validate({"offline": True}, {"type": "object"})
if ZoneInfo("America/Toronto").key != "America/Toronto":
    raise ValueError("Local tzdata unavailable")
installed = {
    d.metadata["Name"]: d.version
    for d in importlib.metadata.distributions(path=[str(destination)])
}
print(json.dumps(installed, sort_keys=True))
print("PASS installed imports, native YAML/rpds, JSON schema and Toronto timezone")
