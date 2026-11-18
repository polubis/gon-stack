import {
  expect,
  request as playwrightRequest,
  type Page,
} from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { topicRow } from './locators';

/**
 * MCP knowledge writes reach the open app live, against the real Supabase
 * backend: an MCP client builds a course and the open knowledge screen shows,
 * renames and drops its topic without a reload.
 */

const OWNER = `e2e-knowledge-mcp-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const TOPIC = 'Dodany przez MCP';
const RENAMED = 'Zmieniony przez MCP';

const secrets = new WeakMap<Page, string>();
const ids = new WeakMap<Page, Record<string, string>>();

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
    const json = (await response.json()) as {
      result: { isError?: boolean; structuredContent: { id: string } };
    };
    expect(json.result.isError).toBeFalsy();
    return json.result.structuredContent;
  } finally {
    await client.dispose();
  }
};

const today = () => new Date().toLocaleDateString('sv-SE');

const commands = {
  'i register the account': async (ctx) => {
    await registerAndConfirm(ctx, OWNER, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i generate an mcp token': async ({ page, getByE2e }) => {
    await page.goto(APP_ROUTER.accessTokens());
    await page.waitForLoadState('networkidle');
    await getByE2e('access-tokens:add').click();
    await getByE2e('access-tokens:name').fill('Knowledge');
    await getByE2e('access-tokens:submit').click();
    await expect(getByE2e('access-tokens:secret-dialog')).toBeVisible();
    secrets.set(page, (await getByE2e('access-tokens:secret').textContent())!);
    await getByE2e('access-tokens:secret-done').click();
  },

  'i open the knowledge screen': async ({ page }) => {
    await page.goto(APP_ROUTER.knowledge());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(150);
  },

  'the client creates a catalog and the topic "Dodany przez MCP"': async ({
    page,
  }) => {
    const category = await call(page, 'create_knowledge_category', {
      name: 'Backend',
    });
    const catalog = await call(page, 'create_knowledge_catalog', {
      name: 'Supabase',
      categoryId: category.id,
    });
    const topic = await call(page, 'create_knowledge_topic', {
      catalogId: catalog.id,
      title: TOPIC,
      studyDay: today(),
    });
    await call(page, 'create_knowledge_reel', {
      topicId: topic.id,
      body: '# Polityki RLS',
    });
    ids.set(page, { topic: topic.id });
  },

  'the screen shows the topic without a reload': async ({ getByE2ePrefix }) => {
    await expect(topicRow(getByE2ePrefix, TOPIC)).toBeVisible({
      timeout: 15_000,
    });
  },

  'the client renames the topic': async ({ page }) => {
    await call(page, 'update_knowledge_topic', {
      id: ids.get(page)!.topic,
      title: RENAMED,
    });
  },

  'the screen shows the new title and not the old one': async ({
    getByE2ePrefix,
  }) => {
    await expect(topicRow(getByE2ePrefix, RENAMED)).toBeVisible({
      timeout: 15_000,
    });
    await expect(topicRow(getByE2ePrefix, TOPIC)).toHaveCount(0);
  },

  'the client deletes the topic': async ({ page }) => {
    await call(page, 'delete_knowledge_topic', {
      id: ids.get(page)!.topic,
      confirm: true,
    });
  },

  'the screen no longer shows the topic': async ({ getByE2ePrefix }) => {
    await expect(topicRow(getByE2ePrefix, RENAMED)).toHaveCount(0, {
      timeout: 15_000,
    });
  },
} satisfies CommandRegistry<Ctx>;

test.describe('knowledge mcp live refresh', () => {
  test('a topic written by an MCP client shows up, changes and goes away live', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register the account'],
      ['i generate an mcp token'],
      ['i open the knowledge screen'],
      ['the client creates a catalog and the topic "Dodany przez MCP"'],
      ['the screen shows the topic without a reload'],
      ['the client renames the topic'],
      ['the screen shows the new title and not the old one'],
      ['the client deletes the topic'],
      ['the screen no longer shows the topic'],
    );
  });
});
