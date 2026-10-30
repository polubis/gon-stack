import z from 'zod';
import { dashboardData, dashboardIn } from './dashboard';
import { category, errorOut, expense, limit, recurring } from './general';

/**
 * Everything the dashboard needs to open, in one read: the same data as the
 * dashboard, expenses, categories, limits and recurring reads together.
 */
export const getBootstrapSchema = () =>
  z.object({
    in: dashboardIn(),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          dashboard: dashboardData(),
          expenses: z.array(expense()),
          categories: z.array(category()),
          limits: z.array(limit()),
          recurring: z.array(recurring()),
        }),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof getBootstrapSchema>>;
