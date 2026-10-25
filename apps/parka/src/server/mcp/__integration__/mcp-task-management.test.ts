// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { issueMcpToken } from '../../domain/mcp-token';
import { createSupabaseGateway } from '../gateway';
import { handleMcpRequest } from '../http';
import { createRateLimiter } from '../rate-limit';

/**
 * Black-box: every call goes through the MCP HTTP handler, the real gateway,
 * PostgREST and the applied `mcp_*` SQL functions of the local Supabase.
 * Two throw-away accounts own all data; deleting them cascades to every row.
 */

const DB_CONTAINER = 'supabase_db_parka';
const URL_ = 'https://parka.test/api/mcp/';

// Replies are untyped JSON read through the public protocol only.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;
type Reply = { isError: boolean; text: string; data: Json };

const psql = (sql: string): string =>
  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-q',
      '-t',
      '-A',
      '-c',
      sql,
    ],
    { encoding: 'utf8' },
  ).trim();

const limiter = () => createRateLimiter({ limit: 100_000, windowMs: 60_000 });
const deps = {
  gatewayFor: createSupabaseGateway,
  tokenLimiter: limiter(),
  failureLimiter: limiter(),
};

const post = (token: string | null, body: unknown) =>
  handleMcpRequest(
    new Request(URL_, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }),
    deps,
  );

const asRpc = (token: string | null, method: string, params?: unknown) =>
  post(token, { jsonrpc: '2.0', id: 1, method, params });

const call = async (
  token: string,
  name: string,
  args: Json = {},
): Promise<Reply> => {
  const response = await asRpc(token, 'tools/call', { name, arguments: args });
  expect(response.status).toBe(200);
  const { result } = (await response.json()) as { result: Json };
  return {
    isError: result.isError === true,
    text: result.content[0].text as string,
    data: (result.structuredContent ?? {}) as Json,
  };
};

type Account = { id: string; token: string };

const createAccount = async (): Promise<Account> => {
  const id = randomUUID();
  const { token, hash, hint, tail } = await issueMcpToken(null, new Date());
  // The sign-up trigger seeds the default categories and priorities.
  psql(
    `insert into auth.users (id, instance_id, aud, role, email) values ('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'it-${id}@example.test')`,
  );
  psql(
    `insert into public.mcp_tokens (user_id, name, token_hash, token_hint, token_tail) values ('${id}', 'integration', '${hash}', '${hint}', '${tail}')`,
  );
  return { id, token };
};

const rowsOf = (ids: string[]): number => {
  const list = ids.map((id) => `'${id}'`).join(',');
  return Number(
    psql(
      `select (select count(*) from auth.users where id in (${list})) + (select count(*) from public.mcp_tokens where user_id in (${list})) + (select count(*) from public.time_tasks where user_id in (${list})) + (select count(*) from public.time_categories where user_id in (${list})) + (select count(*) from public.time_priorities where user_id in (${list})) + (select count(*) from public.time_recurring where user_id in (${list}))`,
    ),
  );
};

let me: Account;
let other: Account;
const unique = (label: string) => `${label} ${randomUUID().slice(0, 8)}`;

/** A category of its own keeps a test's tasks apart from every other test's. */
const freshCategory = async (): Promise<Json> =>
  (await call(me.token, 'create_category', { name: unique('Tag') })).data;

const newTask = async (args: Json = {}): Promise<Json> => {
  const reply = await call(me.token, 'create_task', {
    title: unique('Task'),
    category: 'Praca',
    priority: 'Wysoki',
    ...args,
  });
  expect(reply.isError).toBe(false);
  return reply.data;
};

beforeAll(async () => {
  // The unit setup fakes the Supabase env; this file talks to the real one.
  const env = parseEnv(readFileSync('.env', 'utf8'));
  vi.stubEnv('PUBLIC_PARKA_SUPABASE_URL', env.PUBLIC_PARKA_SUPABASE_URL ?? '');
  vi.stubEnv(
    'PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY',
    env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY ?? '',
  );
  me = await createAccount();
  other = await createAccount();
});

