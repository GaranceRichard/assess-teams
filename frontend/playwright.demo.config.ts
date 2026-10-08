import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./demo-e2e",
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4175/assess-teams/",
    trace: "retain-on-failure",
  },
  projects: [{ name: "demo-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview:demo",
    url: "http://127.0.0.1:4175/assess-teams/",
    reuseExistingServer: false,
  },
});
