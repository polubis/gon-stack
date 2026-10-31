// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { code: string } | null };
type Eq = [string, unknown];

const ME = 'u-1';
const TOKEN = '0b9a4a52-1111-4111-8111-111111111111';
const COMMENT_ID = '11111111-1111-4111-8111-111111111111';

const ROW = {
  id: COMMENT_ID,
  body: 'Zadzwonić',
  created_at: '2026-10-31T10:00:00.000Z',
  edited_at: null,
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

const { createTaskComment } = await import('../create-task-comment');
const { updateTaskComment } = await import('../update-task-comment');
const { deleteTaskComment } = await import('../delete-task-comment');
const { listTaskComments } = await import('../list-task-comments');
const { renameMcpToken } = await import('../rename-mcp-token');

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

describe('list task comments', () => {
  it('lists comments of an own task with the owner name', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.select'] = ok([ROW]);

    const response = await run(listTaskComments, { id: 't-1' });

    expect(response).toMatchObject({
      code: 200,
      data: {
        owner: { name: 'Anna Kowalska', avatarUrl: null },
        items: [{ id: COMMENT_ID, body: 'Zadzwonić', bot: null }],
      },
    });
  });

  it('says not found for a task that is not the owner one', async () => {
    results['time_tasks.select'] = ok(null);

    const response = await run(listTaskComments, { id: 'foreign' });

    expect(response).toMatchObject({ code: 404 });
    expect(eqs['time_tasks.select']).toContainEqual(['user_id', ME]);
  });

  it('shows a bot comment under the current token name', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.select'] = ok([
      { ...ROW, mcp_token_id: TOKEN, bot_name: 'Old', bot_ref: '0b9a4a52' },
    ]);
    results['mcp_tokens.select'] = ok([{ id: TOKEN, name: 'Renamed' }]);

    const response = (await run(listTaskComments, { id: 't-1' })) as {
      data: { items: { bot: unknown }[] };
    };

    expect(response.data.items[0]?.bot).toEqual({
      name: 'Renamed',
      ref: '0b9a4a52',
    });
  });

  it('keeps the stored bot name when its token is gone', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.select'] = ok([
      { ...ROW, mcp_token_id: null, bot_name: 'Old', bot_ref: '0b9a4a52' },
    ]);

    const response = (await run(listTaskComments, { id: 't-1' })) as {
      data: { items: { bot: unknown }[] };
    };

    expect(response.data.items[0]?.bot).toEqual({
      name: 'Old',
      ref: '0b9a4a52',
    });
  });

  it('refuses a signed out caller', async () => {
    signedIn = false;

    expect(await run(listTaskComments, { id: 't-1' })).toMatchObject({
      code: 401,
    });
  });
});

describe('create task comment', () => {
  it('creates a human comment owned by the caller', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.insert'] = ok(ROW);

    const response = await run(createTaskComment, {
      id: 't-1',
      body: '  Zadzwonić  ',
    });

    expect(response).toMatchObject({ code: 201, data: { bot: null } });
    expect(inserted).toEqual([
      { user_id: ME, task_id: 't-1', body: 'Zadzwonić' },
    ]);
  });

  it('never writes bot fields coming from the client', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.insert'] = ok(ROW);

    await run(createTaskComment, {
      id: 't-1',
      body: 'hi',
      bot_name: 'Forged',
      bot_ref: '0b9a4a52',
    });

    expect(inserted[0]).not.toHaveProperty('bot_name');
    expect(inserted[0]).not.toHaveProperty('bot_ref');
  });

  it.each([
    ['blank', '   '],
    ['too long', 'x'.repeat(2001)],
  ])('refuses a %s body', async (_, body) => {
    const response = await run(createTaskComment, { id: 't-1', body });

    expect(response).toMatchObject({ code: 400 });
    expect(inserted).toEqual([]);
  });

  it('accepts a body of exactly 2000 characters', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.insert'] = ok(ROW);

    const response = await run(createTaskComment, {
      id: 't-1',
      body: 'x'.repeat(2000),
    });

    expect(response).toMatchObject({ code: 201 });
  });

  it('says not found for a missing task', async () => {
    results['time_tasks.select'] = ok(null);

    const response = await run(createTaskComment, { id: 'gone', body: 'hi' });

    expect(response).toMatchObject({ code: 404 });
    expect(inserted).toEqual([]);
  });

  it('explains the 200 comments cap as a conflict', async () => {
    results['time_tasks.select'] = ok({ id: 't-1' });
    results['time_task_comments.insert'] = {
      data: null,
      error: { code: '23514' },
    };

    const response = await run(createTaskComment, { id: 't-1', body: 'hi' });

    expect(response).toMatchObject({
      code: 409,
      message: 'A task takes at most 200 comments',
    });
  });
});

