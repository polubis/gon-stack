import type { z } from 'zod';
import {
  createLimitSchema,
  listLimitsSchema,
  updateLimitSchema,
} from '@schemas/limits';
import { createGoalSchema, listGoalsSchema } from '@schemas/goals';
import { listCategoriesSchema } from '@schemas/categories';
import { listExpensesSchema } from '@schemas/expenses';
import { API_ROUTER } from '@/shared/router/routes';
import type { Category, Expense, Goal, Limit } from '../domain/models';
import { toCategory, toExpense, toGoal, toLimit } from './mappers';

type Out<S extends () => z.ZodType> =
  z.infer<ReturnType<S>> extends {
    out: infer O;
  }
    ? O
    : never;

type ListLimitsOut = Out<typeof listLimitsSchema>;
type CreateLimitOut = Out<typeof createLimitSchema>;
type UpdateLimitOut = Out<typeof updateLimitSchema>;
type ListGoalsOut = Out<typeof listGoalsSchema>;
type CreateGoalOut = Out<typeof createGoalSchema>;
type ListCategoriesOut = Out<typeof listCategoriesSchema>;
type ListExpensesOut = Out<typeof listExpensesSchema>;

const readJson = async <T>(response: Response): Promise<T> =>
  (await response.json()) as T;

const getJson = <T>(url: string, signal: AbortSignal): Promise<T> =>
  fetch(url, { headers: { Accept: 'application/json' }, signal }).then(
    readJson<T>,
  );

const send = (url: string, method: 'POST' | 'PUT', body: object) =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/** Nothing else in this module fetches. */
export const fetchLimits = async (signal: AbortSignal): Promise<Limit[]> => {
  const json = await getJson<ListLimitsOut>(API_ROUTER.limits(), signal);
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toLimit);
};

export const fetchGoals = async (signal: AbortSignal): Promise<Goal[]> => {
  const json = await getJson<ListGoalsOut>(API_ROUTER.goals(), signal);
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toGoal);
};

export const fetchCategories = async (
  signal: AbortSignal,
): Promise<Category[]> => {
  const json = await getJson<ListCategoriesOut>(
    API_ROUTER.categories(),
    signal,
  );
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toCategory);
};

export const fetchExpenses = async (
  signal: AbortSignal,
): Promise<Expense[]> => {
  const json = await getJson<ListExpensesOut>(API_ROUTER.expenses(), signal);
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toExpense);
};

export const postLimit = async (limit: Limit): Promise<Limit> => {
  const json = await readJson<CreateLimitOut>(
    await send(API_ROUTER.limits(), 'POST', limit),
  );
  if (json.code !== 201) throw new Error(json.message);
  return toLimit(json.data);
};

export const putLimit = async (limit: Limit): Promise<Limit> => {
  const json = await readJson<UpdateLimitOut>(
    await send(API_ROUTER.limitById(limit.id), 'PUT', limit),
  );
  if (json.code !== 200) throw new Error(json.message);
  return toLimit(json.data);
};

export const postGoal = async (goal: Goal): Promise<Goal> => {
  const json = await readJson<CreateGoalOut>(
    await send(API_ROUTER.goals(), 'POST', goal),
  );
  if (json.code !== 201) throw new Error(json.message);
  return toGoal(json.data);
};
