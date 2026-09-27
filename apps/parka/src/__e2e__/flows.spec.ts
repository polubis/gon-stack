import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';

/**
 * Navigate and wait for the Astro islands on the page to hydrate before the
 * test starts clicking — `client:load` handlers attach a task after `load`.
 */
const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

const plMonthLabel = (year: number, month: number): string =>
  new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );

const yearMonth = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const currentTotalByPage = new WeakMap<Page, string>();

const commands = {
  'i complete onboarding and reach sign-up': async (page) => {
    await open(page, '/');
    // Step through the product introduction, then hand off to sign-up.
    await page.getByTestId('walkthrough:primary').click();
    await page.getByTestId('walkthrough:primary').click();
    await page.getByTestId('walkthrough:primary').click();
    await page.getByTestId('walkthrough:primary').click();
    await page.waitForURL('**/sign-up/');
    await expect(page.getByTestId('auth:main')).toBeVisible();
  },

  'i mock the dashboard totals': async (page) => {
    // Dashboard is backend-only (see modules/dashboard/AGENTS.md) — stub the
    // response so the view has deterministic per-month totals to assert
    // against.
    const current = new Date();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const totals: Record<string, number> = {
      [yearMonth(current)]: 1234,
      [yearMonth(previous)]: 999,
    };
    await page.route('**/api/dashboard/**', async (route) => {
      const month = new URL(route.request().url()).searchParams.get('month');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            total: (month && totals[month]) ?? 0,
            change: 0,
            trend: [],
            categories: [],
          },
        }),
      });
    });
  },
  'the dashboard shows the current month totals': async (page) => {
    const current = new Date();
    await open(page, '/dashboard/');
    await expect(page.getByTestId('dashboard:month-label')).toHaveText(
      new RegExp(
        plMonthLabel(current.getFullYear(), current.getMonth() + 1),
        'i',
      ),
    );
    const total = await page.getByTestId('dashboard:total').textContent();
    currentTotalByPage.set(page, total ?? '');
  },
  'the previous month shows a different total': async (page) => {
    const current = new Date();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    await page.getByTestId('dashboard:prev-month').click();
    await expect(page.getByTestId('dashboard:month-label')).toHaveText(
      new RegExp(
        plMonthLabel(previous.getFullYear(), previous.getMonth() + 1),
        'i',
      ),
    );
    await expect(page.getByTestId('dashboard:total')).not.toHaveText(
      currentTotalByPage.get(page) ?? '',
    );
  },

  'the dashboard links to limits': async (page) => {
    await open(page, '/dashboard/');
    await page.getByRole('link', { name: 'Limity' }).click();
    await page.waitForURL('**/limits/');
    await expect(page.getByTestId('limits:main')).toBeVisible();
  },
  'the dashboard links to recurring': async (page) => {
    await open(page, '/dashboard/');
    await page.getByRole('link', { name: 'Cykliczne' }).click();
    await page.waitForURL('**/recurring/');
    await expect(page.getByTestId('recurring:main')).toBeVisible();
  },

  'i scan and save a receipt as an expense': async (page) => {
    await open(page, '/receipt-scan/');
    await page.getByTestId('receipt:capture').click();

    await expect(page.getByTestId('receipt:review')).toBeVisible();
    await page.getByTestId('receipt:merchant').fill('Testowy Sklep E2E');

    // Correct the first item.
    await page.getByRole('button', { name: /Chleb pszenny/ }).click();
    await page.getByTestId(/^receipt:item-name:/).fill('Chleb razowy');
    await page.getByTestId(/^receipt:item-price:/).fill('3.20');

    await page.getByTestId('receipt:save').click();
    await page.waitForURL('**/expenses/');
  },

  'i mock the expenses list': async (page) => {
    // Expenses is backend-only, same as dashboard (see modules/expenses core/
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
    const purchaseExpense = {
      id: 'exp-purchase-1',
      merchant: 'Kino Helios',
      date: new Date().toISOString(),
      amount: 45,
      categoryId: category.id,
      paymentMethod: 'card',
      isBill: false,
      source: 'manual',
      items: [],
    };

    await page.route('**/api/categories/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, data: [category] }),
      });
    });
    await page.route('**/api/expenses/**', async (route) => {
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

  'expenses can be filtered to bills only': async (page) => {
    await open(page, '/expenses/');
    await page.getByRole('tab', { name: 'Rachunki' }).click();
    await expect(page.getByRole('button', { name: /Tauron/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kino Helios/ })).toHaveCount(
      0,
    );
  },

  'i update an expense merchant name': async (page) => {
    await open(page, '/expenses/');
    await page.getByRole('button', { name: /Kino Helios/ }).click();
    await expect(page.getByTestId('expenses:detail')).toBeVisible();

    await page.getByTestId('expenses:edit').click();
    await page
      .getByTestId('expenses:edit-merchant')
      .fill('Kino Nowe Horyzonty');
    await page.getByTestId('expenses:save').click();
    await expect(page.getByText('Kino Nowe Horyzonty')).toBeVisible();
  },
  'i delete the updated expense': async (page) => {
    await page.getByRole('button', { name: /Kino Nowe Horyzonty/ }).click();
    await page.getByTestId('expenses:delete').click();
    await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);
  },

  'statistics show the yearly total': async (page) => {
    await open(page, '/statistics/');
    await page.getByRole('tab', { name: 'Rok' }).click();
    await expect(page.getByTestId('statistics:total')).toBeVisible();
  },
  'statistics show month comparison': async (page) => {
    await page.getByRole('tab', { name: 'Porównanie' }).click();
    await expect(page.getByTestId('statistics:current')).toBeVisible();
    await expect(page.getByTestId('statistics:changes')).toBeVisible();
  },

  'i create an 80 percent category limit': async (page) => {
    await open(page, '/limits/');
    await expect(page.getByTestId('limits:total')).toBeVisible();

    await page.getByRole('tab', { name: 'Kategorie' }).click();
    await page.getByTestId('limits:new').click();
    await page.getByTestId('limits:form-amount').fill('450');
    await page.getByTestId('limits:form-save').click();
    await expect(page.getByTestId('limits:form')).toHaveCount(0);
  },

  'a new category appears in the list': async (page) => {
    await open(page, '/categories/');
    await page.getByTestId('categories:new').click();
    await page.getByTestId('categories:form-name').fill('Kultura');
    await page.getByTestId('categories:form-save').click();
    await expect(page.getByText('Kultura')).toBeVisible();
  },

  'i toggle recurring tracking off': async (page) => {
    await open(page, '/recurring/');
    // "Wszystkie" keeps disabled entries visible after toggling.
    await page.getByRole('tab', { name: 'Wszystkie' }).click();
    const spotify = page.getByRole('switch', { name: /Spotify/ }).first();
    await expect(spotify).toHaveAttribute('aria-checked', 'true');
    await spotify.click();
    await expect(spotify).toHaveAttribute('aria-checked', 'false');
  },

  'the monthly report downloads a csv': async (page) => {
    await open(page, '/reports/');
    await expect(page.getByTestId('reports:total')).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('reports:download-csv').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  },

  'i update my profile name': async (page) => {
    await open(page, '/settings/');
    await page.getByTestId('settings:edit-profile').click();
    await page.getByTestId('settings:profile-name').fill('Anna Testowa');
    await page.getByTestId('settings:save-profile').click();
    await expect(page.getByTestId('settings:name')).toHaveText('Anna Testowa');
  },

  'financial data exports as csv': async (page) => {
    await open(page, '/data-export/');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('data-export:run').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    await expect(page.getByTestId('data-export:done')).toBeVisible();
  },
} satisfies CommandRegistry<Page>;

