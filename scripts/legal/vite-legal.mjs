import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { collectNpm, renderNotices } from "./npm-notices.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function legalAssets(frontendRoot = resolve(root, "frontend")) {
  return new Map([
    [
      "index.html",
      readFileSync(resolve(root, "scripts/legal/page.html"), "utf8"),
    ],
    ["LICENSE.txt", readFileSync(resolve(root, "LICENSE"), "utf8")],
    ["NOTICE.txt", readFileSync(resolve(root, "NOTICE"), "utf8")],
    [
      "redistribution.txt",
      readFileSync(resolve(root, "docs/legal/redistribution.md"), "utf8"),
    ],
    [
      "INVENTORY.txt",
      readFileSync(resolve(root, "docs/legal/third-party.md"), "utf8"),
    ],
    ["THIRD-PARTY.txt", renderNotices(collectNpm(frontendRoot))],
  ]);
}

export function legalNotices(frontendRoot) {
  return {
    name: "assess-teams-legal-notices",
    generateBundle() {
      for (const [name, source] of legalAssets(frontendRoot)) {
        this.emitFile({ type: "asset", fileName: `legal/${name}`, source });
      }
    },
    configureServer(server) {
      const assets = legalAssets(frontendRoot);
      server.middlewares.use((request, response, next) => {
        const base = server.config.base;
        const path = (request.url ?? "").split("?")[0];
        if (!path.startsWith(`${base}legal/`)) return next();
        const name = path.slice(`${base}legal/`.length);
        const source = assets.get(name);
        if (!source) {
          response.statusCode = 404;
          response.end();
          return;
        }
        if (!["GET", "HEAD"].includes(request.method)) {
          response.statusCode = 405;
          response.setHeader("Allow", "GET, HEAD");
          response.end();
          return;
        }
        response.setHeader(
          "Content-Type",
          name.endsWith(".html")
            ? "text/html; charset=utf-8"
            : "text/plain; charset=utf-8",
        );
        response.end(request.method === "HEAD" ? undefined : source);
      });
    },
  };
}
