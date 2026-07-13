import { devices, type PlaywrightTestConfig } from '@playwright/test';

export type CreatePlaywrightConfigOptions = {
  /** Port the dev server listens on and Playwright targets. */
  port: number;
  /** Host the dev server binds to. Defaults to '127.0.0.1'. */
  host?: string;
  /** Command that boots the server under test. Defaults to serving the production build via `wrangler dev`. */
  webServerCommand?: string;
  /** Root Playwright scans for spec files. Defaults to './src'. */
  testDir?: string;
  /** Glob(s) matched against testDir to find spec files. Defaults to `__e2e__` specs. */
  testMatch?: string | string[];
  /** Glob(s) excluded from the spec search. Defaults to unit-test dirs. */
  testIgnore?: string | string[];
};

export const createPlaywrightConfig = ({
  port,
  host = '127.0.0.1',
  webServerCommand,
  testDir = './src',
  testMatch = ['**/__e2e__/**/*.spec.ts'],
  testIgnore = ['**/__tests__/**'],
}: CreatePlaywrightConfigOptions): PlaywrightTestConfig => {
  const baseURL = `http://${host}:${port}`;

  return {
    testDir,
    testMatch,
    testIgnore,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'html',
    use: {
      baseURL,
      trace: 'on-first-retry',
    },
    webServer: {
      command:
        webServerCommand ??
        `pnpm exec wrangler dev --ip ${host} --port ${port} --show-interactive-dev-session=false`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  };
};
