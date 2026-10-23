import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/data-sources/db-schema';

/** The presented token is unknown, expired or disabled. */
export class McpAuthError extends Error {}

export type TaskStatus = 'open' | 'in_progress' | 'done';

export type TaskQuery = {
  status: TaskStatus | 'all';
  from: string | null;
  to: string | null;
  /** `true` backlog only, `false` scheduled only, `null` both. */
  backlog: boolean | null;
  limit: number;
  offset: number;
};

export type ExpenseQuery = {
  from: string | null;
  to: string | null;
  categoryId: string | null;
  limit: number;
  offset: number;
};

/**
 * Everything the MCP surface may do with the data: read tasks and expenses,
 * set a task's status. There is deliberately no other write.
 */
export type McpGateway = {
  authenticate: () => Promise<void>;
  listTasks: (query: TaskQuery) => Promise<unknown>;
  getTask: (id: string) => Promise<unknown>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<unknown>;
  listExpenses: (query: ExpenseQuery) => Promise<unknown>;
  getExpense: (id: string) => Promise<unknown>;
};

type RpcResult = {
  data: unknown;
  error: { code?: string; message: string } | null;
  status: number;
};

const unwrap = ({ data, error, status }: RpcResult): unknown => {
  if (error) {
    if (status === 401 || error.code === 'PT401') throw new McpAuthError();
    throw new Error(`MCP data call failed (${error.code ?? status})`);
  }
  return data;
};

/**
 * Talks to Postgres through the `mcp_*` functions with the anonymous API
 * key. The raw token is the only credential: the database resolves its owner
 * and every function filters by that owner, so no other account's rows are
 * reachable.
 */
export const createSupabaseGateway = (token: string): McpGateway => {
  const db = createClient<Database>(
    import.meta.env.PUBLIC_PARKA_SUPABASE_URL,
    import.meta.env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const p_token = token;

  return {
    authenticate: async () => {
      unwrap(await db.rpc('mcp_authenticate', { p_token }));
    },
    listTasks: async (q) =>
      unwrap(
        await db.rpc('mcp_list_tasks', {
          p_token,
          p_status: q.status,
          p_from: q.from ?? undefined,
          p_to: q.to ?? undefined,
          p_backlog: q.backlog ?? undefined,
          p_limit: q.limit,
          p_offset: q.offset,
        }),
      ),
    getTask: async (p_id) =>
      unwrap(await db.rpc('mcp_get_task', { p_token, p_id })),
    setTaskStatus: async (p_id, p_status) =>
      unwrap(await db.rpc('mcp_set_task_status', { p_token, p_id, p_status })),
    listExpenses: async (q) =>
      unwrap(
        await db.rpc('mcp_list_expenses', {
          p_token,
          p_from: q.from ?? undefined,
          p_to: q.to ?? undefined,
          p_category_id: q.categoryId ?? undefined,
          p_limit: q.limit,
          p_offset: q.offset,
        }),
      ),
    getExpense: async (p_id) =>
      unwrap(await db.rpc('mcp_get_expense', { p_token, p_id })),
  };
};
