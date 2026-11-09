// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { code: string } | null };
type Eq = [string, unknown];

const ME = 'u-1';
const TOKEN = '0b9a4a52-1111-4111-8111-111111111111';
const HISTORY_ID = '22222222-2222-4222-8222-222222222222';

const ROW = {
  id: HISTORY_ID,
  kind: 'updated',
  field: 'title',
  old_value: 'Stary',
  new_value: 'Nowy',
  created_at: '2026-11-10T10:00:00.000Z',
  mcp_token_id: null,
  bot_name: null,
  bot_ref: null,
};

/** Result per `table.operation`; every call is recorded in `eqs`. */
let results: Record<string, Result> = {};
let eqs: Record<string, Eq[]> = {};
let inserted: unknown[] = [];
let updated: unknown[] = [];
let signedIn = true;

const ok = (data: unknown): Result => ({ data, error: null });

const query = (table: string) => {
  let op = 'select';
  const key = () => `${table}.${op}`;
  const done = () => Promise.resolve(results[key()] ?? ok(null));
  const chain: Record<string, unknown> = {
    select: (..._: unknown[]) => chain,
    insert: (row: unknown) => {
      op = 'insert';
      inserted.push(row);
      return chain;
    },
    update: (row: unknown) => {
      op = 'update';
      updated.push(row);
      return chain;
    },
    delete: () => {
      op = 'delete';
      return chain;
    },
    eq: (column: string, value: unknown) => {
      (eqs[key()] ??= []).push([column, value]);
      return chain;
    },
    in: () => chain,
    order: () => chain,
    maybeSingle: done,
    single: done,
    then: (resolve: (value: Result) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: async () =>
        signedIn
          ? {
              data: {
                user: {
                  id: ME,
                  email: 'anna@parka.test',
                  user_metadata: { full_name: 'Anna Kowalska' },
                },
              },
              error: null,
            }
          : { data: { user: null }, error: null },
    },
    from: query,
  }),
}));

const { listTaskHistory } = await import('../list-task-history');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const run = (
  procedure: (
    read: () => Promise<unknown>,
    context: APIContext,
  ) => Promise<unknown>,
  input: unknown,
) => procedure(async () => input, context);

beforeEach(() => {
  results = {};
  eqs = {};
  inserted = [];
  updated = [];
  signedIn = true;
});

describe('list task history', () => {
  it('lists the entries of an own task as the client reads them', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_history.select'] = ok([ROW]);

    const response = await run(listTaskHistory, { id: 't-1' });

    expect(response).toEqual({
      code: 200,
      data: {
        items: [
          {
            id: HISTORY_ID,
            kind: 'updated',
            field: 'title',
            from: 'Stary',
            to: 'Nowy',
            at: '2026-11-10T10:00:00.000Z',
            bot: null,
          },
        ],
      },
    });
    expect(eqs['time_task_history.select']).toEqual([
      ['user_id', ME],
      ['task_id', 't-1'],
    ]);
  });

  it('says not found for a task that is not the owner one', async () => {
    results['time_tasks.select'] = ok(null);

    const response = await run(listTaskHistory, { id: 'foreign' });

    expect(response).toMatchObject({ code: 404 });
    expect(eqs['time_tasks.select']).toContainEqual(['user_id', ME]);
  });

  it('signs a bot change with the current token name', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_history.select'] = ok([
      { ...ROW, mcp_token_id: TOKEN, bot_name: 'Old', bot_ref: '0b9a4a52' },
    ]);
    results['mcp_tokens.select'] = ok([{ id: TOKEN, name: 'Renamed' }]);

    const response = (await run(listTaskHistory, { id: 't-1' })) as {
      data: { items: { bot: unknown }[] };
    };

    expect(response.data.items[0]?.bot).toEqual({
      name: 'Renamed',
      ref: '0b9a4a52',
    });
  });

  it('keeps the stored bot name when its token is gone', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_history.select'] = ok([
      { ...ROW, mcp_token_id: null, bot_name: 'Old', bot_ref: '0b9a4a52' },
    ]);

    const response = (await run(listTaskHistory, { id: 't-1' })) as {
      data: { items: { bot: unknown }[] };
    };

    expect(response.data.items[0]?.bot).toEqual({
      name: 'Old',
      ref: '0b9a4a52',
    });
  });

  it('writes nothing, whatever the request', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_history.select'] = ok([]);

    await run(listTaskHistory, { id: 't-1' });

    expect(inserted).toEqual([]);
    expect(updated).toEqual([]);
  });

  it('refuses a signed out caller', async () => {
    signedIn = false;

    expect(await run(listTaskHistory, { id: 't-1' })).toMatchObject({
      code: 401,
    });
  });
});
