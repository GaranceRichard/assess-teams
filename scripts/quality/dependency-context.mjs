import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { frontendDependencies } from "./frontend-dependencies.mjs";

export const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

export function dependencyContext(root = repositoryRoot) {
  const cached = {};
  const load = (name, compute) => {
    if (!(name in cached)) {
      try {
        cached[name] = compute();
      } catch (error) {
        cached[name] = { error: error.message };
      }
    }
    return cached[name];
  };
  return {
    root,
    frontend: () => load("frontend", () => frontendDependencies(root)),
    backend: () =>
      load("backend", () => {
        const localPython = resolve(
          root,
          "backend/.venv",
          process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
        );
        const result = JSON.parse(
          execFileSync(
            existsSync(localPython) ? localPython : "python",
            [
              fileURLToPath(
                new URL("./backend_dependencies.py", import.meta.url),
              ),
              root,
            ],
            {
              cwd: root,
              encoding: "utf8",
              stdio: ["ignore", "pipe", "pipe"],
              maxBuffer: 16 * 1024 * 1024,
            },
          ),
        );
        return {
          ...result,
          graph: new Map(
            Object.entries(result.graph).map(([path, dependencies]) => [
              path,
              new Set(dependencies),
            ]),
          ),
        };
      }),
  };
}
