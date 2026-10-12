import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
from zipfile import ZipFile

import pytest

spec = importlib.util.spec_from_file_location(
    "python_inventory", Path(__file__).resolve().parents[2] / "scripts/legal/python_inventory.py"
)
inventory = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inventory)


def distribution(root, files):
    return SimpleNamespace(
        metadata={"Name": "example", "License-Expression": "BSD-3-Clause"},
        version="1.0.0",
        files=files,
        locate_file=lambda file: root / file,
    )


@pytest.mark.functional
def test_export_retains_embedded_licenses_and_exact_bytes(tmp_path):
    names = ["example.dist-info/LICENSE", "example/vendor/NOTICE", "example/vendor/LICENSE"]
    original = b"Copyright upstream\r\nBSD conditions and disclaimer\r\n"
    for name in names:
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(original)
    output = tmp_path / "output"
    result = inventory.export([distribution(tmp_path, names)], output)
    assert result[0]["license"] == "BSD-3-Clause"
    with ZipFile(output / "notices.zip") as archive:
        for name in names:
            assert archive.read(f"example/{name}") == original
        assert len(json.loads(archive.read("inventory.json"))[0]["notices"]) == 3


@pytest.mark.functional
def test_export_refuses_missing_license_before_creating_artifact(tmp_path):
    with pytest.raises(ValueError, match="Missing license text"):
        inventory.export([distribution(tmp_path, [])], tmp_path / "output")
    assert not (tmp_path / "output").exists()


@pytest.mark.functional
def test_export_refuses_missing_embedded_notice(tmp_path):
    with pytest.raises(ValueError, match="Missing notice"):
        inventory.component(distribution(tmp_path, ["example/vendor/LICENSE"]))


@pytest.mark.functional
def test_export_refuses_notice_path_outside_package(tmp_path):
    with pytest.raises(ValueError, match="Unsafe notice path"):
        inventory.component(distribution(tmp_path, ["../LICENSE"]))
