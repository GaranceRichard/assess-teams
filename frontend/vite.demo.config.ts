import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import config from "./vite.config.ts";

// Only this build replaces the production adapters; the application build is unchanged.
const adapters = [
  "auth",
  "dashboard",
  "evaluationRuns",
  "results",
  "steering",
  "productHref",
];
const demoConfig = mergeConfig(config, {
  base: process.env.DEMO_BASE ?? "/assess-teams/",
  resolve: {
    alias: adapters.map((name) => ({
      find: new RegExp("^\\./" + name + "$"),
      replacement: fileURLToPath(
        new URL("./src/demo/" + name + ".ts", import.meta.url),
      ),
    })),
  },
  plugins: [
    {
      name: "demo-entry",
      transformIndexHtml: {
        order: "pre",
        handler(html: string) {
          return html.replace("/src/main.tsx", "/src/demo/main.tsx");
        },
      },
    },
  ],
  build: { outDir: "../build/demo", emptyOutDir: true },
});

// A demo dev server also has no backend proxy.
demoConfig.server = { ...demoConfig.server, proxy: undefined };
export default demoConfig;