afterAll(() => {
  const ids = [me?.id, other?.id].filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  psql(
    `delete from auth.users where id in (${ids.map((id) => `'${id}'`).join(',')})`,
  );
  // Leaves nothing behind: fail loudly when a row survived.
  expect(rowsOf(ids)).toBe(0);
});

describe('mcp access', () => {
  it('lists every task tool for a valid token', async () => {
    const response = await asRpc(me.token, 'tools/list');

    const { result } = (await response.json()) as { result: Json };
    expect(response.status).toBe(200);
    expect(result.tools.map((t: Json) => t.name).sort()).toEqual([
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
  });

  it('rejects a call without a token', async () => {
    const response = await asRpc(null, 'tools/list');

    expect(response.status).toBe(401);
  });

  it('rejects a token the database does not know', async () => {
    const response = await asRpc(
      'parka_mcp_unknownunknownunknownunknownunknown',
      'tools/call',
      { name: 'list_tasks', arguments: {} },
    );

    expect(response.status).toBe(401);
  });

  it('rejects a revoked token', async () => {
    const account = await createAccount();
    psql(
      `update public.mcp_tokens set revoked_at = now() where user_id = '${account.id}'`,
    );

    const response = await asRpc(account.token, 'tools/call', {
      name: 'list_tasks',
      arguments: {},
    });

    expect(response.status).toBe(401);
    psql(`delete from auth.users where id = '${account.id}'`);
  });

  it('rejects an expired token', async () => {
    const account = await createAccount();
    psql(
      `update public.mcp_tokens set expires_at = now() - interval '1 day' where user_id = '${account.id}'`,
    );

    const response = await asRpc(account.token, 'tools/call', {
      name: 'list_tasks',
      arguments: {},
    });

    expect(response.status).toBe(401);
    psql(`delete from auth.users where id = '${account.id}'`);
  });
});

describe('creating tasks', () => {
  it('puts a task without a day in the backlog', async () => {
    const created = await newTask({ description: 'Notes' });

    const found = await call(me.token, 'get_task', { id: created.id });

    expect(found.data).toMatchObject({
      id: created.id,
      day: null,
      at: null,
      status: 'open',
      description: 'Notes',
      categoryName: 'Praca',
      priorityName: 'Wysoki',
      priorityValue: 9,
      recurring: false,
    });
  });

  it('schedules a task for a day and an hour', async () => {
    const created = await newTask({ day: '2026-11-02', at: '09:30' });

    expect(created).toMatchObject({ day: '2026-11-02', at: '09:30' });
  });

  it('accepts category and priority by id', async () => {
    const created = await newTask({ category: 'work', priority: 'low' });

    expect(created).toMatchObject({
      categoryId: 'work',
      priorityId: 'low',
      priorityName: 'Niski',
    });
  });

  it('refuses an unknown category', async () => {
    const reply = await call(me.token, 'create_task', {
      title: 'x',
      category: 'Nope',
      priority: 'Wysoki',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toBe('unknown category');
  });

  it('refuses an unknown priority', async () => {
    const reply = await call(me.token, 'create_task', {
      title: 'x',
      category: 'Praca',
      priority: 'Nope',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toBe('unknown priority');
  });

  it('refuses a backlog task with an hour', async () => {
    const reply = await call(me.token, 'create_task', {
      title: 'x',
      category: 'Praca',
      priority: 'Wysoki',
      at: '10:00',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/no hour/);
  });

  it('refuses an empty title', async () => {
    const reply = await call(me.token, 'create_task', {
      title: '   ',
      category: 'Praca',
      priority: 'Wysoki',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/Invalid arguments/);
  });
});

describe('listing tasks', () => {
  it('filters by category name, ignoring case', async () => {
    const tag = await freshCategory();
    const inside = await newTask({ category: tag.name });
    await newTask();

    const reply = await call(me.token, 'list_tasks', {
      category: String(tag.name).toUpperCase(),
    });

    expect(reply.data.items.map((t: Json) => t.id)).toEqual([inside.id]);
  });

  it('filters by category id', async () => {
    const tag = await freshCategory();
    const inside = await newTask({ category: tag.id });

    const reply = await call(me.token, 'list_tasks', { category: tag.id });

    expect(reply.data.items.map((t: Json) => t.id)).toEqual([inside.id]);
  });

  it('returns nothing for a category that does not exist', async () => {
    const reply = await call(me.token, 'list_tasks', {
      category: 'No such tag',
    });

    expect(reply.data).toEqual({ items: [], nextCursor: null });
  });

  it('separates backlog from scheduled tasks', async () => {
    const tag = await freshCategory();
    const backlog = await newTask({ category: tag.id });
    const scheduled = await newTask({ category: tag.id, day: '2026-11-03' });

    const onlyBacklog = await call(me.token, 'list_tasks', {
      category: tag.id,
      scope: 'backlog',
    });
    const onlyScheduled = await call(me.token, 'list_tasks', {
      category: tag.id,
      scope: 'scheduled',
    });

    expect(onlyBacklog.data.items.map((t: Json) => t.id)).toEqual([backlog.id]);
    expect(onlyScheduled.data.items.map((t: Json) => t.id)).toEqual([
      scheduled.id,
    ]);
  });

  it('limits to a day range', async () => {
    const tag = await freshCategory();
    await newTask({ category: tag.id, day: '2026-12-01' });
    const inside = await newTask({ category: tag.id, day: '2026-12-15' });

    const reply = await call(me.token, 'list_tasks', {
      category: tag.id,
      from: '2026-12-10',
      to: '2026-12-20',
    });

    expect(reply.data.items.map((t: Json) => t.id)).toEqual([inside.id]);
  });

  it('pages through results with a cursor', async () => {
    const tag = await freshCategory();
    const ids = [
      (await newTask({ category: tag.id })).id,
      (await newTask({ category: tag.id })).id,
      (await newTask({ category: tag.id })).id,
    ];

    const first = await call(me.token, 'list_tasks', {
      category: tag.id,
      limit: 2,
    });
    const second = await call(me.token, 'list_tasks', {
      category: tag.id,
      limit: 2,
      cursor: first.data.nextCursor,
    });

    const seen = [...first.data.items, ...second.data.items].map(
      (t: Json) => t.id,
    );
    expect(first.data.items).toHaveLength(2);
    expect(second.data.nextCursor).toBeNull();
    expect([...seen].sort()).toEqual([...ids].sort());
  });
});

describe('moving tasks between backlog and days', () => {
  it('moves a backlog task onto a day', async () => {
    const created = await newTask();

    const moved = await call(me.token, 'update_task', {
      id: created.id,
      day: '2026-11-05',
    });

    expect(moved.data).toMatchObject({ day: '2026-11-05', at: null });
  });

  it('moves a backlog task onto a day with an hour', async () => {
    const created = await newTask();

    const moved = await call(me.token, 'update_task', {
      id: created.id,
      day: '2026-11-05',
      at: '14:15',
    });

    expect(moved.data).toMatchObject({ day: '2026-11-05', at: '14:15' });
  });

  it('sends a scheduled task back to the backlog, clearing hour and status', async () => {
    const created = await newTask({ day: '2026-11-06', at: '08:00' });
    await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'in_progress',
    });

    const parked = await call(me.token, 'update_task', {
      id: created.id,
      day: null,
    });

    expect(parked.data).toMatchObject({
      day: null,
      at: null,
      status: 'open',
    });
  });

  it('refuses a recurring task in the backlog', async () => {
    const created = await newTask({ day: '2026-11-09' });
    const rule = `rule-${randomUUID()}`;
    psql(
      `insert into public.time_recurring (user_id, id, title, category_id, priority_id, start_date) values ('${me.id}', '${rule}', 'Rule', 'work', 'low', '2026-11-09')`,
    );
    psql(
      `update public.time_tasks set recurring_id = '${rule}', occurrence_date = '2026-11-09' where user_id = '${me.id}' and id = '${created.id}'`,
    );

    const reply = await call(me.token, 'update_task', {
      id: created.id,
      day: null,
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/recurring rule/);
    const still = await call(me.token, 'get_task', { id: created.id });
    expect(still.data).toMatchObject({ day: '2026-11-09', recurring: true });
  });
});

describe('task status', () => {
  it('marks a scheduled task in progress and lists it so', async () => {
    const tag = await freshCategory();
    const created = await newTask({ category: tag.id, day: '2026-11-10' });

    const set = await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'in_progress',
    });
    const listed = await call(me.token, 'list_tasks', {
      category: tag.id,
      status: 'in_progress',
    });
    const open = await call(me.token, 'list_tasks', {
      category: tag.id,
      status: 'open',
    });

    expect(set.data.status).toBe('in_progress');
    expect(listed.data.items.map((t: Json) => t.id)).toEqual([created.id]);
    expect(open.data.items).toEqual([]);
  });

  it('marks a task done, then reopens it', async () => {
    const created = await newTask({ day: '2026-11-11' });

    const done = await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'done',
    });
    const reopened = await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'open',
    });

    expect(done.data.status).toBe('done');
    expect(reopened.data.status).toBe('open');
  });

  it('keeps a status change safe to repeat', async () => {
    const created = await newTask({ day: '2026-11-12' });
    await call(me.token, 'set_task_status', { id: created.id, status: 'done' });

    const again = await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'done',
    });

    expect(again.data.status).toBe('done');
  });

  it('refuses done and in progress for a backlog task', async () => {
    const created = await newTask();

    const done = await call(me.token, 'set_task_status', {
      id: created.id,
      status: 'done',
    });
    const progress = await call(me.token, 'update_task', {
      id: created.id,
      status: 'in_progress',
    });

    expect(done.isError).toBe(true);
    expect(done.text).toMatch(/backlog/);
    expect(progress.isError).toBe(true);
    const still = await call(me.token, 'get_task', { id: created.id });
    expect(still.data.status).toBe('open');
  });

  it('says so for a task that does not exist', async () => {
    const reply = await call(me.token, 'set_task_status', {
      id: 'task-missing',
      status: 'done',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/not found/);
  });
});