describe('update task comment', () => {
  it('changes only the text of an own comment', async () => {
    results['time_task_comments.update'] = ok({
      ...ROW,
      body: 'Nowe',
      edited_at: '2026-10-31T11:00:00.000Z',
    });

    const response = await run(updateTaskComment, {
      id: COMMENT_ID,
      body: ' Nowe ',
      bot_name: 'Forged',
    });

    expect(response).toMatchObject({
      code: 200,
      data: { body: 'Nowe', editedAt: '2026-10-31T11:00:00.000Z' },
    });
    expect(updated).toEqual([{ body: 'Nowe' }]);
    expect(eqs['time_task_comments.update']).toContainEqual(['user_id', ME]);
  });

  it('says not found for a comment of someone else', async () => {
    results['time_task_comments.update'] = ok(null);

    expect(
      await run(updateTaskComment, { id: COMMENT_ID, body: 'x' }),
    ).toMatchObject({ code: 404 });
  });

  it.each([
    ['blank body', { id: COMMENT_ID, body: '  ' }],
    ['oversized body', { id: COMMENT_ID, body: 'x'.repeat(2001) }],
    ['malformed id', { id: 'nope', body: 'x' }],
  ])('refuses %s', async (_, input) => {
    expect(await run(updateTaskComment, input)).toMatchObject({ code: 400 });
    expect(updated).toEqual([]);
  });

  it('keeps showing a bot comment as bot after an edit', async () => {
    results['time_task_comments.update'] = ok({
      ...ROW,
      mcp_token_id: TOKEN,
      bot_name: 'Old',
      bot_ref: '0b9a4a52',
      edited_at: '2026-10-31T11:00:00.000Z',
    });
    results['mcp_tokens.select'] = ok([{ id: TOKEN, name: 'Renamed' }]);

    const response = (await run(updateTaskComment, {
      id: COMMENT_ID,
      body: 'x',
    })) as { data: { bot: unknown } };

    expect(response.data.bot).toEqual({ name: 'Renamed', ref: '0b9a4a52' });
  });
});

describe('delete task comment', () => {
  it('deletes an own comment', async () => {
    results['time_task_comments.delete'] = ok([{ id: COMMENT_ID }]);

    const response = await run(deleteTaskComment, { id: COMMENT_ID });

    expect(response).toEqual({ code: 200, ok: true });
    expect(eqs['time_task_comments.delete']).toContainEqual(['user_id', ME]);
  });

  it('says not found when nothing was deleted', async () => {
    results['time_task_comments.delete'] = ok([]);

    expect(await run(deleteTaskComment, { id: COMMENT_ID })).toMatchObject({
      code: 404,
    });
  });

  it('refuses a malformed id', async () => {
    expect(await run(deleteTaskComment, { id: 'nope' })).toMatchObject({
      code: 400,
    });
  });
});

describe('rename mcp token', () => {
  const TOKEN_ROW = {
    id: TOKEN,
    name: 'Asystent',
    token_hint: 'abcd',
    token_tail: 'wxyz',
    ttl_days: 30,
    expires_at: null,
    revoked_at: null,
    rotated_at: null,
    last_used_at: null,
    created_at: '2026-10-31T10:00:00.000Z',
  };

  it('renames an own token and returns it without secrets', async () => {
    results['mcp_tokens.update'] = ok(TOKEN_ROW);

    const response = await run(renameMcpToken, {
      id: TOKEN,
      name: '  Asystent ',
    });

    expect(response).toMatchObject({ code: 200, data: { name: 'Asystent' } });
    expect(JSON.stringify(response)).not.toContain('token_hash');
    expect(updated).toEqual([{ name: 'Asystent' }]);
    expect(eqs['mcp_tokens.update']).toContainEqual(['user_id', ME]);
  });

  it('says not found for a token of someone else', async () => {
    results['mcp_tokens.update'] = ok(null);

    expect(await run(renameMcpToken, { id: TOKEN, name: 'x' })).toMatchObject({
      code: 404,
    });
  });

  it.each([
    ['blank name', { id: TOKEN, name: '   ' }],
    ['61 character name', { id: TOKEN, name: 'x'.repeat(61) }],
    ['malformed id', { id: 'nope', name: 'x' }],
  ])('refuses %s', async (_, input) => {
    expect(await run(renameMcpToken, input)).toMatchObject({ code: 400 });
    expect(updated).toEqual([]);
  });

  it('accepts a 60 character name', async () => {
    results['mcp_tokens.update'] = ok(TOKEN_ROW);

    expect(
      await run(renameMcpToken, { id: TOKEN, name: 'x'.repeat(60) }),
    ).toMatchObject({ code: 200 });
  });
});
