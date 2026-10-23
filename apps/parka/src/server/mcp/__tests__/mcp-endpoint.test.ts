import { describe, expect, it } from 'vitest';
import { issueMcpToken } from '../../domain/mcp-token';
import { McpAuthError, type McpGateway } from '../gateway';
import { handleMcpRequest } from '../http';
import { createRateLimiter } from '../rate-limit';

const URL_ = 'https://parka.test/api/mcp/';
const TOKEN = 'parka_mcp_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG';

const TASK = {
  id: 't-1',
  title: 'Pay rent',
  description: null,
  status: 'open',
  day: '2026-10-24',
  at: null,
  categoryId: 'home',
  categoryName: 'Dom',
  priorityId: 'high',
  priorityName: 'Wysoki',
  priorityValue: 9,
  recurring: false,
};

type RpcJson = {
  error: { code: number };
  result: {
    isError?: boolean;
    content: { text: string }[];
    structuredContent: {
      items: unknown[];
      nextCursor: string | null;
      status: string;
    };
    protocolVersion: string;
    capabilities: { tools?: unknown };
    serverInfo: { name: string };
    tools: unknown[];
  };
};

type Calls = { name: string; args: unknown[] }[];

/** In-memory stand-in for the database: one valid token, one task. */
const fakeGateway = (calls: Calls, valid = true): McpGateway => {
  const guard = async () => {
    if (!valid) throw new McpAuthError();
  };
  const record = async (name: string, ...args: unknown[]) => {
    await guard();
    calls.push({ name, args });
  };
  return {
    authenticate: guard,
    listTasks: async (q) => {
      await record('listTasks', q);
      return { items: [TASK], nextOffset: q.offset === 0 ? 25 : null };
    },
    getTask: async (id) => {
      await record('getTask', id);
      return id === TASK.id ? TASK : null;
    },
    setTaskStatus: async (id, status) => {
      await record('setTaskStatus', id, status);
      return id === TASK.id ? { ...TASK, status } : null;
    },
    listExpenses: async (q) => {
      await record('listExpenses', q);
      return { items: [], nextOffset: null };
    },
    getExpense: async (id) => {
      await record('getExpense', id);
      return null;
    },
  };
};

const setup = (options: { valid?: boolean; limit?: number } = {}) => {
  const calls: Calls = [];
  let gatewaysOpened = 0;
  const deps = {
    gatewayFor: () => {
      gatewaysOpened += 1;
      return fakeGateway(calls, options.valid ?? true);
    },
    tokenLimiter: createRateLimiter({
      limit: options.limit ?? 1000,
      windowMs: 60_000,
    }),
    failureLimiter: createRateLimiter({ limit: 3, windowMs: 60_000 }),
  };
  const post = (
    body: unknown,
    headers: Record<string, string> = {},
    raw?: string,
  ) =>
    handleMcpRequest(
      new Request(URL_, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
          ...headers,
        },
        body: raw ?? JSON.stringify(body),
      }),
      deps,
    );
  const rpc = async (method: string, params?: unknown) => {
    const response = await post({ jsonrpc: '2.0', id: 1, method, params });
    return { response, json: (await response.json()) as RpcJson };
  };
  return { calls, post, rpc, deps, opened: () => gatewaysOpened };
};

describe('mcp handshake', () => {
  it('answers initialize with the negotiated version and the tools capability', async () => {
    const { rpc } = setup();

    const { response, json } = await rpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test', version: '1' },
    });

    expect(response.status).toBe(200);
    expect(json.result.protocolVersion).toBe('2025-06-18');
    expect(json.result.capabilities.tools).toBeDefined();
    expect(json.result.serverInfo.name).toBe('parka');
  });

  it('falls back to its latest version for an unknown one', async () => {
    const { rpc } = setup();

    const { json } = await rpc('initialize', { protocolVersion: '1999-01-01' });

    expect(json.result.protocolVersion).toBe('2025-11-25');
  });

  it('accepts a notification without a body in return', async () => {
    const { post } = setup();

    const response = await post({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    });

    expect(response.status).toBe(202);
    expect(await response.text()).toBe('');
  });

  it('answers ping with an empty result', async () => {
    const { rpc } = setup();

    expect((await rpc('ping')).json.result).toEqual({});
  });
});

