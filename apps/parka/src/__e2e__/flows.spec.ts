import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { signInAsTestUser } from './session';
import { installBackend } from '@/modules/dashboard/__e2e__/fake-backend';

/**
 * Navigate and wait for the Astro islands on the page to hydrate before the
 * test starts clicking — `client:load` handlers attach a task after `load`.
 */
const open = async (page: Page, path: string): Promise<void> => {
  if (path.startsWith(APP_ROUTER.dashboard())) await signInAsTestUser(page);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const yearMonth = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const CATEGORY = {
  id: 'cat-1',
  name: 'Spożywcze',
  icon: 'cart',
  color: '#0f7a4f',
};

/**
 * Stubs every entity endpoint (empty unless overridden) so each module loads
 * deterministic rows through its own repository, without a real backend.
 */
const mockState = async (
  page: Page,
  rows: {
    recurring?: unknown[];
    categories?: unknown[];
    limits?: unknown[];
  } = {},
): Promise<void> => {
  const collections: [string, unknown[]][] = [
    [API_ROUTER.categories(), rows.categories ?? [CATEGORY]],
    [API_ROUTER.expenses(), []],
    [API_ROUTER.limits(), rows.limits ?? []],
    [API_ROUTER.recurring(), rows.recurring ?? []],
    [API_ROUTER.notifications(), []],
  ];
  for (const [url, data] of collections) {
    await page.route(`**${url}**`, async (route) => {
      const request = route.request();
      const method = request.method();
      const body =
        method === 'GET'
          ? { code: 200, data }
          : method === 'POST'
            ? { code: 201, data: request.postDataJSON() }
            : method === 'PUT'
              ? { code: 200, data: request.postDataJSON() }
              : { code: 200, ok: true };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }
  // The dashboard loads its summary together with every list: all or nothing.
  await page.route(
    `**${API_ROUTER.dashboard({ month: '' })}**`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            total: 0,
            change: 0,
            previousTotal: 0,
            userName: 'Anna',
            transactions: 0,
            dailyAverage: 0,
            daily: [],
            previousDaily: [],
            monthlyLimit: null,
            categories: [],
          },
        }),
      });
    },
  );
  await page.route(`**${API_ROUTER.settings()}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data: {
          profile: { name: '', email: '' },
          notifications: {
            push: true,
            email: false,
            limitWarnings: true,
            receiptConfirmations: true,
            limitAlerts: true,
          },
        },
      }),
    });
  });
};

const currentTotalByPage = new WeakMap<Page, string>();

const commands = {
  'i complete onboarding and reach sign-up': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.home());
    // The cookie banner sits at the bottom, over the walkthrough actions.
    await getByE2e('cookies:accept-all').click();
    await expect(getByE2e('cookies:banner')).toBeHidden();
    // Step through the product introduction, then hand off to sign-up.
    await getByE2e('walkthrough:primary').click();
    await getByE2e('walkthrough:primary').click();
    await getByE2e('walkthrough:primary').click();
    await getByE2e('walkthrough:primary').click();
    await page.waitForURL(`**${APP_ROUTER.signUp()}`);
    await expect(getByE2e('auth:main')).toBeVisible();
  },

  'i mock the dashboard totals': async ({ page }) => {
    await mockState(page);
    // Dashboard is backend-only (see modules/dashboard/AGENTS.md) — stub the
    // response so the view has deterministic per-month totals to assert
    // against.
    const current = new Date();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const totals: Record<string, number> = {
      [yearMonth(current)]: 1234,
      [yearMonth(previous)]: 999,
    };
    await page.route(
      `**${API_ROUTER.dashboard({ month: '' })}**`,
      async (route) => {
        const month = new URL(route.request().url()).searchParams.get('month');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            data: {
              total: (month && totals[month]) ?? 0,
              change: 0,
              previousTotal: 0,
              userName: 'Anna',
              transactions: 0,
              dailyAverage: 0,
              daily: [],
              previousDaily: [],
              monthlyLimit: null,
              categories: [],
            },
          }),
        });
      },
    );
  },
  'the dashboard shows the current month totals': async ({
    page,
    getByE2e,
  }) => {
    const current = new Date();
    await open(page, APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:month-select')).toHaveValue(
      yearMonth(current),
    );
    const total = await getByE2e('dashboard:total').textContent();
    currentTotalByPage.set(page, total ?? '');
  },
  'the previous month shows a different total': async ({ page, getByE2e }) => {
    const current = new Date();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    await getByE2e('dashboard:month-select').selectOption(yearMonth(previous));
    await expect(getByE2e('dashboard:month-select')).toHaveValue(
      yearMonth(previous),
    );
    await expect(getByE2e('dashboard:total')).not.toHaveText(
      currentTotalByPage.get(page) ?? '',
    );
  },

  'the dashboard links to limits': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await page.evaluate(() => Object.assign(window, { spaMarker: true }));
    await getByE2e('dashboard:main')
      .getByRole('link', { name: 'Ustaw limit' })
      .click();
    await expect(getByE2e('dashboard:limits')).toBeInViewport();
    await expect(getByE2e('dashboard:limits')).toBeFocused();
    expect(
      await page.evaluate(() => 'spaMarker' in window),
      'navigation stays client-side',
    ).toBe(true);
  },

  'i scan and save a receipt as an expense': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await mockState(page);
    await open(page, APP_ROUTER.receiptScan());
    await getByE2e('receipt:capture').click();

    await expect(getByE2e('receipt:review')).toBeVisible();
    await getByE2e('receipt:merchant').fill('Testowy Sklep E2E');

    // Correct the first item.
    await page.getByRole('button', { name: /Nowy produkt/ }).click();
    await getByE2ePrefix('receipt:item-name:').fill('Chleb razowy');
    await getByE2ePrefix('receipt:item-price:').fill('3.20');

    await getByE2e('receipt:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
  },

  'i cannot save a receipt before any category exists': async ({
    page,
    getByE2e,
  }) => {
    await mockState(page, { categories: [] });
    await open(page, APP_ROUTER.receiptScan());
    await getByE2e('receipt:manual').click();

    await expect(getByE2e('receipt:review')).toBeVisible();
    await expect(getByE2e('receipt:no-categories')).toBeVisible();
    await expect(getByE2e('receipt:save')).toBeDisabled();
  },

  'i add a suggested category': async ({ page, getByE2e }) => {
    await mockState(page, { categories: [] });
    await open(page, APP_ROUTER.categories());
    await getByE2e('categories:add-default:groceries').click();
    await expect(getByE2e('categories:row:groceries')).toContainText(
      'Spożywcze',
    );
    await expect(getByE2e('categories:add-default:groceries')).toHaveCount(0);
  },

  'i add a receipt manually': async ({ page, getByE2e, getByE2ePrefix }) => {
    await mockState(page);
    await open(page, APP_ROUTER.receiptScan());
    await getByE2e('receipt:manual').click();

    await expect(getByE2e('receipt:review')).toBeVisible();
    await getByE2e('receipt:merchant').fill('Sklep Ręczny');
    await page.getByRole('button', { name: /Nowy produkt/ }).click();
    await getByE2ePrefix('receipt:item-name:').fill('Chleb');
    const price = getByE2ePrefix('receipt:item-price:');
    await price.pressSequentially('12,50');
    await expect(price).toHaveValue('12,50');
    await price.fill('');
    await expect(price).toHaveValue('');
    await price.pressSequentially('3,20');
    await expect(price).toHaveValue('3,20');

    await getByE2e('receipt:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
  },

  'i mock the expenses list': async ({ page }) => {
    await mockState(page);
    // Expenses section of the dashboard is backend-only (see modules/dashboard core/
    // facade) — stub categories/expenses so the view has deterministic rows
    // to assert against instead of relying on the removed local demo mode.
    const category = {
      id: 'cat-1',
      name: 'Rachunki',
      icon: 'receipt',
      color: '#4f46e5',
    };
    const billExpense = {
      id: 'exp-bill-1',
      merchant: 'Tauron — Energia',
      date: new Date().toISOString(),
      amount: 210.5,
      categoryId: category.id,
      paymentMethod: 'card',
      isBill: true,
      source: 'manual',
      items: [],
    };
    const funCategory = {
      id: 'cat-2',
      name: 'Rozrywka',
      icon: 'popcorn',
      color: '#c2410c',
    };
    const purchaseExpense = {
      id: 'exp-purchase-1',
      merchant: 'Kino Helios',
      date: new Date().toISOString(),
      amount: 45,
      categoryId: funCategory.id,
      paymentMethod: 'card',
      isBill: false,
      source: 'manual',
      items: [],
    };

    await page.route(`**${API_ROUTER.categories()}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, data: [category, funCategory] }),
      });
    });
    await page.route(`**${API_ROUTER.expenses()}**`, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            data: [billExpense, purchaseExpense],
          }),
        });
        return;
      }
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            data: route.request().postDataJSON(),
          }),
        });
        return;
      }
      if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 200, ok: true }),
        });
        return;
      }
      await route.continue();
    });
  },

  'expenses can be filtered by category': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await getByE2e('dashboard:filter:cat-1').click();
    await expect(page.getByRole('button', { name: /Tauron/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kino Helios/ })).toHaveCount(
      0,
    );
  },

  'i update an expense merchant name': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await page.getByRole('button', { name: /Kino Helios/ }).click();
    await expect(getByE2e('dashboard:detail')).toBeVisible();

    await getByE2e('dashboard:edit-merchant').fill('Kino Nowe Horyzonty');
    await getByE2e('dashboard:save').click();
    await expect(page.getByText('Kino Nowe Horyzonty')).toBeVisible();
  },
  'i delete the updated expense': async ({ page, getByE2e }) => {
    await page.getByRole('button', { name: /Kino Nowe Horyzonty/ }).click();
    await getByE2e('dashboard:delete').click();
    await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);
  },

  'the dashboard shows the month summary': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:total')).toBeVisible();
  },

  'i create an 80 percent category limit': async ({ page, getByE2e }) => {
    await mockState(page);
    await open(page, APP_ROUTER.dashboard());

    await getByE2e('dashboard:limit-new').click();
    await getByE2e('dashboard:limit-form-amount').fill('450');
    await getByE2e('dashboard:limit-form-save').click();
    await expect(getByE2e('dashboard:limit-form')).toHaveCount(0);
  },

  'i open a dashboard with a category limit': async ({ page }) => {
    await mockState(page, {
      limits: [
        {
          id: 'limit-1',
          scope: 'category',
          categoryId: CATEGORY.id,
          amount: 300,
          alertAt80: true,
          delivery: 'push',
        },
      ],
    });
    await open(page, APP_ROUTER.dashboard());
  },
  'i raise the category limit': async ({ getByE2e }) => {
    await getByE2e('dashboard:limit-edit:limit-1').click();
    await getByE2e('dashboard:limit-form-amount').fill('900');
    await getByE2e('dashboard:limit-form-save').click();
    await expect(getByE2e('dashboard:limit-form')).toHaveCount(0);
    await expect(getByE2e('dashboard:limit-list')).toContainText('900,00');
  },
  'i remove the category limit': async ({ page, getByE2e }) => {
    await getByE2e('dashboard:limit-edit:limit-1').click();
    await getByE2e('dashboard:limit-delete').click();
    await expect(getByE2e('dashboard:limit-form')).toHaveCount(0);
    await expect(page.getByText('Brak limitów kategorii.')).toBeVisible();
  },
  'a new category appears in the list': async ({ page, getByE2e }) => {
    await mockState(page);
    await open(page, APP_ROUTER.categories());
    await getByE2e('categories:form-name').fill('Kultura');
    await getByE2e('categories:form-save').click();
    await expect(page.getByText('Kultura')).toBeVisible();
  },

  'i add and remove a recurring expense': async ({ page, getByE2e }) => {
    // Stateful: a recurring change reloads the dashboard, which must read the
    // new item back.
    await mockState(page);
    await installBackend(page, {
      categories: [CATEGORY],
      expenses: [],
      limits: [],
      recurring: [],
    });
    await open(page, APP_ROUTER.dashboard());
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('tab', { name: 'Cykliczny' }).click();
    await getByE2e('dashboard:recurring-form-name').fill('Siłownia');
    await getByE2e('dashboard:recurring-form-cost').fill('99');
    await getByE2e('dashboard:recurring-form-save').click();
    await expect(getByE2e('dashboard:recurring-form')).toHaveCount(0);
    await expect(
      getByE2e('dashboard:expenses').getByText('Siłownia'),
    ).toBeVisible();
    await page.getByRole('button', { name: /Siłownia/ }).click();
    await getByE2e('dashboard:recurring-delete').click();
    await expect(page.getByText('Siłownia')).toHaveCount(0);
  },
  'a recurring expense counts in this month': async ({ page, getByE2e }) => {
    await mockState(page, {
      recurring: [
        {
          id: 'rec-2',
          name: 'Spotify',
          cost: 24.99,
          nextPaymentDate: new Date().toISOString().slice(0, 10),
          active: true,
          paymentMethod: 'card',
          categoryId: CATEGORY.id,
          history: [],
        },
      ],
    });
    await open(page, APP_ROUTER.dashboard());
    await expect(
      getByE2e('dashboard:expenses').getByText('Spotify'),
    ).toBeVisible();
  },
  'the expenses list offers adding a recurring expense': async ({
    page,
    getByE2e,
  }) => {
    await mockState(page);
    await open(page, APP_ROUTER.dashboard());
    await getByE2e('dashboard:expense-new').click();
    await page.getByRole('tab', { name: 'Cykliczny' }).click();
    await expect(getByE2e('dashboard:recurring-form')).toBeVisible();
  },

  'the monthly report downloads a csv': async ({ page, getByE2e }) => {
    await mockState(page);
    await open(page, APP_ROUTER.reports());
    await expect(getByE2e('reports:total')).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      getByE2e('reports:download-csv').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  },

  'i update my profile name': async ({ page, getByE2e }) => {
    await mockState(page);
    await open(page, APP_ROUTER.settings());
    await getByE2e('settings:edit-profile').click();
    await getByE2e('settings:profile-name').fill('Anna Testowa');
    await getByE2e('settings:save-profile').click();
    await expect(getByE2e('settings:name')).toHaveText('Anna Testowa');
  },

  'financial data exports as csv': async ({ page, getByE2e }) => {
    await mockState(page);
    await open(page, APP_ROUTER.dataExport());
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      getByE2e('data-export:run').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    await expect(getByE2e('data-export:done')).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test('onboarding leads an anonymous visitor to registration', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(['i complete onboarding and reach sign-up']);
});

