import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end verification that every Parka feature works against the real
 * Supabase (Postgres) backend — not the localStorage demo store.
 *
 * The flow registers a fresh account (which seeds per-user demo data through a
 * Postgres trigger), then exercises each feature and reloads the page to prove
 * the change round-tripped through the database under row-level security.
 */

const EMAIL = `e2e-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

/** Wait for the store's debounced full-state sync (PUT /api/state) to land. */
const synced = (page: Page) =>
  page.waitForResponse(
    (r) =>
      r.url().includes('/api/state') &&
      r.request().method() === 'PUT' &&
      r.status() === 200,
  );

const reload = async (page: Page): Promise<void> => {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

test('every feature works against the real Supabase backend', async ({
  page,
}) => {
  // --- Registration: creates a backend session + seeded demo data ----------
  await open(page, '/sign-up/');
  await page.getByTestId('auth:email').fill(EMAIL);
  await page.getByTestId('auth:password').fill(PASSWORD);
  await page.getByTestId('auth:submit').click();
  await page.waitForURL('**/dashboard/');

  // Totals are computed from rows the trigger inserted into Postgres.
  await expect(page.getByTestId('dashboard:month-label')).toHaveText(
    /kwiecień 2025/i,
  );
  await expect(page.getByTestId('dashboard:total')).toContainText('zł');

  // --- Spending overview: month selection reads other months from the DB ---
  await page.getByTestId('dashboard:prev-month').click();
  await expect(page.getByTestId('dashboard:month-label')).toHaveText(
    /marzec 2025/i,
  );
  await page.getByTestId('dashboard:next-month').click();
  await expect(page.getByTestId('dashboard:month-label')).toHaveText(
    /kwiecień 2025/i,
  );

  // --- Categories: create, then confirm it survives a reload --------------
  await open(page, '/categories/');
  await page.getByTestId('categories:new').click();
  await page.getByTestId('categories:form-name').fill('Kultura');
  await Promise.all([
    synced(page),
    page.getByTestId('categories:form-save').click(),
  ]);
  await expect(page.getByText('Kultura')).toBeVisible();
  await reload(page);
  await expect(page.getByText('Kultura')).toBeVisible();

  // --- Receipt scanning: AI review -> persist as an expense --------------
  await open(page, '/receipt-scan/');
  await page.getByTestId('receipt:capture').click();
  await expect(page.getByTestId('receipt:review')).toBeVisible();
  await page.getByTestId('receipt:merchant').fill('Sklep E2E Backend');
  await page.getByRole('button', { name: /Chleb pszenny/ }).click();
  await page.getByTestId('receipt:item-name').first().fill('Chleb razowy');
  await page.getByTestId('receipt:item-price').first().fill('3.20');
  await page.getByTestId('receipt:save').click();
  await page.waitForURL('**/expenses/');
  await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
  await reload(page);
  await expect(page.getByText('Sklep E2E Backend')).toBeVisible();

  // --- Expenses: filter, update and remove ------------------------------
  await page.getByRole('tab', { name: 'Rachunki' }).click();
  await expect(page.getByRole('button', { name: /Tauron/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Kino Helios/ })).toHaveCount(
    0,
  );
  await page.getByRole('tab', { name: 'Wszystkie' }).click();

  await page.getByRole('button', { name: /Kino Helios/ }).click();
  await expect(page.getByTestId('expenses:detail')).toBeVisible();
  await page.getByTestId('expenses:edit').click();
  await page.getByTestId('expenses:edit-merchant').fill('Kino Nowe Horyzonty');
  await Promise.all([synced(page), page.getByTestId('expenses:save').click()]);
  await expect(page.getByText('Kino Nowe Horyzonty')).toBeVisible();
  await reload(page);
  await expect(page.getByText('Kino Nowe Horyzonty')).toBeVisible();

  await page.getByRole('button', { name: /Kino Nowe Horyzonty/ }).click();
  await Promise.all([
    synced(page),
    page.getByTestId('expenses:delete').click(),
  ]);
  await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);
  await reload(page);
  await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);

  // --- Statistics & reports --------------------------------------------
  await open(page, '/statistics/');
  await page.getByRole('tab', { name: 'Rok' }).click();
  await expect(page.getByTestId('statistics:total')).toContainText('zł');
  await page.getByRole('tab', { name: 'Porównanie' }).click();
  await expect(page.getByTestId('statistics:current')).toBeVisible();
  await expect(page.getByTestId('statistics:changes')).toBeVisible();

  await open(page, '/reports/');
  await expect(page.getByTestId('reports:total')).toContainText('zł');
  const [csv] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('reports:download-csv').click(),
  ]);
  expect(csv.suggestedFilename()).toMatch(/\.csv$/);

  // --- Limits & goals: create a category limit -------------------------
  await open(page, '/limits/');
  await expect(page.getByTestId('limits:total')).toBeVisible();
  await page.getByRole('tab', { name: 'Kategorie' }).click();
  await page.getByTestId('limits:new').click();
  await page.getByTestId('limits:form-amount').fill('450');
  await Promise.all([
    synced(page),
    page.getByTestId('limits:form-save').click(),
  ]);
  await expect(page.getByTestId('limits:form')).toHaveCount(0);
  await reload(page);
  await page.getByRole('tab', { name: 'Kategorie' }).click();
  await expect(
    page.getByTestId('limits:category-list').getByText('Rachunki'),
  ).toBeVisible();

  // --- Recurring expenses: toggle tracking off, persist --------------
  await open(page, '/recurring/');
  await page.getByRole('tab', { name: 'Wszystkie' }).click();
  const spotify = page.getByRole('switch', { name: /Spotify/ }).first();
  await expect(spotify).toHaveAttribute('aria-checked', 'true');
  await Promise.all([synced(page), spotify.click()]);
  await expect(spotify).toHaveAttribute('aria-checked', 'false');
  await reload(page);
  await page.getByRole('tab', { name: 'Wszystkie' }).click();
  await expect(
    page.getByRole('switch', { name: /Spotify/ }).first(),
  ).toHaveAttribute('aria-checked', 'false');

  // --- Notifications ------------------------------------------------
  await open(page, '/notifications/');
  await expect(
    page.getByTestId('notifications:list').getByRole('listitem').first(),
  ).toBeVisible();

  // --- Settings: update profile, persist across reload -------------
  await open(page, '/settings/');
  await page.getByTestId('settings:edit-profile').click();
  await page.getByTestId('settings:profile-name').fill('Anna Backendowa');
  await Promise.all([
    synced(page),
    page.getByTestId('settings:save-profile').click(),
  ]);
  await expect(page.getByTestId('settings:name')).toHaveText('Anna Backendowa');
  await reload(page);
  await expect(page.getByTestId('settings:name')).toHaveText('Anna Backendowa');

  // --- Data export ------------------------------------------------
  await open(page, '/data-export/');
  const [dump] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('data-export:run').click(),
  ]);
  expect(dump.suggestedFilename()).toMatch(/\.csv$/);
  await expect(page.getByTestId('data-export:done')).toBeVisible();

  // --- Sign out, then sign back in: data persisted in Postgres ----
  await open(page, '/settings/');
  await Promise.all([
    page.waitForURL('**/sign-in/'),
    page.getByTestId('settings:sign-out').click(),
  ]);
  await page.getByTestId('auth:email').fill(EMAIL);
  await page.getByTestId('auth:password').fill(PASSWORD);
  await page.getByTestId('auth:submit').click();
  await page.waitForURL('**/dashboard/');

  await open(page, '/settings/');
  await expect(page.getByTestId('settings:name')).toHaveText('Anna Backendowa');
  await open(page, '/categories/');
  await expect(page.getByText('Kultura')).toBeVisible();
  await open(page, '/expenses/');
  await expect(page.getByText('Sklep E2E Backend')).toBeVisible();
  await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);
});
