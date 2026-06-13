import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: browser (host) → Vite front (host:5173) → Symfony API (Docker, port 80, test env).
 * global-setup starts the backend in test env and seeds the app_test database (fixtures).
 *
 * workers=1: tests share the seeded test database, so they run serially to avoid
 * races (the password-reset test mutates a user).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
