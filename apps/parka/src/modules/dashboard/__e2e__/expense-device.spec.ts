import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Seed } from './fake-backend';

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };
const SEED: Seed = {
  categories: [FOOD],
  expenses: [],
  limits: [],
  recurring: [],
};

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const settle = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the page for adding an expense': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.newExpense());
    await settle(page);
  },
  'i add the expense "Kawiarnia" of 25 zloty': async ({ getByE2e, page }) => {
    await getByE2e('expense-form:merchant').fill('Kawiarnia');
    await getByE2e('expense-form:amount').fill('25');
    await getByE2e('expense-form:save').click();
    await expect(getByE2e('dashboard:main')).toBeVisible();
    await settle(page);
  },
  'i open "Kawiarnia" from the list': async ({ getByE2ePrefix, getByE2e }) => {
    await getByE2ePrefix('dashboard:expense:')
      .filter({ hasText: 'Kawiarnia' })
      .first()
      .click();
    await expect(getByE2e('dashboard:detail')).toBeVisible();
  },

  'the list row names the device': async ({ getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix('dashboard:expense:').filter({ hasText: 'Kawiarnia' }),
    ).toContainText(/Chrome on/);
  },
  'the list row shows only the device icon': async ({ getByE2ePrefix }) => {
    const row = getByE2ePrefix('dashboard:expense:').filter({
      hasText: 'Kawiarnia',
    });
    await expect(row.locator('svg.lucide-smartphone')).toBeVisible();
    // Screen-reader only: the name takes no room in the row.
    const box = await row.getByText('Safari on iOS').boundingBox();
    expect(box?.width ?? 0).toBeLessThanOrEqual(1);
  },
  'the popup names the device and its id': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:detail-device-name')).not.toBeEmpty();
    await expect(getByE2e('dashboard:detail-device-id')).toContainText(
      /^device-/,
    );
  },
  'the popup names the device as Safari on iOS': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:detail-device-name')).toHaveText(
      'Safari on iOS',
    );
  },
} satisfies CommandRegistry<Ctx>;

test.describe('expense device on desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a new expense lists and details the device it came from', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i add the expense "Kawiarnia" of 25 zloty'],
      ['the list row names the device'],
      ['i open "Kawiarnia" from the list'],
      ['the popup names the device and its id'],
    );
  });
});

test.describe('expense device on mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: IPHONE_UA,
    isMobile: true,
    hasTouch: true,
  });

  test('a new expense lists the device icon and details its name', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the page for adding an expense'],
      ['i add the expense "Kawiarnia" of 25 zloty'],
      ['the list row shows only the device icon'],
      ['i open "Kawiarnia" from the list'],
      ['the popup names the device as Safari on iOS'],
      ['the popup names the device and its id'],
    );
  });
});
