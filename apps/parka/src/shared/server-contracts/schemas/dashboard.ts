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
          trend: z.array(trendPoint()),
          categories: z.array(categorySlice()),
        }),
      }),
      errorOut(),
    ]),
  });
