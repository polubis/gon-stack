import z from 'zod';
import { errorOut } from './general';

const categorySlice = () =>
  z.object({
    categoryId: z.string().min(1),
    name: z.string(),
    color: z.string(),
    amount: z.number(),
    pct: z.number(),
  });

const dayPoint = () => z.object({ day: z.number(), total: z.number() });

export const getDashboardSchema = () =>
  z.object({
    in: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          total: z.number(),
          change: z.number(),
          previousTotal: z.number(),
          userName: z.string(),
          transactions: z.number(),
          dailyAverage: z.number(),
          daily: z.array(dayPoint()),
          previousDaily: z.array(dayPoint()),
          monthlyLimit: z.number().nullable(),
          categories: z.array(categorySlice()),
        }),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof getDashboardSchema>>;