describe('mcp tools list', () => {
  it('lists the tools with schemas and honest annotations', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/list');
    const tools = json.result.tools as {
      name: string;
      inputSchema: { type: string };
      outputSchema: { type: string };
      annotations: { readOnlyHint: boolean; idempotentHint: boolean };
    }[];

    expect(tools.map((t) => t.name).sort()).toEqual([
      'get_expense',
      'get_task',
      'list_expenses',
      'list_tasks',
      'set_task_status',
    ]);
    expect(tools.every((t) => t.inputSchema.type === 'object')).toBe(true);
    expect(tools.every((t) => t.outputSchema.type === 'object')).toBe(true);
    const writers = tools.filter((t) => !t.annotations.readOnlyHint);
    expect(writers.map((t) => t.name)).toEqual(['set_task_status']);
    expect(writers[0]!.annotations.idempotentHint).toBe(true);
  });

  it('offers no way to create, edit or delete anything else', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/list');

    const names = (json.result.tools as { name: string }[]).map((t) => t.name);
    expect(names.some((n) => /create|update|delete|add|remove/.test(n))).toBe(
      false,
    );
  });
});

describe('mcp reading', () => {
  it('returns a page of tasks with a cursor for the next one', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: { status: 'open', limit: 25 },
    });

    expect(json.result.isError).toBeUndefined();
    expect(json.result.structuredContent.items).toHaveLength(1);
    expect(json.result.structuredContent.nextCursor).toEqual(
      expect.any(String),
    );
    expect(JSON.parse(json.result.content[0].text).items[0].id).toBe('t-1');
  });

  it('continues from the cursor it handed out', async () => {
    const { rpc, calls } = setup();
    const first = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: {},
    });

    await rpc('tools/call', {
      name: 'list_tasks',
      arguments: { cursor: first.json.result.structuredContent.nextCursor },
    });

    expect(calls[1]!.args[0]).toMatchObject({ offset: 25 });
  });

  it('rejects a cursor it did not issue as a tool error', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: { cursor: 'not-a-cursor' },
    });

    expect(json.result.isError).toBe(true);
  });

  it('rejects a cursor that points absurdly far', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: { cursor: btoa('parka:99999999999') },
    });

    expect(json.result.isError).toBe(true);
  });

  it('reports invalid arguments as a tool error, not a crash', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: { from: 'yesterday', unexpected: true },
    });

    expect(json.result.isError).toBe(true);
    expect(json.result.content[0].text).toMatch(/Invalid arguments/);
  });

  it('says so when a task does not exist', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', {
      name: 'get_task',
      arguments: { id: 'missing' },
    });

    expect(json.result.isError).toBe(true);
    expect(json.result.content[0].text).toMatch(/not found/);
  });

  it('answers an unknown tool with a protocol error', async () => {
    const { rpc } = setup();

    const { json } = await rpc('tools/call', { name: 'delete_everything' });

    expect(json.error.code).toBe(-32602);
  });
});

describe('mcp status change', () => {
  it('marks a task done', async () => {
    const { rpc, calls } = setup();

    const { json } = await rpc('tools/call', {
      name: 'set_task_status',
      arguments: { id: 't-1', status: 'done' },
    });

    expect(json.result.structuredContent.status).toBe('done');
    expect(calls).toEqual([{ name: 'setTaskStatus', args: ['t-1', 'done'] }]);
  });

  it('refuses any field besides the status', async () => {
    const { rpc, calls } = setup();

    const { json } = await rpc('tools/call', {
      name: 'set_task_status',
      arguments: { id: 't-1', status: 'done', title: 'Hacked' },
    });

    expect(json.result.isError).toBe(true);
    expect(calls).toEqual([]);
  });

  it('refuses a status other than open or done', async () => {
    const { rpc, calls } = setup();

    const { json } = await rpc('tools/call', {
      name: 'set_task_status',
      arguments: { id: 't-1', status: 'deleted' },
    });

    expect(json.result.isError).toBe(true);
    expect(calls).toEqual([]);
  });
});

