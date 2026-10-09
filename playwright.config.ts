import { defineConfig, devices } from '@playwright/test';

/**
 * Testes end-to-end (navegador real) — complementam o Vitest (lógica).
 * Arrancam o dev server sozinhos (vite, porta 3000).
 *
 * `channel: 'msedge'` usa o Microsoft Edge já instalado no Windows —
 * não é preciso descarregar browsers do Playwright.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'msedge',
    trace: 'on-first-retry',
    reducedMotion: 'reduce'
  },
  projects: [{ name: 'msedge', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
