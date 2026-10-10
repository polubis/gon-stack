import type { z } from 'zod';
import type { listCategoriesSchema } from '@schemas/categories';
import type {
  createExpenseSchema,
  listExpensesSchema,
  updateExpenseSchema,
} from '@schemas/expenses';
import type { createRecurringSchema } from '@schemas/recurring';
import type { scanReceiptSchema } from '@schemas/receipts';
import { API_ROUTER } from '@/shared/router/routes';
import type {
  Category,
  NewExpense,
  NewRecurring,
  StoredExpense,
  ReceiptDraft,
} from '../domain/models';
import {
  toCategory,
  toExpenseBody,
  toReceiptDraft,
  toRecurringBody,
  toStoredExpense,
} from './mappers';
import { shrinkReceipt } from './receipt-image';

type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];
type CreateExpenseOut = z.infer<ReturnType<typeof createExpenseSchema>>['out'];
type ListExpensesOut = z.infer<ReturnType<typeof listExpensesSchema>>['out'];
type UpdateExpenseOut = z.infer<ReturnType<typeof updateExpenseSchema>>['out'];
type CreateRecurringOut = z.infer<
  ReturnType<typeof createRecurringSchema>
>['out'];
type ScanReceiptOut = z.infer<ReturnType<typeof scanReceiptSchema>>['out'];

const post = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/** The only place in this module that talks to the backend. */
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

export const postExpense = async (expense: NewExpense): Promise<void> => {
  const response = await post(API_ROUTER.expenses(), toExpenseBody(expense));
  const json = (await response.json()) as CreateExpenseOut;
  if (json.code !== 201) throw new Error(json.message);
};

/** `null` when no such expense exists. */
export const fetchExpense = async (
  id: string,
  signal: AbortSignal,
): Promise<StoredExpense | null> => {
  const response = await fetch(API_ROUTER.expenses(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListExpensesOut;
  if (json.code !== 200) throw new Error(json.message);
  const found = json.data.find((e) => e.id === id);
  return found ? toStoredExpense(found) : null;
};

export const putExpense = async (expense: StoredExpense): Promise<void> => {
  const response = await fetch(API_ROUTER.expenseById(expense.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toExpenseBody(expense)),
  });
  const json = (await response.json()) as UpdateExpenseOut;
  if (json.code !== 200) throw new Error(json.message);
};

export const postRecurring = async (recurring: NewRecurring): Promise<void> => {
  const response = await post(
    API_ROUTER.recurring(),
    toRecurringBody(recurring),
  );
  const json = (await response.json()) as CreateRecurringOut;
  if (json.code !== 201) throw new Error(json.message);
};

export const postReceiptScan = async (
  file: File,
  signal: AbortSignal,
): Promise<ReceiptDraft> => {
  const body = new FormData();
  body.append('file', await shrinkReceipt(file));
  const response = await fetch(API_ROUTER.scanReceipt(), {
    method: 'POST',
    body,
    signal,
  });
  const json = (await response.json()) as ScanReceiptOut;
  if (json.code !== 200) throw new Error(json.message);
  return toReceiptDraft(json.data);
};
