import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent, seedConsent } from '@/__e2e__/cookie-consent';
import { test, type Ctx } from '@/__e2e__/test';

const { describe } = test;

const BEACON_URL = 'https://static.cloudflareinsights.com/beacon.min.js';
const SCRIPT_SELECTOR = 'script#cloudflare-web-analytics';

// Counting hits per page (rather than racing page.waitForRequest after the
// triggering action) sidesteps the case where the browser fires the request
// before the test gets around to starting the wait.
const beaconRequestCounts = new WeakMap<Page, number>();

const commands = {
  'i intercept the analytics beacon': ({ page }) => {
    beaconRequestCounts.set(page, 0);

    return page.route(BEACON_URL, (route) => {
      beaconRequestCounts.set(page, (beaconRequestCounts.get(page) ?? 0) + 1);

      return route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'export default {};',
      });
    });
  },
  'im on the home page': ({ page }) => page.goto('/'),
  'i have already accepted all cookies': ({ page }) =>
    seedAcceptedConsent(page),
  'i have declined optional cookies': ({ page }) =>
    seedConsent(page, {
      necessary: true,
      performance: false,
      functional: false,
      marketing: false,
    }),

  'the cookie banner should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:banner')).toBeVisible({ timeout: 8000 }),
  'the cookie reopen trigger should be visible': ({ getByE2e }) =>
    expect(getByE2e('cookies:reopen')).toBeVisible({ timeout: 8000 }),

  'i click customize': ({ getByE2e }) => getByE2e('cookies:customize').click(),
  'i click accept all': ({ getByE2e }) =>
    getByE2e('cookies:accept-all').click(),
  'i click save preferences': ({ getByE2e }) =>
    getByE2e('cookies:save-preferences').click(),
  'i toggle the performance category': ({ page }) =>
    page.getByRole('switch', { name: 'Wydajnościowe' }).click(),

  'the analytics script should be injected': ({ page }) =>
    expect(page.locator(SCRIPT_SELECTOR)).toHaveCount(1, { timeout: 8000 }),
  'the analytics script should not be injected': ({ page }) =>
    expect(page.locator(SCRIPT_SELECTOR)).toHaveCount(0),
  'the analytics script should carry the correct beacon config': async ({
    page,
  }) => {
    const script = page.locator(SCRIPT_SELECTOR);
    await expect(script).toHaveAttribute('src', BEACON_URL);
    await expect(script).toHaveAttribute('type', 'module');
    await expect(script).toHaveAttribute(
      'data-cf-beacon',
      JSON.stringify({ token: '8bd820928ece444fa93244e03e7ac4e6' }),
    );
  },
  'the analytics beacon should have been requested': ({ page }) =>
    expect
      .poll(() => beaconRequestCounts.get(page) ?? 0, { timeout: 5000 })
      .toBeGreaterThan(0),
  'the analytics beacon should not have been requested': async ({ page }) => {
    await page.waitForTimeout(1000);
    expect(beaconRequestCounts.get(page) ?? 0).toBe(0);
  },
} satisfies CommandRegistry<Ctx>;

describe('cloudflare web analytics consent gating', () => {
  test('does not request the beacon before any consent decision', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['the analytics script should not be injected'],
      ['the analytics beacon should not have been requested'],
    );
  });

  test('loads and requests the beacon after accepting all cookies', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click accept all'],
      ['the analytics script should be injected'],
      ['the analytics script should carry the correct beacon config'],
      ['the analytics beacon should have been requested'],
    );
  });

  test('loads the beacon when the performance category is opted into via preferences', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['i toggle the performance category'],
      ['i click save preferences'],
      ['the analytics script should be injected'],
      ['the analytics beacon should have been requested'],
    );
  });

  test('never loads the beacon when only the necessary category is saved', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['im on the home page'],
      ['the cookie banner should be visible'],
      ['i click customize'],
      ['i click save preferences'],
      ['the analytics script should not be injected'],
      ['the analytics beacon should not have been requested'],
    );
  });

  test('loads the beacon on return visits when performance consent was already granted', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['i have already accepted all cookies'],
      ['im on the home page'],
      ['the cookie reopen trigger should be visible'],
      ['the analytics script should be injected'],
      ['the analytics beacon should have been requested'],
    );
  });

  test('does not load the beacon on return visits when performance consent was declined', async ({
    page,
    getByE2e,
  }) => {
    await interpreter(commands, { page, getByE2e })(
      ['i intercept the analytics beacon'],
      ['i have declined optional cookies'],
      ['im on the home page'],
      ['the cookie reopen trigger should be visible'],
      ['the analytics script should not be injected'],
      ['the analytics beacon should not have been requested'],
    );
  });
});
