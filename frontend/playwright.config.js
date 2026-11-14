import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

const FRONTEND_URL = "http://127.0.0.1:4173";
// Porta separada do Compose (8080) para o E2E poder rodar com a stack no ar.
const BACKEND_URL = "http://127.0.0.1:8081";

export default defineConfig({
  testDir: "./tests/e2e",
  // Os testes compartilham o mesmo PostgreSQL, então rodam em série.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: [
    {
      // Backend real, com migrations aplicadas. Requer o PostgreSQL de pé
      // (make db-up) e a DATABASE_URL correta.
      command:
        "poetry run alembic upgrade head && poetry run uvicorn app.main:app --host 127.0.0.1 --port 8081",
      cwd: "../backend",
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
      url: FRONTEND_URL,
      reuseExistingServer: !isCI,
      timeout: 120000,
      env: {
        ...process.env,
        VITE_API_URL: BACKEND_URL,
      },
    },
  ],
});
