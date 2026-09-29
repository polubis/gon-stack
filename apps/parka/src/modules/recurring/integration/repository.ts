import type { z } from 'zod';
import { listRecurringSchema, updateRecurringSchema } from '@schemas/recurring';
import { listCategoriesSchema } from '@schemas/categories';
import { API_ROUTER } from '@/shared/router';
import type { Category, Recurring } from '../domain/models';
import { toCategory, toRecurring } from './mappers';

type ListRecurringOut = z.infer<ReturnType<typeof listRecurringSchema>>['out'];
type UpdateRecurringOut = z.infer<
  ReturnType<typeof updateRecurringSchema>
>['out'];
type ListCategoriesOut = z.infer<
  ReturnType<typeof listCategoriesSchema>
>['out'];

/** Nothing else in this module fetches. */
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

export const putRecurring = async (
  recurring: Recurring,
): Promise<Recurring> => {
  const response = await fetch(API_ROUTER.recurringById(recurring.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recurring),
  });
  const json = (await response.json()) as UpdateRecurringOut;
  if (json.code !== 200) throw new Error(json.message);
  return toRecurring(json.data);
};
