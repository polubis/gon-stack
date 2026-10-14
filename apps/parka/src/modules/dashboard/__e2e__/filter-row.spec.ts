import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { todayDay } from '@/shared/period/period';
import { installBackend, type Seed } from './fake-backend';

const CATEGORY_COUNT = 10;

const category = (n: number) => ({
  id: `cat-${n}`,
  name: `Kategoria numer ${n}`,
  icon: 'cart',
  color: '#0f7a4f',
});

const expenseOf = (n: number) => ({
  id: `e-${n}`,
  merchant: `Sklep ${n}`,
  date: `${todayDay()}T10:00:00.000Z`,
  amount: 10 + n,
  categoryId: `cat-${n}`,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual' as const,
  items: [],
});

const seedOf = (count: number): Seed => ({
  categories: Array.from({ length: count }, (_, n) => category(n)),
  expenses: Array.from({ length: count }, (_, n) => expenseOf(n)),
  limits: [],
  recurring: [],
});

const open = async (page: Page, seed: Seed): Promise<void> => {
  await signInAsTestUser(page);
  await installBackend(page, seed);
  await page.goto(APP_ROUTER.dashboard());
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const commands = {
  'i open the dashboard with one category': ({ page }) => open(page, seedOf(1)),
  'i open the dashboard with many categories': ({ page }) =>
    open(page, seedOf(CATEGORY_COUNT)),

  'the "Wszystkie" filter is shown': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:filter:all')).toBeVisible();
    await expect(getByE2e('dashboard:filter:all')).toHaveText('Wszystkie 1');
  },
  'the filter row shows a scrollbar': async ({ getByE2e }) => {
    const width = await getByE2e('dashboard:filter:all')
      .locator('..')
      .evaluate((el) => getComputedStyle(el).scrollbarWidth);
    expect(width).not.toBe('none');
  },
  'the filter row hides its scrollbar': async ({ getByE2e }) => {
    const width = await getByE2e('dashboard:filter:all')
      .locator('..')
      .evaluate((el) => getComputedStyle(el).scrollbarWidth);
    expect(width).toBe('none');
  },
  'the last category filter can be reached': async ({ getByE2e }) => {
    const last = getByE2e(`dashboard:filter:cat-${CATEGORY_COUNT - 1}`);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('expense filter row on desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a single category still shows "Wszystkie"', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard with one category'],
      ['the "Wszystkie" filter is shown'],
    );
  });

  test('many categories scroll with a visible scrollbar', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard with many categories'],
      ['the filter row shows a scrollbar'],
      ['the last category filter can be reached'],
    );
  });
});

test.describe('expense filter row on mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('a single category still shows "Wszystkie"', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard with one category'],
      ['the "Wszystkie" filter is shown'],
    );
  });

  test('many categories scroll without a scrollbar', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard with many categories'],
      ['the filter row hides its scrollbar'],
      ['the last category filter can be reached'],
    );
  });
});
