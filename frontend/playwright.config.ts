import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { backendPort, backendURL, frontendPort, frontendURL } from "./e2e/urls";

const repositoryRoot = resolve(import.meta.dirname, "..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  workers: 1,
  use: {
    baseURL: frontendURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `node ./scripts/run-powershell.mjs ./scripts/dev-backend.ps1 -NoReload -Port ${backendPort}`,
      cwd: repositoryRoot,
      url: `${backendURL}/api/health/`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      cwd: import.meta.dirname,
      env: { ASSESS_BACKEND_URL: backendURL },
      url: frontendURL,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
