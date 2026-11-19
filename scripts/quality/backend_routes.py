"""Static Django route relations; never import or execute application modules."""

import ast
import fnmatch
import re


def text(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.JoinedStr):
        return "".join(text(part) or "*" for part in node.values)
    return None


def same_endpoint(left, right):
    def parts(value):
        value = re.sub(r"<[^>]*>|\{[^}]*\}", "*", value)
        return value.split("?")[0].strip("/").split("/")

    a, b = parts(left), parts(right)
    return len(a) == len(b) and all(x == y or "*" in (x, y) for x, y in zip(a, b))


def route_table(trees):
    routes = []
    for module, tree in trees.items():
        if not (module.endswith((".urls", "_urls"))):
            continue
        imports = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module:
                for alias in node.names:
                    imports[alias.asname or alias.name] = node.module
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Name):
                continue
            if node.func.id == "re_path":
                raise ValueError("Route regex non bornee")
            if node.func.id != "path" or len(node.args) < 2:
                continue
            path = text(node.args[0])
            if path is None:
                raise ValueError("Route Django dynamique non bornee")
            view = node.args[1]
            if (
                isinstance(view, ast.Call)
                and isinstance(view.func, ast.Name)
                and view.func.id == "include"
            ):
                if path:
                    raise ValueError("Prefixe include non audite")
                continue
            name = next(
                (text(kw.value) for kw in node.keywords if kw.arg == "name"), None
            )
            owner = imports.get(view.id) if isinstance(view, ast.Name) else None
            if (
                isinstance(view, ast.Call)
                and isinstance(view.func, ast.Attribute)
                and isinstance(view.func.value, ast.Name)
            ):
                owner = imports.get(view.func.value.id)
            if path.startswith("api/") and owner is None:
                raise ValueError("Vue API dynamique non bornee")
            routes.append({"path": "/" + path, "name": name, "module": owner})
    return routes


def route_dependencies(tree, routes, test=False):
    values = (
        [value for node in ast.walk(tree) if (value := text(node)) is not None]
        if test
        else [
            text(node.args[0])
            for node in ast.walk(tree)
            if isinstance(node, ast.Call)
            and node.args
            and (
                getattr(node.func, "id", "") == "reverse"
                or getattr(node.func, "attr", "") == "reverse"
            )
            and text(node.args[0]) is not None
        ]
    )
    modules = set()
    local_views = {route["module"] for route in routes if route["module"]}
    for value in values:
        if value in ("schema", "swagger-ui") or value.startswith(
            ("/api/schema/", "/api/docs/")
        ):
            modules.update(local_views)
        for route in routes:
            if route["module"] and (
                (route["name"] and fnmatch.fnmatchcase(route["name"], value))
                or (value.startswith("/api/") and same_endpoint(route["path"], value))
            ):
                modules.add(route["module"])
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        name = (
            node.func.id
            if isinstance(node.func, ast.Name)
            else getattr(node.func, "attr", "")
        )
        if name == "reverse" and (not node.args or text(node.args[0]) is None):
            modules.update(local_views)
    return modules