describe('updating tasks', () => {
  it('changes only the given fields', async () => {
    const created = await newTask({
      day: '2026-11-13',
      at: '11:00',
      description: 'Keep me',
    });

    const updated = await call(me.token, 'update_task', {
      id: created.id,
      title: 'New title',
    });

    expect(updated.data).toMatchObject({
      title: 'New title',
      description: 'Keep me',
      day: '2026-11-13',
      at: '11:00',
      categoryName: 'Praca',
    });
  });

  it('changes category and priority by name', async () => {
    const tag = await freshCategory();
    const created = await newTask();

    const updated = await call(me.token, 'update_task', {
      id: created.id,
      category: tag.name,
      priority: 'niski',
    });

    expect(updated.data).toMatchObject({
      categoryId: tag.id,
      priorityName: 'Niski',
      priorityValue: 2,
    });
  });

  it('clears the description with null', async () => {
    const created = await newTask({ description: 'Gone soon' });

    const updated = await call(me.token, 'update_task', {
      id: created.id,
      description: null,
    });

    expect(updated.data.description).toBeNull();
  });

  it('clears the hour with null', async () => {
    const created = await newTask({ day: '2026-11-14', at: '12:00' });

    const updated = await call(me.token, 'update_task', {
      id: created.id,
      at: null,
    });

    expect(updated.data).toMatchObject({ day: '2026-11-14', at: null });
  });

  it('refuses an unknown category and keeps the task as it was', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'update_task', {
      id: created.id,
      title: 'Half done',
      category: 'Nope',
    });

    expect(reply.isError).toBe(true);
    const still = await call(me.token, 'get_task', { id: created.id });
    expect(still.data.title).toBe(created.title);
  });

  it('refuses a title that is too long', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'update_task', {
      id: created.id,
      title: 'x'.repeat(161),
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/Invalid arguments/);
  });

  it('refuses an update that changes nothing', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'update_task', { id: created.id });

    expect(reply.isError).toBe(true);
  });

  it('says so for a task that does not exist', async () => {
    const reply = await call(me.token, 'update_task', {
      id: 'task-missing',
      title: 'x',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/not found/);
  });
});