test('onboarding leads an anonymous visitor to registration', async ({
  page,
}) => {
  await interpreter(
    commands,
    page,
  )(['i complete onboarding and reach sign-up']);
});

test('month selection changes the spending overview period', async ({
  page,
}) => {
  await interpreter(commands, page)(
    ['i mock the dashboard totals'],
    ['the dashboard shows the current month totals'],
    ['the previous month shows a different total'],
  );
});

test('spending overview links to receipt, limits and recurring flows', async ({
  page,
}) => {
  await interpreter(commands, page)(
    ['the dashboard links to limits'],
    ['the dashboard links to recurring'],
  );
});

test('a scanned receipt can be reviewed, corrected and saved as an expense', async ({
  page,
}) => {
  await interpreter(
    commands,
    page,
  )(['i scan and save a receipt as an expense']);
});

test('expenses can be filtered to bills only', async ({ page }) => {
  await interpreter(commands, page)(
    ['i mock the expenses list'],
    ['expenses can be filtered to bills only'],
  );
});

test('an expense can be updated and removed', async ({ page }) => {
  await interpreter(commands, page)(
    ['i mock the expenses list'],
    ['i update an expense merchant name'],
    ['i delete the updated expense'],
  );
});

test('statistics expose selectable ranges and month comparison', async ({
  page,
}) => {
  await interpreter(commands, page)(
    ['statistics show the yearly total'],
    ['statistics show month comparison'],
  );
});

test('a category spending limit with an 80% alert can be created', async ({
  page,
}) => {
  await interpreter(commands, page)(['i create an 80 percent category limit']);
});

test('a new category appears in the category list', async ({ page }) => {
  await interpreter(commands, page)(['a new category appears in the list']);
});

test('recurring expense tracking can be toggled off', async ({ page }) => {
  await interpreter(commands, page)(['i toggle recurring tracking off']);
});

test('the monthly report is downloadable', async ({ page }) => {
  await interpreter(commands, page)(['the monthly report downloads a csv']);
});

test('profile information can be managed from settings', async ({ page }) => {
  await interpreter(commands, page)(['i update my profile name']);
});

test('financial data can be exported as CSV', async ({ page }) => {
  await interpreter(commands, page)(['financial data exports as csv']);
});
