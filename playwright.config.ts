import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // HTML report includes inline video, screenshots, and traces
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",

    // Record a video for every test. Use "retain-on-failure" to only keep failing ones.
    video: "on",

    // Full trace (timeline, network, DOM snapshots) — viewable in the HTML report
    trace: "on",

    // Screenshot on every test failure
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
