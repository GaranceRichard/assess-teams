import { defineConfig, devices } from "@playwright/test";
import { e2ePort } from "./e2e/port";

const port = e2ePort(process.env.ASSESS_E2E_DEMO_PORT, 4175);
const baseURL = `http://127.0.0.1:${port}/assess-teams/`;

export default defineConfig({
  testDir: "./demo-e2e",
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "demo-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run preview:demo -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
});
