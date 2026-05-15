import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  globalSetup: require.resolve('./global-setup'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'http://localhost:4200',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'pnpm exec nx serve api',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env['CI'],
      env: {
        DATABASE_URL: process.env['DATABASE_URL_TEST'] ?? process.env['DATABASE_URL'] ?? '',
        JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'] ?? '',
        NODE_ENV: 'test',
        PORT: '3000',
        CORS_ORIGIN: 'http://localhost:4200',
      },
    },
    {
      command: 'pnpm exec nx serve web',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
