"""Portable component checks; real candidate integration is a separate local run."""

import contextlib
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from package_common import digest, inventory, safe_path, scan
from package_components import component_inventory
from package_sources import assert_source, commands, git, source_blobs, source_paths
from python_wheelhouse import verify as verify_wheels


class PackageComponentTests(unittest.TestCase):
    def test_source_contains_production_schema_migrations_and_all_commands(self):
        sha = git("rev-parse", "HEAD").strip()
        paths = source_paths(sha)
        self.assertIn("backend/config/installation.schema.json", paths)
        self.assertTrue(any("/migrations/" in p for p in paths))
        self.assertEqual(len(commands(paths)), 4)
        self.assertFalse(any("/tests/" in p or "development" in p for p in paths))
        with tempfile.TemporaryDirectory() as temporary:
            for name, data in source_blobs(sha).items():
                target = Path(temporary) / "source"
                target.write_bytes(data)
                scan(target, name)

    def test_new_delivered_operation_is_discovered_without_new_service(self):
        names = [
            "backend/config/wsgi.py",
            "backend/config/installation.schema.json",
            "scripts/operations/future-delivered.ps1",
        ]
        with patch("package_sources.git", return_value="\n".join(names)):
            self.assertIn(names[-1], source_paths("a" * 40))
        command = "backend/example/management/commands/future_delivered.py"
        self.assertEqual(commands([command]), [command])

    def test_unclassified_resource_is_refused(self):
        names = (
            "backend/config/wsgi.py\nbackend/config/installation.schema.json\n"
            "backend/real-data.csv"
        )
        with (
            patch("package_sources.git", return_value=names),
            self.assertRaisesRegex(ValueError, "Unclassified"),
        ):
            source_paths("a" * 40)

    def test_path_traversals_are_refused(self):
        for name in ("../file", "/file", "C:/file", "a\\b", "a//b", "a/./b"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                safe_path(name)

    def test_inventory_detects_real_altered_or_missing_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / "file"
            path.write_bytes(b"original")
            original = inventory(root)
            path.write_bytes(b"modified")
            self.assertNotEqual(original, inventory(root))
            path.unlink()
            self.assertNotEqual(original, inventory(root))

    def test_private_file_and_realistic_secret_content_refused(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "fixture"
            path.write_text("public")
            with self.assertRaisesRegex(ValueError, "Private"):
                scan(path, "backend/.env.production")
            path.write_text("gh" + "p_" + "A" * 35)
            with self.assertRaisesRegex(ValueError, "secret"):
                scan(path, "backend/config/unsafe.py")

    def test_original_legal_metadata_and_public_ui_labels_are_not_secrets(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "fixture"
            path.write_text('label("Password:"),code(" ****** ")')
            scan(path, "web/static/swagger-ui/swagger-ui-bundle.js")
            path.write_text('{"license": "MIT"}')
            scan(path, "web/static/swagger-ui/legal/node_modules_format/package.json")
            with self.assertRaisesRegex(ValueError, "metadata"):
                scan(path, "backend/package.json")
            path.write_text('{"password": "' + "test-only-value" + '"}')
            with self.assertRaisesRegex(ValueError, "secret"):
                scan(path, "documentation/unsafe.txt")

    def test_missing_source_identity_refused(self):
        with self.assertRaisesRegex(ValueError, "Full source SHA"):
            assert_source("HEAD")

    def test_dirty_source_refused_before_output(self):
        with (
            patch(
                "package_sources.git", side_effect=["a" * 40, " M backend/manage.py"]
            ),
            self.assertRaisesRegex(ValueError, "Uncommitted"),
        ):
            assert_source("a" * 40)

    def test_exact_fifteen_wheels_feed_component_provenance(self):
        with contextlib.redirect_stdout(io.StringIO()):
            wheels = verify_wheels()
        web = {"version": "0.0.0", "swagger": {"version": "5.35.0"}}
        components = component_inventory(
            web, wheels, {"version": "2.11.9", "origins": []}
        )
        self.assertEqual(len(components), 19)
        self.assertEqual(
            sum(
                c.get("destination", "").startswith("python/")
                for c in components
                if c.get("destination")
            ),
            15,
        )
        self.assertEqual(
            digest(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        )


if __name__ == "__main__":
    unittest.main()
