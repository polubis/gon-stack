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
 * MCP writes reach the open app live, against the real Supabase backend: two
 * tabs of one browser share a single stream, and both show what an MCP client
 * changed without a reload.
 */

const OWNER = `e2e-live-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const DAY = '2026-10-24';

const secrets = new WeakMap<Page, string>();
const streams = new WeakMap<Page, string[]>();

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
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
    return (await response.json()) as {
      result: { isError?: boolean; structuredContent: { id: string } };
    };
  } finally {
    await client.dispose();
  }
};

const commands = {
  'i register the account': async (ctx) => {
    await registerAndConfirm(ctx, OWNER, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i generate an mcp token': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.accessTokens());
    await getByE2e('access-tokens:add').click();
    await getByE2e('access-tokens:name').fill('Live');
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    secrets.set(page, (await getByE2e('access-tokens:secret').textContent())!);
    await getByE2e('access-tokens:secret-done').click();
  },

  'i open the day in two tabs': async ({ page }) => {
    const watched: string[] = [];
    streams.set(page, watched);
    page
      .context()
      .on('request', (request) =>
        request.url().includes('/api/data-changes/events')
          ? watched.push(request.url())
          : undefined,
      );
    await open(page, APP_ROUTER.time({ date: DAY }));
    const second = await page.context().newPage();
    await open(second, APP_ROUTER.time({ date: DAY }));
    secrets.set(second, secrets.get(page)!);
    tabs.set(page, second);
    await page.bringToFront();
  },

  'the client creates the task "Dodane przez MCP"': async ({ page }) => {
    const created = await call(page, 'create_task', {
      title: 'Dodane przez MCP',
      category: 'work',
      priority: 'high',
      day: DAY,
    });
    expect(created.result.isError).toBeFalsy();
    ids.set(page, created.result.structuredContent.id);
  },

  'both tabs show the task without a reload': async ({ page }) => {
    for (const tab of [page, tabs.get(page)!])
      await expect(tab.getByText('Dodane przez MCP')).toBeVisible({
        timeout: 15_000,
      });
  },

  'the client renames the task': async ({ page }) => {
    await call(page, 'update_task', {
      id: ids.get(page),
      title: 'Zmienione przez MCP',
    });
  },

  'both tabs show the new title and not the old one': async ({ page }) => {
    for (const tab of [page, tabs.get(page)!]) {
      await expect(tab.getByText('Zmienione przez MCP')).toBeVisible({
        timeout: 15_000,
      });
      await expect(tab.getByText('Dodane przez MCP')).toHaveCount(0);
    }
  },

  'the browser holds one stream for both tabs': async ({ page }) => {
    expect(streams.get(page)).toHaveLength(1);
  },
} satisfies CommandRegistry<Ctx>;

const tabs = new WeakMap<Page, Page>();
const ids = new WeakMap<Page, string>();

test.describe('mcp live refresh', () => {
  test('a task written by an MCP client shows up in every open tab', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account'],
      ['i generate an mcp token'],
      ['i open the day in two tabs'],
      ['the client creates the task "Dodane przez MCP"'],
      ['both tabs show the task without a reload'],
      ['the client renames the task'],
      ['both tabs show the new title and not the old one'],
      ['the browser holds one stream for both tabs'],
    );
  });
});
