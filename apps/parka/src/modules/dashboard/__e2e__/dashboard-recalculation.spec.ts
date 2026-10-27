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

/** A fixed present keeps the month's upcoming payments independent of the real date. */
const TODAY = `${month()}-03`;

const NETFLIX_DAY = `${month()}-01`;

/** A rule that already charged this month's payment (an ordinary expense now). */
const NETFLIX = {
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  interval: 'weekly' as const,
  startDate: NETFLIX_DAY,
  endDate: null,
  lastMaterializedDate: NETFLIX_DAY,
  active: true,
  paymentMethod: 'card',
  categoryId: FOOD.id,
};

const NETFLIX_CHARGE = {
  ...expense(`r-1:${NETFLIX_DAY}`, 30, NETFLIX_DAY, FOOD.id),
  merchant: 'Netflix',
  recurringId: NETFLIX.id,
  occurrenceDate: NETFLIX_DAY,
};

/** `YYYY-MM-DD` of the day `offset` days from the fixed present. */
const day = (offset: number): string => {
  const target = new Date(`${TODAY}T12:00:00`);
  target.setDate(target.getDate() + offset);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
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
  await page.clock.setFixedTime(new Date(`${TODAY}T12:00:00`));
  backends.set(page, await installBackend(page, seed, TODAY));
  await open(page, APP_ROUTER.dashboard());
};

