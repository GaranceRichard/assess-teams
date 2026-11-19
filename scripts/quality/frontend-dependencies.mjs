import { existsSync } from "node:fs";
import { posix, resolve } from "node:path";
import { sources } from "./dependency-graph.mjs";

function stylesheetConsumers(files, graph) {
  const globalStyles = new Set();
  for (const [path, source] of files) {
    if (!path.endsWith(".css")) continue;
    const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
    const roots = [];
    let global = /@(?!media\b|supports\b)|:root|:global|:has\(|url\s*\(/i.test(
      css,
    );
    for (const [, rule] of css.matchAll(/([^{}]+)\{/g)) {
      if (/^\s*@(media|supports)\b/.test(rule)) continue;
      for (const selector of rule.split(",")) {
        const root = /^\s*\.([\w-]+)(.*)$/.exec(selector);
        if (!root || /^[^\s>]*\s*[+~]/.test(root[2])) global = true;
        else roots.push(root[1]);
      }
    }
    const consumers = [...files]
      .filter(
        ([file, text]) =>
          file.startsWith("frontend/src/") &&
          !file.endsWith(".css") &&
          !/\.test\./.test(file) &&
          roots.some((token) => text.includes(token)),
      )
      .map(([file]) => file);
    if (!roots.length || !consumers.length) global = true;
    if (global) globalStyles.add(path);
    for (const [file] of files)
      if (
        (global && file.startsWith("frontend/src/") && file.endsWith(".tsx")) ||
        consumers.includes(file) ||
        (file.startsWith("frontend/src/") &&
          /className=\{\s*[a-zA-Z_$][\w$]*(?:\s*\}|\s*\+)/.test(
            files.get(file),
          ))
      )
        graph.get(file).add(path);
  }
  return globalStyles;
}

export function frontendDependencies(root) {
  const files = sources(
    root,
    ["frontend/src", "frontend/e2e", "frontend/demo-e2e"],
    /\.(tsx?|[cm]?js|css)$/,
  );
  const graph = new Map(),
    bindings = new Map(),
    opaque = new Set();
  const candidates = (path) => [
    path,
    ...[".ts", ".tsx", ".js", ".mjs", ".css", "/index.ts", "/index.tsx"].map(
      (suffix) => path + suffix,
    ),
  ];
  const local = (path, specifier) => {
    if (!specifier.startsWith(".")) return null;
    const base = posix.normalize(posix.join(posix.dirname(path), specifier));
    const found = candidates(base).find((item) =>
      existsSync(resolve(root, item)),
    );
    if (!found || base.startsWith("../")) opaque.add(path);
    return found;
  };
  for (const [path, source] of files) {
    const dependencies = new Set(),
      names = new Map();
    const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const match of text.matchAll(
      /\b(?:from\s*|import\s*(?:\(\s*)?|(?:mock|doMock)\s*\(\s*|@import\s*)(["'])([^"'\n]+)\1/g,
    )) {
      const dependency = local(path, match[2]);
      if (dependency) dependencies.add(dependency);
    }
    for (const match of text.matchAll(
      /\bimport\s+([^;]*?)\s+from\s*["']([^"']+)["']/g,
    )) {
      const dependency = local(path, match[2]);
      if (!dependency) continue;
      for (const token of match[1].replace(/[{}]/g, "").split(",")) {
        const name = token
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .at(-1);
        if (/^[A-Za-z_$][\w$]*$/.test(name)) names.set(name, dependency);
      }
    }
    let dynamic = /\b(?:require|eval|Function)\s*\(/.test(text);
    for (const [, expression] of text.matchAll(
      /\bimport\s*\(\s*([^"'\s][^)]*)\)/g,
    )) {
      const name = expression.trim();
      const constant =
        /^[A-Za-z_$][\w$]*$/.test(name) &&
        new RegExp("\\bconst\\s+" + name + "\\s*=\\s*[\"']([^\"']+)[\"']").exec(
          text,
        );
      if (!constant) dynamic = true;
      else if (!constant[1].startsWith("/node_modules/")) {
        const dependency = local(path, constant[1]);
        if (dependency) dependencies.add(dependency);
        else dynamic = true;
      }
    }
    if (dynamic) opaque.add(path);
    graph.set(path, dependencies);
    bindings.set(path, names);
  }
  const globalStyles = stylesheetConsumers(files, graph);
  for (const path of opaque) graph.get(path).add("*");
  const caseFiles = new Set(
    [...files]
      .filter(
        ([path, text]) =>
          /\.test\.tsx?$/.test(path) &&
          /\b(it|test)\s*(\(|\.(each|for)\b)/.test(text),
      )
      .map(([path]) => path),
  );
  return {
    sources: files,
    graph,
    bindings,
    opaque,
    globalStyles,
    caseFiles,
    root,
  };
}
