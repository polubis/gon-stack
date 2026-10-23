import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { localDay } from '@/shared/date/date';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * Time module against the real Supabase backend: a fresh account gets the
 * default categories and priorities, creates / completes / edits / deletes a
 * task, and every change survives a reload (Postgres round trip under RLS).
 */

const EMAIL = `e2e-time-${Date.now()}@parka.test`;
const RECURRING_EMAIL = `e2e-time-recurring-${Date.now()}@parka.test`;
const BACKLOG_EMAIL = `e2e-time-backlog-${Date.now()}@parka.test`;
const DESCRIPTION_EMAIL = `e2e-time-description-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const LONG_TITLE = `Długi tytuł ${'x'.repeat(147)}`;
const LONG_DESCRIPTION = Array.from(
  { length: 12 },
  (_, i) => `Linia ${i + 1}`,
).join('\n');
const DAY = '2026-10-20';
const NEXT_WEEK = '2026-10-27';
const LATER = '2026-11-03';
const AFTER_LATER = '2026-11-10';

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

  'i register an account for the backlog': async (ctx) => {
    await registerAndConfirm(ctx, BACKLOG_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task to the backlog and it survives a reload': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Do backlogu' }).click();
    const form = getByE2e('time:backlog-form');
    await form.getByRole('textbox', { name: 'Nazwa' }).fill('Dentysta E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await expect(getByE2e('time:toast')).toHaveText('Dodano do backlogu.');
    await expect(getByE2e('time:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName(
      'Backlog, zadań: 1',
    );
  },

  'i edit the backlog task and it stays in the backlog': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:backlog-open').click();
    await page
      .getByRole('button', { name: 'Edytuj zadanie z backlogu: Dentysta E2E' })
      .click();
    const form = getByE2e('time:backlog-form');
    await form
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Dentysta piątek E2E');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:backlog-save').click(),
    ]);
    await reload(page);
    await expect(page).toHaveURL(/modal=backlog/);
    await expect(
      page.getByRole('button', {
        name: 'Edytuj zadanie z backlogu: Dentysta piątek E2E',
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Zamknij' }).click();
  },

  'one click moves the backlog task to today and it stays there': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:backlog-open').click();
    await expect(page).toHaveURL(/modal=backlog/);
    await Promise.all([
      synced(page, 'PUT', 200),
      page
        .getByRole('button', { name: 'Przenieś na dziś: Dentysta piątek E2E' })
        .click(),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await page.getByRole('button', { name: 'Zamknij' }).click();
    await open(page, APP_ROUTER.time({ date: localDay(new Date()) }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Dentysta piątek E2E' }),
    ).toBeVisible();
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName('Backlog');
  },

  'a picked day moves another backlog task there': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Do backlogu' }).click();
    await getByE2e('time:backlog-form')
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Auto E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await getByE2e('time:backlog-open').click();
    await Promise.all([
      synced(page, 'PUT', 200),
      page.getByLabel('Przenieś na wybrany dzień: Auto E2E').fill(NEXT_WEEK),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Auto E2E' }),
    ).toBeVisible();
  },

  'i register an account for recurring tasks': async (ctx) => {
    await registerAndConfirm(ctx, RECURRING_EMAIL, PASSWORD);
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

  'the task keeps the device it was created on': async ({ page, getByE2e }) => {
    const more = page.getByRole('button', { name: 'Więcej: Raport E2E' });
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await reload(page);
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport E2E' })
      .click();
    await expect(getByE2e('time:task-device')).toContainText('device-');
    await getByE2e('time:task-dialog')
      .getByRole('button', { name: 'Anuluj' })
      .click();
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
    await getByE2e('period-control:next').click();
    await expect(getByE2e('time:empty')).toContainText(
      'środa, 21 października 2026',
    );
    await expect(page).toHaveURL(/date=2026-10-21/);
  },

  'the range menu returns to today from another period': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.timeWeek({ date: '2026-05-05' }));
    await page.getByRole('button', { name: /Zakres:/ }).click();
    await page.keyboard.press('End');
    await expect(getByE2e('period-control:today')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`date=${localDay(new Date())}`));
    await expect(page.getByRole('list', { name: 'Zakres' })).toBeHidden();
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

  'i add a weekly recurring task and its first occurrence appears once':
    async ({ page, getByE2e }) => {
      await open(page, APP_ROUTER.time({ date: DAY }));
      await getByE2e('time:empty').getByRole('button').click();
      const dialog = getByE2e('time:task-dialog');
      await dialog.getByRole('textbox', { name: 'Nazwa' }).fill('Siłownia E2E');
      await dialog.getByRole('switch', { name: 'Powtarzaj' }).click();
      await Promise.all([
        synced(page, 'POST', 201),
        getByE2e('time:task-save').click(),
      ]);
      const occurrence = page.getByRole('button', {
        name: 'Edytuj zadanie: Siłownia E2E',
      });
      await expect(occurrence).toBeVisible();
      await expect(getByE2e('time:recurring-mark')).toHaveCount(1);
      await reload(page);
      await expect(occurrence).toHaveCount(1);
      await page.getByRole('button', { name: 'Więcej: Siłownia E2E' }).click();
      await expect(getByE2e('time:task-row-device')).toHaveCount(0);
      await page.keyboard.press('Escape');
    },

  'the series reaches the following weeks and never revives a deleted task':
    async ({ page, getByE2e }) => {
      await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
      const occurrence = page.getByRole('button', {
        name: 'Edytuj zadanie: Siłownia E2E',
      });
      await expect(occurrence).toBeVisible();

      await occurrence.click();
      await getByE2e('time:task-delete').click();
      await Promise.all([
        synced(page, 'DELETE', 200),
        getByE2e('time:delete-confirm').click(),
      ]);
      await open(page, APP_ROUTER.time({ date: LATER }));
      await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
      await expect(getByE2e('time:empty')).toBeVisible();
      await open(page, APP_ROUTER.time({ date: LATER }));
      await expect(occurrence).toBeVisible();
    },

  'i end the series and its tasks stay as ordinary ones': async ({
    page,
    getByE2e,
  }) => {
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Siłownia E2E' })
      .click();
    await getByE2e('time:recurring-stop').click();
    await Promise.all([
      synced(page, 'DELETE', 200),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Siłownia E2E' }),
    ).toBeVisible();
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    await open(page, APP_ROUTER.time({ date: AFTER_LATER }));
    await expect(getByE2e('time:empty')).toBeVisible();
  },

  'i register an account for descriptions': async (ctx) => {
    await registerAndConfirm(ctx, DESCRIPTION_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task with a 160 characters title and a description': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Zadanie', exact: true }).click();
    const dialog = getByE2e('time:task-dialog');
    await dialog.getByRole('textbox', { name: 'Nazwa' }).fill(LONG_TITLE);
    await dialog
      .getByRole('textbox', { name: 'Opis (opcjonalnie)' })
      .fill(LONG_DESCRIPTION);
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(
      page.getByRole('button', { name: `Edytuj zadanie: ${LONG_TITLE}` }),
    ).toBeVisible();
  },

  'the description shows only in the details and opens in full': async ({
    page,
    getByE2e,
  }) => {
    await expect(page.getByText('Linia 1', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: `Więcej: ${LONG_TITLE}` }).click();
    await page
      .getByRole('menuitem', { name: `Szczegóły zadania: ${LONG_TITLE}` })
      .click();
    await expect(getByE2e('time:description-clamp')).toBeVisible();
    await getByE2e('time:description-more').click();
    await expect(getByE2e('time:description-full')).toContainText('Linia 12');
  },
} satisfies CommandRegistry<Ctx>;

test('time works against the real Supabase backend', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i register a new account'],
    ['the day view of an empty account names the day'],
    ['the new account starts with default categories and priorities'],
    ['i add a task and it survives a reload'],
    ['the task keeps the device it was created on'],
    ['i complete the task and it stays done after a reload'],
    ['i rename the task'],
    ['the month view marks the day and the year view counts it'],
    ['the next day is empty and navigation keeps the date in the address'],
    ['the range menu returns to today from another period'],
    ['i delete the task after confirming'],
    ['the api lists no tasks after the delete'],
  );
});

test('task description and long title survive the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for descriptions'],
    ['i add a task with a 160 characters title and a description'],
    ['the description shows only in the details and opens in full'],
  );
});

test('backlog tasks move to the board on the real backend', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i register an account for the backlog'],
    ['i add a task to the backlog and it survives a reload'],
    ['i edit the backlog task and it stays in the backlog'],
    ['one click moves the backlog task to today and it stays there'],
    ['a picked day moves another backlog task there'],
  );
});

test('recurring time tasks follow their series on the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for recurring tasks'],
    ['i add a weekly recurring task and its first occurrence appears once'],
    ['the series reaches the following weeks and never revives a deleted task'],
    ['i end the series and its tasks stay as ordinary ones'],
  );
});
