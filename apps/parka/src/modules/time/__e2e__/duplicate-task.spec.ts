import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { APP_ROUTER } from '@/shared/router/routes';
import { duplicateTask, taskInfo } from './locators';

/**
 * Duplicate from the task menu against the real Supabase backend: the add form
 * opens prefilled from the source, saving creates a second task, for a board
 * task and for a backlog task.
 */

const EMAIL = `e2e-time-duplicate-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-10-20';

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
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
  'i register an account': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i have a task on the board and a task in the backlog': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:task-new').click();
    await getByE2e('time:task-name').fill('Raport E2E');
    await getByE2e('time:priority-select').click();
    await page.getByRole('option', { name: 'Wysoki' }).click();
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(taskInfo(getByE2ePrefix, 'Raport E2E')).toBeVisible();

    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:backlog-new').click();
    await getByE2e('time:backlog-name').fill('Dentysta E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await reloadDay(page);
  },

  'i duplicate the board task and the copy shows up': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await duplicateTask(getByE2ePrefix, 'Raport E2E');
    await expect(page).toHaveURL(/modal=task-duplicate/);
    await expect(getByE2e('time:task-name')).toHaveValue('Raport E2E');
    await expect(getByE2e('time:priority-select')).toContainText('Wysoki');
    await page.waitForTimeout(800);
    await getByE2e('time:task-name').fill('Raport E2E kopia');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(taskInfo(getByE2ePrefix, 'Raport E2E kopia')).toBeVisible();
    await expect(taskInfo(getByE2ePrefix, 'Raport E2E')).toHaveCount(2);
    await page.waitForTimeout(800);
  },

  'i duplicate the backlog task and the copy shows up': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('time:backlog-open').click();
    await expect(taskInfo(getByE2ePrefix, 'Dentysta E2E')).toBeVisible();
    await duplicateTask(getByE2ePrefix, 'Dentysta E2E');
    await expect(page).toHaveURL(/modal=task-duplicate/);
    await expect(getByE2e('time:backlog-name')).toHaveValue('Dentysta E2E');
    await page.waitForTimeout(800);
    await getByE2e('time:backlog-name').fill('Dentysta E2E kopia');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await expect(taskInfo(getByE2ePrefix, 'Dentysta E2E kopia')).toBeVisible();
    await expect(getByE2e('time:backlog-dialog')).toBeVisible();
    await page.waitForTimeout(800);
  },
} satisfies CommandRegistry<Ctx>;

const reloadDay = async (page: Page): Promise<void> => {
  await open(page, APP_ROUTER.time({ date: DAY }));
};

test.describe('duplicate task', () => {
  test.setTimeout(90_000);

  test('a user duplicates a board task and a backlog task', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i register an account'],
      ['i have a task on the board and a task in the backlog'],
      ['i duplicate the board task and the copy shows up'],
      ['i duplicate the backlog task and the copy shows up'],
    );
  });
});
