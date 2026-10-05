import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 2,
  timeout: 45000,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "artifacts/desktop-release-20261005/playwright-report",
        open: "never",
      },
    ],
    ["json", { outputFile: "artifacts/desktop-release-20261005/results.json" }],
  ],
  outputDir: "artifacts/desktop-release-20261005/test-results",
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:4179",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "1280", use: { viewport: { width: 1280, height: 800 } } },
    { name: "1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "1512", use: { viewport: { width: 1512, height: 982 } } },
    { name: "1728", use: { viewport: { width: 1728, height: 1117 } } },
    { name: "1024", use: { viewport: { width: 1024, height: 800 } } },
  ],
});
