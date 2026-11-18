import z from 'zod';
import type { DataDomain } from '@schemas/data-changes';
import {
  ATTACHMENT_MIME_TYPES,
  attachmentRejection,
} from '@/shared/attachments/rules';
import { API_ROUTER } from '@/shared/router/routes';
import { isDay } from '@/shared/period/period';
import { CATEGORY_ICON_IDS } from '@/shared/ui/category-icon-ids';
import { McpInputError, type McpGateway } from './gateway';

/** Raised by a tool for a failure the model should read and may act on. */
export class ToolError extends Error {}

export type ToolAnnotations = {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
};

export type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

/** What the transport knows and tools may need (e.g. to build an absolute URL). */
export type ToolContext = { origin: string };

export type RegisteredTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  call: (
    args: unknown,
    gateway: McpGateway,
    context: ToolContext,
  ) => Promise<ToolResult>;
};

const DEFAULT_LIMIT = 25;
const CURSOR_PREFIX = 'parka:';
const MAX_OFFSET = 100_000;

const text = (value: string): ToolResult['content'] => [
  { type: 'text', text: value },
];

const failure = (message: string): ToolResult => ({
  content: text(message),
  isError: true,
});

const jsonSchema = (schema: z.ZodType, io: 'input' | 'output') => {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema, {
    io,
    unrepresentable: 'any',
  }) as Record<string, unknown>;
  return rest;
};

/** Tells the owner's open app which module a write changed (default: time). */
const announceWrite = async (gateway: McpGateway, domain: DataDomain) => {
  try {
    await gateway.notifyChange(domain);
  } catch {
    // The write is done; a missed live refresh must not fail it.
  }
};

const defineTool = <I extends z.ZodType, O extends z.ZodType>(tool: {
  name: string;
  title: string;
  description: string;
  input: I;
  output: O;
  annotations: ToolAnnotations;
  /** Module a write changes; tasks, categories and priorities are `time`. */
  domain?: DataDomain;
  run: (
    args: z.infer<I>,
    gateway: McpGateway,
    context: ToolContext,
  ) => Promise<z.input<O>>;
}): RegisteredTool => ({
  name: tool.name,
  title: tool.title,
  description: tool.description,
  inputSchema: jsonSchema(tool.input, 'input'),
  outputSchema: jsonSchema(tool.output, 'output'),
  annotations: tool.annotations,
  call: async (args, gateway, context) => {
    const parsed = tool.input.safeParse(args ?? {});
    if (!parsed.success) {
      return failure(
        `Invalid arguments: ${parsed.error.issues
          .map((i) => `${i.path.join('.') || 'arguments'}: ${i.message}`)
          .join('; ')}`,
      );
    }
    try {
      const out = tool.output.safeParse(
        await tool.run(parsed.data, gateway, context),
      );
      if (!out.success) return failure('The server returned unexpected data');
      if (!tool.annotations.readOnlyHint)
        await announceWrite(gateway, tool.domain ?? 'time');
      return {
        content: text(JSON.stringify(out.data)),
        structuredContent: out.data as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof ToolError || error instanceof McpInputError)
        return failure(error.message);
      throw error;
    }
  },
});

const day = () => z.string().refine(isDay, 'Expected a day as YYYY-MM-DD');
const at = () =>
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected a time as HH:MM');
const title = () => z.string().trim().min(1).max(160);
const description = () => z.string().trim().max(5000);
const ref = (what: string) =>
  z.string().trim().min(1).max(100).describe(`${what} id or name`);
const taskStatus = () =>
  z
    .string()
    .trim()
    .min(1)
    .max(100)
    .describe(
      'open, in_progress, done, or the id or name of a custom step from list_statuses',
    );
const id = () => z.string().trim().min(1).max(100);
const limit = () => z.number().int().min(1).max(100).default(DEFAULT_LIMIT);
const cursor = () =>
  z
    .string()
    .max(100)
    .optional()
    .describe('Opaque `nextCursor` of the previous page');

const encodeCursor = (offset: number | null): string | null =>
  offset === null ? null : btoa(`${CURSOR_PREFIX}${offset}`);

const decodeCursor = (value: string | undefined): number => {
  if (value === undefined) return 0;
  try {
    const raw = atob(value);
    const offset = Number(raw.slice(CURSOR_PREFIX.length));
    if (
      raw.startsWith(CURSOR_PREFIX) &&
      Number.isSafeInteger(offset) &&
      offset >= 0 &&
      offset <= MAX_OFFSET
    )
      return offset;
  } catch {
    // falls through to the error below
  }
  throw new ToolError('Invalid cursor. Use the nextCursor of a previous page');
};

const page = (
  data: unknown,
): { items: unknown[]; nextOffset: number | null } => {
  const parsed = z
    .object({
      items: z.array(z.unknown()),
      nextOffset: z.number().int().nullable(),
    })
    .parse(data);
  return parsed;
};

