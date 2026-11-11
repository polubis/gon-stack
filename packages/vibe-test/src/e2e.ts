import { test as base, type Locator, type Page } from '@playwright/test';

/** Context every interpreter command receives: `interpreter(commands, e2e)`. */
export type E2eContext<TId extends string> = {
  page: Page;
  getByE2e: (id: TId, scope?: Page | Locator) => Locator;
  getByE2ePrefix: <TPrefix extends string>(
    prefix: `${TPrefix}${string}` extends TId ? TPrefix : never,
    scope?: Page | Locator,
  ) => Locator;
};

/**
 * Builds a `test` bound to an app's `data-e2e` id union, so `getByE2e` only
 * accepts ids that are actually declared for that app — a typo or a
 * renamed/removed id fails to compile instead of failing silently at
 * runtime. Relies on `testIdAttribute: 'data-e2e'` (set by
 * `createPlaywrightConfig`), so this is a thin, typed wrapper over
 * Playwright's own `page.getByTestId`.
 *
 * `getByE2ePrefix` covers ids with a runtime-generated tail
 * (`prefix:${string | number}`): the prefix must be one that some declared
 * id can actually start with, so it stays type-safe without regexes.
 *
 * Both getters take an optional `scope` (page or locator) to search inside
 * one container instead of the whole page.
 *
 * `e2e` bundles `page` with both getters, ready to hand to `interpreter`.
 */
export const createE2eTest = <TId extends string>() =>
  base.extend<
    Omit<E2eContext<TId>, 'page'> & {
      e2e: E2eContext<TId>;
    }
  >({
    getByE2e: async ({ page }, use) => {
      await use((id, scope = page) => scope.getByTestId(id));
    },
    getByE2ePrefix: async ({ page }, use) => {
      await use((prefix, scope = page) =>
        scope.locator(`[data-e2e^="${prefix}"]`),
      );
    },
    e2e: async ({ page, getByE2e, getByE2ePrefix }, use) => {
      await use({ page, getByE2e, getByE2ePrefix });
    },
  });
