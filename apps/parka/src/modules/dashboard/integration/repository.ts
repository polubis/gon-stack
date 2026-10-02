import type { z } from 'zod';
import type { Schema } from '@schemas/dashboard';
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
import { createGoalSchema, listGoalsSchema } from '@schemas/goals';
import { API_ROUTER } from '@/shared/router/routes';
import type {
  Category,
  Expense,
  ExpenseId,
  Goal,
  Limit,
  LimitId,
  Month,
  Summary,
} from '../domain/models';
import { toCategory, toExpense, toGoal, toLimit, toSummary } from './mappers';

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
type ListGoalsOut = z.infer<ReturnType<typeof listGoalsSchema>>['out'];
type CreateGoalOut = z.infer<ReturnType<typeof createGoalSchema>>['out'];

/** Nothing else in this module fetches. */
export const fetchSummary = async (
  month: Month,
  signal: AbortSignal,
): Promise<Summary> => {
  const response = await fetch(API_ROUTER.dashboard({ month }), {
    headers: { Accept: 'application/json' },
    signal,
  });

  const json = (await response.json()) as Schema['out'];

  if (json.code !== 200) {
    throw new Error(json.message);
  }

  return toSummary(json.data);
};

export const fetchExpenses = async (
  signal: AbortSignal,
): Promise<Expense[]> => {
  const response = await fetch(API_ROUTER.expenses(), {
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
  const response = await fetch(API_ROUTER.expenseById(expense.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  const json = (await response.json()) as UpdateExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
  return toExpense(json.data);
};

export const deleteExpense = async (id: ExpenseId): Promise<void> => {
  const response = await fetch(API_ROUTER.expenseById(id), {
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

export const fetchGoals = async (signal: AbortSignal): Promise<Goal[]> => {
  const response = await fetch(API_ROUTER.goals(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListGoalsOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toGoal);
};

export const postLimit = async (limit: Limit): Promise<Limit> => {
  const response = await fetch(API_ROUTER.limits(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(limit),
  });
  const json = (await response.json()) as CreateLimitOut;
  if (json.code !== 201) throw new Error(json.message);
  return toLimit(json.data);
};

export const putLimit = async (limit: Limit): Promise<Limit> => {
  const response = await fetch(API_ROUTER.limitById(limit.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(limit),
  });
  const json = (await response.json()) as UpdateLimitOut;
  if (json.code !== 200) throw new Error(json.message);
  return toLimit(json.data);
};

export const postGoal = async (goal: Goal): Promise<Goal> => {
  const response = await fetch(API_ROUTER.goals(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  const json = (await response.json()) as CreateGoalOut;
  if (json.code !== 201) throw new Error(json.message);
  return toGoal(json.data);
};

export const deleteLimit = async (id: LimitId): Promise<void> => {
  const response = await fetch(API_ROUTER.limitById(id), { method: 'DELETE' });
  const json = (await response.json()) as DeleteLimitOut;
  if (json.code !== 200) throw new Error(json.message);
};