test('month selection changes the spending overview period', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i mock the dashboard totals'],
    ['the dashboard shows the current month totals'],
    ['the previous month shows a different total'],
  );
});

test('spending overview links to the limits section', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i mock the dashboard totals'],
    ['the dashboard links to limits'],
  );
});

test('a scanned receipt can be reviewed, corrected and saved as an expense', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(['i scan and save a receipt as an expense']);
});

test('a suggested category can be added from the category list', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(['i add a suggested category']);
});

test('a receipt can be added manually', async ({ e2e }) => {
  await interpreter(commands, e2e)(['i add a receipt manually']);
});

test('a receipt cannot be saved before any category exists', async ({
  e2e,
}) => {
  await interpreter(
    commands,
    e2e,
  )(['i cannot save a receipt before any category exists']);
});

test('expenses can be filtered by category', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i mock the expenses list'],
    ['expenses can be filtered by category'],
  );
});

test('an expense can be updated and removed', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i mock the expenses list'],
    ['i update an expense merchant name'],
    ['i delete the updated expense'],
  );
});

test('the dashboard exposes the month summary', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i mock the dashboard totals'],
    ['the dashboard shows the month summary'],
  );
});

test('a category spending limit with an 80% alert can be created', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(['i create an 80 percent category limit']);
});

test('a category limit can be raised and then removed', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i open a dashboard with a category limit'],
    ['i raise the category limit'],
    ['i remove the category limit'],
  );
});

test('a new category appears in the category list', async ({ e2e }) => {
  await interpreter(commands, e2e)(['a new category appears in the list']);
});

test('recurring expenses can be added and removed', async ({ e2e }) => {
  await interpreter(commands, e2e)(['i add and remove a recurring expense']);
});

test('a recurring expense is counted in its months', async ({ e2e }) => {
  await interpreter(
    commands,
    e2e,
  )(['a recurring expense counts in this month']);
});

test('the expenses list hosts the recurring add button', async ({ e2e }) => {
  await interpreter(
    commands,
    e2e,
  )(['the expenses list offers adding a recurring expense']);
});

test('the monthly report is downloadable', async ({ e2e }) => {
  await interpreter(commands, e2e)(['the monthly report downloads a csv']);
});

test('profile information can be managed from settings', async ({ e2e }) => {
  await interpreter(commands, e2e)(['i update my profile name']);
});

test('financial data can be exported as CSV', async ({ e2e }) => {
  await interpreter(commands, e2e)(['financial data exports as csv']);
});
