import {
  expect,
  request as playwrightRequest,
  type Page,
} from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { taskDone } from './locators';

/**
 * Custom task statuses against the real Supabase backend: the user adds a step
 * in the app, the task circle walks through it, and an MCP client lists the
 * workflow and moves a task by the step's name.
 */

const OWNER = `e2e-statuses-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-11-10';

const secrets = new WeakMap<Page, string>();

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

type ToolResult = {
  result: {
    isError?: boolean;
    structuredContent: {
      status: string;
      statusName: string;
      items: { id: string; name: string; kind: string }[];
    };
  };
};

const call = async (page: Page, name: string, args: unknown) => {
  const client = await playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
  });
  try {
    const response = await client.post(API_ROUTER.mcp(), {
      headers: { Authorization: `Bearer ${secrets.get(page)!}` },
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name, arguments: args },
      },
    });
    expect(response.status()).toBe(200);
    return (await response.json()) as ToolResult;
  } finally {
    await client.dispose();
  }
};

const circle = (prefix: Ctx['getByE2ePrefix']) => taskDone(prefix, 'Raport');
const badge = (prefix: Ctx['getByE2ePrefix']) =>
  prefix(
    'time:task-progress-badge:',
    prefix('time:task:').filter({ hasText: 'Raport' }),
  );

const commands = {
  'i register the account': async (ctx) => {
    await registerAndConfirm(ctx, OWNER, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i generate an mcp token': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.accessTokens());
    await getByE2e('access-tokens:add').click();
    await getByE2e('access-tokens:name').fill('Statusy');
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    secrets.set(page, (await getByE2e('access-tokens:secret').textContent())!);
    await getByE2e('access-tokens:secret-done').click();
  },

  'a task exists and the workflow is the default one': async ({ page }) => {
    await call(page, 'create_task', {
      title: 'Raport',
      category: 'work',
      priority: 'high',
      day: DAY,
    });
    const listed = await call(page, 'list_statuses', {});
    expect(listed.result.structuredContent.items.map((s) => s.id)).toEqual([
      'open',
      'in_progress',
      'done',
    ]);
  },

  'i add the Review step in the editor': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page.getByRole('button', { name: 'Dodaj' }).first().click();
    await page.getByRole('menuitem', { name: 'Statusy zadań' }).click();
    const dialog = getByE2e('time:statuses-dialog');
    await getByE2e('time:status-add').click();
    await getByE2ePrefix('time:status-name:', dialog).last().fill('Review');
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/time/statuses') && r.status() === 200,
      ),
      getByE2e('time:statuses-save').click(),
    ]);
    await expect(dialog).toBeHidden();
  },

  'the circle walks through the new step': async ({ page, getByE2ePrefix }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    const box = circle(getByE2ePrefix);
    await box.click();
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    await box.click();
    await expect(badge(getByE2ePrefix)).toHaveText('Review');
    await box.click();
    await expect(box).toBeChecked();
    await page.waitForLoadState('networkidle');
  },

  'the client sees the step and moves the task by its name': async ({
    page,
  }) => {
    const listed = await call(page, 'list_statuses', {});
    expect(listed.result.structuredContent.items.map((s) => s.name)).toEqual([
      'Do zrobienia',
      'W trakcie',
      'Review',
      'Zrobione',
    ]);
    const moved = await call(page, 'set_task_status', {
      id: (await call(page, 'list_tasks', { status: 'done' })).result
        .structuredContent.items[0]!.id,
      status: 'review',
    });
    expect(moved.result.structuredContent.statusName).toBe('Review');
  },

  'the app shows the step the client set': async ({ page, getByE2ePrefix }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(badge(getByE2ePrefix)).toHaveText('Review');
    await expect(circle(getByE2ePrefix)).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  },

  'removing the step sends its task back to in progress': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await page.getByRole('button', { name: 'Dodaj' }).first().click();
    await page.getByRole('menuitem', { name: 'Statusy zadań' }).click();
    const dialog = getByE2e('time:statuses-dialog');
    await getByE2ePrefix('time:status-delete:', dialog).last().click();
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/time/statuses') && r.status() === 200,
      ),
      getByE2e('time:statuses-save').click(),
    ]);
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(badge(getByE2ePrefix)).toHaveText('W trakcie');
    await expect(
      badge(getByE2ePrefix).filter({ hasText: 'Review' }),
    ).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('custom task statuses', () => {
  test.setTimeout(90_000);

  test('a user adds a step, the task walks through it and MCP follows', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account'],
      ['i generate an mcp token'],
      ['a task exists and the workflow is the default one'],
      ['i add the Review step in the editor'],
      ['the circle walks through the new step'],
      ['the client sees the step and moves the task by its name'],
      ['the app shows the step the client set'],
      ['removing the step sends its task back to in progress'],
    );
  });
});