const task = () =>
  z.object({
    id: z.string(),
    key: z.string().describe('Unique readable task key, e.g. QXT-7'),
    title: z.string(),
    description: z.string().nullable(),
    status: z
      .string()
      .describe('open, done, in_progress or the id of a custom step'),
    statusName: z
      .string()
      .describe('Label of the status, as the user named it'),
    day: z.string().nullable().describe('Null for a backlog task'),
    at: z.string().nullable().describe('HH:MM; null lasts the whole day'),
    categoryId: z.string(),
    categoryName: z.string().nullable(),
    priorityId: z.string(),
    priorityName: z.string().nullable(),
    priorityValue: z.number().nullable().describe('1 (least) to 10 (most)'),
    recurring: z.boolean(),
  });

const attachment = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    size: z.number().int().describe('Stored bytes (after image reduction)'),
    mime: z.string(),
    status: z
      .enum(['uploading', 'ready', 'failed'])
      .optional()
      .describe(
        'Only videos can be `uploading` (stored right after the response)',
      ),
  });

const historyEntry = () =>
  z.object({
    id: z.string(),
    kind: z.enum([
      'created',
      'updated',
      'attachment_added',
      'attachment_removed',
      'comment_added',
      'comment_edited',
      'comment_removed',
    ]),
    field: z
      .enum([
        'title',
        'description',
        'category',
        'priority',
        'day',
        'at',
        'done',
        'in_progress',
        'status',
      ])
      .nullable()
      .describe('Only for `updated`: the field that changed'),
    from: z.string().nullable().describe('Value before (text, names, files)'),
    to: z.string().nullable().describe('Value after'),
    at: z.string(),
    author: z.enum(['owner', 'bot']),
    botName: z.string().nullable().describe('Name of the token behind it'),
    botRef: z.string().nullable(),
  });

const comment = () =>
  z.object({
    id: z.string(),
    body: z.string(),
    createdAt: z.string(),
    editedAt: z.string().nullable(),
    author: z.enum(['owner', 'bot']),
    botName: z
      .string()
      .nullable()
      .describe('Name of the token that wrote it (bot comments)'),
    botRef: z
      .string()
      .nullable()
      .describe('Short id of that token, safe to show (never the secret)'),
  });

const category = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    color: z.string(),
    taskCount: z.number().int(),
  });

const priority = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    value: z.number().int().describe('1 (least) to 10 (most)'),
  });

const status = () =>
  z.object({
    id: z.string().describe('open, done, in_progress or a custom step id'),
    name: z.string(),
    kind: z.enum(['open', 'step', 'done']),
  });

const categoryName = () => z.string().trim().min(1).max(40);
const categoryIcon = () => z.enum(CATEGORY_ICON_IDS);
const categoryColor = () =>
  z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a colour as #rrggbb');

const expense = () =>
  z.object({
    id: z.string(),
    merchant: z.string(),
    date: z.string(),
    amount: z.number(),
    categoryId: z.string().nullable(),
    categoryName: z.string().nullable(),
    paymentMethod: z.string(),
    isBill: z.boolean(),
    source: z.enum(['receipt', 'manual']),
  });

const expenseDetail = () =>
  expense().extend({
    items: z.array(
      z.object({
        name: z.string(),
        unitPrice: z.number(),
        quantity: z.number(),
        discount: z.number(),
        categoryId: z.string(),
      }),
    ),
  });

const pageOf = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z
      .string()
      .nullable()
      .describe('Pass as `cursor` to get the next page; null on the last page'),
  });

const WRITE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
};

const DESTRUCTIVE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: false,
};

const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

/** Items are checked against the tool's output schema right after. */
const toPage = <T>(
  data: unknown,
): { items: T[]; nextCursor: string | null } => {
  const { items, nextOffset } = page(data);
  return { items: items as T[], nextCursor: encodeCursor(nextOffset) };
};

