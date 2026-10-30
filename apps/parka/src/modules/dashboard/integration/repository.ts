import type { z } from 'zod';
import type { Schema } from '@schemas/dashboard';
import type { Schema as BootstrapSchema } from '@schemas/bootstrap';
import {
  deleteExpenseSchema,
  listExpensesSchema,
  updateExpenseSchema,
} from '@schemas/expenses';
import { listCategoriesSchema } from '@schemas/categories';
import {
  createLimitSchema,
  deleteLimitSchema,
  listLimitsSchema,
  updateLimitSchema,
} from '@schemas/limits';
import {
  deleteRecurringSchema,
  listRecurringSchema,
  updateRecurringSchema,
} from '@schemas/recurring';
import { browserTimeZone } from '@/shared/date/date';
import { API_ROUTER } from '@/shared/router/routes';
import { createRequestCache } from '@/shared/request-cache/request-cache';
import type {
  Category,
  DashboardData,
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Period,
  Recurring,
  RecurringId,
  Summary,
} from '../domain/models';
import {
  toCategory,
  toExpense,
  toLimit,
  toRecurring,
  toSummary,
} from './mappers';

const cache = createRequestCache();

/** Reads are shared and kept briefly; any write drops them, also when it ends. */
const send = async (...args: Parameters<typeof fetch>) => {
  cache.clear();
  try {
    return await fetch(...args);
  } finally {
    cache.clear();
  }
};

/** A cached read is shared between views, so no single view may abort it. */
const SHARED = new AbortController().signal;

/** A freshly opened dashboard never starts from reads another module outdated. */
export const resetDashboardReads = () => cache.clear();

type ListExpensesOut = z.infer<ReturnType<typeof listExpensesSchema>>['out'];
type UpdateExpenseOut = z.infer<ReturnType<typeof updateExpenseSchema>>['out'];
type DeleteExpenseOut = z.infer<ReturnType<typeof deleteExpenseSchema>>['out'];
type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];
type ListLimitsOut = z.infer<ReturnType<typeof listLimitsSchema>>['out'];
type CreateLimitOut = z.infer<ReturnType<typeof createLimitSchema>>['out'];
type UpdateLimitOut = z.infer<ReturnType<typeof updateLimitSchema>>['out'];
type DeleteLimitOut = z.infer<ReturnType<typeof deleteLimitSchema>>['out'];
type ListRecurringOut = z.infer<ReturnType<typeof listRecurringSchema>>['out'];
type UpdateRecurringOut = z.infer<
  ReturnType<typeof updateRecurringSchema>
>['out'];
type DeleteRecurringOut = z.infer<
  ReturnType<typeof deleteRecurringSchema>
>['out'];

