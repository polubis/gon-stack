import z from 'zod';

/**
 * Shared shape for the aggregate finance state endpoint. `GET /api/state`
 * hydrates the React store from Postgres; `PUT /api/state` writes the whole
 * per-user graph back (row-level-security keyed to the session user).
 */

const category = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
});

const receiptItem = z.object({
  id: z.string().min(1),
  name: z.string(),
  unitPrice: z.coerce.number(),
  quantity: z.coerce.number(),
  discount: z.coerce.number(),
  categoryId: z.string().min(1),
});

const expense = z.object({
  id: z.string().min(1),
  merchant: z.string(),
  date: z.string().min(1),
  amount: z.coerce.number(),
  categoryId: z.string().min(1),
  paymentMethod: z.string(),
  isBill: z.boolean(),
  source: z.enum(['receipt', 'manual']),
  items: z.array(receiptItem),
});

const limit = z.object({
  id: z.string().min(1),
  scope: z.enum(['total', 'category']),
  categoryId: z.string().min(1).optional(),
  amount: z.coerce.number(),
  alertAt80: z.boolean(),
  delivery: z.enum(['push', 'email']),
});

const goal = z.object({
  id: z.string().min(1),
  name: z.string(),
  target: z.coerce.number(),
  saved: z.coerce.number(),
  months: z.coerce.number(),
});

const recurring = z.object({
  id: z.string().min(1),
  name: z.string(),
  cost: z.coerce.number(),
  nextPaymentDate: z.string().min(1),
  active: z.boolean(),
  paymentMethod: z.string(),
  categoryId: z.string().min(1),
  history: z.array(z.object({ date: z.string(), amount: z.coerce.number() })),
});

const notification = z.object({
  id: z.string().min(1),
  kind: z.string().min(1),
  title: z.string(),
  body: z.string(),
  ageDays: z.coerce.number(),
});

const settings = z.object({
  profile: z.object({ name: z.string(), email: z.string() }),
  notifications: z.object({
    push: z.boolean(),
    email: z.boolean(),
    limitWarnings: z.boolean(),
    receiptConfirmations: z.boolean(),
    limitAlerts: z.boolean(),
  }),
});

export const financeState = z.object({
  categories: z.array(category),
  expenses: z.array(expense),
  limits: z.array(limit),
  goals: z.array(goal),
  recurring: z.array(recurring),
  notifications: z.array(notification),
  settings,
});

export type FinanceState = z.infer<typeof financeState>;

const errorOut = z.union([
  z.object({
    code: z.literal(400),
    type: z.literal('bad-request'),
    message: z.string(),
  }),
  z.object({
    code: z.literal(401),
    type: z.literal('unauthorized'),
    message: z.string(),
  }),
  z.object({
    code: z.literal(500),
    type: z.literal('internal-server'),
    message: z.string(),
  }),
]);

export const getStateSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: financeState }),
      errorOut,
    ]),
  });

export const syncStateSchema = () =>
  z.object({
    in: financeState,
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      errorOut,
    ]),
  });

export type GetStateSchema = z.infer<ReturnType<typeof getStateSchema>>;
export type SyncStateSchema = z.infer<ReturnType<typeof syncStateSchema>>;
