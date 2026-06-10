import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev -- --mode e2e-harness --port 5173',
    url: 'http://localhost:5173/e2e/harness.html',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