export const fetchSummary = async (
  period: Period,
  signal: AbortSignal,
): Promise<Summary> => {
  const response = await fetch(
    API_ROUTER.dashboard({
      kind: period.kind,
      from: period.from,
      to: period.kind === 'custom' ? period.to : undefined,
      tz: browserTimeZone(),
    }),
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  const json = (await response.json()) as Schema['out'];

  if (json.code !== 200) {
    throw new Error(json.message);
  }

  return toSummary(json.data);
};

/** Everything a cold dashboard needs, read in one request. */
const fetchBootstrap = async (period: Period): Promise<DashboardData> => {
  const response = await fetch(
    API_ROUTER.bootstrap({
      kind: period.kind,
      from: period.from,
      to: period.kind === 'custom' ? period.to : undefined,
      tz: browserTimeZone(),
    }),
    { headers: { Accept: 'application/json' }, signal: SHARED },
  );
  const json = (await response.json()) as BootstrapSchema['out'];
  if (json.code !== 200) throw new Error(json.message);

  const { dashboard, expenses, categories, limits, recurring } = json.data;
  return {
    summary: toSummary(dashboard),
    expenses: expenses.map(toExpense),
    categories: categories.map(toCategory),
    limits: limits.map(toLimit),
    recurring: recurring.map(toRecurring),
  };
};

export const fetchExpenses = async (
  signal: AbortSignal,
): Promise<Expense[]> => {
  const response = await fetch(API_ROUTER.expenses({ tz: browserTimeZone() }), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListExpensesOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toExpense);
};

export const fetchCategories = async (
  signal: AbortSignal,
): Promise<Category[]> => {
  const response = await fetch(API_ROUTER.categories(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListCategoriesOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toCategory);
};

export const putExpense = async (expense: Expense): Promise<Expense> => {
  const response = await send(API_ROUTER.expenseById(expense.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  const json = (await response.json()) as UpdateExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
  return toExpense(json.data);
};

export const deleteExpense = async (id: ExpenseId): Promise<void> => {
  const response = await send(API_ROUTER.expenseById(id), {
    method: 'DELETE',
  });
  const json = (await response.json()) as DeleteExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
};

export const fetchLimits = async (signal: AbortSignal): Promise<Limit[]> => {
  const response = await fetch(API_ROUTER.limits(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListLimitsOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toLimit);
};

export const postLimit = async (limit: Limit): Promise<Limit> => {
  const response = await send(API_ROUTER.limits(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(limit),
  });
  const json = (await response.json()) as CreateLimitOut;
  if (json.code !== 201) throw new Error(json.message);
  return toLimit(json.data);
};

export const putLimit = async (limit: Limit): Promise<Limit> => {
  const response = await send(API_ROUTER.limitById(limit.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(limit),
  });
  const json = (await response.json()) as UpdateLimitOut;
  if (json.code !== 200) throw new Error(json.message);
  return toLimit(json.data);
};

export const deleteLimit = async (id: LimitId): Promise<void> => {
  const response = await send(API_ROUTER.limitById(id), { method: 'DELETE' });
  const json = (await response.json()) as DeleteLimitOut;
  if (json.code !== 200) throw new Error(json.message);
};

export const fetchRecurring = async (
  signal: AbortSignal,
): Promise<Recurring[]> => {
  const response = await fetch(
    API_ROUTER.recurring({ tz: browserTimeZone() }),
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );
  const json = (await response.json()) as ListRecurringOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toRecurring);
};

export const putRecurring = async (
  recurring: Recurring,
): Promise<Recurring> => {
  const response = await send(API_ROUTER.recurringById(recurring.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recurring),
  });
  const json = (await response.json()) as UpdateRecurringOut;
  if (json.code !== 200) throw new Error(json.message);
  return toRecurring(json.data);
};

export const deleteRecurring = async (id: RecurringId): Promise<void> => {
  const response = await send(API_ROUTER.recurringById(id), {
    method: 'DELETE',
  });
  const json = (await response.json()) as DeleteRecurringOut;
  if (json.code !== 200) throw new Error(json.message);
};

const summaryKey = (period: Period) =>
  `summary:${period.kind}:${period.from}:${period.to}`;

/** Warms the summary of a period the user is likely to open next. */
export const prefetchSummary = (period: Period) =>
  cache.prefetch(summaryKey(period), () => fetchSummary(period, SHARED));

/**
 * Single entry point for reading the dashboard. The summary depends on the
 * period; expenses, categories, limits and recurring are shared between
 * periods and kept in the cache. When those are missing, they come together
 * with the summary in one request (signed in once, charges made once);
 * moving to another period then asks for the summary alone. Due recurring
 * charges become expenses on the server, idempotently, so parallel reads
 * never double a charge.
 */
export const fetchDashboard = async (
  period: Period,
): Promise<DashboardData> => {
  let together: Promise<DashboardData> | undefined;
  const bootstrap = () => (together ??= fetchBootstrap(period));

  // Reads start in this order: the shared ones first tell the summary whether
  // a request is already on its way.
  const [expenses, categories, limits, recurring, summary] = await Promise.all([
    cache.read('expenses', () => bootstrap().then((data) => data.expenses)),
    cache.read('categories', () => bootstrap().then((data) => data.categories)),
    cache.read('limits', () => bootstrap().then((data) => data.limits)),
    cache.read('recurring', () => bootstrap().then((data) => data.recurring)),
    cache.read(summaryKey(period), () =>
      together
        ? together.then((data) => data.summary)
        : fetchSummary(period, SHARED),
    ),
  ]);

  return { summary, expenses, categories, limits, recurring };
};
