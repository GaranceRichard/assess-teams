"""Inventory real Python imports, routes and fixtures without executing product code."""

import ast
import json
import sys
from pathlib import Path

from backend_boundaries import boundaries
from backend_fixtures import connect_fixtures
from backend_imports import connect_imports
from backend_routes import route_dependencies, route_table
from backend_test_symbols import test_symbols

EXCLUDED = {".venv", "venv", "__pycache__", ".cache", "coverage"}


def analyse(root):
    base = Path(root) / "backend"
    files = {
        path.relative_to(base).as_posix(): path
        for path in base.rglob("*.py")
        if not any(part in EXCLUDED for part in path.relative_to(base).parts)
    }
    if any(path.is_symlink() for path in files.values()):
        raise ValueError("Module Python indirect")
    modules = {
        path.removesuffix(".py").replace("/", ".").removesuffix(".__init__"): path
        for path in files
    }
    trees = {
        module: ast.parse(files[path].read_text(encoding="utf-8-sig"), filename=path)
        for module, path in modules.items()
    }
    routes = route_table(trees)
    graph = {path: set() for path in files}
    route_trees, functions = test_symbols(trees, modules, graph)
    commands = {
        module.rsplit(".", 1)[-1]: path
        for module, path in modules.items()
        if ".management.commands." in module
    }
    for module, tree in trees.items():
        path = modules[module]
        connect_imports(tree, module, path, modules, graph, commands)
        graph[path].update(
            modules[item]
            for item in route_dependencies(
                route_trees[module], routes, path.startswith("tests/")
            )
            if item in modules
        )
        if "/admin/" in ast.unparse(tree):
            graph[path].update(item for item in files if item.endswith("/admin.py"))
    for key, (module, tree) in functions.items():
        connect_imports(tree, module, key, modules, graph, commands)
        graph[key].update(
            modules[item]
            for item in route_dependencies(tree, routes, True)
            if item in modules
        )
    connect_fixtures(trees, modules, graph)
    # Registers establish named relations above; they do not execute all consumers.
    for module, path in modules.items():
        if module.endswith((".urls", "_urls")) or path.endswith("conftest.py"):
            graph[path] = set()
    return {
        **boundaries(trees, modules),
        "caseFiles": [
            "backend/" + modules[module]
            for module, tree in trees.items()
            if any(
                isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
                and node.name.startswith("test_")
                for node in ast.walk(tree)
            )
        ],
        "graph": {
            "backend/" + path: sorted(
                "backend/" + item if item != "*" else "*" for item in dependencies
            )
            for path, dependencies in graph.items()
        },
        "routes": [
            {**route, "file": "backend/" + modules[route["module"]]}
            for route in routes
            if route["module"] in modules
        ],
        "modules": {"backend/" + path: module for module, path in modules.items()},
    }


if __name__ == "__main__":
    print(json.dumps(analyse(sys.argv[1])))
