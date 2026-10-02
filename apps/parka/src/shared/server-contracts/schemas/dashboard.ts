import z from 'zod';
import { errorOut } from './general';

const trendPoint = () =>
  z.object({ month: z.string().min(1), total: z.number() });

const categorySlice = () =>
  z.object({
    categoryId: z.string().min(1),
    name: z.string(),
    color: z.string(),
    amount: z.number(),
    pct: z.number(),
  });

const categoryChange = () =>
  z.object({
    categoryId: z.string().min(1),
    name: z.string(),
    color: z.string(),
    changePct: z.number(),
  });

const dayPoint = () => z.object({ day: z.number(), total: z.number() });

export const getDashboardSchema = () =>
  z.object({
    in: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      trendMonths: z.coerce.number().int().min(1).max(24).optional(),
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
          rangeTotal: z.number(),
          trend: z.array(trendPoint()),
          categories: z.array(categorySlice()),
          categoryChanges: z.array(categoryChange()),
        }),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof getDashboardSchema>>;
