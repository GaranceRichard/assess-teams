"""Function consumers for test helpers; namespace/star imports remain conservative."""

import ast
from pathlib import PurePosixPath


def test_symbols(trees, modules, graph):
    route_trees = dict(trees)
    functions = {}
    for module, tree in trees.items():
        path = modules[module]
        if not path.startswith("tests/") or PurePosixPath(path).name.startswith(
            "test_"
        ):
            continue
        if path.endswith("conftest.py"):
            continue
        definitions = {
            node.name: node
            for node in tree.body
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        }
        if not definitions:
            continue
        keys = {name: path + "#" + name for name in definitions}
        for name, node in definitions.items():
            key = keys[name]
            graph[key] = {path}
            functions[key] = (module, ast.Module(body=[node], type_ignores=[]))
        route_trees[module] = ast.Module(
            body=[node for node in tree.body if node not in definitions.values()],
            type_ignores=[],
        )
        for key, (_, function_tree) in list(functions.items()):
            if not key.startswith(path + "#"):
                continue
            graph[key].update(
                keys[node.id]
                for node in ast.walk(function_tree)
                if isinstance(node, ast.Name) and node.id in keys
            )
        graph[path].update(
            keys[node.id]
            for node in ast.walk(route_trees[module])
            if isinstance(node, ast.Name) and node.id in keys
        )
    return route_trees, functions
