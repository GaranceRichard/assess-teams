"""Conservative persistence and the reviewed notification callback boundary."""

import ast

MUTATIONS = {
    "save",
    "update",
    "delete",
    "create",
    "get_or_create",
    "update_or_create",
    "bulk_create",
    "bulk_update",
    "execute",
    "executemany",
    "set",
    "add",
    "remove",
}


def boundaries(trees, modules):
    writes, detached = [], []
    for module, tree in trees.items():
        path = modules[module]
        if not path.startswith("tests/") and any(
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr in MUTATIONS
            for node in ast.walk(tree)
        ):
            writes.append("backend/" + path)
        if module != "notifications.queue":
            continue
        uses = [
            node
            for node in ast.walk(tree)
            if isinstance(node, ast.Name) and node.id == "deliver_email"
        ]
        callbacks = [
            node
            for node in ast.walk(tree)
            if isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "on_commit"
            and node.args
            and isinstance(node.args[0], ast.Lambda)
            and isinstance(node.args[0].body, ast.Call)
            and isinstance(node.args[0].body.func, ast.Name)
            and node.args[0].body.func.id == "deliver_email"
            and any(
                kw.arg == "robust"
                and isinstance(kw.value, ast.Constant)
                and kw.value.value is True
                for kw in node.keywords
            )
        ]
        if len(uses) == 1 and len(callbacks) == 1:
            detached.append(["backend/" + path, "backend/notifications/delivery.py"])
    return {"writes": writes, "detached": detached}
