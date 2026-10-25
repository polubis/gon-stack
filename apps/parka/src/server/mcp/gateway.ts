import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/data-sources/db-schema';

/** The presented token is unknown, expired or disabled. */
export class McpAuthError extends Error {}

/** The database refused the call for a reason the model may read and act on. */
export class McpInputError extends Error {}

export type TaskStatus = 'open' | 'in_progress' | 'done';

export type TaskQuery = {
  status: TaskStatus | 'all';
  from: string | null;
  to: string | null;
  /** `true` backlog only, `false` scheduled only, `null` both. */
  backlog: boolean | null;
  /** Category ("tag") id or name. */
  category: string | null;
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

/** Task fields a caller may change; a missing key stays as it was. */
export type TaskPatch = {
  title?: string;
  description?: string | null;
  /** Category ("tag") id or name. */
  category?: string;
  /** Priority id or name. */
  priority?: string;
  /** `null` sends the task to the backlog. */
  day?: string | null;
  at?: string | null;
  status?: TaskStatus;
};

export type NewTask = {
  title: string;
  description: string | null;
  category: string;
  priority: string;
  day: string | null;
  at: string | null;
};

export type CategoryPatch = { name?: string; icon?: string; color?: string };

/**
 * Everything the MCP surface may do with the data: what the tasks UI does
 * (tasks, categories, priorities) and reading expenses.
 */
export type McpGateway = {
  authenticate: () => Promise<void>;
  listTasks: (query: TaskQuery) => Promise<unknown>;
  getTask: (id: string) => Promise<unknown>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<unknown>;
  createTask: (task: NewTask) => Promise<unknown>;
  updateTask: (id: string, patch: TaskPatch) => Promise<unknown>;
  deleteTask: (id: string) => Promise<unknown>;
  listCategories: () => Promise<unknown>;
  createCategory: (input: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<unknown>;
  updateCategory: (id: string, patch: CategoryPatch) => Promise<unknown>;
  deleteCategory: (id: string) => Promise<unknown>;
  listPriorities: () => Promise<unknown>;
  createPriority: (input: { name: string; value: number }) => Promise<unknown>;
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
    if (error.code === 'PT400') throw new McpInputError(error.message);
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
          p_category: q.category ?? undefined,
        }),
      ),
    getTask: async (p_id) =>
      unwrap(await db.rpc('mcp_get_task', { p_token, p_id })),
    setTaskStatus: async (p_id, p_status) =>
      unwrap(await db.rpc('mcp_set_task_status', { p_token, p_id, p_status })),
    createTask: async (t) =>
      unwrap(
        await db.rpc('mcp_create_task', {
          p_token,
          p_title: t.title,
          p_description: t.description ?? undefined,
          p_category: t.category,
          p_priority: t.priority,
          p_day: t.day ?? undefined,
          p_at: t.at ?? undefined,
        }),
      ),
    updateTask: async (p_id, patch) =>
      unwrap(
        await db.rpc('mcp_update_task', { p_token, p_id, p_patch: patch }),
      ),
    deleteTask: async (p_id) =>
      unwrap(await db.rpc('mcp_delete_task', { p_token, p_id })),
    listCategories: async () =>
      unwrap(await db.rpc('mcp_list_categories', { p_token })),
    createCategory: async (c) =>
      unwrap(
        await db.rpc('mcp_create_category', {
          p_token,
          p_name: c.name,
          p_icon: c.icon,
          p_color: c.color,
        }),
      ),
    updateCategory: async (p_id, patch) =>
      unwrap(
        await db.rpc('mcp_update_category', { p_token, p_id, p_patch: patch }),
      ),
    deleteCategory: async (p_id) =>
      unwrap(await db.rpc('mcp_delete_category', { p_token, p_id })),
    listPriorities: async () =>
      unwrap(await db.rpc('mcp_list_priorities', { p_token })),
    createPriority: async (p) =>
      unwrap(
        await db.rpc('mcp_create_priority', {
          p_token,
          p_name: p.name,
          p_value: p.value,
        }),
      ),
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