describe('deleting tasks', () => {
  it('refuses without the confirmation and keeps the task', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'delete_task', { id: created.id });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/Invalid arguments/);
    expect((await call(me.token, 'get_task', { id: created.id })).isError).toBe(
      false,
    );
  });

  it('refuses a confirmation that is not true', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'delete_task', {
      id: created.id,
      confirm: false,
    });

    expect(reply.isError).toBe(true);
    expect((await call(me.token, 'get_task', { id: created.id })).isError).toBe(
      false,
    );
  });

  it('removes a confirmed task for good', async () => {
    const created = await newTask();

    const reply = await call(me.token, 'delete_task', {
      id: created.id,
      confirm: true,
    });
    const after = await call(me.token, 'get_task', { id: created.id });

    expect(reply.data).toEqual({ id: created.id, deleted: true });
    expect(after.isError).toBe(true);
    expect(after.text).toMatch(/not found/);
  });

  it('says so when deleting the same task twice', async () => {
    const created = await newTask();
    await call(me.token, 'delete_task', { id: created.id, confirm: true });

    const again = await call(me.token, 'delete_task', {
      id: created.id,
      confirm: true,
    });

    expect(again.isError).toBe(true);
    expect(again.text).toMatch(/not found/);
  });
});

describe('account isolation', () => {
  it('hides another account tasks', async () => {
    const mine = await newTask();

    const read = await call(other.token, 'get_task', { id: mine.id });
    const listed = await call(other.token, 'list_tasks', { limit: 100 });

    expect(read.isError).toBe(true);
    expect(listed.data.items.map((t: Json) => t.id)).not.toContain(mine.id);
  });

  it('cannot change or delete another account task', async () => {
    const mine = await newTask();

    const update = await call(other.token, 'update_task', {
      id: mine.id,
      title: 'Hijacked',
    });
    const status = await call(other.token, 'set_task_status', {
      id: mine.id,
      status: 'done',
    });
    const remove = await call(other.token, 'delete_task', {
      id: mine.id,
      confirm: true,
    });

    expect([update.isError, status.isError, remove.isError]).toEqual([
      true,
      true,
      true,
    ]);
    const still = await call(me.token, 'get_task', { id: mine.id });
    expect(still.data).toMatchObject({ title: mine.title, status: 'open' });
  });

  it('cannot use another account category', async () => {
    const theirs = (
      await call(other.token, 'create_category', { name: unique('Theirs') })
    ).data;

    const reply = await call(me.token, 'create_task', {
      title: 'x',
      category: theirs.id,
      priority: 'Wysoki',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toBe('unknown category');
  });
});

describe('categories', () => {
  it('lists the default categories with task counts', async () => {
    const reply = await call(me.token, 'list_categories');

    const names = reply.data.items.map((c: Json) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Praca', 'Dom', 'Zdrowie']));
    expect(reply.data.items[0]).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      icon: expect.any(String),
      color: expect.any(String),
      taskCount: expect.any(Number),
    });
  });

  it('creates a category with defaults for icon and colour', async () => {
    const name = unique('Auto');

    const reply = await call(me.token, 'create_category', { name });

    expect(reply.data).toMatchObject({
      name,
      icon: 'sparkles',
      color: '#4b5a52',
      taskCount: 0,
    });
  });

  it('refuses a duplicate name, ignoring case', async () => {
    const tag = await freshCategory();

    const reply = await call(me.token, 'create_category', {
      name: String(tag.name).toLowerCase(),
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/already exists/);
  });

  it('refuses an unknown icon and a bad colour', async () => {
    const icon = await call(me.token, 'create_category', {
      name: unique('Bad'),
      icon: 'nope',
    });
    const color = await call(me.token, 'create_category', {
      name: unique('Bad'),
      color: 'red',
    });

    expect(icon.isError).toBe(true);
    expect(color.isError).toBe(true);
  });

  it('renames a category and recolours it', async () => {
    const tag = await freshCategory();
    const name = unique('Renamed');

    const updated = await call(me.token, 'update_category', {
      id: tag.id,
      name,
      icon: 'zap',
      color: '#112233',
    });

    expect(updated.data).toMatchObject({
      id: tag.id,
      name,
      icon: 'zap',
      color: '#112233',
    });
  });

  it('shows the new name on its tasks', async () => {
    const tag = await freshCategory();
    const created = await newTask({ category: tag.id });
    const name = unique('Renamed');

    await call(me.token, 'update_category', { id: tag.id, name });

    const found = await call(me.token, 'get_task', { id: created.id });
    expect(found.data.categoryName).toBe(name);
  });

  it('counts the tasks of a category', async () => {
    const tag = await freshCategory();
    await newTask({ category: tag.id });
    await newTask({ category: tag.id, day: '2026-11-16' });

    const listed = await call(me.token, 'list_categories');

    const found = listed.data.items.find((c: Json) => c.id === tag.id);
    expect(found.taskCount).toBe(2);
  });

  it('says so when updating a category that does not exist', async () => {
    const reply = await call(me.token, 'update_category', {
      id: 'tcat-missing',
      name: 'x',
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/not found/);
  });

  it('refuses to delete a category that still has tasks', async () => {
    const tag = await freshCategory();
    await newTask({ category: tag.id });

    const reply = await call(me.token, 'delete_category', {
      id: tag.id,
      confirm: true,
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/in use/);
    const listed = await call(me.token, 'list_categories');
    expect(listed.data.items.map((c: Json) => c.id)).toContain(tag.id);
  });

  it('deletes a category once its tasks moved away', async () => {
    const tag = await freshCategory();
    const created = await newTask({ category: tag.id });
    await call(me.token, 'update_task', {
      id: created.id,
      category: 'Praca',
    });

    const reply = await call(me.token, 'delete_category', {
      id: tag.id,
      confirm: true,
    });

    expect(reply.data).toEqual({ id: tag.id, deleted: true });
    const listed = await call(me.token, 'list_categories');
    expect(listed.data.items.map((c: Json) => c.id)).not.toContain(tag.id);
  });

  it('refuses to delete a category without the confirmation', async () => {
    const tag = await freshCategory();

    const reply = await call(me.token, 'delete_category', { id: tag.id });

    expect(reply.isError).toBe(true);
    const listed = await call(me.token, 'list_categories');
    expect(listed.data.items.map((c: Json) => c.id)).toContain(tag.id);
  });

  it('says so when deleting a category that does not exist', async () => {
    const reply = await call(me.token, 'delete_category', {
      id: 'tcat-missing',
      confirm: true,
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/not found/);
  });
});

describe('priorities', () => {
  it('lists the most important first', async () => {
    const reply = await call(me.token, 'list_priorities');

    const values = reply.data.items.map((p: Json) => p.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(reply.data.items.map((p: Json) => p.name)).toEqual(
      expect.arrayContaining(['Wysoki', 'Średni', 'Niski']),
    );
  });

  it('creates a priority and uses it on a task', async () => {
    const name = unique('Ultra');

    const created = await call(me.token, 'create_priority', {
      name,
      value: 10,
    });
    const task = await newTask({ priority: name });

    expect(created.data).toMatchObject({ name, value: 10 });
    expect(task).toMatchObject({ priorityName: name, priorityValue: 10 });
  });

  it('refuses a duplicate name, ignoring case', async () => {
    const reply = await call(me.token, 'create_priority', {
      name: 'wysoki',
      value: 4,
    });

    expect(reply.isError).toBe(true);
    expect(reply.text).toMatch(/already exists/);
  });

  it('refuses a weight outside 1 to 10', async () => {
    const low = await call(me.token, 'create_priority', {
      name: unique('Low'),
      value: 0,
    });
    const high = await call(me.token, 'create_priority', {
      name: unique('High'),
      value: 11,
    });

    expect(low.isError).toBe(true);
    expect(high.isError).toBe(true);
  });
});
