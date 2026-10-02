import type { z } from 'zod';
import type { Schema } from '@schemas/dashboard';
import {
  deleteExpenseSchema,
  listExpensesSchema,
  updateExpenseSchema,
} from '@schemas/expenses';
import { listCategoriesSchema } from '@schemas/categories';
import { API_ROUTER } from '@/shared/router/routes';
import type {
  Category,
  Expense,
  ExpenseId,
  Month,
  Summary,
} from '../domain/models';
import { toCategory, toExpense, toSummary } from './mappers';

type ListExpensesOut = z.infer<ReturnType<typeof listExpensesSchema>>['out'];
type UpdateExpenseOut = z.infer<ReturnType<typeof updateExpenseSchema>>['out'];
type DeleteExpenseOut = z.infer<ReturnType<typeof deleteExpenseSchema>>['out'];
type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];

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
