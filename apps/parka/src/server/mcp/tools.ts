import z from 'zod';
import { isDay } from '@/shared/period/period';
import type { McpGateway } from './gateway';

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
      if (error instanceof ToolError) return failure(error.message);
      throw error;
    }
  },
});

const day = () => z.string().refine(isDay, 'Expected a day as YYYY-MM-DD');
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
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(['open', 'done']),
    day: z.string().nullable().describe('Null for a backlog task'),
    at: z.string().nullable().describe('HH:MM; null lasts the whole day'),
    categoryId: z.string(),
    categoryName: z.string().nullable(),
    priorityId: z.string(),
    priorityName: z.string().nullable(),
    priorityValue: z.number().nullable().describe('1 (least) to 10 (most)'),
    recurring: z.boolean(),
  });

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
      "Lists the signed-in user's tasks, scheduled ones by day and time, then backlog ones. Filter by status, day range or scope. Paginated.",
    input: z.strictObject({
      status: z.enum(['open', 'done', 'all']).default('all'),
      from: day().optional().describe('First day, inclusive'),
      to: day().optional().describe('Last day, inclusive'),
      scope: z
        .enum(['all', 'scheduled', 'backlog'])
        .default('all')
        .describe('Backlog tasks have no day'),
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
      'Marks a task as done or open again. This is the only change the server allows: titles, dates and other fields cannot be edited and tasks cannot be created or deleted. Safe to repeat.',
    input: z.strictObject({
      id: id(),
      status: z.enum(['open', 'done']),
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
