import type { z } from 'zod';
import type { createExpenseSchema } from '@schemas/expenses';
import type { listCategoriesSchema } from '@schemas/categories';
import { API_ROUTER } from '@/shared/router';
import type { Category, NewReceipt } from '../domain/models';
import { toCategory, toExpenseBody, toNotificationBody } from './mappers';

type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];
type CreateExpenseOut = z.infer<ReturnType<typeof createExpenseSchema>>['out'];

const post = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/** Nothing else in this module fetches. */
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

/** Creates the expense, then its (best-effort) confirmation notification. */
export const saveReceipt = async ({
  expense,
  notification,
}: NewReceipt): Promise<void> => {
  const expenseResponse = await post(
    API_ROUTER.expenses(),
    toExpenseBody(expense),
  );
  const expenseJson = (await expenseResponse.json()) as CreateExpenseOut;
  if (expenseJson.code !== 201) throw new Error(expenseJson.message);

  // The expense is saved; a failed confirmation must not trigger a retry
  // that would duplicate it.
  await post(
    API_ROUTER.notifications(),
    toNotificationBody(notification),
  ).catch(() => undefined);
};