const CORE_TOOLS: readonly RegisteredTool[] = [
  defineTool({
    name: 'list_tasks',
    title: 'List tasks',
    description:
      "Lists the signed-in user's tasks, scheduled ones by day and time, then backlog ones. Filter by status, day range, scope or category (the task's tag, e.g. Automatyzacja). Paginated.",
    input: z.strictObject({
      status: z
        .union([z.literal('all'), taskStatus()])
        .default('all')
        .describe(
          'all, or one status: open, in_progress, done or a custom step (list_statuses)',
        ),
      from: day().optional().describe('First day, inclusive'),
      to: day().optional().describe('Last day, inclusive'),
      scope: z
        .enum(['all', 'scheduled', 'backlog'])
        .default('all')
        .describe('Backlog tasks have no day'),
      category: ref('Category (tag)').optional(),
      limit: limit(),
      cursor: cursor(),
    }),
    output: pageOf(task()),
    annotations: READ_ONLY,
    run: async (args, gateway) =>
      toPage<z.input<ReturnType<typeof task>>>(
        await gateway.listTasks({
          status: args.status,
          from: args.from ?? null,
          to: args.to ?? null,
          backlog: args.scope === 'all' ? null : args.scope === 'backlog',
          category: args.category ?? null,
          limit: args.limit,
          offset: decodeCursor(args.cursor),
        }),
      ),
  }),
  defineTool({
    name: 'get_task',
    title: 'Get a task',
    description: 'Returns one task by id.',
    input: z.strictObject({ id: id() }),
    output: task(),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.getTask(args.id);
      if (!found) throw new ToolError(`Task "${args.id}" not found`);
      return found as z.input<ReturnType<typeof task>>;
    },
  }),
  defineTool({
    name: 'set_task_status',
    title: 'Set task status',
    description:
      "Sets a task to open, done, or one of the user's steps between them (in_progress by default, plus custom ones: see list_statuses). A backlog task (no day) can only be open: give it a day with update_task first. Safe to repeat.",
    input: z.strictObject({
      id: id(),
      status: taskStatus(),
    }),
    output: task(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    run: async (args, gateway) => {
      const updated = await gateway.setTaskStatus(args.id, args.status);
      if (!updated) throw new ToolError(`Task "${args.id}" not found`);
      return updated as z.input<ReturnType<typeof task>>;
    },
  }),
  defineTool({
    name: 'create_task',
    title: 'Create a task',
    description:
      'Creates a task. Without `day` it lands in the backlog (no hour, always open). `category` is the tag: an id or a name from list_categories; `priority` an id or a name from list_priorities.',
    input: z.strictObject({
      title: title(),
      description: description().nullable().default(null),
      category: ref('Category (tag)'),
      priority: ref('Priority'),
      day: day().nullable().default(null).describe('Null for the backlog'),
      at: at()
        .nullable()
        .default(null)
        .describe('HH:MM; null lasts the whole day'),
    }),
    output: task(),
    annotations: WRITE,
    run: async (args, gateway) =>
      (await gateway.createTask(args)) as z.input<ReturnType<typeof task>>,
  }),
  defineTool({
    name: 'update_task',
    title: 'Update a task',
    description:
      'Changes the given fields of a task; the others stay. Covers title, description, category (tag), priority, status, day and hour. Setting `day` to null sends the task to the backlog (clears hour and status); setting a day moves a backlog task onto the board. Does not delete.',
    input: z
      .strictObject({
        id: id(),
        title: title().optional(),
        description: description().nullable().optional(),
        category: ref('Category (tag)').optional(),
        priority: ref('Priority').optional(),
        day: day()
          .nullable()
          .optional()
          .describe('Null sends it to the backlog'),
        at: at()
          .nullable()
          .optional()
          .describe('HH:MM; null lasts the whole day'),
        status: taskStatus().optional(),
      })
      .refine(
        (v) => Object.keys(v).length > 1,
        'Give at least one field to change',
      ),
    output: task(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: taskId, ...patch }, gateway) => {
      const updated = await gateway.updateTask(taskId, patch);
      if (!updated) throw new ToolError(`Task "${taskId}" not found`);
      return updated as z.input<ReturnType<typeof task>>;
    },
  }),
  defineTool({
    name: 'delete_task',
    title: 'Delete a task permanently',
    description:
      'PERMANENTLY deletes one task. It cannot be undone. Use only when the user explicitly asked to delete this task; to finish or park it use set_task_status or update_task. Requires `confirm: true`.',
    input: z.strictObject({
      id: id(),
      confirm: z.literal(true).describe('Must be true: confirms the deletion'),
    }),
    output: z.object({ id: z.string(), deleted: z.literal(true) }),
    annotations: DESTRUCTIVE,
    run: async (args, gateway) => {
      if (!(await gateway.deleteTask(args.id)))
        throw new ToolError(`Task "${args.id}" not found`);
      return { id: args.id, deleted: true as const };
    },
  }),
  defineTool({
    name: 'list_task_attachments',
    title: 'List task attachments',
    description:
      'Lists the files attached to a task (name, stored size, type, status). A task has at most 5.',
    input: z.strictObject({ taskId: id() }),
    output: z.object({ items: z.array(attachment()) }),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.listTaskAttachments(args.taskId);
      if (!found) throw new ToolError(`Task "${args.taskId}" not found`);
      return found as { items: z.input<ReturnType<typeof attachment>>[] };
    },
  }),
  defineTool({
    name: 'request_attachment_upload',
    title: 'Get a one-time URL to attach a file',
    description: `The only way to attach a file (screenshot, video, log, anything). Returns a one-time upload URL bound to this task, name and type; it expires in 5 minutes and works once. Then send the raw bytes without any Authorization header and without reading any config: curl -sS -X POST -H "Content-Type: <mimeType>" --data-binary @<file> "<uploadUrl>" (the answer is the attachment JSON). Treat the URL like a secret: do not log or paste it. A used, expired, wrong-type or oversized upload spends the URL: request a new one. Allowed: ${ATTACHMENT_MIME_TYPES.join(', ')}. A stored file is at most 5 MB (a video: 20 MB, kept as it is) and a task takes 5 files. Photos are re-encoded as lossy WebP (quality 75, same pixel size) first, so the limit applies after the reduction; an animated GIF is kept as it is.`,
    input: z.strictObject({
      taskId: id(),
      name: z.string().trim().min(1).max(200),
      mimeType: z.enum(ATTACHMENT_MIME_TYPES),
    }),
    output: z.object({
      uploadUrl: z.string().describe('POST the raw file here, once'),
      contentType: z.string().describe('Send exactly this Content-Type'),
      expiresAt: z.string().describe('ISO time the URL stops working'),
    }),
    annotations: WRITE,
    run: async (args, gateway, context) => {
      const reason = attachmentRejection({
        name: args.name,
        type: args.mimeType,
        size: 1,
      });
      if (reason) throw new ToolError(reason);
      const issued = await gateway.requestAttachmentUpload(args.taskId, {
        name: args.name,
        mime: args.mimeType,
      });
      if (!issued) throw new ToolError(`Task "${args.taskId}" not found`);
      return {
        uploadUrl: `${context.origin}${API_ROUTER.mcpUploads()}?ticket=${issued.ticket}`,
        contentType: args.mimeType,
        expiresAt: issued.expiresAt,
      };
    },
  }),
  defineTool({
    name: 'delete_task_attachment',
    title: 'Delete a task attachment permanently',
    description:
      'PERMANENTLY deletes one attached file (id from list_task_attachments). It cannot be undone. Use only when the user explicitly asked. Requires `confirm: true`.',
    input: z.strictObject({
      id: z.uuid(),
      confirm: z.literal(true).describe('Must be true: confirms the deletion'),
    }),
    output: z.object({ id: z.string(), deleted: z.literal(true) }),
    annotations: DESTRUCTIVE,
    run: async (args, gateway) => {
      if (!(await gateway.deleteTaskAttachment(args.id)))
        throw new ToolError(`Attachment "${args.id}" not found`);
      return { id: args.id, deleted: true as const };
    },
  }),
  defineTool({
    name: 'list_task_comments',
    title: 'List task comments',
    description:
      'Lists the comments under a task, oldest first. Each says who wrote it: the account owner or a bot (the name and short id of its token).',
    input: z.strictObject({ taskId: id() }),
    output: z.object({ items: z.array(comment()) }),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.listTaskComments(args.taskId);
      if (!found) throw new ToolError(`Task "${args.taskId}" not found`);
      return found as { items: z.input<ReturnType<typeof comment>>[] };
    },
  }),
  defineTool({
    name: 'add_task_comment',
    title: 'Comment on a task',
    description:
      'Adds a comment under a task. It is shown to the owner as written by this bot, signed with the name of the token you are connected with. A task takes at most 200 comments.',
    input: z.strictObject({
      taskId: id(),
      body: z.string().trim().min(1).max(2000),
    }),
    output: comment(),
    annotations: WRITE,
    run: async (args, gateway) => {
      const added = await gateway.addTaskComment(args.taskId, args.body);
      if (!added) throw new ToolError(`Task "${args.taskId}" not found`);
      return added as z.input<ReturnType<typeof comment>>;
    },
  }),
  defineTool({
    name: 'get_task_history',
    title: 'Task history',
    description:
      'Lists what happened to a task, newest first: creation, each changed field (before and after), attachments added or removed and comments written, edited or deleted. Each entry says who did it: the owner or a bot (token name and short id). Read only; the history cannot be changed.',
    input: z.strictObject({ taskId: id() }),
    output: z.object({ items: z.array(historyEntry()) }),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.listTaskHistory(args.taskId);
      if (!found) throw new ToolError(`Task "${args.taskId}" not found`);
      return found as { items: z.input<ReturnType<typeof historyEntry>>[] };
    },
  }),
  defineTool({
    name: 'list_categories',
    title: 'List categories',
    description:
      'Lists the task categories (the tags a task carries), with how many tasks use each.',
    input: z.strictObject({}),
    output: z.object({ items: z.array(category()) }),
    annotations: READ_ONLY,
    run: async (_args, gateway) =>
      (await gateway.listCategories()) as {
        items: z.input<ReturnType<typeof category>>[];
      },
  }),
  defineTool({
    name: 'create_category',
    title: 'Create a category',
    description:
      'Creates a task category (tag). Names are unique, ignoring case.',
    input: z.strictObject({
      name: categoryName(),
      icon: categoryIcon().default('sparkles'),
      color: categoryColor().default('#4b5a52'),
    }),
    output: category(),
    annotations: WRITE,
    run: async (args, gateway) =>
      (await gateway.createCategory(args)) as z.input<
        ReturnType<typeof category>
      >,
  }),
  defineTool({
    name: 'update_category',
    title: 'Update a category',
    description: 'Renames a category or changes its icon or colour.',
    input: z
      .strictObject({
        id: id(),
        name: categoryName().optional(),
        icon: categoryIcon().optional(),
        color: categoryColor().optional(),
      })
      .refine(
        (v) => Object.keys(v).length > 1,
        'Give at least one field to change',
      ),
    output: category(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: categoryId, ...patch }, gateway) => {
      const updated = await gateway.updateCategory(categoryId, patch);
      if (!updated) throw new ToolError(`Category "${categoryId}" not found`);
      return updated as z.input<ReturnType<typeof category>>;
    },
  }),
  defineTool({
    name: 'delete_category',
    title: 'Delete a category permanently',
    description:
      'PERMANENTLY deletes an unused category. A category that still has tasks is refused: move them first with update_task. Requires `confirm: true`.',
    input: z.strictObject({
      id: id(),
      confirm: z.literal(true).describe('Must be true: confirms the deletion'),
    }),
    output: z.object({ id: z.string(), deleted: z.literal(true) }),
    annotations: DESTRUCTIVE,
    run: async (args, gateway) => {
      if (!(await gateway.deleteCategory(args.id)))
        throw new ToolError(`Category "${args.id}" not found`);
      return { id: args.id, deleted: true as const };
    },
  }),
  defineTool({
    name: 'list_statuses',
    title: 'List task statuses',
    description:
      'Lists the task workflow in order: open, the steps the user configured (in_progress is the default one), done. A task moves along it; pass an id or name to set_task_status, update_task or list_tasks.',
    input: z.strictObject({}),
    output: z.object({ items: z.array(status()) }),
    annotations: READ_ONLY,
    run: async (_args, gateway) =>
      (await gateway.listStatuses()) as {
        items: z.input<ReturnType<typeof status>>[];
      },
  }),
  defineTool({
    name: 'list_priorities',
    title: 'List priorities',
    description: 'Lists the task priorities, most important first.',
    input: z.strictObject({}),
    output: z.object({ items: z.array(priority()) }),
    annotations: READ_ONLY,
    run: async (_args, gateway) =>
      (await gateway.listPriorities()) as {
        items: z.input<ReturnType<typeof priority>>[];
      },
  }),
  defineTool({
    name: 'create_priority',
    title: 'Create a priority',
    description:
      'Creates a priority: a name plus a weight from 1 (least) to 10 (most important). Names are unique, ignoring case.',
    input: z.strictObject({
      name: categoryName(),
      value: z.number().int().min(1).max(10),
    }),
    output: priority(),
    annotations: WRITE,
    run: async (args, gateway) =>
      (await gateway.createPriority(args)) as z.input<
        ReturnType<typeof priority>
      >,
  }),
  defineTool({
    name: 'list_expenses',
    title: 'List expenses',
    description:
      "Lists the signed-in user's expenses, newest first. Filter by day range or category. Paginated. Amounts are in the account currency.",
    input: z.strictObject({
      from: day().optional().describe('First day, inclusive'),
      to: day().optional().describe('Last day, inclusive'),
      categoryId: id().optional(),
      limit: limit(),
      cursor: cursor(),
    }),
    output: pageOf(expense()),
    annotations: READ_ONLY,
    run: async (args, gateway) =>
      toPage<z.input<ReturnType<typeof expense>>>(
        await gateway.listExpenses({
          from: args.from ?? null,
          to: args.to ?? null,
          categoryId: args.categoryId ?? null,
          limit: args.limit,
          offset: decodeCursor(args.cursor),
        }),
      ),
  }),
  defineTool({
    name: 'get_expense',
    title: 'Get an expense',
    description: 'Returns one expense by id, with its receipt items.',
    input: z.strictObject({ id: id() }),
    output: expenseDetail(),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.getExpense(args.id);
      if (!found) throw new ToolError(`Expense "${args.id}" not found`);
      return found as z.input<ReturnType<typeof expenseDetail>>;
    },
  }),
];

