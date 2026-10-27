import z from 'zod';
import {
  ATTACHMENT_MIME_TYPES,
  attachmentRejection,
} from '@/shared/attachments/rules';
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

export type RegisteredTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  annotations: ToolAnnotations;
  call: (args: unknown, gateway: McpGateway) => Promise<ToolResult>;
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

const defineTool = <I extends z.ZodType, O extends z.ZodType>(tool: {
  name: string;
  title: string;
  description: string;
  input: I;
  output: O;
  annotations: ToolAnnotations;
  run: (args: z.infer<I>, gateway: McpGateway) => Promise<z.input<O>>;
}): RegisteredTool => ({
  name: tool.name,
  title: tool.title,
  description: tool.description,
  inputSchema: jsonSchema(tool.input, 'input'),
  outputSchema: jsonSchema(tool.output, 'output'),
  annotations: tool.annotations,
  call: async (args, gateway) => {
    const parsed = tool.input.safeParse(args ?? {});
    if (!parsed.success) {
      return failure(
        `Invalid arguments: ${parsed.error.issues
          .map((i) => `${i.path.join('.') || 'arguments'}: ${i.message}`)
          .join('; ')}`,
      );
    }
    try {
      const out = tool.output.safeParse(await tool.run(parsed.data, gateway));
      if (!out.success) return failure('The server returned unexpected data');
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
const taskStatus = () => z.enum(['open', 'in_progress', 'done']);
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
    status: z.enum(['open', 'in_progress', 'done']),
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
  });

const decodeBase64 = (value: string): ArrayBuffer => {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    throw new ToolError('contentBase64 is not valid base64');
  }
};

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

export const MCP_TOOLS: readonly RegisteredTool[] = [
  defineTool({
    name: 'list_tasks',
    title: 'List tasks',
    description:
      "Lists the signed-in user's tasks, scheduled ones by day and time, then backlog ones. Filter by status, day range, scope or category (the task's tag, e.g. Automatyzacja). Paginated.",
    input: z.strictObject({
      status: z.enum(['open', 'in_progress', 'done', 'all']).default('all'),
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
      'Sets a task to open, in_progress (started, not finished) or done. A backlog task (no day) can only be open: give it a day with update_task first. Safe to repeat.',
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
      'Lists the files attached to a task (name, stored size, type). A task has at most 5.',
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
    name: 'add_task_attachment',
    title: 'Attach a file to a task',
    description: `Attaches a file given as base64 (about 6 MB of file at most per call). Allowed: ${ATTACHMENT_MIME_TYPES.join(', ')}. A stored file is at most 5 MB and a task takes 5 files. Photos are re-encoded as lossy WebP (quality 75, same pixel size) first, so the limit applies after the reduction; an animated GIF is kept as it is.`,
    input: z.strictObject({
      taskId: id(),
      name: z.string().trim().min(1).max(200),
      mimeType: z.enum(ATTACHMENT_MIME_TYPES),
      contentBase64: z.string().min(1),
    }),
    output: attachment().extend({
      originalSize: z.number().int().describe('Bytes you sent'),
    }),
    annotations: WRITE,
    run: async (args, gateway) => {
      const bytes = decodeBase64(args.contentBase64);
      const reason = attachmentRejection({
        name: args.name,
        type: args.mimeType,
        size: bytes.byteLength,
      });
      if (reason) throw new ToolError(reason);
      const added = await gateway.addTaskAttachment(args.taskId, {
        name: args.name,
        mime: args.mimeType,
        bytes,
      });
      if (!added) throw new ToolError(`Task "${args.taskId}" not found`);
      return added as z.input<ReturnType<typeof attachment>> & {
        originalSize: number;
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
