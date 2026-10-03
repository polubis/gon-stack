import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';
import { installBackend, type Backend, type Seed } from './fake-backend';

/** Local calendar month `offset` months from now, as `YYYY-MM`. */
const month = (offset = 0): string => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
};

const FOOD = { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' };
const TRANSPORT = {
  id: 'cat-2',
  name: 'Transport',
  icon: 'car',
  color: '#1d4ed8',
};

const expense = (
  id: string,
  amount: number,
  day: string,
  categoryId: string,
) => ({
  id,
  merchant: `Sklep ${id}`,
  date: `${day}T10:00:00.000Z`,
  amount,
  categoryId,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual' as const,
  items: [],
});

const NETFLIX = {
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  nextPaymentDate: `${month()}-02T00:00:00.000Z`,
  active: true,
  paymentMethod: 'card',
  categoryId: FOOD.id,
  history: [],
};

/** This month: 60 + 40 = 100 in 2 expenses. Last month: 50 in 1. */
const BASE: Seed = {
  categories: [FOOD, TRANSPORT],
  expenses: [
    expense('e-1', 60, `${month()}-01`, FOOD.id),
    expense('e-2', 40, `${month()}-01`, TRANSPORT.id),
    expense('e-0', 50, `${month(-1)}-01`, FOOD.id),
  ],
  limits: [],
  recurring: [],
};

const backends = new WeakMap<Page, Backend>();
const backendOf = (page: Page): Backend => {
  const backend = backends.get(page);
  if (!backend) throw new Error('No backend installed for this page.');
  return backend;
};

/** Waits for the Astro islands to hydrate before the test starts clicking. */
const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const openDashboardWith = async (page: Page, seed: Seed): Promise<void> => {
  await signInAsTestUser(page);
  backends.set(page, await installBackend(page, seed));
  await open(page, APP_ROUTER.dashboard());
};

const commands = {
  'i open a dashboard with expenses of two months': ({ page }) =>
    openDashboardWith(page, BASE),
  'i open a dashboard with a recurring expense': ({ page }) =>
    openDashboardWith(page, { ...BASE, recurring: [NETFLIX] }),
  'i open a dashboard with a monthly limit of 500': ({ page }) =>
    openDashboardWith(page, {
      ...BASE,
      limits: [{ id: 'l-0', scope: 'total', amount: 500 }],
    }),

  'the month shows 100,00 over 2 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('100,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('2');
  },
  'the month change is +100% against last month': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:change')).toContainText('+100%');
  },
  'the month shows 130,00 over 3 charges': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('130,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },

  'i save a new 25 expense from a receipt': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.receiptScan());
    await getByE2e('receipt:manual').click();
    await expect(getByE2e('receipt:review')).toBeVisible();
    await getByE2e('receipt:merchant').fill('Piekarnia');
    await page.getByRole('button', { name: /Nowy produkt/ }).click();
    await getByE2ePrefix('receipt:item-name:').fill('Chleb');
    await getByE2ePrefix('receipt:item-price:').fill('25');
    await getByE2e('receipt:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
    await page.waitForLoadState('networkidle');
  },
  'the month shows 125,00 over 3 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('125,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },

  'i change the amount of the first expense to 150': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense:e-1').click();
    await getByE2e('dashboard:edit').click();
    await getByE2e('dashboard:edit-amount').fill('150');
    await getByE2e('dashboard:save').click();
    await expect(getByE2e('dashboard:detail')).toHaveCount(0);
  },
  'the month shows 190,00 over 2 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('190,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('2');
  },

  'i delete the first expense': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense:e-1').click();
    await getByE2e('dashboard:delete').click();
    await expect(getByE2e('dashboard:detail')).toHaveCount(0);
  },
  'the month shows 40,00 over 1 expense': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('40,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('1');
  },

  'i add a recurring expense of 50': async ({ getByE2e }) => {
    await getByE2e('dashboard:recurring-new').click();
    await getByE2e('dashboard:recurring-form-name').fill('Siłownia');
    await getByE2e('dashboard:recurring-form-cost').fill('50');
    await getByE2e('dashboard:recurring-form-save').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
  },
  'the month shows 150,00 over 3 charges': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('150,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },

  'i pause the recurring expense': async ({ page }) => {
    await page.getByRole('switch', { name: 'Śledzenie: Netflix' }).click();
  },
  'i change the recurring expense cost to 45': async ({ getByE2e }) => {
    await getByE2e('dashboard:recurring-edit:r-1').click();
    await getByE2e('dashboard:recurring-form-cost').fill('45');
    await getByE2e('dashboard:recurring-form-save').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
  },
  'the month shows 145,00 over 3 charges': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('145,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },
  'i delete the recurring expense': async ({ getByE2e }) => {
    await getByE2e('dashboard:recurring-edit:r-1').click();
    await getByE2e('dashboard:recurring-delete').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
  },

  'the limit has 400,00 left': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText('400,00');
  },
  'i lower the monthly limit to 300': async ({ getByE2e }) => {
    await getByE2e('dashboard:limit-total-edit').click();
    await getByE2e('dashboard:limit-total-amount').fill('300');
    await getByE2e('dashboard:limit-total-save').click();
    await expect(getByE2e('dashboard:limit-total-amount')).toHaveCount(0);
  },
  'the limit has 200,00 left': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText('200,00');
  },

  'i switch to last month': async ({ getByE2e }) => {
    await getByE2e('dashboard:month-select').selectOption(month(-1));
  },
  'last month shows 50,00 over 1 expense': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('50,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('1');
  },

  'the dashboard loaded everything once': async ({ page }) => {
    const paths = [
      '/api/dashboard/',
      '/api/expenses/',
      '/api/categories/',
      '/api/limits/',
      '/api/recurring/',
    ];
    for (const path of paths)
      await expect
        .poll(() => backendOf(page).count('GET', path), { message: path })
        .toBe(1);
    // Nothing else follows: a repeated read would show up after a settle.
    await page.waitForTimeout(500);
    for (const path of paths)
      expect(backendOf(page).count('GET', path), path).toBe(1);
  },
  'the dashboard loaded everything twice': async ({ page }) => {
    await expect
      .poll(() => backendOf(page).count('GET', '/api/dashboard/'))
      .toBe(2);
    expect(backendOf(page).count('GET', '/api/recurring/')).toBe(2);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('dashboard values after changes', () => {
  test('the month total counts a newly saved expense', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['the month shows 100,00 over 2 expenses'],
      ['i save a new 25 expense from a receipt'],
      ['the month shows 125,00 over 3 expenses'],
    );
  });

  test('the month total follows an edited expense', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i change the amount of the first expense to 150'],
      ['the month shows 190,00 over 2 expenses'],
    );
  });

  test('the month total drops when an expense is deleted', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i delete the first expense'],
      ['the month shows 40,00 over 1 expense'],
    );
  });

  test('a new recurring expense is added to the month total', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i add a recurring expense of 50'],
      ['the month shows 150,00 over 3 charges'],
    );
  });

  test('pausing a recurring expense takes its charge out', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['the month shows 130,00 over 3 charges'],
      ['i pause the recurring expense'],
      ['the month shows 100,00 over 2 expenses'],
    );
  });

  test('editing a recurring cost changes the month total', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i change the recurring expense cost to 45'],
      ['the month shows 145,00 over 3 charges'],
    );
  });

  test('deleting a recurring expense takes its charge out', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i delete the recurring expense'],
      ['the month shows 100,00 over 2 expenses'],
    );
  });

  test('the limit left follows a changed monthly limit', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a monthly limit of 500'],
      ['the limit has 400,00 left'],
      ['i lower the monthly limit to 300'],
      ['the limit has 200,00 left'],
    );
  });

  test('another month shows its own values', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['the month change is +100% against last month'],
      ['i switch to last month'],
      ['last month shows 50,00 over 1 expense'],
    );
  });

  test('opening the dashboard loads everything once', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['the dashboard loaded everything once'],
    );
  });

  test('a recurring change reloads the dashboard once more', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i change the recurring expense cost to 45'],
      ['the dashboard loaded everything twice'],
    );
  });
});