describe('mcp access control', () => {
  it('rejects a request without a token', async () => {
    const { post } = setup();

    const response = await post(
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      {
        Authorization: '',
      },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toMatch(/^Bearer/);
  });

  it('rejects a token the database does not accept', async () => {
    const { rpc } = setup({ valid: false });

    const { response } = await rpc('tools/call', {
      name: 'list_tasks',
      arguments: {},
    });

    expect(response.status).toBe(401);
  });

  it('rejects an unknown token on handshake too', async () => {
    const { rpc } = setup({ valid: false });

    expect(
      (await rpc('initialize', { protocolVersion: '2025-06-18' })).response
        .status,
    ).toBe(401);
    expect((await rpc('tools/list')).response.status).toBe(401);
  });

  it('slows down a client that keeps sending bad tokens', async () => {
    const { rpc } = setup({ valid: false });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
      statuses.push((await rpc('ping')).response.status);

    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it('stops querying the database for a client that keeps failing', async () => {
    const { rpc, opened } = setup({ valid: false });

    for (let i = 0; i < 6; i++) await rpc('ping');

    expect(opened()).toBe(3);
  });

  it('cannot dodge the failure limit by forging X-Forwarded-For', async () => {
    const { post } = setup({ valid: false });

    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
      statuses.push(
        (
          await post(
            { jsonrpc: '2.0', id: 1, method: 'ping' },
            { 'X-Forwarded-For': `10.0.0.${i}` },
          )
        ).status,
      );

    expect(statuses).toEqual([401, 401, 401, 429, 429]);
  });

  it('limits the request rate per token', async () => {
    const { rpc } = setup({ limit: 2 });

    const statuses: number[] = [];
    for (let i = 0; i < 3; i++)
      statuses.push((await rpc('ping')).response.status);

    expect(statuses).toEqual([200, 200, 429]);
  });

  it('refuses a foreign browser origin', async () => {
    const { post } = setup();

    const response = await post(
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { Origin: 'https://evil.example' },
    );

    expect(response.status).toBe(403);
  });

  it('allows requests that carry no origin, like native clients', async () => {
    const { post } = setup();

    const response = await post({ jsonrpc: '2.0', id: 1, method: 'ping' });

    expect(response.status).toBe(200);
  });

  it('refuses GET since it opens no event stream', async () => {
    const { deps } = setup();

    const response = await handleMcpRequest(new Request(URL_), deps);

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });

  it('rejects malformed JSON and batches', async () => {
    const { post } = setup();

    expect((await post(null, {}, '{nope')).status).toBe(400);
    expect(
      (await post([{ jsonrpc: '2.0', id: 1, method: 'ping' }])).status,
    ).toBe(400);
  });

  it('rejects an oversized body', async () => {
    const { post } = setup();

    const response = await post(null, {}, 'x'.repeat(70_000));

    expect(response.status).toBe(413);
  });

  it('rejects an oversized body that declares no length', async () => {
    const { deps } = setup();
    const chunk = new TextEncoder().encode('x'.repeat(40_000));
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.enqueue(chunk);
        controller.close();
      },
    });

    const response = await handleMcpRequest(
      new Request(URL_, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body,
        duplex: 'half',
      } as RequestInit),
      deps,
    );

    expect(response.status).toBe(413);
  });

  it('never echoes the token back', async () => {
    const { json } = await setup({ valid: false }).rpc('ping');

    expect(JSON.stringify(json)).not.toContain(TOKEN);
  });
});

describe('rate limiter under a flood of distinct keys', () => {
  it('stays correct for recent keys', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

    for (let i = 0; i < 5_000; i++) limiter.hit(`flood-${i}`);

    expect(limiter.hit('latest').allowed).toBe(true);
    expect(limiter.hit('latest').allowed).toBe(false);
  });
});

describe('mcp token issuing', () => {
  it('issues a long random secret and a matching hash', async () => {
    const a = await issueMcpToken(null, new Date('2026-10-24T00:00:00Z'));
    const b = await issueMcpToken(null, new Date('2026-10-24T00:00:00Z'));

    expect(a.token).toMatch(/^parka_mcp_[A-Za-z0-9_-]{43}$/);
    expect(a.token).not.toBe(b.token);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hash).not.toContain(a.token);
  });

  it('sets the expiry from the chosen lifetime', async () => {
    const issued = await issueMcpToken(7, new Date('2026-10-24T00:00:00Z'));

    expect(issued.expiresAt).toBe('2026-10-31T00:00:00.000Z');
    expect((await issueMcpToken(null, new Date())).expiresAt).toBeNull();
  });
});
