import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { registerAndConfirm } from './mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router';

/**
 * End-to-end verification that every Parka feature works against the real
 * Supabase (Postgres) backend.
 *
 * The flow registers a fresh account (which starts with no data), then exercises each feature and reloads the page to prove
 * the change round-tripped through the database under row-level security.
 */

const plMonthLabel = (offset: number): string =>
  new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(
    new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1),
  );

const EMAIL = `e2e-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

/** Wait for a specific per-entity write to land. */
const synced = (page: Page, method: string, path: string, status = 200) =>
  page.waitForResponse(
    (r) =>
      r.url().includes(path) &&
      r.request().method() === method &&
      r.status() === status,
  );

const reload = async (page: Page): Promise<void> => {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const commands = {
  'i register a new account': async (page) => {
    await registerAndConfirm(page, EMAIL, PASSWORD);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(150);
  },

  'the dashboard opens on the current month': async (page) => {
    await open(page, APP_ROUTER.dashboard());
    await expect(page.getByTestId('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(0), 'i'),
    );
    await expect(page.getByTestId('dashboard:total')).toContainText('zł');
  },
  'month navigation reads other months from the db': async (page) => {
    await page.getByTestId('dashboard:prev-month').click();
    await expect(page.getByTestId('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(-1), 'i'),
    );
    await page.getByTestId('dashboard:next-month').click();
    await expect(page.getByTestId('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(0), 'i'),
    );
  },

  'i add suggested categories and they survive a reload': async (page) => {
    await open(page, APP_ROUTER.categories());
    await page.getByTestId('categories:add-default:groceries').click();
    await expect(page.getByTestId('categories:row:groceries')).toContainText(
      'Spożywcze',
    );
    await reload(page);
    await expect(page.getByTestId('categories:row:groceries')).toContainText(
      'Spożywcze',
    );
  },
  'i create a category and it survives a reload': async (page) => {
    await open(page, APP_ROUTER.categories());
    await page.getByTestId('categories:new').click();
    await page.getByTestId('categories:form-name').fill('Kultura');
    await Promise.all([
      synced(page, 'POST', API_ROUTER.categories(), 201),
      page.getByTestId('categories:form-save').click(),
    ]);
    await expect(page.getByText('Kultura')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Kultura')).toBeVisible();
  },

  'i scan a receipt and save it as an expense': async (page) => {
    await open(page, APP_ROUTER.receiptScan());
    await page.getByTestId('receipt:capture').click();
    await expect(page.getByTestId('receipt:review')).toBeVisible();
    await page.getByTestId('receipt:merchant').fill('Sklep E2E Backend');
    await page.getByRole('button', { name: /Nowy produkt/ }).click();
    await page.getByTestId(/^receipt:item-name:/).fill('Chleb razowy');
    await page.getByTestId(/^receipt:item-price:/).fill('3.20');
    await page.getByTestId('receipt:save').click();
    await page.waitForURL(`**${APP_ROUTER.expenses()}`);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
  },

  'i update and delete an expense': async (page) => {
    await open(page, APP_ROUTER.expenses());
    await page.getByRole('button', { name: /Sklep E2E Backend/ }).click();
    await expect(page.getByTestId('expenses:detail')).toBeVisible();
    await page.getByTestId('expenses:edit').click();
    await page.getByTestId('expenses:edit-merchant').fill('Sklep Nowy');
    await Promise.all([
      synced(page, 'PUT', API_ROUTER.expenses()),
      page.getByTestId('expenses:save').click(),
    ]);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();

    await page.getByRole('button', { name: /Sklep Nowy/ }).click();
    await Promise.all([
      synced(page, 'DELETE', API_ROUTER.expenses()),
      page.getByTestId('expenses:delete').click(),
    ]);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },

  'statistics expose year and comparison views': async (page) => {
    await open(page, APP_ROUTER.statistics());
    await page.getByRole('tab', { name: 'Rok' }).click();
    await expect(page.getByTestId('statistics:total')).toContainText('zł');
    await page.getByRole('tab', { name: 'Porównanie' }).click();
    await expect(page.getByTestId('statistics:current')).toBeVisible();
    await expect(page.getByTestId('statistics:changes')).toBeVisible();
  },
  'the report totals and downloads a csv': async (page) => {
    await open(page, APP_ROUTER.reports());
    await expect(page.getByTestId('reports:total')).toContainText('zł');
    const [csv] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('reports:download-csv').click(),
    ]);
    expect(csv.suggestedFilename()).toMatch(/\.csv$/);
  },

  'i create a category limit': async (page) => {
    await open(page, APP_ROUTER.limits());
    await page.getByRole('tab', { name: 'Kategorie' }).click();
    await page.getByTestId('limits:new').click();
    await page.getByTestId('limits:form-amount').fill('450');
    await Promise.all([
      synced(page, 'POST', API_ROUTER.limits(), 201),
      page.getByTestId('limits:form-save').click(),
    ]);
    await expect(page.getByTestId('limits:form')).toHaveCount(0);
    await reload(page);
    await page.getByRole('tab', { name: 'Kategorie' }).click();
    await expect(
      page.getByTestId('limits:category-list').getByText('Spożywcze'),
    ).toBeVisible();
  },

  'i update my settings profile': async (page) => {
    await open(page, APP_ROUTER.settings());
    await page.getByTestId('settings:edit-profile').click();
    await page.getByTestId('settings:profile-name').fill('Anna Backendowa');
    await Promise.all([
      synced(page, 'PUT', API_ROUTER.settings()),
      page.getByTestId('settings:save-profile').click(),
    ]);
    await expect(page.getByTestId('settings:name')).toHaveText(
      'Anna Backendowa',
    );
    await reload(page);
    await expect(page.getByTestId('settings:name')).toHaveText(
      'Anna Backendowa',
    );
  },

  'data export downloads a csv': async (page) => {
    await open(page, APP_ROUTER.dataExport());
    const [dump] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('data-export:run').click(),
    ]);
    expect(dump.suggestedFilename()).toMatch(/\.csv$/);
    await expect(page.getByTestId('data-export:done')).toBeVisible();
  },

  'i sign out and sign back in': async (page) => {
    await open(page, APP_ROUTER.settings());
    await Promise.all([
      page.waitForURL(`**${APP_ROUTER.signIn()}`),
      page.getByTestId('settings:sign-out').click(),
    ]);
    await page.getByTestId('auth:email').fill(EMAIL);
    await page.getByTestId('auth:password').fill(PASSWORD);
    await page.getByTestId('auth:submit').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
  },
  'data persisted in postgres after sign back in': async (page) => {
    await open(page, APP_ROUTER.settings());
    await expect(page.getByTestId('settings:name')).toHaveText(
      'Anna Backendowa',
    );
    await open(page, APP_ROUTER.categories());
    await expect(page.getByText('Kultura')).toBeVisible();
    await open(page, APP_ROUTER.expenses());
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },
} satisfies CommandRegistry<Page>;

test('every feature works against the real Supabase backend', async ({
  page,
}) => {
  await interpreter(commands, page)(
    ['i register a new account'],
    ['the dashboard opens on the current month'],
    ['month navigation reads other months from the db'],
    ['i add suggested categories and they survive a reload'],
    ['i create a category and it survives a reload'],
    ['i scan a receipt and save it as an expense'],
    ['i update and delete an expense'],
    ['statistics expose year and comparison views'],
    ['the report totals and downloads a csv'],
    ['i create a category limit'],
    ['i update my settings profile'],
    ['data export downloads a csv'],
    ['i sign out and sign back in'],
    ['data persisted in postgres after sign back in'],
  );
});
