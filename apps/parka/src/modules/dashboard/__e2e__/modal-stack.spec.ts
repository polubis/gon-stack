import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Seed } from './fake-backend';

const month = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };

/** Eight expenses: the tile shows six, "show all" lists the rest. */
const SEED: Seed = {
  categories: [FOOD],
  expenses: Array.from({ length: 8 }, (_, i) => ({
    id: `e-${i}`,
    merchant: `Sklep e-${i}`,
    date: `${month()}-0${i + 1}T10:00:00.000Z`,
    amount: 10 + i,
    categoryId: FOOD.id,
    paymentMethod: 'card',
    isBill: false,
    source: 'manual' as const,
    items: [],
  })),
  limits: [],
  recurring: [],
};

const openDashboard = async (page: Page, path: string): Promise<void> => {
  await signInAsTestUser(page);
  await installBackend(page, SEED);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const modals = (page: Page): string[] =>
  new URL(page.url()).searchParams.getAll('modal');

const commands = {
  'i open the dashboard': ({ page }) =>
    openDashboard(page, APP_ROUTER.dashboard()),
  'i open the dashboard linked to two stacked popups': ({ page }) =>
    openDashboard(page, '/app/?modal=expenses&modal=expense:e-0'),

  'i open the full expenses list': async ({ getByE2e }) => {
    await getByE2e('dashboard:expenses-toggle').click();
    await expect(getByE2e('dashboard:expenses-dialog')).toBeVisible();
  },
  'i open the first expense from the list': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense:e-0').last().click();
    await expect(getByE2e('dashboard:detail')).toBeVisible();
  },
  'i press the browser Back button': async ({ page }) => {
    await page.goBack();
  },
  'i press Escape': async ({ page }) => {
    await page.keyboard.press('Escape');
  },

  'both popups are stacked and the URL lists them': async ({
    page,
    getByE2e,
  }) => {
    await expect(getByE2e('dashboard:expenses-dialog')).toBeAttached();
    await expect(getByE2e('dashboard:detail')).toBeVisible();
    expect(modals(page)).toEqual(['expenses', 'expense:e-0']);
  },
  'only the expenses list is open': async ({ page, getByE2e }) => {
    await expect(getByE2e('dashboard:detail')).toHaveCount(0);
    await expect(getByE2e('dashboard:expenses-dialog')).toBeVisible();
    expect(modals(page)).toEqual(['expenses']);
  },
  'no popup is open': async ({ page, getByE2e }) => {
    await expect(getByE2e('dashboard:expenses-dialog')).toHaveCount(0);
    expect(modals(page)).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('stacked popups', () => {
  test('a popup opened over another stacks on top of it', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the full expenses list'],
      ['i open the first expense from the list'],
      ['both popups are stacked and the URL lists them'],
    );
  });

  test('Back closes only the top popup', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the full expenses list'],
      ['i open the first expense from the list'],
      ['i press the browser Back button'],
      ['only the expenses list is open'],
      ['i press the browser Back button'],
      ['no popup is open'],
    );
  });

  test('Escape closes only the top popup', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard'],
      ['i open the full expenses list'],
      ['i open the first expense from the list'],
      ['i press Escape'],
      ['only the expenses list is open'],
    );
  });

  test('a link restores the whole stack', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the dashboard linked to two stacked popups'],
      ['both popups are stacked and the URL lists them'],
    );
  });
});