const commands = {
  'i open a dashboard with expenses of two months': ({ page }) =>
    openDashboardWith(page, BASE),
  'i open a dashboard with a recurring expense': ({ page }) =>
    openDashboardWith(page, {
      ...BASE,
      expenses: [...BASE.expenses, NETFLIX_CHARGE],
      recurring: [NETFLIX],
    }),
  'i open a dashboard with a monthly limit of 500': ({ page }) =>
    openDashboardWith(page, {
      ...BASE,
      limits: [{ id: 'l-0', scope: 'total', amount: 500, alertAt: 80 }],
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

  'i add an expense of 25 with a product': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('menuitem', { name: 'Wydatek', exact: true }).click();
    await expect(getByE2e('expenses-management:main')).toBeVisible();
    await getByE2e('expense-form:merchant').fill('Piekarnia');
    await getByE2e('expense-form:add-product').click();
    await getByE2ePrefix('expense-form:product-name:').fill('Chleb');
    await getByE2ePrefix('expense-form:product-price:').fill('25');
    await getByE2e('expense-form:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
    await page.waitForLoadState('networkidle');
  },
  'the month shows 125,00 over 3 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('125,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },

  'i change the amount of the first expense to 150': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('dashboard:expense:e-1').click();
    await getByE2e('dashboard:edit').click();
    await page.waitForURL('**/app/expenses/edit/**');
    await page.waitForLoadState('networkidle');
    await getByE2e('expense-form:amount').fill('150');
    await getByE2e('expense-form:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
  },
  'the month shows 190,00 over 2 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('190,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('2');
  },

  'i delete the first expense': async ({ getByE2e }) => {
    await getByE2e('dashboard:expense:e-1').click();
    await getByE2e('dashboard:delete').click();
    await getByE2e('dashboard:delete-confirm').click();
    await expect(getByE2e('dashboard:detail')).toHaveCount(0);
  },
  'the month shows 40,00 over 1 expense': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('40,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('1');
  },

  'i add a recurring expense of 50': async ({ page, getByE2e }) => {
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('menuitem', { name: 'Wydatek', exact: true }).click();
    await page.getByRole('tab', { name: 'Cykliczny' }).click();
    await getByE2e('expenses-management:recurring-name').fill('Siłownia');
    await getByE2e('expenses-management:recurring-cost').fill('50');
    await getByE2e('expenses-management:recurring-save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
  },
  'i add a recurring expense of 50 starting in a week': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('menuitem', { name: 'Wydatek', exact: true }).click();
    await page.getByRole('tab', { name: 'Cykliczny' }).click();
    await getByE2e('expenses-management:recurring-name').fill('Siłownia');
    await getByE2e('expenses-management:recurring-cost').fill('50');
    await getByE2e('expenses-management:recurring-date').fill(day(7));
    await getByE2e('expenses-management:recurring-save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
  },
  'i add a normal expense of 25': async ({ page, getByE2e }) => {
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('menuitem', { name: 'Wydatek', exact: true }).click();
    await getByE2e('expense-form:merchant').fill('Piekarnia');
    await getByE2e('expense-form:amount').fill('25');
    await getByE2e('expense-form:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
  },
  'i add an expense from an uploaded receipt': async ({ page, getByE2e }) => {
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('menuitem', { name: 'Wydatek', exact: true }).click();
    await getByE2e('expenses-management:upload-input').setInputFiles({
      name: 'receipt.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await expect(getByE2e('expense-form:merchant')).toHaveValue('Biedronka');
    await getByE2e('expense-form:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
  },
  'the month shows 142,50 over 3 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('142,50');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },
  'the month shows 150,00 over 3 charges': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('150,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('3');
  },

  'i change the upcoming payment cost to 45': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('dashboard:upcoming:').first().click();
    await expect(getByE2e('dashboard:scope-note')).toContainText(
      'Edytujesz ten i kolejne wydatki',
    );
    await getByE2e('dashboard:recurring-form-cost').fill('45');
    await getByE2e('dashboard:recurring-form-save').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
  },
  'i add a product of 12 to the upcoming payment': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('dashboard:upcoming:').first().click();
    await getByE2e('expense-form:add-product').click();
    await getByE2ePrefix('expense-form:product-name:').fill('Chleb');
    await getByE2ePrefix('expense-form:product-price:').fill('12');
    await expect(getByE2e('dashboard:recurring-form-cost')).toHaveAttribute(
      'readonly',
      '',
    );
    await getByE2e('dashboard:recurring-form-save').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
  },
  'the upcoming payment shows 12,00': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:upcoming')).toContainText('12,00');
  },
  'the upcoming payment shows 45,00': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:upcoming')).toContainText('45,00');
  },
  'the month still shows 100,00 over 2 expenses': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('100,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('2');
  },
  'the upcoming payment of Siłownia is announced': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:upcoming')).toContainText('Siłownia');
    await expect(getByE2e('dashboard:upcoming-badge')).toBeVisible();
  },
  'i delete the recurring rule from its upcoming payment': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('dashboard:upcoming:').first().click();
    await getByE2e('dashboard:recurring-delete').click();
    await expect(getByE2e('dashboard:delete-scope')).toContainText(
      'Usuniesz regułę',
    );
    await getByE2e('dashboard:delete-confirm').click();
    await expect(getByE2e('dashboard:recurring-dialog')).toHaveCount(0);
  },
  'no payment is announced': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:upcoming')).toHaveCount(0);
  },
  'i delete the charged recurring expense': async ({ getByE2e }) => {
    await getByE2e(`dashboard:expense:r-1:${NETFLIX_DAY}`).click();
    await expect(getByE2e('dashboard:scope-note')).toContainText(
      'dotyczą tylko jego',
    );
    await getByE2e('dashboard:delete').click();
    await expect(getByE2e('dashboard:delete-scope')).toContainText(
      'Usuniesz tylko ten wydatek',
    );
    await getByE2e('dashboard:delete-confirm').click();
    await expect(getByE2e('dashboard:detail')).toHaveCount(0);
  },
  'the next payment of the rule is still announced': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:upcoming')).toContainText('Netflix');
  },
  'i reload the dashboard': async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('networkidle');
  },

  'the limit has 400,00 left': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText('400,00');
  },
  'i lower the monthly limit to 300': async ({ getByE2e }) => {
    await getByE2e('dashboard:limits-manage').click();
    await getByE2e('dashboard:limit-edit:l-0').click();
    await getByE2e('dashboard:limit-form-amount').fill('300');
    await getByE2e('dashboard:limit-form-save').click();
    await expect(getByE2e('dashboard:limit-form')).toHaveCount(0);
    await getByE2e('dashboard:limits-dialog')
      .getByRole('button', { name: 'Zamknij' })
      .click();
    await expect(getByE2e('dashboard:limits-dialog')).toHaveCount(0);
  },
  'the limit has 200,00 left': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:limit-left')).toContainText('200,00');
  },

  'i switch to last month': async ({ getByE2e }) => {
    await getByE2e('period-control:prev').click();
  },
  'last month shows 50,00 over 1 expense': async ({ getByE2e }) => {
    await expect(getByE2e('dashboard:total')).toContainText('50,00');
    await expect(getByE2e('dashboard:transactions')).toHaveText('1');
  },

  'the dashboard loaded everything once': async ({ page }) => {
    // The summary of the neighbouring month is fetched ahead, so it may be
    // read twice in all: the shown month and the one before it.
    const shared = [
      '/api/expenses/',
      '/api/categories/',
      '/api/limits/',
      '/api/recurring/',
    ];
    for (const path of shared)
      await expect
        .poll(() => backendOf(page).count('GET', path), { message: path })
        .toBe(1);
    await expect
      .poll(() => backendOf(page).count('GET', '/api/dashboard/'))
      .toBeGreaterThanOrEqual(1);
    // Nothing else follows: a repeated read would show up after a settle.
    await page.waitForTimeout(500);
    for (const path of shared)
      expect(backendOf(page).count('GET', path), path).toBe(1);
    expect(backendOf(page).count('GET', '/api/dashboard/')).toBeLessThanOrEqual(
      2,
    );
  },
  'the dashboard loaded everything twice': async ({ page }) => {
    await expect
      .poll(() => backendOf(page).count('GET', '/api/recurring/'))
      .toBe(2);
    await page.waitForTimeout(500);
    expect(backendOf(page).count('GET', '/api/recurring/')).toBe(2);
    // Each load may also fetch the previous month ahead: two loads, at most four.
    const summaries = backendOf(page).count('GET', '/api/dashboard/');
    expect(summaries).toBeGreaterThanOrEqual(2);
    expect(summaries).toBeLessThanOrEqual(4);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('dashboard values after changes', () => {
  test('the month total counts a newly saved expense', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['the month shows 100,00 over 2 expenses'],
      ['i add an expense of 25 with a product'],
      ['the month shows 125,00 over 3 expenses'],
    );
  });

  test('the month total counts an expense read from a receipt photo', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i add an expense from an uploaded receipt'],
      ['the month shows 142,50 over 3 expenses'],
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

  test('a recurring expense due today is charged into the month total', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i add a recurring expense of 50'],
      ['the month shows 150,00 over 3 charges'],
    );
  });

  test('a new normal expense is added to the month total', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i add a normal expense of 25'],
      ['the month shows 125,00 over 3 expenses'],
    );
  });

  test('a recurring expense starting later is only announced', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['i add a recurring expense of 50 starting in a week'],
      ['the month still shows 100,00 over 2 expenses'],
      ['the upcoming payment of Siłownia is announced'],
    );
  });

  test('editing an upcoming payment changes the rule, not what was charged', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i change the upcoming payment cost to 45'],
      ['the month shows 130,00 over 3 charges'],
      ['the upcoming payment shows 45,00'],
    );
  });

  test('deleting the rule keeps what was already charged', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i delete the recurring rule from its upcoming payment'],
      ['the month shows 130,00 over 3 charges'],
      ['no payment is announced'],
    );
  });

  test('a deleted charged expense leaves the rule and does not come back', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i delete the charged recurring expense'],
      ['the month still shows 100,00 over 2 expenses'],
      ['the next payment of the rule is still announced'],
      ['i reload the dashboard'],
      ['the month still shows 100,00 over 2 expenses'],
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

  test('products of a rule set its cost', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i add a product of 12 to the upcoming payment'],
      ['the upcoming payment shows 12,00'],
    );
  });

  test('opening the dashboard loads everything once', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with expenses of two months'],
      ['the dashboard loaded everything once'],
    );
  });

  test('a rule change reloads the dashboard once more', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open a dashboard with a recurring expense'],
      ['i change the upcoming payment cost to 45'],
      ['the dashboard loaded everything twice'],
    );
  });
});
