import {
  expect,
  request as playwrightRequest,
  type Page,
} from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * Task history against the real Supabase backend: the database records what
 * happens to a task whoever does it, the app and an MCP client can only read
 * it, and a bot's changes carry its token name.
 */

const OWNER = `e2e-history-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-11-10';

const secrets = new WeakMap<Page, string>();
const taskIds = new WeakMap<Page, string>();

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

type ToolResult = {
  result: {
    isError?: boolean;
    structuredContent: {
      id: string;
      items: { kind: string; field: string | null; botName: string | null }[];
    };
    content: { text: string }[];
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

const openHistory = async ({ page, getByE2e }: Ctx) => {
  await open(page, APP_ROUTER.time({ date: DAY }));
  await page
    .getByRole('button', { name: 'Szczegóły zadania: Zmieniony tytuł' })
    .click();
  await getByE2e('time:history-toggle').click();
  return getByE2e('time:history');
};

const commands = {
  'i register the account': async (ctx) => {
    await registerAndConfirm(ctx, OWNER, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i generate an mcp token': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.accessTokens());
    await getByE2e('access-tokens:add').click();
    await getByE2e('access-tokens:name').fill('Historyk');
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    secrets.set(page, (await getByE2e('access-tokens:secret').textContent())!);
    await getByE2e('access-tokens:secret-done').click();
  },

  'the client creates a task, renames it and comments': async ({ page }) => {
    const created = await call(page, 'create_task', {
      title: 'Pierwszy tytuł',
      category: 'work',
      priority: 'high',
      day: DAY,
    });
    const id = created.result.structuredContent.id;
    taskIds.set(page, id);
    await call(page, 'update_task', { id, title: 'Zmieniony tytuł' });
    await call(page, 'add_task_comment', { taskId: id, body: 'Notatka bota' });
  },

  'the owner reads the trail in the app': async (ctx) => {
    const history = await openHistory(ctx);
    await expect(history).toContainText('Utworzono zadanie „Pierwszy tytuł”');
    await expect(history).toContainText(
      'Zmieniono tytuł: „Pierwszy tytuł” → „Zmieniony tytuł”',
    );
    await expect(history).toContainText('Dodano komentarz: „Notatka bota”');
  },

  'the bot changes are signed with the token name': async ({ getByE2e }) => {
    await expect(getByE2e('time:history')).toContainText('Historyk · #');
  },

  'a change of the owner joins the trail unsigned': async (ctx) => {
    const { page, getByE2e } = ctx;
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Szczegóły zadania: Zmieniony tytuł' })
      .click();
    await getByE2e('time:task-details-edit').click();
    await getByE2e('time:task-dialog')
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Tytuł właściciela');
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/time/') && r.status() === 200,
      ),
      getByE2e('time:task-save').click(),
    ]);
    await page
      .getByRole('button', { name: 'Szczegóły zadania: Tytuł właściciela' })
      .click();
    await getByE2e('time:history-toggle').click();
    const newest = getByE2e('time:history').getByRole('listitem').first();
    await expect(newest).toContainText(
      'Zmieniono tytuł: „Zmieniony tytuł” → „Tytuł właściciela”',
    );
    await expect(newest).not.toContainText('Historyk');
  },

  'the client reads the same trail and cannot write it': async ({ page }) => {
    const read = await call(page, 'get_task_history', {
      taskId: taskIds.get(page),
    });
    const kinds = read.result.structuredContent.items.map((i) => i.kind);
    expect(kinds[0]).toBe('updated');
    expect(kinds).toContain('created');
    expect(kinds).toContain('comment_added');
    const tools = await playwrightRequest.newContext({
      baseURL: new URL(page.url()).origin,
    });
    try {
      const listed = await tools.post(API_ROUTER.mcp(), {
        headers: { Authorization: `Bearer ${secrets.get(page)!}` },
        data: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      });
      const names = (
        (await listed.json()) as { result: { tools: { name: string }[] } }
      ).result.tools.map((t) => t.name);
      expect(names.filter((n) => n.includes('history'))).toEqual([
        'get_task_history',
      ]);
    } finally {
      await tools.dispose();
    }
  },

  'the app api offers no write on the history': async ({ page }) => {
    const id = taskIds.get(page)!;
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      const response = await page.request[method](
        API_ROUTER.timeTaskHistory(id),
        { data: { kind: 'created', to: 'fałsz' } },
      );
      expect([404, 405]).toContain(response.status());
    }
  },

  'deleting the task leaves no trail to read': async ({ page }) => {
    const id = taskIds.get(page)!;
    const removed = await page.request.delete(`/api/time/tasks/${id}/`);
    expect(removed.status()).toBe(200);
    const gone = await page.request.get(API_ROUTER.timeTaskHistory(id));
    expect(gone.status()).toBe(404);
    const viaClient = await call(page, 'get_task_history', { taskId: id });
    expect(viaClient.result.isError).toBe(true);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('task history', () => {
  test.setTimeout(90_000);

  test('a task keeps a read only trail of everything that happened to it', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account'],
      ['i generate an mcp token'],
      ['the client creates a task, renames it and comments'],
      ['the owner reads the trail in the app'],
      ['the bot changes are signed with the token name'],
      ['a change of the owner joins the trail unsigned'],
      ['the client reads the same trail and cannot write it'],
      ['the app api offers no write on the history'],
      ['deleting the task leaves no trail to read'],
    );
  });
});
