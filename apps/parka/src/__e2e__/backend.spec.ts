import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
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
  'i register a new account': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
    await ctx.page.waitForTimeout(150);
  },

  'the dashboard opens on the current month': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(0), 'i'),
    );
    await expect(getByE2e('dashboard:total')).toContainText('zł');
  },
  'month navigation reads other months from the db': async ({ getByE2e }) => {
    await getByE2e('dashboard:prev-month').click();
    await expect(getByE2e('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(-1), 'i'),
    );
    await getByE2e('dashboard:next-month').click();
    await expect(getByE2e('dashboard:month-label')).toHaveText(
      new RegExp(plMonthLabel(0), 'i'),
    );
  },

  'i add suggested categories and they survive a reload': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.categories());
    await Promise.all([
      synced(page, 'POST', API_ROUTER.categories(), 201),
      getByE2e('categories:add-default:groceries').click(),
    ]);
    await expect(getByE2e('categories:row:groceries')).toContainText(
      'Spożywcze',
    );
    await reload(page);
    await expect(getByE2e('categories:row:groceries')).toContainText(
      'Spożywcze',
    );
  },
  'i create a category and it survives a reload': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.categories());
    await getByE2e('categories:form-name').fill('Kultura');
    await Promise.all([
      synced(page, 'POST', API_ROUTER.categories(), 201),
      getByE2e('categories:form-save').click(),
    ]);
    await expect(page.getByText('Kultura')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Kultura')).toBeVisible();
  },

  'i scan a receipt and save it as an expense': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.receiptScan());
    await getByE2e('receipt:capture').click();
    await expect(getByE2e('receipt:review')).toBeVisible();
    await getByE2e('receipt:merchant').fill('Sklep E2E Backend');
    await page.getByRole('button', { name: /Nowy produkt/ }).click();
    await getByE2ePrefix('receipt:item-name:').fill('Chleb razowy');
    await getByE2ePrefix('receipt:item-price:').fill('3.20');
    await getByE2e('receipt:save').click();
    await page.waitForURL(`**${APP_ROUTER.expenses()}`);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
  },

  'i update and delete an expense': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.expenses());
    await page.getByRole('button', { name: /Sklep E2E Backend/ }).click();
    await expect(getByE2e('expenses:detail')).toBeVisible();
    await getByE2e('expenses:edit').click();
    await getByE2e('expenses:edit-merchant').fill('Sklep Nowy');
    await Promise.all([
      synced(page, 'PUT', API_ROUTER.expenses()),
      getByE2e('expenses:save').click(),
    ]);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();

    await page.getByRole('button', { name: /Sklep Nowy/ }).click();
    await Promise.all([
      synced(page, 'DELETE', API_ROUTER.expenses()),
      getByE2e('expenses:delete').click(),
    ]);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },

  'the dashboard exposes year and comparison views': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.dashboard());
    await page.getByRole('tab', { name: 'Rok' }).click();
    await expect(getByE2e('dashboard:range-total')).toContainText('zł');
    await expect(getByE2e('dashboard:previous-total')).toContainText('zł');
    await expect(getByE2e('dashboard:changes')).toBeVisible();
  },
  'the report totals and downloads a csv': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.reports());
    await expect(getByE2e('reports:total')).toContainText('zł');
    const [csv] = await Promise.all([
      page.waitForEvent('download'),
      getByE2e('reports:download-csv').click(),
    ]);
    expect(csv.suggestedFilename()).toMatch(/\.csv$/);
  },

  'i create a category limit': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.limits());
    await page.getByRole('tab', { name: 'Kategorie' }).click();
    await getByE2e('limits:new').click();
    await getByE2e('limits:form-amount').fill('450');
    await Promise.all([
      synced(page, 'POST', API_ROUTER.limits(), 201),
      getByE2e('limits:form-save').click(),
    ]);
    await expect(getByE2e('limits:form')).toHaveCount(0);
    await reload(page);
    await page.getByRole('tab', { name: 'Kategorie' }).click();
    await expect(
      getByE2e('limits:category-list').getByText('Spożywcze'),
    ).toBeVisible();
  },

  'i update my settings profile': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.settings());
    await getByE2e('settings:edit-profile').click();
    await getByE2e('settings:profile-name').fill('Anna Backendowa');
    await Promise.all([
      synced(page, 'PUT', API_ROUTER.settings()),
      getByE2e('settings:save-profile').click(),
    ]);
    await expect(getByE2e('settings:name')).toHaveText('Anna Backendowa');
    await reload(page);
    await expect(getByE2e('settings:name')).toHaveText('Anna Backendowa');
  },

  'data export downloads a csv': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dataExport());
    const [dump] = await Promise.all([
      page.waitForEvent('download'),
      getByE2e('data-export:run').click(),
    ]);
    expect(dump.suggestedFilename()).toMatch(/\.csv$/);
    await expect(getByE2e('data-export:done')).toBeVisible();
  },

  'i sign out and sign back in': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.settings());
    await Promise.all([
      page.waitForURL(`**${APP_ROUTER.signIn()}`),
      getByE2e('settings:sign-out').click(),
    ]);
    await getByE2e('auth:email').fill(EMAIL);
    await getByE2e('auth:password').fill(PASSWORD);
    await getByE2e('auth:submit').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
  },
  'data persisted in postgres after sign back in': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.settings());
    await expect(getByE2e('settings:name')).toHaveText('Anna Backendowa');
    await open(page, APP_ROUTER.categories());
    await expect(page.getByText('Kultura')).toBeVisible();
    await open(page, APP_ROUTER.expenses());
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

test('every feature works against the real Supabase backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register a new account'],
    ['the dashboard opens on the current month'],
    ['month navigation reads other months from the db'],
    ['i add suggested categories and they survive a reload'],
    ['i create a category and it survives a reload'],
    ['i scan a receipt and save it as an expense'],
    ['i update and delete an expense'],
    ['the dashboard exposes year and comparison views'],
    ['the report totals and downloads a csv'],
    ['i create a category limit'],
    ['i update my settings profile'],
    ['data export downloads a csv'],
    ['i sign out and sign back in'],
    ['data persisted in postgres after sign back in'],
  );
});
