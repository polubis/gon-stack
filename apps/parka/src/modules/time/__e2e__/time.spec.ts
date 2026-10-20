import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * Time module against the real Supabase backend: a fresh account gets the
 * default categories and priorities, creates / completes / edits / deletes a
 * task, and every change survives a reload (Postgres round trip under RLS).
 */

const EMAIL = `e2e-time-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-10-20';

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const reload = async (page: Page): Promise<void> => {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const synced = (page: Page, method: string, status: number) =>
  page.waitForResponse(
    (r) =>
      r.url().includes('/api/time/') &&
      r.request().method() === method &&
      r.status() === status,
  );

const commands = {
  'i register a new account': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'the day view of an empty account names the day': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(getByE2e('time:empty')).toContainText(
      'wtorek, 20 października 2026',
    );
  },

  'the new account starts with default categories and priorities': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:empty').getByRole('button').click();
    const dialog = getByE2e('time:task-dialog');
    await expect(dialog.getByRole('radio', { name: 'Praca' })).toBeVisible();
    await expect(
      dialog.getByRole('radio', { name: 'Odpoczynek' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('radio', { name: '5 - Średni' }),
    ).toBeChecked();
    await expect(page).toHaveURL(/modal=task-new/);
  },

  'i add a task and it survives a reload': async ({ page, getByE2e }) => {
    const dialog = getByE2e('time:task-dialog');
    await dialog.getByRole('textbox', { name: 'Nazwa' }).fill('Raport E2E');
    await dialog
      .getByRole('radio', { name: '9 - Wysoki' })
      .check({ force: true });
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(getByE2e('time:toast')).toHaveText('Dodano zadanie.');
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport E2E' }),
    ).toBeVisible();
    await reload(page);
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport E2E' }),
    ).toBeVisible();
  },

  'i complete the task and it stays done after a reload': async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Zrobione: Raport E2E' });
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toBeChecked();
    await reload(page);
    await expect(
      page.getByRole('checkbox', { name: 'Zrobione: Raport E2E' }),
    ).toBeChecked();
  },

  'i rename the task': async ({ page, getByE2e }) => {
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport E2E' })
      .click();
    const dialog = getByE2e('time:task-dialog');
    const title = dialog.getByRole('textbox', { name: 'Nazwa' });
    await title.fill('Raport kwartalny');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport kwartalny' }),
    ).toBeVisible();
  },

  'the month view marks the day and the year view counts it': async ({
    page,
  }) => {
    await open(page, APP_ROUTER.timeMonth({ date: DAY }));
    await expect(
      page.getByLabel('wtorek, 20 października, 1 zadanie'),
    ).toBeVisible();
    await open(page, APP_ROUTER.timeYear({ date: DAY }));
    await expect(
      page.getByRole('heading', { name: 'Październik' }).locator('..'),
    ).toContainText('1 zadanie');
  },

  'the next day is empty and navigation keeps the date in the address': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:next').click();
    await expect(getByE2e('time:empty')).toContainText(
      'środa, 21 października 2026',
    );
    await expect(page).toHaveURL(/date=2026-10-21/);
  },

  'i delete the task after confirming': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport kwartalny' })
      .click();
    await getByE2e('time:task-delete').click();
    await expect(getByE2e('time:delete-dialog')).toBeVisible();
    await Promise.all([
      synced(page, 'DELETE', 200),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('time:empty')).toBeVisible();
  },

  'the api lists no tasks after the delete': async ({ page }) => {
    const res = await page.request.get(
      API_ROUTER.time({ from: '2026-01-01', to: '2026-12-31' }),
    );
    expect(res.status()).toBe(200);
    expect(
      ((await res.json()) as { data: { tasks: unknown[] } }).data.tasks,
    ).toEqual([]);
  },
} satisfies CommandRegistry<Ctx>;

test('time works against the real Supabase backend', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i register a new account'],
    ['the day view of an empty account names the day'],
    ['the new account starts with default categories and priorities'],
    ['i add a task and it survives a reload'],
    ['i complete the task and it stays done after a reload'],
    ['i rename the task'],
    ['the month view marks the day and the year view counts it'],
    ['the next day is empty and navigation keeps the date in the address'],
    ['i delete the task after confirming'],
    ['the api lists no tasks after the delete'],
  );
});
