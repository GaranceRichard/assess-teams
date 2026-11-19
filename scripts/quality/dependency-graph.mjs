import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const excluded = new Set([
  "node_modules",
  ".venv",
  "venv",
  ".git",
  ".cache",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  "test-results",
  "playwright-report",
]);

export function sources(root, directories, pattern) {
  const result = new Map();
  function visit(path) {
    const full = join(root, path);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`Source indirecte: ${path}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(full).sort())
        if (!excluded.has(name)) visit(path ? path + "/" + name : name);
    } else if (pattern.test(path)) result.set(path, readFileSync(full, "utf8"));
  }
  for (const directory of directories) visit(directory);
  return result;
}

export function closure(graph, seeds) {
  const reached = new Set();
  const pending = [...seeds];
  while (pending.length) {
    const path = pending.pop();
    if (reached.has(path)) continue;
    reached.add(path);
    pending.push(...(graph.get(path) || []));
  }
  return reached;
}

export function dependents(graph, seeds, includeOpaque = true) {
  const reverse = new Map();
  for (const [consumer, dependencies] of graph)
    for (const dependency of dependencies) {
      if (!reverse.has(dependency)) reverse.set(dependency, new Set());
      reverse.get(dependency).add(consumer);
    }
  return closure(reverse, [...seeds, ...(includeOpaque ? ["*"] : [])]);
}

export const sorted = (values) => [...new Set(values)].sort();

// Compare route templates, not arbitrary substrings or directory proximity.
export function sameEndpoint(left, right) {
  const parts = (value) =>
    value
      .replace(/\$\{[^}]*\}|<[^>]*>|\{[^}]*\}/g, "*")
      .split("?")[0]
      .replace(/^\//, "")
      .split("/")
      .filter(Boolean);
  const a = parts(left),
    b = parts(right);
  let index = 0;
  while (index < a.length && index < b.length) {
    if (
      (a[index] === "*" && index === a.length - 1) ||
      (b[index] === "*" && index === b.length - 1)
    )
      return true;
    if (a[index] !== b[index] && a[index] !== "*" && b[index] !== "*")
      return false;
    index++;
  }
  return (
    a.slice(index).every((part) => part === "*") &&
    b.slice(index).every((part) => part === "*")
  );
}
