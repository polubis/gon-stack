import { expect, test, type Page } from '@playwright/test';

/**
 * Navigate and wait for the Astro islands on the page to hydrate before the
 * test starts clicking — `client:load` handlers attach a task after `load`.
 */
const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(200);
};

test('onboarding leads an anonymous visitor to registration', async ({
  page,
}) => {
  await open(page, '/');
  // Step through the product introduction, then hand off to sign-up.
  await page.getByTestId('home:primary').click();
  await page.getByTestId('home:primary').click();
  await page.getByTestId('home:primary').click();
  await page.getByTestId('home:primary').click();
  await page.waitForURL('**/sign-up/');
  await expect(page.getByTestId('auth:main')).toBeVisible();
});

test('month selection changes the spending overview period', async ({
  page,
}) => {
  await open(page, '/dashboard/');
  await expect(page.getByTestId('dashboard:month-label')).toHaveText(
    /kwiecień 2025/i,
  );
  const aprilTotal = await page.getByTestId('dashboard:total').textContent();

  await page.getByTestId('dashboard:prev-month').click();
  await expect(page.getByTestId('dashboard:month-label')).toHaveText(
    /marzec 2025/i,
  );
  await expect(page.getByTestId('dashboard:total')).not.toHaveText(
    aprilTotal ?? '',
  );
});

test('spending overview links to receipt, limits and recurring flows', async ({
  page,
}) => {
  await open(page, '/dashboard/');
  await page.getByRole('link', { name: 'Limity' }).click();
  await page.waitForURL('**/limits/');
  await expect(page.getByTestId('limits:main')).toBeVisible();

  await open(page, '/dashboard/');
  await page.getByRole('link', { name: 'Cykliczne' }).click();
  await page.waitForURL('**/recurring/');
  await expect(page.getByTestId('recurring:main')).toBeVisible();
});

test('a scanned receipt can be reviewed, corrected and persisted as an expense', async ({
  page,
}) => {
  await open(page, '/receipt-scan/');
  await page.getByTestId('receipt:capture').click();

  await expect(page.getByTestId('receipt:review')).toBeVisible();
  await page.getByTestId('receipt:merchant').fill('Testowy Sklep E2E');

  // Correct the first item.
  await page.getByRole('button', { name: /Chleb pszenny/ }).click();
  await page.getByTestId('receipt:item-name').first().fill('Chleb razowy');
  await page.getByTestId('receipt:item-price').first().fill('3.20');

  await page.getByTestId('receipt:save').click();
  await page.waitForURL('**/expenses/');
  await expect(page.getByText('Testowy Sklep E2E')).toBeVisible();
});

test('expenses can be filtered to bills only', async ({ page }) => {
  await open(page, '/expenses/');
  await page.getByRole('tab', { name: 'Rachunki' }).click();
  await expect(page.getByRole('button', { name: /Tauron/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Kino Helios/ })).toHaveCount(
    0,
  );
});

test('an expense can be updated and removed', async ({ page }) => {
  await open(page, '/expenses/');
  await page.getByRole('button', { name: /Kino Helios/ }).click();
  await expect(page.getByTestId('expenses:detail')).toBeVisible();

  await page.getByTestId('expenses:edit').click();
  await page.getByTestId('expenses:edit-merchant').fill('Kino Nowe Horyzonty');
  await page.getByTestId('expenses:save').click();
  await expect(page.getByText('Kino Nowe Horyzonty')).toBeVisible();

  await page.getByRole('button', { name: /Kino Nowe Horyzonty/ }).click();
  await page.getByTestId('expenses:delete').click();
  await expect(page.getByText('Kino Nowe Horyzonty')).toHaveCount(0);
});

test('statistics expose selectable ranges and month comparison', async ({
  page,
}) => {
  await open(page, '/statistics/');
  await page.getByRole('tab', { name: 'Rok' }).click();
  await expect(page.getByTestId('statistics:total')).toBeVisible();

  await page.getByRole('tab', { name: 'Porównanie' }).click();
  await expect(page.getByTestId('statistics:current')).toBeVisible();
  await expect(page.getByTestId('statistics:changes')).toBeVisible();
});

test('a category spending limit with an 80% alert can be created', async ({
  page,
}) => {
  await open(page, '/limits/');
  await expect(page.getByTestId('limits:total')).toBeVisible();

  await page.getByRole('tab', { name: 'Kategorie' }).click();
  await page.getByTestId('limits:new').click();
  await page.getByTestId('limits:form-amount').fill('450');
  await page.getByTestId('limits:form-save').click();
  await expect(page.getByTestId('limits:form')).toHaveCount(0);
});

test('a new category appears in the category list', async ({ page }) => {
  await open(page, '/categories/');
  await page.getByTestId('categories:new').click();
  await page.getByTestId('categories:form-name').fill('Kultura');
  await page.getByTestId('categories:form-save').click();
  await expect(page.getByText('Kultura')).toBeVisible();
});

test('recurring expense tracking can be toggled off', async ({ page }) => {
  await open(page, '/recurring/');
  // "Wszystkie" keeps disabled entries visible after toggling.
  await page.getByRole('tab', { name: 'Wszystkie' }).click();
  const spotify = page.getByRole('switch', { name: /Spotify/ }).first();
  await expect(spotify).toHaveAttribute('aria-checked', 'true');
  await spotify.click();
  await expect(spotify).toHaveAttribute('aria-checked', 'false');
});

test('the monthly report is downloadable', async ({ page }) => {
  await open(page, '/reports/');
  await expect(page.getByTestId('reports:total')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('reports:download-csv').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
});

test('profile information can be managed from settings', async ({ page }) => {
  await open(page, '/settings/');
  await page.getByTestId('settings:edit-profile').click();
  await page.getByTestId('settings:profile-name').fill('Anna Testowa');
  await page.getByTestId('settings:save-profile').click();
  await expect(page.getByTestId('settings:name')).toHaveText('Anna Testowa');
});

test('financial data can be exported as CSV', async ({ page }) => {
  await open(page, '/data-export/');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('data-export:run').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  await expect(page.getByTestId('data-export:done')).toBeVisible();
});
