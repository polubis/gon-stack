import z from 'zod';
import {
  category,
  expense,
  limit,
  goal,
  recurring,
  notification,
  settings,
  errorOut,
} from './general';

/**
 * Shared shape for the aggregate finance state endpoint. `GET /api/state`
 * hydrates the React store from Postgres; `PUT /api/state` writes the whole
 * per-user graph back (row-level-security keyed to the session user).
 */

export const financeState = z.object({
  categories: z.array(category()),
  expenses: z.array(expense()),
  limits: z.array(limit()),
  goals: z.array(goal()),
  recurring: z.array(recurring()),
  notifications: z.array(notification()),
  settings: settings(),
});

export type FinanceState = z.infer<typeof financeState>;

export const getStateSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: financeState }),
      errorOut(),
    ]),
  });

export const syncStateSchema = () =>
  z.object({
    in: financeState,
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      errorOut(),
    ]),
  });

export type GetStateSchema = z.infer<ReturnType<typeof getStateSchema>>;
export type SyncStateSchema = z.infer<ReturnType<typeof syncStateSchema>>;
