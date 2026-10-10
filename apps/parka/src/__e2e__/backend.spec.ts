import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { registerAndConfirm } from './mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * End-to-end verification that every Parka feature works against the real
 * Supabase (Postgres) backend.
 *
 * The flow registers a fresh account (which starts with no data), then exercises each feature and reloads the page to prove
 * the change round-tripped through the database under row-level security.
 */

const monthValue = (offset: number): string => {
  const date = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + offset,
    1,
  );
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

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
    await expect(getByE2e('dashboard:month-select')).toHaveValue(monthValue(0));
    await expect(getByE2e('dashboard:total')).toContainText('zł');
  },
  'month navigation reads other months from the db': async ({ getByE2e }) => {
    await getByE2e('dashboard:month-select').selectOption(monthValue(-1));
    await expect(getByE2e('dashboard:month-select')).toHaveValue(
      monthValue(-1),
    );
    await getByE2e('dashboard:month-select').selectOption(monthValue(0));
    await expect(getByE2e('dashboard:month-select')).toHaveValue(monthValue(0));
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

  'i add an expense with a product and save it': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.newExpense());
    await expect(getByE2e('expense-form:form')).toBeVisible();
    await getByE2e('expense-form:merchant').fill('Sklep E2E Backend');
    await getByE2e('expense-form:add-product').click();
    await getByE2ePrefix('expense-form:product-name:').fill('Chleb razowy');
    await getByE2ePrefix('expense-form:product-price:').fill('3.20');
    await getByE2e('expense-form:save').click();
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
  },

  'i update and delete an expense': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await page.getByRole('button', { name: /Sklep E2E Backend/ }).click();
    await expect(getByE2e('dashboard:detail')).toBeVisible();
    await getByE2e('dashboard:edit').click();
    await page.waitForURL('**/app/expenses/edit/**');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(150);
    await getByE2e('expense-form:merchant').fill('Sklep Nowy');
    await Promise.all([
      synced(page, 'PUT', API_ROUTER.expenses()),
      getByE2e('expense-form:save').click(),
    ]);
    await page.waitForURL(`**${APP_ROUTER.dashboard()}**`);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toBeVisible();

    await page.getByRole('button', { name: /Sklep Nowy/ }).click();
    await Promise.all([
      synced(page, 'DELETE', API_ROUTER.expenses()),
      getByE2e('dashboard:delete').click(),
    ]);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
    await reload(page);
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },

  'the dashboard exposes the month summary': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:transactions')).toBeVisible();
    await expect(getByE2e('dashboard:total')).toContainText('zł');
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
    await open(page, APP_ROUTER.dashboard());
    await getByE2e('dashboard:limit-new').click();
    await getByE2e('dashboard:limit-form-amount').fill('450');
    await Promise.all([
      synced(page, 'POST', API_ROUTER.limits(), 201),
      getByE2e('dashboard:limit-form-save').click(),
    ]);
    await expect(getByE2e('dashboard:limit-form')).toHaveCount(0);
    await reload(page);
    await expect(
      getByE2e('dashboard:limit-list').getByText('Spożywcze'),
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
    await open(page, APP_ROUTER.dashboard());
    await expect(page.getByText('Sklep Nowy')).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

// Skipped: see src/__e2e__/__log__/0003-skip-backend-e2e.md
test.skip('every feature works against the real Supabase backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register a new account'],
    ['the dashboard opens on the current month'],
    ['month navigation reads other months from the db'],
    ['i add suggested categories and they survive a reload'],
    ['i create a category and it survives a reload'],
    ['i add an expense with a product and save it'],
    ['i update and delete an expense'],
    ['the dashboard exposes the month summary'],
    ['the report totals and downloads a csv'],
    ['i create a category limit'],
    ['i update my settings profile'],
    ['data export downloads a csv'],
    ['i sign out and sign back in'],
    ['data persisted in postgres after sign back in'],
  );
});
