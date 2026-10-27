import z from 'zod';
import { errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

/** What a notification remembers about an expense: enough to render a diff. */
const expenseSnapshot = () =>
  z.object({
    merchant: z.string(),
    amount: z.number(),
    date: z.string(),
    /** Category display name; `null` when products span several categories. */
    category: z.string().nullable(),
    paymentMethod: z.string(),
    isBill: z.boolean(),
  });

const categorySnapshot = () =>
  z.object({
    name: z.string(),
    icon: z.string(),
    color: z.string(),
  });

const recurringSnapshot = () =>
  z.object({
    name: z.string(),
    cost: z.number(),
    interval: z.enum(['weekly', 'monthly', 'yearly']),
    category: z.string().nullable(),
    paymentMethod: z.string(),
  });

const unfinishedTask = () =>
  z.object({
    title: z.string(),
    /** `HH:MM`; `null` for a task that lasts the whole day. */
    at: z.string().nullable(),
  });

/**
 * One entry per notification type, each with its own payload. Shared by the
 * internal write endpoint (input) and the list endpoint (output).
 */
const typed = <TKind extends string, TPayload extends z.ZodType>(
  kind: TKind,
  payload: TPayload,
) => z.object({ kind: z.literal(kind), payload });

export const notificationEvent = () =>
  z.discriminatedUnion('kind', [
    typed('expense-created', z.object({ expense: expenseSnapshot() })),
    typed(
      'expense-updated',
      z.object({ before: expenseSnapshot(), after: expenseSnapshot() }),
    ),
    typed('expense-deleted', z.object({ expense: expenseSnapshot() })),
    typed('category-created', z.object({ category: categorySnapshot() })),
    typed(
      'category-updated',
      z.object({ before: categorySnapshot(), after: categorySnapshot() }),
    ),
    typed('category-deleted', z.object({ category: categorySnapshot() })),
    typed(
      'time-day-unfinished',
      z.object({
        /** The day (`YYYY-MM-DD`) that is about to end. */
        day: z.string(),
        tasks: z.array(unfinishedTask()).min(1),
      }),
    ),
    typed(
      'limit-reached',
      z.object({
        /** Category display name; `null` for the total limit. */
        category: z.string().nullable(),
        /** Month (`YYYY-MM`) the limit counts. */
        month: z.string(),
        amount: z.number(),
        spent: z.number(),
        /** Percent of the limit the user asked to be told at. */
        alertAt: z.number(),
      }),
    ),
    typed(
      'recurring-accrued',
      z.object({
        rule: recurringSnapshot(),
        /** Days (`YYYY-MM-DD`) that were charged just now. */
        days: z.array(z.string()).min(1),
      }),
    ),
  ]);

const stored = () =>
  z.object({
    id: z.string().min(1),
    title: z.string(),
    body: z.string(),
    createdAt: z.string().min(1),
    read: z.boolean(),
  });

/** Stored notification; rows older than the typed payloads read as `other`. */
export const notification = () =>
  z.union([
    z.intersection(stored(), notificationEvent()),
    stored().extend({ kind: z.literal('other'), payload: z.null() }),
  ]);

export const NOTIFICATIONS_PAGE_SIZE = 20;
export const NOTIFICATIONS_MAX_PAGE_SIZE = 50;

/**
 * Newest first, cursor paginated. Read notifications are never filtered out;
 * `unread` is the server-side total, independent of the page.
 */
export const listNotificationsSchema = () =>
  z.object({
    in: z.object({
      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(NOTIFICATIONS_MAX_PAGE_SIZE)
        .default(NOTIFICATIONS_PAGE_SIZE),
      /** Opaque `nextCursor` of the previous page. */
      cursor: z.string().min(1).optional(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.array(notification()),
        nextCursor: z.string().nullable(),
        unread: z.number().int().min(0),
      }),
      errorOut(),
    ]),
  });

export const markNotificationReadSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const markAllNotificationsReadSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      errorOut(),
    ]),
  });

export const deleteNotificationSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
