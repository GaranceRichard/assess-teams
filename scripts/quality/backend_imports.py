"""Local imports, module-string consumers and management command references."""

import ast
import re

from backend_routes import text


def connect_imports(tree, module, path, modules, graph, commands):
    def depend(target):
        parts = target.split(".")
        for size in range(len(parts), 0, -1):
            candidate = ".".join(parts[:size])
            if candidate in modules:
                symbol = modules[candidate] + "#" + ".".join(parts[size:])
                graph[path].add(symbol if symbol in graph else modules[candidate])
                break
        for size in range(1, len(parts)):
            init = modules.get(".".join(parts[:size]), "")
            if init.endswith("/__init__.py"):
                graph[path].add(init)

    def explicit(target):
        if target.split(".")[0] in modules and target not in modules:
            graph[path].add("*")
        depend(target)

    for node in ast.walk(tree):
        if isinstance(node, ast.Import) and any(
            alias.name == "importlib" for alias in node.names
        ):
            graph[path].add("*")
        if isinstance(node, ast.ImportFrom) and node.module == "importlib":
            graph[path].add("*")
        if isinstance(node, ast.Import):
            for alias in node.names:
                explicit(alias.name)
                if alias.name in modules:
                    graph[path].update(
                        key
                        for key in graph
                        if key.startswith(modules[alias.name] + "#")
                    )
        if isinstance(node, ast.ImportFrom):
            package = (
                module if path.endswith("/__init__.py") else module.rsplit(".", 1)[0]
            )
            prefix = node.module or ""
            if node.level:
                parents = package.split(".")
                prefix = ".".join(
                    parents[: len(parents) - node.level + 1] + [prefix]
                ).strip(".")
            explicit(prefix)
            for alias in node.names:
                depend(prefix + "." + alias.name)
                if alias.name == "*" and prefix in modules:
                    graph[path].update(
                        key for key in graph if key.startswith(modules[prefix] + "#")
                    )
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            for target in re.findall(r"\b[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)+", node.value):
                depend(target)
            if node.value in commands:
                graph[path].add(commands[node.value])
        if isinstance(node, ast.Call):
            name = getattr(node.func, "id", getattr(node.func, "attr", ""))
            value = text(node.args[0]) if node.args else None
            if name == "call_command" and value is None:
                graph[path].update(commands.values())
            if name in {"__import__", "import_module"}:
                if value:
                    explicit(value)
                else:
                    graph[path].add("*")
            if name in {"spec_from_file_location", "eval", "exec"}:
                graph[path].add("*")
