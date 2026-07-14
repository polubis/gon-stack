import { test as base, type Locator } from '@playwright/test';

/**
 * Builds a `test` bound to an app's `data-e2e` id union, so `getByE2e` only
 * accepts ids that are actually declared for that app — a typo or a
 * renamed/removed id fails to compile instead of failing silently at
 * runtime. Relies on `testIdAttribute: 'data-e2e'` (set by
 * `createPlaywrightConfig`), so this is a thin, typed wrapper over
 * Playwright's own `page.getByTestId`.
 */
export const createE2eTest = <TId extends string>() =>
  base.extend<{ getByE2e: (id: TId) => Locator }>({
    getByE2e: async ({ page }, use) => {
      await use((id) => page.getByTestId(id));
    },
  });
