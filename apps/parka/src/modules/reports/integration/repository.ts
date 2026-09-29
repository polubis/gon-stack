import type { z } from 'zod';
import type { listExpensesSchema } from '@schemas/expenses';
import type { listCategoriesSchema } from '@schemas/categories';
import type { listRecurringSchema } from '@schemas/recurring';
import { API_ROUTER } from '@/shared/router';
import type { Category, Expense, Recurring } from '../domain/models';
import { toCategory, toExpense, toRecurring } from './mappers';

type ListExpensesOut = z.infer<ReturnType<typeof listExpensesSchema>>['out'];
type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];
type ListRecurringOut = z.infer<ReturnType<typeof listRecurringSchema>>['out'];

/** Nothing else in this module fetches. */
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

export const fetchRecurring = async (
  signal: AbortSignal,
): Promise<Recurring[]> => {
  const response = await fetch(API_ROUTER.recurring(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListRecurringOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toRecurring);
};