const kId = (what: string) => z.uuid().describe(`${what} id`);
const kName = (max: number) => z.string().trim().min(1).max(max);
const kPosition = () =>
  z.number().int().min(0).max(100000).describe('Order inside its parent');

const knowledgeCategory = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    position: z.number().int(),
    catalogCount: z.number().int(),
  });

const knowledgeCatalog = () =>
  z.object({
    id: z.string(),
    categoryId: z.string().nullable(),
    name: z.string(),
    description: z.string(),
    position: z.number().int(),
    topicCount: z.number().int(),
  });

const knowledgeTag = () =>
  z.object({ id: z.string(), name: z.string(), topicCount: z.number().int() });

const knowledgeTopic = () =>
  z.object({
    id: z.string(),
    catalogId: z.string(),
    title: z.string(),
    description: z.string(),
    position: z.number().int(),
    studyDay: z.string().nullable().describe('Planned day; null = backlog'),
    tagIds: z.array(z.string()),
    reelCount: z.number().int(),
    doneCount: z.number().int().describe('Reels the user finished'),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

const knowledgeReel = () =>
  z.object({
    id: z.string(),
    topicId: z.string(),
    body: z.string().describe('Markdown'),
    position: z.number().int(),
    mediaKind: z
      .enum(['image', 'video'])
      .nullable()
      .describe('Picture or clip added in the app; not readable over MCP'),
    done: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

const listOf = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item) });

const deleted = () => z.object({ id: z.string(), deleted: z.literal(true) });

const KNOWLEDGE = { domain: 'knowledge' } as const;

/** Deleting tool of one knowledge item; `what` names it in messages. */
const deleteKnowledge = (
  what: string,
  note: string,
  remove: (gateway: McpGateway, id: string) => Promise<unknown>,
) =>
  defineTool({
    ...KNOWLEDGE,
    name: `delete_knowledge_${what}`,
    title: `Delete a knowledge ${what} permanently`,
    description: `PERMANENTLY deletes one knowledge ${what}${note}. It cannot be undone. Use only when the user explicitly asked for it. Requires \`confirm: true\`.`,
    input: z.strictObject({
      id: kId(what),
      confirm: z.literal(true).describe('Must be true: confirms the deletion'),
    }),
    output: deleted(),
    annotations: DESTRUCTIVE,
    run: async (args, gateway) => {
      if (!(await remove(gateway, args.id)))
        throw new ToolError(`Knowledge ${what} "${args.id}" not found`);
      return { id: args.id, deleted: true as const };
    },
  });

const notFound = (what: string, id: string) =>
  new ToolError(`Knowledge ${what} "${id}" not found`);

const changedFields = (v: object) => Object.keys(v).length > 1;
const AT_LEAST_ONE = 'Give at least one field to change';

const KNOWLEDGE_TOOLS: readonly RegisteredTool[] = [
  defineTool({
    name: 'list_knowledge_categories',
    title: 'List knowledge categories',
    description:
      'Lists the knowledge categories (areas grouping catalogs), in the order of the app.',
    input: z.strictObject({}),
    output: listOf(knowledgeCategory()),
    annotations: READ_ONLY,
    run: async (_args, gateway) =>
      (await gateway.listKnowledgeCategories()) as z.input<
        ReturnType<typeof listOf<ReturnType<typeof knowledgeCategory>>>
      >,
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'create_knowledge_category',
    title: 'Create a knowledge category',
    description:
      'Creates a knowledge category. The name is unique ignoring case.',
    input: z.strictObject({
      name: kName(40),
      color: categoryColor().nullable().default(null),
    }),
    output: knowledgeCategory(),
    annotations: WRITE,
    run: async (args, gateway) =>
      (await gateway.createKnowledgeCategory(args)) as z.input<
        ReturnType<typeof knowledgeCategory>
      >,
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'update_knowledge_category',
    title: 'Update a knowledge category',
    description: 'Changes the given fields of a knowledge category.',
    input: z
      .strictObject({
        id: kId('Category'),
        name: kName(40).optional(),
        color: categoryColor().optional(),
        position: kPosition().optional(),
      })
      .refine(changedFields, AT_LEAST_ONE),
    output: knowledgeCategory(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: categoryId, ...patch }, gateway) => {
      const updated = await gateway.updateKnowledgeCategory(categoryId, patch);
      if (!updated) throw notFound('category', categoryId);
      return updated as z.input<ReturnType<typeof knowledgeCategory>>;
    },
  }),
  deleteKnowledge(
    'category',
    '; refused while catalogs still use it',
    (gateway, id) => gateway.deleteKnowledgeCategory(id),
  ),
  defineTool({
    name: 'list_knowledge_catalogs',
    title: 'List knowledge catalogs',
    description:
      'Lists the knowledge catalogs (folders of topics), optionally of one category.',
    input: z.strictObject({ categoryId: kId('Category').optional() }),
    output: listOf(knowledgeCatalog()),
    annotations: READ_ONLY,
    run: async (args, gateway) =>
      (await gateway.listKnowledgeCatalogs(args.categoryId ?? null)) as z.input<
        ReturnType<typeof listOf<ReturnType<typeof knowledgeCatalog>>>
      >,
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'create_knowledge_catalog',
    title: 'Create a knowledge catalog',
    description:
      'Creates a catalog, optionally filed under a category (list_knowledge_categories).',
    input: z.strictObject({
      name: kName(80),
      categoryId: kId('Category').nullable().default(null),
      description: z.string().trim().max(500).nullable().default(null),
    }),
    output: knowledgeCatalog(),
    annotations: WRITE,
    run: async (args, gateway) => {
      const created = await gateway.createKnowledgeCatalog(args);
      if (!created) throw notFound('category', args.categoryId ?? '');
      return created as z.input<ReturnType<typeof knowledgeCatalog>>;
    },
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'update_knowledge_catalog',
    title: 'Update a knowledge catalog',
    description:
      'Changes the given fields of a catalog. `categoryId: null` takes it out of its category.',
    input: z
      .strictObject({
        id: kId('Catalog'),
        name: kName(80).optional(),
        description: z.string().trim().max(500).optional(),
        categoryId: kId('Category').nullable().optional(),
        position: kPosition().optional(),
      })
      .refine(changedFields, AT_LEAST_ONE),
    output: knowledgeCatalog(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: catalogId, ...patch }, gateway) => {
      const updated = await gateway.updateKnowledgeCatalog(catalogId, patch);
      if (!updated) throw notFound('catalog', catalogId);
      return updated as z.input<ReturnType<typeof knowledgeCatalog>>;
    },
  }),
  deleteKnowledge(
    'catalog',
    ' with all its topics, reels, progress and files',
    (gateway, id) => gateway.deleteKnowledgeCatalog(id),
  ),
  defineTool({
    name: 'list_knowledge_tags',
    title: 'List knowledge tags',
    description: 'Lists the tags that label knowledge topics, by name.',
    input: z.strictObject({}),
    output: listOf(knowledgeTag()),
    annotations: READ_ONLY,
    run: async (_args, gateway) =>
      (await gateway.listKnowledgeTags()) as z.input<
        ReturnType<typeof listOf<ReturnType<typeof knowledgeTag>>>
      >,
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'create_knowledge_tag',
    title: 'Create a knowledge tag',
    description: 'Creates a tag. The name is unique ignoring case.',
    input: z.strictObject({ name: kName(30) }),
    output: knowledgeTag(),
    annotations: WRITE,
    run: async (args, gateway) =>
      (await gateway.createKnowledgeTag(args.name)) as z.input<
        ReturnType<typeof knowledgeTag>
      >,
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'update_knowledge_tag',
    title: 'Rename a knowledge tag',
    description: 'Renames a tag.',
    input: z.strictObject({ id: kId('Tag'), name: kName(30) }),
    output: knowledgeTag(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async (args, gateway) => {
      const updated = await gateway.updateKnowledgeTag(args.id, args.name);
      if (!updated) throw notFound('tag', args.id);
      return updated as z.input<ReturnType<typeof knowledgeTag>>;
    },
  }),
  deleteKnowledge(
    'tag',
    '; topics keep existing, only lose the label',
    (gateway, id) => gateway.deleteKnowledgeTag(id),
  ),
  defineTool({
    name: 'list_knowledge_topics',
    title: 'List knowledge topics',
    description:
      'Lists knowledge topics (a stack of reels each) with progress counts, scheduled ones by study day, then backlog ones. Filter by catalog, tag, text, study-day range (`from` and `to` together) or scope. Paginated.',
    input: z
      .strictObject({
        catalogId: kId('Catalog').optional(),
        tagId: kId('Tag').optional(),
        q: z
          .string()
          .trim()
          .min(1)
          .max(100)
          .optional()
          .describe('Text found in title or description, ignoring case'),
        from: day().optional().describe('First study day, inclusive'),
        to: day().optional().describe('Last study day, inclusive'),
        scope: z
          .enum(['all', 'scheduled', 'undated'])
          .default('all')
          .describe('Undated (backlog) topics have no study day'),
        limit: limit(),
        cursor: cursor(),
      })
      .refine(
        (v) => (v.from === undefined) === (v.to === undefined),
        'Give `from` and `to` together',
      ),
    output: pageOf(knowledgeTopic()),
    annotations: READ_ONLY,
    run: async (args, gateway) =>
      toPage<z.input<ReturnType<typeof knowledgeTopic>>>(
        await gateway.listKnowledgeTopics({
          catalogId: args.catalogId ?? null,
          tagId: args.tagId ?? null,
          q: args.q ?? null,
          from: args.from ?? null,
          to: args.to ?? null,
          scope: args.scope,
          limit: args.limit,
          offset: decodeCursor(args.cursor),
        }),
      ),
  }),
  defineTool({
    name: 'get_knowledge_topic',
    title: 'Get a knowledge topic',
    description: 'Returns one topic with all its reels in order.',
    input: z.strictObject({ id: kId('Topic') }),
    output: z.object({
      topic: knowledgeTopic(),
      reels: z.array(knowledgeReel()),
    }),
    annotations: READ_ONLY,
    run: async (args, gateway) => {
      const found = await gateway.getKnowledgeTopic(args.id);
      if (!found) throw notFound('topic', args.id);
      return found as {
        topic: z.input<ReturnType<typeof knowledgeTopic>>;
        reels: z.input<ReturnType<typeof knowledgeReel>>[];
      };
    },
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'create_knowledge_topic',
    title: 'Create a knowledge topic',
    description:
      'Creates a topic in a catalog. Without `studyDay` it lands in the backlog. `tagIds` come from list_knowledge_tags. Add its reels with create_knowledge_reel.',
    input: z.strictObject({
      catalogId: kId('Catalog'),
      title: kName(120),
      description: z.string().trim().max(500).nullable().default(null),
      studyDay: day().nullable().default(null).describe('Null for the backlog'),
      tagIds: z.array(kId('Tag')).max(50).default([]),
    }),
    output: knowledgeTopic(),
    annotations: WRITE,
    run: async (args, gateway) => {
      const created = await gateway.createKnowledgeTopic(args);
      if (!created) throw notFound('catalog', args.catalogId);
      return created as z.input<ReturnType<typeof knowledgeTopic>>;
    },
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'update_knowledge_topic',
    title: 'Update a knowledge topic',
    description:
      'Changes the given fields of a topic. `tagIds` replaces all its tags; `studyDay: null` moves it to the backlog; `catalogId` moves it to another catalog.',
    input: z
      .strictObject({
        id: kId('Topic'),
        catalogId: kId('Catalog').optional(),
        title: kName(120).optional(),
        description: z.string().trim().max(500).optional(),
        studyDay: day()
          .nullable()
          .optional()
          .describe('Null sends it to the backlog'),
        tagIds: z.array(kId('Tag')).max(50).optional(),
        position: kPosition().optional(),
      })
      .refine(changedFields, AT_LEAST_ONE),
    output: knowledgeTopic(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: topicId, ...patch }, gateway) => {
      const updated = await gateway.updateKnowledgeTopic(topicId, patch);
      if (!updated) throw notFound('topic', topicId);
      return updated as z.input<ReturnType<typeof knowledgeTopic>>;
    },
  }),
  deleteKnowledge(
    'topic',
    ' with all its reels, progress and files',
    (gateway, id) => gateway.deleteKnowledgeTopic(id),
  ),
  defineTool({
    ...KNOWLEDGE,
    name: 'create_knowledge_reel',
    title: 'Create a knowledge reel',
    description:
      'Adds a reel (one short portion of Markdown, 1 to 8000 characters) at the end of a topic.',
    input: z.strictObject({
      topicId: kId('Topic'),
      body: z.string().trim().min(1).max(8000).describe('Markdown'),
    }),
    output: knowledgeReel(),
    annotations: WRITE,
    run: async (args, gateway) => {
      const created = await gateway.createKnowledgeReel(
        args.topicId,
        args.body,
      );
      if (!created) throw notFound('topic', args.topicId);
      return created as z.input<ReturnType<typeof knowledgeReel>>;
    },
  }),
  defineTool({
    ...KNOWLEDGE,
    name: 'update_knowledge_reel',
    title: 'Update a knowledge reel',
    description: 'Changes the Markdown body or the position of a reel.',
    input: z
      .strictObject({
        id: kId('Reel'),
        body: z.string().trim().min(1).max(8000).optional(),
        position: kPosition().optional(),
      })
      .refine(changedFields, AT_LEAST_ONE),
    output: knowledgeReel(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async ({ id: reelId, ...patch }, gateway) => {
      const updated = await gateway.updateKnowledgeReel(reelId, patch);
      if (!updated) throw notFound('reel', reelId);
      return updated as z.input<ReturnType<typeof knowledgeReel>>;
    },
  }),
  deleteKnowledge('reel', ' with its progress and file', (gateway, id) =>
    gateway.deleteKnowledgeReel(id),
  ),
  defineTool({
    ...KNOWLEDGE,
    name: 'set_knowledge_progress',
    title: 'Mark a knowledge reel done or not',
    description:
      'Marks a reel finished (`done: true`) or not finished. Safe to repeat.',
    input: z.strictObject({ reelId: kId('Reel'), done: z.boolean() }),
    output: knowledgeReel(),
    annotations: { ...WRITE, idempotentHint: true },
    run: async (args, gateway) => {
      const updated = await gateway.setKnowledgeProgress(
        args.reelId,
        args.done,
      );
      if (!updated) throw notFound('reel', args.reelId);
      return updated as z.input<ReturnType<typeof knowledgeReel>>;
    },
  }),
];

export const MCP_TOOLS: readonly RegisteredTool[] = [
  ...CORE_TOOLS,
  ...KNOWLEDGE_TOOLS,
];
