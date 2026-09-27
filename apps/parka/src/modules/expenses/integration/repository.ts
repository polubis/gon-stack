import type { z } from 'zod';
import {
  listExpensesSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
} from '@schemas/expenses';
import { listCategoriesSchema } from '@schemas/categories';
import type { Category, Expense } from '../domain/models';

type ListExpensesOut = z.infer<ReturnType<typeof listExpensesSchema>>['out'];
type UpdateExpenseOut = z.infer<ReturnType<typeof updateExpenseSchema>>['out'];
type DeleteExpenseOut = z.infer<ReturnType<typeof deleteExpenseSchema>>['out'];
type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];

/** Nothing else in this module fetches. */
export const fetchExpenses = async (
  signal: AbortSignal,
): Promise<Expense[]> => {
  const response = await fetch('/api/expenses/', {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListExpensesOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const fetchCategories = async (
  signal: AbortSignal,
): Promise<Category[]> => {
  const response = await fetch('/api/categories/', {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListCategoriesOut;
  if (json.code !== 200) throw new Error(json.message);
  // Server validates `icon` as a non-empty string, not the closed union.
  return json.data as Category[];
};

export const putExpense = async (expense: Expense): Promise<Expense> => {
  const response = await fetch(`/api/expenses/${expense.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  const json = (await response.json()) as UpdateExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const removeExpense = async (id: string): Promise<void> => {
  const response = await fetch(`/api/expenses/${id}/`, { method: 'DELETE' });
  const json = (await response.json()) as DeleteExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
};
