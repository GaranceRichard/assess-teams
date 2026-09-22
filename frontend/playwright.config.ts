import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

const repositoryRoot = resolve(import.meta.dirname, "..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5180",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "node ./scripts/run-powershell.mjs ./scripts/dev-backend.ps1 -NoReload -Port 8100",
      cwd: repositoryRoot,
      url: "http://127.0.0.1:8100/api/health/",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5180",
      cwd: import.meta.dirname,
      env: { ASSESS_BACKEND_URL: "http://127.0.0.1:8100" },
      url: "http://127.0.0.1:5180",
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
