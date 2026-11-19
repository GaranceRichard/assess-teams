"""Respect pytest fixture visibility instead of making module autouse global."""

import ast
from pathlib import PurePosixPath

from backend_routes import text


def connect_fixtures(trees, modules, graph):
    fixtures, autouse = {}, set()
    for module, tree in trees.items():
        path = modules[module]
        fixture_names = {"fixture"} | {
            alias.asname or alias.name
            for node in ast.walk(tree)
            if isinstance(node, ast.ImportFrom) and node.module == "pytest"
            for alias in node.names
            if alias.name == "fixture"
        }
        decorators = {
            id(decorator)
            for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            for decorator in node.decorator_list
        }
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and any(
                isinstance(target, ast.Name) and target.id == "pytest_plugins"
                for target in node.targets
            ):
                raise ValueError("Plugin pytest non borne")
            if (
                path.endswith("conftest.py")
                and isinstance(node, ast.FunctionDef)
                and node.name.startswith("pytest_")
            ):
                raise ValueError("Hook pytest non borne")
            if (
                isinstance(node, ast.Call)
                and getattr(node.func, "attr", getattr(node.func, "id", ""))
                in fixture_names
                and id(node) not in decorators
            ):
                raise ValueError("Fabrique de fixture non bornee")
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for decorator in node.decorator_list:
                call = decorator if isinstance(decorator, ast.Call) else None
                name = call.func if call else decorator
                if getattr(name, "attr", getattr(name, "id", "")) not in fixture_names:
                    continue
                fixture_name = node.name
                for kw in call.keywords if call else []:
                    if kw.arg == "autouse" and not isinstance(kw.value, ast.Constant):
                        raise ValueError("Autouse dynamique non borne")
                    if kw.arg == "name":
                        fixture_name = text(kw.value)
                        if fixture_name is None:
                            raise ValueError("Nom de fixture dynamique")
                    if (
                        kw.arg == "autouse"
                        and isinstance(kw.value, ast.Constant)
                        and kw.value.value
                    ):
                        autouse.add(
                            path + "#" + node.name
                            if path + "#" + node.name in graph
                            else path
                        )
                fixture_path = (
                    path + "#" + node.name if path + "#" + node.name in graph else path
                )
                fixtures.setdefault(fixture_name, set()).add(fixture_path)

    def reachable(seeds):
        reached, pending = set(), list(seeds)
        while pending:
            item = pending.pop()
            if item not in reached:
                reached.add(item)
                pending.extend(graph.get(item, set()) - reached)
        return reached

    for module, tree in trees.items():
        path = modules[module]
        if not path.startswith("tests/"):
            continue
        registries = [
            item
            for item in graph
            if item.endswith("conftest.py")
            and path.startswith(PurePosixPath(item).parent.as_posix() + "/")
        ]
        visible = reachable([path, *registries])
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                graph[path].update(fixtures.get(node.value, set()) & visible)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for arg in node.args.args + node.args.kwonlyargs:
                    graph[path].update(fixtures.get(arg.arg, set()) & visible)
        if PurePosixPath(path).name.startswith("test_"):
            graph[path].update(autouse & visible)
