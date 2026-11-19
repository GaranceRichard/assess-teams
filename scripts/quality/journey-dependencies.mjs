import {
  closure,
  dependents,
  sorted,
  sameEndpoint,
} from "./dependency-graph.mjs";

const shell = "frontend/src/ProductShell.tsx";
const demo = "frontend/src/demo/DemoApp.tsx";

function routeTable(frontend) {
  const navigation = frontend.sources.get("frontend/src/navigation.ts") || "";
  const routes = [
    ...navigation.matchAll(
      /path:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g,
    ),
  ].map(([, path, title]) => ({ path, title, app: [], demo: [] }));
  for (const [file, mode] of [
    [shell, "app"],
    [demo, "demo"],
  ]) {
    const source = frontend.sources.get(file) || "";
    for (const [, path, name] of source.matchAll(
      /path\s*===\s*["']([^"']+)["'][^?]*\?\s*\(\s*<([A-Z]\w*)/g,
    )) {
      const route = routes.find((item) => item.path === path);
      const dependency = frontend.bindings.get(file)?.get(name);
      if (route && dependency) route[mode].push(dependency);
    }
  }
  const preview = frontend.bindings.get(demo)?.get("DemoPreview");
  for (const route of routes)
    if (!route.demo.length)
      route.demo =
        route.path === "/dashboard" ? route.app : [preview].filter(Boolean);
  return routes;
}

export function journeySelection(frontend, paths, endpoints = []) {
  const routes = routeTable(frontend);
  if (!routes.length || routes.some((route) => !route.app.length))
    return { e2e: ["*"], demo: true, reason: "Registre React non resolu" };
  const affected = dependents(frontend.graph, paths);
  const roots = new Set(paths);
  const common = [shell, demo, "frontend/src/App.tsx", "frontend/src/main.tsx"];
  const directCommon = common.some((path) => roots.has(path));
  const routePaths = (mode) =>
    routes.filter(
      (route) =>
        directCommon ||
        route[mode].some((page) =>
          [...closure(frontend.graph, [page])].some((path) => roots.has(path)),
        ),
    );
  const selected = {};
  for (const [mode, directory, field] of [
    ["app", "frontend/e2e/", "e2e"],
    ["demo", "frontend/demo-e2e/", "demoTests"],
  ]) {
    const reachedRoutes = routePaths(mode);
    const unknownBoundary = !reachedRoutes.length && paths.length > 0;
    selected[field] = [];
    for (const [path] of frontend.sources) {
      if (!path.startsWith(directory) || !path.endsWith(".spec.ts")) continue;
      const consumed = closure(frontend.graph, [path]);
      const text = [...consumed]
        .map((file) => frontend.sources.get(file) || "")
        .join("\n")
        .replace(/\\u([\da-f]{4})/gi, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16)),
        );
      const normalized = text.toLowerCase().replaceAll("\\/", "/");
      const links = [
        ...normalized.matchAll(
          /getbyrole\(\s*["']link["'][\s\S]{0,220}?(?:\}\)|\}\s*\))/g,
        ),
      ].map((match) => match[0]);
      const known = routes.filter((route) => {
        const escaped = route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const literal = new RegExp(
          "[\"'\x60](?:\\./)?#?" + escaped + "(?=[/?#\"'\x60])",
        );
        return (
          literal.test(normalized) ||
          links.some((link) => link.includes(route.title.toLowerCase()))
        );
      });
      if (
        /\.goto\(\s*["'](?:\/|\.\/?|\.\/dashboard|\/dashboard)["']/.test(text)
      )
        known.push(routes.find((route) => route.path === "/dashboard"));
      const unresolvedLink =
        links.some(
          (link) =>
            !routes.some((route) => link.includes(route.title.toLowerCase())),
        ) || /getbyrole\(\s*["']link["']\s*\)/.test(normalized);
      const dynamic =
        [...consumed].some((file) => frontend.opaque.has(file)) ||
        /\.goto\(\s*[^"'\s]/.test(text) ||
        unresolvedLink;
      const directAPI = endpoints.some((endpoint) =>
        [...text.matchAll(/["'`](\/api\/[^"'`\s]*)/g)].some((match) =>
          sameEndpoint(endpoint, match[1]),
        ),
      );
      if (
        directCommon ||
        unknownBoundary ||
        affected.has(path) ||
        directAPI ||
        dynamic ||
        !known.length ||
        reachedRoutes.some(
          (route) => known.includes(route) || route.path === "/dashboard",
        )
      )
        selected[field].push(path);
    }
    selected[field] = sorted(selected[field]);
  }
  if (!selected.e2e.length && !selected.demoTests.length)
    return { e2e: ["*"], demo: true, reason: "Aucun parcours prouve" };
  return { ...selected, demo: false };
}
