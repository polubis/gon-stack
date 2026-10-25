import {
  expect,
  request as playwrightRequest,
  type Page,
} from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { expectNoA11yViolations } from '@/__e2e__/axe';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * MCP access against the real Supabase backend: a token generated in the
 * panel lets an MCP client read tasks and expenses and finish tasks, nothing
 * more; rotation and revocation cut the old secret off at once; another
 * account's token never reaches these rows.
 */

const STAMP = Date.now();
const OWNER = `e2e-mcp-owner-${STAMP}@parka.test`;
const OWNER_OF_TWO = `e2e-mcp-two-${STAMP}@parka.test`;
const PHONE = `e2e-mcp-phone-${STAMP}@parka.test`;
const STRANGER = `e2e-mcp-stranger-${STAMP}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-10-24';
const TASK_ID = 'e2e-mcp-task';
const EXPENSE_ID = 'e2e-mcp-expense';

/** Secrets handed out per page, to prove the old one stops working. */
const secrets = new WeakMap<Page, string[]>();

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

type Rpc = {
  status: number;
  json: {
    result?: {
      isError?: boolean;
      tools?: { name: string }[];
      structuredContent?: Record<string, unknown> & {
        items?: { id: string }[];
        status?: string;
      };
      content?: { text: string }[];
    };
    error?: { code: number };
  };
};

/** One MCP call without any cookie: only the bearer token identifies the caller. */
const mcp = async (
  page: Page,
  token: string,
  method: string,
  params?: unknown,
): Promise<Rpc> => {
  const client = await playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
  });
  try {
    const response = await client.post(API_ROUTER.mcp(), {
      headers: { Authorization: `Bearer ${token}` },
      data: { jsonrpc: '2.0', id: 1, method, params },
    });
    return { status: response.status(), json: await response.json() };
  } finally {
    await client.dispose();
  }
};

const call = (page: Page, token: string, name: string, args: unknown) =>
  mcp(page, token, 'tools/call', { name, arguments: args });

const latest = (page: Page): string => secrets.get(page)!.at(-1)!;

const commands = {
  'i register the account': async (ctx, email: string) => {
    await registerAndConfirm(ctx, email, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i have a task and an expense': async ({ page }) => {
    const task = await page.request.post(API_ROUTER.timeTasks(), {
      data: {
        id: TASK_ID,
        title: 'Zadanie dla MCP',
        description: null,
        categoryId: 'work',
        priorityId: 'high',
        day: DAY,
        at: null,
        done: false,
      },
    });
    expect(task.status()).toBe(201);
    const category = await page.request.post(API_ROUTER.categories(), {
      data: {
        id: 'e2e-mcp-cat',
        name: 'Kultura',
        icon: 'star',
        color: '#ff0000',
      },
    });
    expect(category.status()).toBe(201);
    const expense = await page.request.post(API_ROUTER.expenses(), {
      data: {
        id: EXPENSE_ID,
        merchant: 'Sklep MCP',
        date: '2026-10-20',
        amount: 42.5,
        categoryId: 'e2e-mcp-cat',
        paymentMethod: 'card',
        isBill: false,
        source: 'manual',
        items: [],
      },
    });
    expect(expense.status()).toBe(201);
  },

  'the screen is as narrow as a small phone': async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
  },

  'i open the tokens panel': async ({ page }) => {
    await open(page, APP_ROUTER.accessTokens());
  },

  'i see no tokens yet': async ({ getByE2e }) => {
    await expect(getByE2e('access-tokens:empty')).toBeVisible();
  },

  'the panel has no wcag violations': async ({ page }) => {
    await expectNoA11yViolations(page);
  },

  'i generate a token named "Claude" valid for 7 days': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('access-tokens:add').click();
    await expect(page).toHaveURL(/modal=token-new/);
    await getByE2e('access-tokens:name').fill('Claude');
    await getByE2e('access-tokens:ttl').click();
    await page.getByRole('option', { name: '7 dni' }).click();
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    const secret = (await getByE2e('access-tokens:secret').textContent()) ?? '';
    expect(secret).toMatch(/^parka_mcp_[A-Za-z0-9_-]{43}$/);
    secrets.set(page, [...(secrets.get(page) ?? []), secret]);
  },

  'the secret dialog has no wcag violations': async ({ page }) => {
    await expectNoA11yViolations(page);
  },

  'i close the secret dialog': async ({ page, getByE2e }) => {
    await getByE2e('access-tokens:secret-done').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeHidden();
    await expect(page.getByText(latest(page))).toHaveCount(0);
  },

  'the token is listed only in masked form': async ({
    page,
    getByE2ePrefix,
  }) => {
    const secret = latest(page);
    await expect(getByE2ePrefix('access-tokens:mask:')).toHaveText(
      `parka_mcp_${secret.slice(10, 14)}…${secret.slice(-4)}`,
    );
    await expect(getByE2ePrefix('access-tokens:status:')).toHaveText('Aktywny');
    await expect(getByE2ePrefix('access-tokens:last-used:')).toHaveText(
      'Nigdy',
    );
    await expect(page.locator('body')).not.toContainText(secret);
  },

  'i reload and the secret is gone for good': async ({ page }) => {
    await reload(page);
    await expect(page.locator('body')).not.toContainText(latest(page));
  },

  'the client lists exactly the fourteen tools': async ({ page }) => {
    const { status, json } = await mcp(page, latest(page), 'tools/list');
    expect(status).toBe(200);
    expect(json.result!.tools!.map((t) => t.name).sort()).toEqual([
      'create_category',
      'create_priority',
      'create_task',
      'delete_category',
      'delete_task',
      'get_expense',
      'get_task',
      'list_categories',
      'list_expenses',
      'list_priorities',
      'list_tasks',
      'set_task_status',
      'update_category',
      'update_task',
    ]);
  },

  'the client reads the task and the expense': async ({ page }) => {
    const tasks = await call(page, latest(page), 'list_tasks', {
      status: 'open',
    });
    expect(
      tasks.json.result!.structuredContent!.items!.map((t) => t.id),
    ).toContain(TASK_ID);
    const expenses = await call(page, latest(page), 'list_expenses', {});
    expect(
      expenses.json.result!.structuredContent!.items!.map((e) => e.id),
    ).toContain(EXPENSE_ID);
    const detail = await call(page, latest(page), 'get_expense', {
      id: EXPENSE_ID,
    });
    expect(detail.json.result!.structuredContent!.merchant).toBe('Sklep MCP');
  },

  'the client marks the task done': async ({ page }) => {
    const done = await call(page, latest(page), 'set_task_status', {
      id: TASK_ID,
      status: 'done',
    });
    expect(done.json.result!.structuredContent!.status).toBe('done');
    const again = await call(page, latest(page), 'set_task_status', {
      id: TASK_ID,
      status: 'done',
    });
    expect(again.json.result!.structuredContent!.status).toBe('done');
  },

  'the app shows the task as done': async ({ page }) => {
    const res = await page.request.get(API_ROUTER.time({ from: DAY, to: DAY }));
    const tasks = (await res.json()).data.tasks as {
      id: string;
      done: boolean;
    }[];
    expect(tasks.find((t) => t.id === TASK_ID)?.done).toBe(true);
  },

  'the status tool changes nothing but the status': async ({ page }) => {
    const edit = await call(page, latest(page), 'set_task_status', {
      id: TASK_ID,
      status: 'open',
      title: 'Przejęte',
    });
    expect(edit.json.result!.isError).toBe(true);
    const missing = await call(page, latest(page), 'delete_everything', {
      title: 'Nowe',
    });
    expect(missing.json.error!.code).toBe(-32602);
    const tasks = await page.request.get(
      API_ROUTER.time({ from: DAY, to: DAY }),
    );
    const found = (
      (await tasks.json()).data.tasks as {
        id: string;
        title: string;
        done: boolean;
      }[]
    ).find((t) => t.id === TASK_ID);
    expect(found).toMatchObject({ title: 'Zadanie dla MCP', done: true });
  },

  'the token shows when it was last used': async ({ page, getByE2ePrefix }) => {
    await reload(page);
    await expect(getByE2ePrefix('access-tokens:last-used:')).not.toHaveText(
      'Nigdy',
    );
  },

  'i rotate the token after confirming': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('access-tokens:rotate:').click();
    await expect(page).toHaveURL(/modal=token-rotate/);
    await getByE2e('access-tokens:confirm').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    const secret = (await getByE2e('access-tokens:secret').textContent()) ?? '';
    expect(secret).not.toBe(latest(page));
    secrets.set(page, [...secrets.get(page)!, secret]);
    await getByE2e('access-tokens:secret-done').click();
  },

  'the old secret is refused and the new one works': async ({ page }) => {
    const [old, fresh] = secrets.get(page)!.slice(-2) as [string, string];
    expect((await mcp(page, old, 'ping')).status).toBe(401);
    expect((await mcp(page, fresh, 'ping')).status).toBe(200);
  },

  'i disable the token after confirming': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('access-tokens:revoke:').click();
    await expect(page).toHaveURL(/modal=token-revoke/);
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/revoke/') && r.status() === 200,
      ),
      getByE2e('access-tokens:confirm').click(),
    ]);
    await expect(getByE2ePrefix('access-tokens:status:')).toHaveText(
      'Wyłączony',
    );
  },

  'the disabled token is refused': async ({ page }) => {
    expect((await mcp(page, latest(page), 'tools/list')).status).toBe(401);
    expect((await call(page, latest(page), 'list_tasks', {})).status).toBe(401);
  },

  'i delete the token after confirming': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('access-tokens:delete:').click();
    await expect(page).toHaveURL(/modal=token-delete/);
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.request().method() === 'DELETE' &&
          r.url().includes('/api/mcp-tokens/') &&
          r.status() === 200,
      ),
      getByE2e('access-tokens:confirm').click(),
    ]);
    await expect(getByE2e('access-tokens:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('access-tokens:empty')).toBeVisible();
  },

  'i sign out and register another account': async (ctx) => {
    await ctx.page.context().clearCookies();
    await registerAndConfirm(ctx, STRANGER, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'the other account sees none of the first one data': async ({ page }) => {
    const stranger = latest(page);
    const tasks = await call(page, stranger, 'list_tasks', {});
    expect(tasks.json.result!.structuredContent!.items).toEqual([]);
    const task = await call(page, stranger, 'get_task', { id: TASK_ID });
    expect(task.json.result!.isError).toBe(true);
    const flip = await call(page, stranger, 'set_task_status', {
      id: TASK_ID,
      status: 'open',
    });
    expect(flip.json.result!.isError).toBe(true);
    const expenses = await call(page, stranger, 'list_expenses', {});
    expect(expenses.json.result!.structuredContent!.items).toEqual([]);
    const expense = await call(page, stranger, 'get_expense', {
      id: EXPENSE_ID,
    });
    expect(expense.json.result!.isError).toBe(true);
  },

  'i generate a token for the other account': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.accessTokens());
    await getByE2e('access-tokens:add').click();
    await getByE2e('access-tokens:name').fill('Obcy');
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    const secret = (await getByE2e('access-tokens:secret').textContent()) ?? '';
    secrets.set(page, [...(secrets.get(page) ?? []), secret]);
    await getByE2e('access-tokens:secret-done').click();
  },

  'a request without a token or from a foreign origin is refused': async ({
    page,
  }) => {
    const client = await playwrightRequest.newContext({
      baseURL: new URL(page.url()).origin,
    });
    const rpc = { jsonrpc: '2.0', id: 1, method: 'ping' };
    const anonymous = await client.post(API_ROUTER.mcp(), { data: rpc });
    expect(anonymous.status()).toBe(401);
    expect(anonymous.headers()['www-authenticate']).toMatch(/^Bearer/);
    const foreign = await client.post(API_ROUTER.mcp(), {
      headers: {
        Authorization: `Bearer ${latest(page)}`,
        Origin: 'https://evil.example',
      },
      data: rpc,
    });
    expect(foreign.status()).toBe(403);
    expect((await client.get(API_ROUTER.mcp())).status()).toBe(405);
    await client.dispose();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('mcp access tokens', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a generated token lets a client read tasks and expenses and finish tasks', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account', OWNER],
      ['i have a task and an expense'],
      ['i open the tokens panel'],
      ['i see no tokens yet'],
      ['the panel has no wcag violations'],
      ['i generate a token named "Claude" valid for 7 days'],
      ['the secret dialog has no wcag violations'],
      ['i close the secret dialog'],
      ['the token is listed only in masked form'],
      ['i reload and the secret is gone for good'],
      ['the client lists exactly the fourteen tools'],
      ['the client reads the task and the expense'],
      ['the client marks the task done'],
      ['the app shows the task as done'],
      ['the status tool changes nothing but the status'],
      ['the token shows when it was last used'],
      ['i rotate the token after confirming'],
      ['the old secret is refused and the new one works'],
      ['i disable the token after confirming'],
      ['the disabled token is refused'],
      ['i delete the token after confirming'],
    );
  });

  test('a token never reaches another account data and the endpoint refuses strangers', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account', OWNER_OF_TWO],
      ['i have a task and an expense'],
      ['i open the tokens panel'],
      ['i generate a token named "Claude" valid for 7 days'],
      ['i close the secret dialog'],
      ['i sign out and register another account'],
      ['i generate a token for the other account'],
      ['the other account sees none of the first one data'],
      ['a request without a token or from a foreign origin is refused'],
    );
  });
});

test.describe('mcp access tokens on a phone', () => {
  // Signs up on a roomy screen (the cookie banner covers the form on a small one).
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the panel stays usable and accessible on the narrowest screen', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account', PHONE],
      ['the screen is as narrow as a small phone'],
      ['i open the tokens panel'],
      ['i generate a token named "Claude" valid for 7 days'],
      ['the secret dialog has no wcag violations'],
      ['i close the secret dialog'],
      ['the panel has no wcag violations'],
    );
  });
});
