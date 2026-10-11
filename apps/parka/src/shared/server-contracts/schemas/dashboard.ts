import z from 'zod';
import { isTimeZone } from '@/shared/date/date';
import { errorOut } from './general';

const categorySlice = () =>
  z.object({
    categoryId: z.string().min(1),
    name: z.string(),
    color: z.string(),
    amount: z.number(),
    pct: z.number(),
  });

const point = () => z.object({ index: z.number(), total: z.number() });

export const getDashboardSchema = () =>
  z.object({
    in: z.object({
      kind: z.enum(['day', 'week', 'month', 'year', 'custom']),
      /** Any day of the period; a future one snaps to the present period. */
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      /** Last day of a `custom` range; ignored for the other kinds. */
      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      /** IANA time zone whose calendar days the period is counted in. */
      tz: z.string().refine(isTimeZone, 'Unknown time zone').optional(),
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
          series: z.array(point()),
          previousSeries: z.array(point()),
          monthlyLimit: z.number().nullable(),
          categories: z.array(categorySlice()),
        }),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof getDashboardSchema>>;
