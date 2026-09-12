import z from 'zod';

/**
 * Per-entity shapes shared across the aggregate `/api/state` schema and the
 * per-entity REST schemas. Kept as factory functions so each call site gets
 * its own zod instance rather than sharing a mutated singleton.
 */

export const category = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    icon: z.string().min(1),
    color: z.string().min(1),
  });

export const receiptItem = () =>
  z.object({
    id: z.string().min(1),
    name: z.string(),
    unitPrice: z.coerce.number(),
    quantity: z.coerce.number(),
    discount: z.coerce.number(),
    categoryId: z.string().min(1),
  });

export const expense = () =>
  z.object({
    id: z.string().min(1),
    merchant: z.string(),
    date: z.string().min(1),
    amount: z.coerce.number(),
    categoryId: z.string().min(1),
    paymentMethod: z.string(),
    isBill: z.boolean(),
    source: z.enum(['receipt', 'manual']),
    items: z.array(receiptItem()),
  });

export const limit = () =>
  z.object({
    id: z.string().min(1),
    scope: z.enum(['total', 'category']),
    categoryId: z.string().min(1).optional(),
    amount: z.coerce.number(),
    alertAt80: z.boolean(),
    delivery: z.enum(['push', 'email']),
  });

export const goal = () =>
  z.object({
    id: z.string().min(1),
    name: z.string(),
    target: z.coerce.number(),
    saved: z.coerce.number(),
    months: z.coerce.number(),
  });

export const recurring = () =>
  z.object({
    id: z.string().min(1),
    name: z.string(),
    cost: z.coerce.number(),
    nextPaymentDate: z.string().min(1),
    active: z.boolean(),
    paymentMethod: z.string(),
    categoryId: z.string().min(1),
    history: z.array(z.object({ date: z.string(), amount: z.coerce.number() })),
  });

export const notification = () =>
  z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    title: z.string(),
    body: z.string(),
    ageDays: z.coerce.number(),
  });

export const settings = () =>
  z.object({
    profile: z.object({ name: z.string(), email: z.string() }),
    notifications: z.object({
      push: z.boolean(),
      email: z.boolean(),
      limitWarnings: z.boolean(),
      receiptConfirmations: z.boolean(),
      limitAlerts: z.boolean(),
    }),
  });

export const notFoundOut = () =>
  z.object({
    code: z.literal(404),
    type: z.literal('not-found'),
    message: z.string(),
  });

export const errorOut = () =>
  z.union([
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
