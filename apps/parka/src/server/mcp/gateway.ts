import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/data-sources/db-schema';
import type { DataDomain } from '@schemas/data-changes';
import {
  prepareAttachment,
  type AttachmentImages,
} from '../application/shared/attachment-image';
import {
  TASK_ATTACHMENT_BUCKET,
  taskAttachmentPath,
} from '../application/shared/task-attachment';

/** The presented token is unknown, expired or disabled. */
export class McpAuthError extends Error {}

/** The database refused the call for a reason the model may read and act on. */
export class McpInputError extends Error {}

/** `open`, `in_progress`, `done`, or the id or name of a custom step (see `list_statuses`). */
export type TaskStatus = string;

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

export type UploadRequest = { name: string; mime: string };

/** A one-time upload ticket: shown once, bound to one task, name and type. */
export type UploadTicket = { ticket: string; expiresAt: string };

/** What a claimed ticket allows: one file for one task. */
export type UploadTarget = {
  userId: string;
  taskId: string;
  name: string;
  mime: string;
};

export type StoredAttachment = {
  id: string;
  name: string;
  size: number;
  mime: string;
  originalSize: number;
};

/**
 * What the one-time URL may do, with the ticket as the only credential:
 * burn it (`claim`), then store one file for the task it was issued for.
 */
export type UploadGateway = {
  /** `null` for an unknown, expired or already used ticket. */
  claim: () => Promise<UploadTarget | null>;
  store: (
    target: UploadTarget,
    bytes: ArrayBuffer,
  ) => Promise<StoredAttachment>;
};

/**
 * Everything the MCP surface may do with the data: what the tasks UI does
 * (tasks, categories, priorities) and reading expenses.
 */
export type McpGateway = {
  authenticate: () => Promise<void>;
  /** Tells the owner's open app to reload what an MCP write changed. */
  notifyChange: (domain: DataDomain) => Promise<void>;
  listTasks: (query: TaskQuery) => Promise<unknown>;
  getTask: (id: string) => Promise<unknown>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<unknown>;
  createTask: (task: NewTask) => Promise<unknown>;
  updateTask: (id: string, patch: TaskPatch) => Promise<unknown>;
  deleteTask: (id: string) => Promise<unknown>;
  listTaskAttachments: (taskId: string) => Promise<unknown>;
  /** The one way to attach a file: `null` for an unknown task. */
  requestAttachmentUpload: (
    taskId: string,
    file: UploadRequest,
  ) => Promise<UploadTicket | null>;
  deleteTaskAttachment: (id: string) => Promise<unknown>;
  listTaskComments: (taskId: string) => Promise<unknown>;
  addTaskComment: (taskId: string, body: string) => Promise<unknown>;
  listTaskHistory: (taskId: string) => Promise<unknown>;
  listCategories: () => Promise<unknown>;
  createCategory: (input: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<unknown>;
  updateCategory: (id: string, patch: CategoryPatch) => Promise<unknown>;
  deleteCategory: (id: string) => Promise<unknown>;
  listStatuses: () => Promise<unknown>;
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

  // Storage has no token login: files are reached as `anon` with the token in
  // a header; storage policies resolve its owner and allow only that folder.
  const files = () =>
    createClient<Database>(
      import.meta.env.PUBLIC_PARKA_SUPABASE_URL,
      import.meta.env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { 'x-mcp-token': token } },
      },
    ).storage.from(TASK_ATTACHMENT_BUCKET);

  const attachmentsOf = async (taskId: string) =>
    unwrap(
      await db.rpc('mcp_list_task_attachments', {
        p_token,
        p_task_id: taskId,
      }),
    ) as { userId: string; items: { id: string }[] } | null;

  return {
    authenticate: async () => {
      unwrap(await db.rpc('mcp_authenticate', { p_token }));
    },
    notifyChange: async (domain) => {
      unwrap(await db.rpc('mcp_notify_change', { p_token, p_domain: domain }));
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
    listStatuses: async () =>
      unwrap(await db.rpc('mcp_list_statuses', { p_token })),
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
    deleteTask: async (p_id) => {
      // Rows go with the task, files do not: collect them first.
      const attachments = await attachmentsOf(p_id);
      const deleted = unwrap(
        await db.rpc('mcp_delete_task', { p_token, p_id }),
      );
      if (deleted && attachments && attachments.items.length > 0)
        await files().remove(
          attachments.items.map((a) =>
            taskAttachmentPath(attachments.userId, a.id),
          ),
        );
      return deleted;
    },
    listTaskAttachments: async (taskId) => {
      const found = await attachmentsOf(taskId);
      return found ? { items: found.items } : null;
    },
    requestAttachmentUpload: async (taskId, file) =>
      unwrap(
        await db.rpc('mcp_request_upload', {
          p_token,
          p_task_id: taskId,
          p_name: file.name,
          p_mime: file.mime,
        }),
      ) as UploadTicket | null,
    deleteTaskAttachment: async (p_id) => {
      const owner = unwrap(
        await db.rpc('mcp_delete_task_attachment', { p_token, p_id }),
      ) as string | null;
      if (!owner) return false;
      await files().remove([taskAttachmentPath(owner, p_id)]);
      return true;
    },
    listTaskComments: async (p_task_id) =>
      unwrap(await db.rpc('mcp_list_task_comments', { p_token, p_task_id })),
    addTaskComment: async (p_task_id, p_body) =>
      unwrap(
        await db.rpc('mcp_add_task_comment', { p_token, p_task_id, p_body }),
      ),
    listTaskHistory: async (p_task_id) =>
      unwrap(await db.rpc('mcp_list_task_history', { p_token, p_task_id })),
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

/**
 * Talks to Postgres and Storage with the anonymous API key and the upload
 * ticket as the only credential. The database resolves the owner from the
 * ticket, and storage policies allow only that owner's folder until the file
 * is recorded.
 */
export const createSupabaseUploadGateway = (
  ticket: string,
  images: AttachmentImages,
): UploadGateway => {
  const client = createClient<Database>(
    import.meta.env.PUBLIC_PARKA_SUPABASE_URL,
    import.meta.env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-upload-ticket': ticket } },
    },
  );
  const files = () => client.storage.from(TASK_ATTACHMENT_BUCKET);

  return {
    claim: async () =>
      unwrap(
        await client.rpc('mcp_claim_upload', { p_ticket: ticket }),
      ) as UploadTarget | null,
    store: async (target, bytes) => {
      const prepared = await prepareAttachment(images, {
        bytes,
        name: target.name,
        mime: target.mime,
      }).catch((error: unknown) => {
        throw new McpInputError(
          error instanceof Error ? error.message : 'Invalid file',
        );
      });
      const id = crypto.randomUUID();
      const path = taskAttachmentPath(target.userId, id);
      const upload = await files().upload(path, prepared.bytes, {
        contentType: prepared.mime,
      });
      if (upload.error) throw new Error('MCP file upload failed');
      try {
        const row = unwrap(
          await client.rpc('mcp_finish_upload', {
            p_ticket: ticket,
            p_id: id,
            p_name: prepared.name,
            p_size: prepared.bytes.byteLength,
            p_mime: prepared.mime,
          }),
        ) as { id: string; name: string; size: number; mime: string };
        return {
          id: row.id,
          name: row.name,
          size: row.size,
          mime: row.mime,
          originalSize: prepared.originalSize,
        };
      } catch (error) {
        // Never leave a file nobody points at.
        await files().remove([path]);
        throw error;
      }
    },
  };
};
