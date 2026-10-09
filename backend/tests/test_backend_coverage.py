import json

import coverage
import pytest

from tests.ci_helpers import merger


def write_manifests(directory):
    for index in (1, 2):
        (directory / f".coverage.{index}").touch()
        manifest = {
            "shard": index,
            "count": 2,
            "collected": ["test_a", "test_b"],
            "selected": ["test_a" if index == 1 else "test_b"],
            "coverage_version": coverage.__version__,
            "exit_code": 0,
        }
        (directory / f"manifest-{index}.json").write_text(json.dumps(manifest))


def test_complete_disjoint_shards_are_required(tmp_path):
    write_manifests(tmp_path)
    assert merger.validate_shards(tmp_path, 2) == 2


@pytest.mark.parametrize("filename", [".coverage.2", "manifest-2.json"])
def test_missing_shard_data_or_manifest_blocks_coverage(tmp_path, filename):
    write_manifests(tmp_path)
    (tmp_path / filename).unlink()
    with pytest.raises((ValueError, FileNotFoundError)):
        merger.validate_shards(tmp_path, 2)


@pytest.mark.parametrize(
    "field,value",
    [
        ("selected", ["test_a"]),
        ("selected", []),
        ("selected", ["test_b", "test_b"]),
        ("selected", ["unknown"]),
        ("collected", ["test_a"]),
        ("collected", []),
        ("collected", ["test_a", "test_a"]),
        ("count", 3),
        ("shard", 1),
        ("coverage_version", "0.0"),
        ("exit_code", 1),
    ],
)
def test_invalid_or_incomplete_test_partition_blocks_coverage(tmp_path, field, value):
    write_manifests(tmp_path)
    path = tmp_path / "manifest-2.json"
    manifest = json.loads(path.read_text())
    manifest[field] = value
    path.write_text(json.dumps(manifest))
    with pytest.raises(ValueError):
        merger.validate_shards(tmp_path, 2)


def test_unexpected_coverage_shard_blocks_coverage(tmp_path):
    write_manifests(tmp_path)
    (tmp_path / ".coverage.3").touch()
    with pytest.raises(ValueError):
        merger.validate_shards(tmp_path, 2)


@pytest.mark.parametrize("complete,expected", [(True, 0), (False, 1)])
def test_real_branch_coverage_is_enforced_after_union(tmp_path, monkeypatch, complete, expected):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("COVERAGE_FILE", "coverage/.coverage.1")
    output = tmp_path / "coverage"
    output.mkdir()
    write_manifests(output)
    source_dir = tmp_path / "source"
    source_dir.mkdir()
    source = source_dir / "example.py"
    source.write_text("def choose(value):\n    if value:\n        return 1\n    return 0\n")
    config = tmp_path / ".coveragerc"
    config.write_text(f"[run]\nbranch=True\nsource={source_dir}\n[report]\nfail_under=90\n")
    percentages = []
    for index in (1, 2):
        cov = coverage.Coverage(
            config_file=str(config), data_file=str(output / f".coverage.{index}")
        )
        cov.start()
        namespace = {}
        exec(compile(source.read_text(), str(source), "exec"), namespace)
        namespace["choose"](index == 1 or not complete)
        cov.stop()
        cov.save()
        percentages.append(cov.report())
    assert all(percent < 90 for percent in percentages)
    assert merger.combine(output, config, 2) == expected
    assert (output / "backend.xml").exists()


def test_relative_branch_data_merges_across_distinct_runner_checkouts(tmp_path, monkeypatch):
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    write_manifests(artifacts)
    code = "def choose(value):\n    if value:\n        return 1\n    return 0\n"
    for index in (1, 2, 3):
        checkout = tmp_path / f"runner-{index}"
        checkout.mkdir()
        (checkout / "example.py").write_text(code)
        config = checkout / ".coveragerc"
        config.write_text(
            "[run]\nbranch=True\nrelative_files=True\nsource=.\n[report]\nfail_under=90\n"
        )
        monkeypatch.chdir(checkout)
        if index == 3:
            (checkout / "coverage").mkdir()
            assert merger.combine(artifacts, config, 2) == 0
            assert 'filename="example.py"' in (checkout / "coverage/backend.xml").read_text()
            break
        cov = coverage.Coverage(
            config_file=str(config), data_file=str(artifacts / f".coverage.{index}")
        )
        cov.start()
        namespace = {}
        exec(compile(code, str(checkout / "example.py"), "exec"), namespace)
        namespace["choose"](index == 1)
        cov.stop()
        cov.save()
